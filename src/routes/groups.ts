/**
 * Group URL Routes
 *
 * Handles semantic and short URL routing for workshop groups
 * Supports lobby system and session management
 */

import { Elysia, t } from 'elysia';
import { ActivityService } from '@/services/activity.service';
import { TemplateService } from '@/services/template.service';
import { UrlService } from '@/services/url.service';
import type { ApiError, ResolveUrlResponse } from '@/types/api';

export const groupRoutes = new Elysia()
  // Resolve any URL to workshop group information
  .get(
    '/resolve-url',
    async ({ query, set }) => {
      try {
        const { path } = query;

        if (!path) {
          set.status = 400;
          const apiError: ApiError = {
            success: false,
            error: 'Path parameter is required',
            timestamp: new Date().toISOString(),
          };
          return apiError;
        }

        const resolved = await UrlService.resolveUrl(path);

        if (!resolved) {
          set.status = 404;
          const apiError: ApiError = {
            success: false,
            error: 'Group not found for this URL',
            timestamp: new Date().toISOString(),
          };
          return apiError;
        }

        const response: ResolveUrlResponse = {
          success: true,
          data: {
            workshop_group: {
              ...resolved.workshop_group,
              workshop: resolved.workshop,
              writing_group: resolved.writing_group,
              participants: [], // Will be filled by other endpoints
              activities: [], // Will be filled by other endpoints
              online_count: 0, // Will be filled by real-time system
            },
            urls: resolved.urls,
            resolved_from: resolved.resolved_from,
          },
          timestamp: new Date().toISOString(),
        };

        return response;
      } catch (error) {
        set.status = 500;
        const apiError: ApiError = {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to resolve URL',
          timestamp: new Date().toISOString(),
        };
        return apiError;
      }
    },
    {
      query: t.Object({
        path: t.String(),
      }),
    }
  )

  // Get all available groups for browsing
  .get('/available', async () => {
    try {
      const groups = await UrlService.getAvailableGroups();

      return {
        success: true,
        data: groups,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const apiError: ApiError = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get available groups',
        timestamp: new Date().toISOString(),
      };
      return apiError;
    }
  })

  // Short URL redirect handler: /gruppe-{short_id}
  .get(
    '/gruppe-:shortId',
    async ({ params, set, headers }) => {
      try {
        const resolved = await UrlService.resolveByShortId(params.shortId);

        if (!resolved) {
          set.status = 404;
          const html = TemplateService.render(
            'error',
            {
              error_icon: '🔍',
              error_title: 'Gruppe nicht gefunden',
              error_message: `Die Gruppe mit der ID "${params.shortId}" existiert nicht oder ist nicht verfügbar.`,
            },
            {
              title: 'Gruppe nicht gefunden',
              showHeader: false,
              showFooter: false,
            }
          );

          return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }

        // Check if user is authenticated (simple cookie check for now)
        const sessionCookie = headers['cookie']
          ?.split(';')
          .find((c) => c.trim().startsWith('schreibmaschine_session='));

        const isAuthenticated = Boolean(sessionCookie);

        // Redirect to semantic URL for better UX
        if (isAuthenticated) {
          // Authenticated: redirect to group room
          set.status = 302;
          set.headers['Location'] = resolved.urls.full_semantic_url;
          return;
        } else {
          // Not authenticated: redirect to lobby
          set.status = 302;
          set.headers['Location'] = resolved.urls.lobby_url;
          return;
        }
      } catch (_error) {
        set.status = 500;
        const html = TemplateService.render(
          'error',
          {
            error_icon: '⚠️',
            error_title: 'Ein Fehler ist aufgetreten',
            error_message: 'Beim Auflösen der Gruppen-URL ist ein Fehler aufgetreten.',
          },
          {
            title: 'Fehler',
            showHeader: false,
            showFooter: false,
          }
        );

        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    },
    {
      params: t.Object({
        shortId: t.String(),
      }),
    }
  )

  // Lobby page: /{workshop_slug}/{group_slug}/vorraum
  .get(
    '/:workshopSlug/:groupSlug/vorraum',
    async ({ params, set }) => {
      try {
        const lobbyInfo = await UrlService.getLobbyInfo(params.workshopSlug, params.groupSlug);

        if (!lobbyInfo) {
          set.status = 404;
          const html = TemplateService.render(
            'error',
            {
              error_icon: '🔍',
              error_title: 'Gruppe nicht gefunden',
              error_message: 'Die angeforderte Schreibgruppe existiert nicht.',
            },
            {
              title: 'Gruppe nicht gefunden',
              showHeader: false,
              showFooter: false,
            }
          );

          return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }

        const html = TemplateService.render('lobby', lobbyInfo, {
          title: `${lobbyInfo.writing_group.name} - ${lobbyInfo.workshop.name}`,
          additionalCSS: 'lobby',
          showHeader: false,
          showFooter: false,
        });

        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      } catch (_error) {
        set.status = 500;
        const html = TemplateService.render(
          'error',
          {
            error_icon: '⚠️',
            error_title: 'Ein Fehler ist aufgetreten',
            error_message: 'Beim Laden der Lobby ist ein Fehler aufgetreten.',
          },
          {
            title: 'Fehler',
            showHeader: false,
            showFooter: false,
          }
        );

        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    },
    {
      params: t.Object({
        workshopSlug: t.String(),
        groupSlug: t.String(),
      }),
    }
  )

  // Group room: /{workshop_slug}/{group_slug}
  .get(
    '/:workshopSlug/:groupSlug',
    async ({ params, set, headers }) => {
      try {
        const resolved = await UrlService.resolveBySemanticUrl(
          params.workshopSlug,
          params.groupSlug
        );

        if (!resolved) {
          set.status = 404;
          const html = TemplateService.render(
            'error',
            {
              error_icon: '🔍',
              error_title: 'Gruppe nicht gefunden',
              error_message: 'Die angeforderte Schreibgruppe existiert nicht.',
            },
            {
              title: 'Gruppe nicht gefunden',
              showHeader: false,
              showFooter: false,
            }
          );

          return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }

        // Check authentication
        const sessionCookie = headers['cookie']
          ?.split(';')
          .find((c) => c.trim().startsWith('schreibmaschine_session='));

        if (!sessionCookie) {
          // Not authenticated: redirect to lobby
          set.status = 302;
          set.headers['Location'] = resolved.urls.lobby_url;
          return;
        }

        // TODO: Validate session and get participant info
        const participantId = sessionCookie.split('=')[1];

        // Prepare data for group room template
        const groupRoomData = {
          workshop: resolved.workshop,
          writing_group: resolved.writing_group,
          workshop_group: resolved.workshop_group,
          current_participant_id: participantId,
          participants: [
            // TODO: Load real participants from database
            { display_name: 'Du (Teamer)', role: 'teamer', online: true, is_current_user: true },
          ],
          activities: await new ActivityService().getActivitiesForGroup(resolved.workshop_group.id),
          online_count: 1, // TODO: Get real online count
        };

        const html = TemplateService.render('group-room', groupRoomData, {
          title: `${resolved.writing_group.name} - ${resolved.workshop.name}`,
          additionalCSS: 'group-room',
          showHeader: false,
          showFooter: false,
        });

        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      } catch (_error) {
        set.status = 500;
        const html = TemplateService.render(
          'error',
          {
            error_icon: '⚠️',
            error_title: 'Ein Fehler ist aufgetreten',
            error_message: 'Beim Laden der Schreibgruppe ist ein Fehler aufgetreten.',
          },
          {
            title: 'Fehler',
            showHeader: false,
            showFooter: false,
          }
        );

        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    },
    {
      params: t.Object({
        workshopSlug: t.String(),
        groupSlug: t.String(),
      }),
    }
  );
