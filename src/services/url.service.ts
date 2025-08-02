/**
 * URL Service
 *
 * Handles URL resolution and routing for workshop groups
 * Supports both semantic URLs (/workshop_slug/group_slug) and short URLs (/gruppe-p6)
 */

import { db } from '@/config/database';
import type { GroupUrl, Workshop, WorkshopGroup, WritingGroup } from '@/types/database';
import { isValidShortId } from '@/utils/crypto';
import { isValidSlug } from '@/utils/slugify';

export class UrlService {
  /**
   * Resolve URL to workshop group
   * Handles both semantic and short URL formats
   */
  static async resolveUrl(path: string): Promise<{
    workshop_group: WorkshopGroup;
    workshop: Workshop;
    writing_group: WritingGroup;
    urls: GroupUrl;
    resolved_from: 'semantic' | 'short_id';
  } | null> {
    // Remove leading/trailing slashes and split path
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    const segments = cleanPath.split('/');

    // Try short URL format first: gruppe-{short_id}
    if (segments.length === 1 && segments[0]?.startsWith('gruppe-')) {
      const shortId = segments[0].replace('gruppe-', '');
      if (isValidShortId(shortId)) {
        return await UrlService.resolveByShortId(shortId);
      }
    }

    // Try semantic URL format: {workshop_slug}/{group_slug}
    if (segments.length >= 2) {
      const [workshopSlug, groupSlug] = segments;
      if (workshopSlug && groupSlug && isValidSlug(workshopSlug) && isValidSlug(groupSlug)) {
        return await UrlService.resolveBySemanticUrl(workshopSlug, groupSlug);
      }
    }

    return null;
  }

  /**
   * Resolve by short ID (e.g., "p6", "Lz")
   */
  static async resolveByShortId(shortId: string): Promise<{
    workshop_group: WorkshopGroup;
    workshop: Workshop;
    writing_group: WritingGroup;
    urls: GroupUrl;
    resolved_from: 'short_id';
  } | null> {
    const query = `
      SELECT 
        wg.*,
        w.id as workshop_id,
        w.name as workshop_name,
        w.slug as workshop_slug,
        w.description as workshop_description,
        w.status as workshop_status,
        w.created_at as workshop_created_at,
        w.updated_at as workshop_updated_at,
        wr.id as writing_group_id,
        wr.name as writing_group_name,
        wr.slug as writing_group_slug,
        wr.description as writing_group_description,
        wr.is_template as writing_group_is_template,
        wr.created_at as writing_group_created_at,
        wr.updated_at as writing_group_updated_at
      FROM workshop_groups wg
      JOIN workshops w ON wg.workshop_id = w.id
      JOIN writing_groups wr ON wg.writing_group_id = wr.id
      WHERE wg.short_id = ?
    `;

    const result = db.prepare(query).get(shortId) as any;
    if (!result) {
      return null;
    }

    const workshop: Workshop = {
      id: result.workshop_id,
      name: result.workshop_name,
      slug: result.workshop_slug,
      description: result.workshop_description,
      status: result.workshop_status,
      created_at: result.workshop_created_at,
      updated_at: result.workshop_updated_at,
    };

    const writingGroup: WritingGroup = {
      id: result.writing_group_id,
      name: result.writing_group_name,
      slug: result.writing_group_slug,
      description: result.writing_group_description,
      is_template: Boolean(result.writing_group_is_template),
      created_at: result.writing_group_created_at,
      updated_at: result.writing_group_updated_at,
    };

    const workshopGroup: WorkshopGroup = {
      id: result.id,
      workshop_id: result.workshop_id,
      writing_group_id: result.writing_group_id,
      name_override: result.name_override,
      slug_override: result.slug_override,
      short_id: result.short_id,
      status: result.status,
      participant_order: result.participant_order,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };

    const urls = UrlService.generateUrls(workshop, writingGroup, workshopGroup);

    return {
      workshop_group: workshopGroup,
      workshop,
      writing_group: writingGroup,
      urls,
      resolved_from: 'short_id',
    };
  }

