/**
 * Participant API Routes
 *
 * REST API endpoints for participant management
 */

import { Elysia, t } from 'elysia';
import { ParticipantService } from '@/services/participant.service';
import type {
  ApiError,
  BulkCreateParticipantsResponse,
  ParticipantResponse,
  ParticipantsResponse,
} from '@/types/api';

export const participantRoutes = new Elysia({ prefix: '/participants' })
  // Get all participants with pagination and search
  .get(
    '/',
    async ({ query }) => {
      try {
        const {
          page = 1,
          limit = 50,
          q: searchQuery,
          sort_by = 'display_name',
          sort_order = 'asc',
        } = query;

        const result = await ParticipantService.findAll({
          page: Number(page),
          limit: Number(limit),
          query: searchQuery || '',
          sort_by: String(sort_by),
          sort_order: sort_order as 'asc' | 'desc',
        });

        const response: ParticipantsResponse = {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        };

        return response;
      } catch (error) {
        const apiError: ApiError = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date().toISOString(),
        };
        return apiError;
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        q: t.Optional(t.String()),
        sort_by: t.Optional(t.String()),
        sort_order: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
      }),
    }
  )

  // Get participant by ID
  .get(
    '/:id',
    async ({ params, set }) => {
      try {
        const participant = await ParticipantService.findById(params.id);

        if (!participant) {
          set.status = 404;
          const apiError: ApiError = {
            success: false,
            error: 'Participant not found',
            timestamp: new Date().toISOString(),
          };
          return apiError;
        }

        const response: ParticipantResponse = {
          success: true,
          data: participant,
          timestamp: new Date().toISOString(),
        };

        return response;
      } catch (error) {
        set.status = 500;
        const apiError: ApiError = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date().toISOString(),
        };
        return apiError;
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // Get participant with all their groups
  .get(
    '/:id/groups',
    async ({ params, set }) => {
      try {
        const participantWithGroups = await ParticipantService.findWithGroups(params.id);

        if (!participantWithGroups) {
          set.status = 404;
          const apiError: ApiError = {
            success: false,
            error: 'Participant not found',
            timestamp: new Date().toISOString(),
          };
          return apiError;
        }

        return {
          success: true,
          data: participantWithGroups,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        set.status = 500;
        const apiError: ApiError = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date().toISOString(),
        };
        return apiError;
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // Get participants by display name
  .get(
    '/display-name/:displayName',
    async ({ params }) => {
      try {
        const participants = await ParticipantService.findByDisplayName(params.displayName);

        return {
          success: true,
          data: participants,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        const apiError: ApiError = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date().toISOString(),
        };
        return apiError;
      }
    },
    {
      params: t.Object({
        displayName: t.String(),
      }),
    }
  )

  // Create new participant
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const participant = await ParticipantService.create(body);

        set.status = 201;
        const response: ParticipantResponse = {
          success: true,
          data: participant,
          message: 'Participant created successfully',
          timestamp: new Date().toISOString(),
        };

        return response;
      } catch (error) {
        set.status = 400;
        const apiError: ApiError = {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create participant',
          timestamp: new Date().toISOString(),
        };
        return apiError;
      }
    },
    {
      body: t.Object({
        full_name: t.String({ minLength: 1, maxLength: 200 }),
        display_name: t.String({ minLength: 1, maxLength: 50 }),
      }),
    }
  )

  // Update participant
  .put(
    '/:id',
    async ({ params, body, set }) => {
      try {
        const participant = await ParticipantService.update(params.id, body);

        if (!participant) {
          set.status = 404;
          const apiError: ApiError = {
            success: false,
            error: 'Participant not found',
            timestamp: new Date().toISOString(),
          };
          return apiError;
        }

        const response: ParticipantResponse = {
          success: true,
          data: participant,
          message: 'Participant updated successfully',
          timestamp: new Date().toISOString(),
        };

        return response;
      } catch (error) {
        set.status = 400;
        const apiError: ApiError = {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update participant',
          timestamp: new Date().toISOString(),
        };
        return apiError;
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        full_name: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
        display_name: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
      }),
    }
  )

  // Delete participant
  .delete(
    '/:id',
    async ({ params, set }) => {
      try {
        const deleted = await ParticipantService.delete(params.id);

        if (!deleted) {
          set.status = 404;
          const apiError: ApiError = {
            success: false,
            error: 'Participant not found',
            timestamp: new Date().toISOString(),
          };
          return apiError;
        }

        return {
          success: true,
          message: 'Participant deleted successfully',
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        set.status = 400;
        const apiError: ApiError = {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete participant',
          timestamp: new Date().toISOString(),
        };
        return apiError;
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // Bulk create participants
  .post(
    '/bulk',
    async ({ body, set }) => {
      try {
        const result = await ParticipantService.createMany(body.participants);

        const response: BulkCreateParticipantsResponse = {
          success: true,
          data: result,
          message: `Created ${result.created.length} participants${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ''}`,
          timestamp: new Date().toISOString(),
        };

        if (result.errors.length > 0) {
          set.status = 207; // Multi-status
        } else {
          set.status = 201;
        }

        return response;
      } catch (error) {
        set.status = 400;
        const apiError: ApiError = {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create participants',
          timestamp: new Date().toISOString(),
        };
        return apiError;
      }
    },
    {
      body: t.Object({
        participants: t.Array(
          t.Object({
            full_name: t.String({ minLength: 1, maxLength: 200 }),
            display_name: t.String({ minLength: 1, maxLength: 50 }),
          }),
          { minItems: 1, maxItems: 100 }
        ),
        workshop_group_id: t.Optional(t.String()),
      }),
    }
  )

  // Get participants available for a group (not already in the group)
  .get(
    '/available-for-group/:workshopGroupId',
    async ({ params }) => {
      try {
        const participants = await ParticipantService.findAvailableForGroup(params.workshopGroupId);

        return {
          success: true,
          data: participants,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        const apiError: ApiError = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date().toISOString(),
        };
        return apiError;
      }
    },
    {
      params: t.Object({
        workshopGroupId: t.String(),
      }),
    }
  )

  // Get participants in a specific group
  .get(
    '/in-group/:workshopGroupId',
    async ({ params }) => {
      try {
        const participants = await ParticipantService.findInGroup(params.workshopGroupId);

        return {
          success: true,
          data: participants,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        const apiError: ApiError = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date().toISOString(),
        };
        return apiError;
      }
    },
    {
      params: t.Object({
        workshopGroupId: t.String(),
      }),
    }
  )

  // Get participant statistics
  .get(
    '/:id/stats',
    async ({ params, set }) => {
      try {
        const stats = await ParticipantService.getStats(params.id);

        if (!stats) {
          set.status = 404;
          const apiError: ApiError = {
            success: false,
            error: 'Participant not found',
            timestamp: new Date().toISOString(),
          };
          return apiError;
        }

        return {
          success: true,
          data: stats,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        set.status = 500;
        const apiError: ApiError = {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get participant statistics',
          timestamp: new Date().toISOString(),
        };
        return apiError;
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // Check if display name exists
  .get(
    '/check-display-name/:displayName',
    async ({ params }) => {
      try {
        const exists = await ParticipantService.displayNameExists(params.displayName);

        return {
          success: true,
          data: {
            display_name: params.displayName,
            exists,
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        const apiError: ApiError = {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to check display name',
          timestamp: new Date().toISOString(),
        };
        return apiError;
      }
    },
    {
      params: t.Object({
        displayName: t.String(),
      }),
    }
  );