  /**
   * Resolve by semantic URL (workshop_slug/group_slug)
   */
  static async resolveBySemanticUrl(
    workshopSlug: string,
    groupSlug: string
  ): Promise<{
    workshop_group: WorkshopGroup;
    workshop: Workshop;
    writing_group: WritingGroup;
    urls: GroupUrl;
    resolved_from: 'semantic';
  } | null> {
    // Try with slug_override first, then with original writing group slug
    const query = `
      SELECT 
        wg.*,
        w.id as workshop_id,
        w.name as workshop_name,
        w.slug as workshop_slug,
        w.description as workshop_description,
        w.status as workshop_status,
        w.created_at as workshop_created_at,
        w.updated_at as workshop_updated_at,
        wr.id as writing_group_id,
        wr.name as writing_group_name,
        wr.slug as writing_group_slug,
        wr.description as writing_group_description,
        wr.is_template as writing_group_is_template,
        wr.created_at as writing_group_created_at,
        wr.updated_at as writing_group_updated_at
      FROM workshop_groups wg
      JOIN workshops w ON wg.workshop_id = w.id
      JOIN writing_groups wr ON wg.writing_group_id = wr.id
      WHERE w.slug = ? 
        AND (
          wg.slug_override = ? 
          OR (wg.slug_override IS NULL AND wr.slug = ?)
        )
    `;

    const result = db.prepare(query).get(workshopSlug, groupSlug, groupSlug) as any;
    if (!result) {
      return null;
    }

    const workshop: Workshop = {
      id: result.workshop_id,
      name: result.workshop_name,
      slug: result.workshop_slug,
      description: result.workshop_description,
      status: result.workshop_status,
      created_at: result.workshop_created_at,
      updated_at: result.workshop_updated_at,
    };

    const writingGroup: WritingGroup = {
      id: result.writing_group_id,
      name: result.writing_group_name,
      slug: result.writing_group_slug,
      description: result.writing_group_description,
      is_template: Boolean(result.writing_group_is_template),
      created_at: result.writing_group_created_at,
      updated_at: result.writing_group_updated_at,
    };

    const workshopGroup: WorkshopGroup = {
      id: result.id,
      workshop_id: result.workshop_id,
      writing_group_id: result.writing_group_id,
      name_override: result.name_override,
      slug_override: result.slug_override,
      short_id: result.short_id,
      status: result.status,
      participant_order: result.participant_order,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };

    const urls = UrlService.generateUrls(workshop, writingGroup, workshopGroup);

    return {
      workshop_group: workshopGroup,
      workshop,
      writing_group: writingGroup,
      urls,
      resolved_from: 'semantic',
    };
  }

  /**
   * Generate all URL variants for a workshop group
   */
  static generateUrls(
    workshop: Workshop,
    writingGroup: WritingGroup,
    workshopGroup: WorkshopGroup
  ): GroupUrl {
    const groupSlug = workshopGroup.slug_override || writingGroup.slug;

    return {
      workshop_slug: workshop.slug,
      group_slug: groupSlug,
      short_id: workshopGroup.short_id,
      full_semantic_url: `/${workshop.slug}/${groupSlug}`,
      short_url: `/gruppe-${workshopGroup.short_id}`,
      lobby_url: `/${workshop.slug}/${groupSlug}/vorraum`,
    };
  }

  /**
   * Check if a path should redirect to lobby
   * Returns lobby URL if user needs to authenticate
   */
  static shouldRedirectToLobby(path: string, isAuthenticated: boolean): string | null {
    if (isAuthenticated) {
      return null;
    }

    // Clean path and check if it's a group URL (not already lobby)
    const cleanPath = path.replace(/^\/+|\/+$/g, '');

    // Skip if already in lobby
    if (cleanPath.endsWith('/vorraum')) {
      return null;
    }

    // Check if it's a valid group URL pattern
    const segments = cleanPath.split('/');

    // Short URL format: gruppe-{short_id}
    if (segments.length === 1 && segments[0]?.startsWith('gruppe-')) {
      // For short URLs, we need to resolve to get the semantic lobby URL
      // This would be handled by the route handler
      return null; // Let the route handler deal with this
    }

    // Semantic URL format: {workshop_slug}/{group_slug}
    if (segments.length === 2) {
      const [workshopSlug, groupSlug] = segments;
      if (workshopSlug && groupSlug) {
        return `/${workshopSlug}/${groupSlug}/vorraum`;
      }
    }

    return null;
  }

  /**
   * Get lobby information for a group
   */
  static async getLobbyInfo(
    workshopSlug: string,
    groupSlug: string
  ): Promise<{
    workshop: Workshop;
    writing_group: WritingGroup;
    workshop_group: WorkshopGroup;
    participants: Array<{
      id: string;
      display_name: string;
      role: 'participant' | 'teamer';
    }>;
    urls: GroupUrl;
    is_active: boolean;
  } | null> {
    // First resolve the group
    const resolved = await UrlService.resolveBySemanticUrl(workshopSlug, groupSlug);
    if (!resolved) {
      return null;
    }

    // Get participants in this group
    const participantsQuery = `
      SELECT 
        p.id,
        p.display_name,
        gp.role
      FROM group_participants gp
      JOIN participants p ON gp.participant_id = p.id
      WHERE gp.workshop_group_id = ?
      ORDER BY gp.table_position, p.display_name
    `;

    const participants = db.prepare(participantsQuery).all(resolved.workshop_group.id) as Array<{
      id: string;
      display_name: string;
      role: 'participant' | 'teamer';
    }>;

    return {
      workshop: resolved.workshop,
      writing_group: resolved.writing_group,
      workshop_group: resolved.workshop_group,
      participants,
      urls: resolved.urls,
      is_active: resolved.workshop_group.status === 'active',
    };
  }

  /**
   * Get all available workshop groups for browsing
   */
  static async getAvailableGroups(): Promise<
    Array<{
      workshop: Workshop;
      writing_group: WritingGroup;
      workshop_group: WorkshopGroup;
      urls: GroupUrl;
      participant_count: number;
      online_count: number;
    }>
  > {
    const query = `
      SELECT 
        wg.*,
        w.id as workshop_id,
        w.name as workshop_name,
        w.slug as workshop_slug,
        w.description as workshop_description,
        w.status as workshop_status,
        w.created_at as workshop_created_at,
        w.updated_at as workshop_updated_at,
        wr.id as writing_group_id,
        wr.name as writing_group_name,
        wr.slug as writing_group_slug,
        wr.description as writing_group_description,
        wr.is_template as writing_group_is_template,
        wr.created_at as writing_group_created_at,
        wr.updated_at as writing_group_updated_at,
        COUNT(DISTINCT gp.id) as participant_count,
        COUNT(DISTINCT os.id) as online_count
      FROM workshop_groups wg
      JOIN workshops w ON wg.workshop_id = w.id
      JOIN writing_groups wr ON wg.writing_group_id = wr.id
      LEFT JOIN group_participants gp ON wg.id = gp.workshop_group_id
      LEFT JOIN online_sessions os ON wg.id = os.workshop_group_id 
        AND datetime(os.last_seen) > datetime('now', '-1 minute')
      WHERE w.status = 'active' AND wg.status IN ('active', 'setup')
      GROUP BY wg.id
      ORDER BY w.name, wr.name
    `;

    const results = db.prepare(query).all() as any[];

    return results.map((result) => {
      const workshop: Workshop = {
        id: result.workshop_id,
        name: result.workshop_name,
        slug: result.workshop_slug,
        description: result.workshop_description,
        status: result.workshop_status,
        created_at: result.workshop_created_at,
        updated_at: result.workshop_updated_at,
      };

      const writingGroup: WritingGroup = {
        id: result.writing_group_id,
        name: result.writing_group_name,
        slug: result.writing_group_slug,
        description: result.writing_group_description,
        is_template: Boolean(result.writing_group_is_template),
        created_at: result.writing_group_created_at,
        updated_at: result.writing_group_updated_at,
      };

      const workshopGroup: WorkshopGroup = {
        id: result.id,
        workshop_id: result.workshop_id,
        writing_group_id: result.writing_group_id,
        name_override: result.name_override,
        slug_override: result.slug_override,
        short_id: result.short_id,
        status: result.status,
        participant_order: result.participant_order,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };

      const urls = UrlService.generateUrls(workshop, writingGroup, workshopGroup);

      return {
        workshop,
        writing_group: writingGroup,
        workshop_group: workshopGroup,
        urls,
        participant_count: result.participant_count || 0,
        online_count: result.online_count || 0,
      };
    });
  }
}
