/**
 * Participant Service
 *
 * Business logic for participant management in Schreibmaschine
 */

import { db } from '@/config/database';
import type {
  CreateParticipant,
  PaginatedResult,
  Participant,
  SearchOptions,
  UpdateParticipant,
} from '@/types/database';
import { generateId, isValidUUID } from '@/utils/crypto';

export class ParticipantService {
  /**
   * Get all participants with pagination and search
   */
  static async findAll(options: SearchOptions = {}): Promise<PaginatedResult<Participant>> {
    const { page = 1, limit = 50, query, sort_by = 'display_name', sort_order = 'asc' } = options;
    const offset = (page - 1) * limit;

    // Build base query
    let whereClause = '';
    const params: (string | number)[] = [];

    if (query) {
      whereClause = 'WHERE display_name LIKE ? OR full_name LIKE ?';
      params.push(`%${query}%`, `%${query}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM participants ${whereClause}`;
    const countResult = db.prepare(countQuery).get(...params) as { count: number };
    const total = countResult.count;

    // Get participants
    const dataQuery = `
      SELECT * FROM participants 
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const participants = db.prepare(dataQuery).all(...params) as Participant[];

    return {
      data: participants,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page * limit < total,
        has_prev: page > 1,
      },
    };
  }

  /**
   * Get participant by ID
   */
  static async findById(id: string): Promise<Participant | null> {
    if (!isValidUUID(id)) {
      return null;
    }

    const query = 'SELECT * FROM participants WHERE id = ?';
    const participant = db.prepare(query).get(id) as Participant | undefined;

    return participant || null;
  }

  /**
   * Get participants by display name (can have duplicates)
   */
  static async findByDisplayName(displayName: string): Promise<Participant[]> {
    const query = 'SELECT * FROM participants WHERE display_name = ? ORDER BY created_at';
    const participants = db.prepare(query).all(displayName) as Participant[];

    return participants;
  }

  /**
   * Get participant with all their workshop groups
   */
  static async findWithGroups(id: string): Promise<{
    participant: Participant;
    groups: Array<{
      workshop_group: any;
      workshop: any;
      writing_group: any;
      role: 'participant' | 'teamer';
      table_position: number | null;
      joined_at: string;
      is_online: boolean;
    }>;
  } | null> {
    const participant = await ParticipantService.findById(id);
    if (!participant) {
      return null;
    }

    // Get all groups this participant is in
    const groupsQuery = `
      SELECT 
        gp.*,
        wg.id as workshop_group_id,
        wg.name_override as workshop_group_name_override,
        wg.short_id,
        wg.status as workshop_group_status,
        w.id as workshop_id,
        w.name as workshop_name,
        w.slug as workshop_slug,
        w.status as workshop_status,
        wr.id as writing_group_id,
        wr.name as writing_group_name,
        wr.slug as writing_group_slug,
        CASE WHEN os.id IS NOT NULL THEN 1 ELSE 0 END as is_online
      FROM group_participants gp
      JOIN workshop_groups wg ON gp.workshop_group_id = wg.id
      JOIN workshops w ON wg.workshop_id = w.id
      JOIN writing_groups wr ON wg.writing_group_id = wr.id
      LEFT JOIN online_sessions os ON wg.id = os.workshop_group_id 
        AND os.participant_id = gp.participant_id
        AND datetime(os.last_seen) > datetime('now', '-1 minute')
      WHERE gp.participant_id = ?
      ORDER BY w.name, wr.name
    `;

    const groups = db.prepare(groupsQuery).all(id) as any[];

    return {
      participant,
      groups: groups.map((g) => ({
        workshop_group: {
          id: g.workshop_group_id,
          name_override: g.workshop_group_name_override,
          short_id: g.short_id,
          status: g.workshop_group_status,
        },
        workshop: {
          id: g.workshop_id,
          name: g.workshop_name,
          slug: g.workshop_slug,
          status: g.workshop_status,
        },
        writing_group: {
          id: g.writing_group_id,
          name: g.writing_group_name,
          slug: g.writing_group_slug,
        },
        role: g.role,
        table_position: g.table_position,
        joined_at: g.joined_at,
        is_online: Boolean(g.is_online),
      })),
    };
  }

  /**
   * Create new participant
   */
  static async create(data: CreateParticipant): Promise<Participant> {
    const id = generateId();

    const insertQuery = `
      INSERT INTO participants (id, full_name, display_name)
      VALUES (?, ?, ?)
    `;

    db.prepare(insertQuery).run(id, data.full_name, data.display_name);

    const participant = await ParticipantService.findById(id);
    if (!participant) {
      throw new Error('Failed to create participant');
    }

    return participant;
  }

  /**
   * Update participant
   */
  static async update(id: string, data: UpdateParticipant): Promise<Participant | null> {
    const existing = await ParticipantService.findById(id);
    if (!existing) {
      return null;
    }

    const updateFields: string[] = [];
    const params: (string | number)[] = [];

    if (data.full_name !== undefined) {
      updateFields.push('full_name = ?');
      params.push(data.full_name);
    }

    if (data.display_name !== undefined) {
      updateFields.push('display_name = ?');
      params.push(data.display_name);
    }

    if (updateFields.length === 0) {
      return existing;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const updateQuery = `UPDATE participants SET ${updateFields.join(', ')} WHERE id = ?`;
    db.prepare(updateQuery).run(...params);

    return await ParticipantService.findById(id);
  }

  /**
   * Delete participant
   */
  static async delete(id: string): Promise<boolean> {
    const existing = await ParticipantService.findById(id);
    if (!existing) {
      return false;
    }

    // Check if participant is in any active groups
    const activeGroupsQuery = `
      SELECT COUNT(*) as count 
      FROM group_participants gp
      JOIN workshop_groups wg ON gp.workshop_group_id = wg.id
      WHERE gp.participant_id = ? AND wg.status IN ('active', 'paused')
    `;
    const activeGroups = db.prepare(activeGroupsQuery).get(id) as { count: number };

    if (activeGroups.count > 0) {
      throw new Error('Cannot delete participant who is in active groups');
    }

    const deleteQuery = 'DELETE FROM participants WHERE id = ?';
    const result = db.prepare(deleteQuery).run(id);

    return result.changes > 0;
  }

  /**
   * Get participants available for a workshop group (not already in the group)
   */
  static async findAvailableForGroup(workshopGroupId: string): Promise<Participant[]> {
    if (!isValidUUID(workshopGroupId)) {
      return [];
    }

    const query = `
      SELECT p.* 
      FROM participants p
      WHERE p.id NOT IN (
        SELECT gp.participant_id 
        FROM group_participants gp 
        WHERE gp.workshop_group_id = ?
      )
      ORDER BY p.display_name
    `;

    const participants = db.prepare(query).all(workshopGroupId) as Participant[];
    return participants;
  }

  /**
   * Get participants in a specific workshop group
   */
  static async findInGroup(workshopGroupId: string): Promise<
    Array<{
      participant: Participant;
      role: 'participant' | 'teamer';
      table_position: number | null;
      joined_at: string;
      is_online: boolean;
    }>
  > {
    if (!isValidUUID(workshopGroupId)) {
      return [];
    }

    const query = `
      SELECT 
        p.*,
        gp.role,
        gp.table_position,
        gp.joined_at,
        CASE WHEN os.id IS NOT NULL THEN 1 ELSE 0 END as is_online
      FROM group_participants gp
      JOIN participants p ON gp.participant_id = p.id
      LEFT JOIN online_sessions os ON gp.workshop_group_id = os.workshop_group_id 
        AND os.participant_id = p.id
        AND datetime(os.last_seen) > datetime('now', '-1 minute')
      WHERE gp.workshop_group_id = ?
      ORDER BY gp.table_position, p.display_name
    `;

    const results = db.prepare(query).all(workshopGroupId) as any[];

    return results.map((r) => ({
      participant: {
        id: r.id,
        full_name: r.full_name,
        display_name: r.display_name,
        created_at: r.created_at,
        updated_at: r.updated_at,
      },
      role: r.role,
      table_position: r.table_position,
      joined_at: r.joined_at,
      is_online: Boolean(r.is_online),
    }));
  }

  /**
   * Bulk create participants
   */
  static async createMany(participantsData: CreateParticipant[]): Promise<{
    created: Participant[];
    errors: Array<{
      index: number;
      error: string;
      data: CreateParticipant;
    }>;
  }> {
    const created: Participant[] = [];
    const errors: Array<{ index: number; error: string; data: CreateParticipant }> = [];

    for (let i = 0; i < participantsData.length; i++) {
      try {
        const participant = await ParticipantService.create(participantsData[i]!);
        created.push(participant);
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : String(error),
          data: participantsData[i]!,
        });
      }
    }

    return { created, errors };
  }

  /**
   * Check if display name exists (case-insensitive)
   */
  static async displayNameExists(displayName: string): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM participants WHERE LOWER(display_name) = LOWER(?)';
    const result = db.prepare(query).get(displayName) as { count: number };
    return result.count > 0;
  }

  /**
   * Get participant statistics
   */
  static async getStats(id: string): Promise<{
    groups_count: number;
    workshops_count: number;
    activities_count: number;
    documents_count: number;
    last_active?: string;
  } | null> {
    const participant = await ParticipantService.findById(id);
    if (!participant) {
      return null;
    }

    const statsQuery = `
      SELECT 
        COUNT(DISTINCT gp.workshop_group_id) as groups_count,
        COUNT(DISTINCT wg.workshop_id) as workshops_count,
        COUNT(DISTINCT ap.activity_id) as activities_count,
        COUNT(DISTINCT d.id) as documents_count,
        MAX(os.last_seen) as last_active
      FROM participants p
      LEFT JOIN group_participants gp ON p.id = gp.participant_id
      LEFT JOIN workshop_groups wg ON gp.workshop_group_id = wg.id
      LEFT JOIN activity_participants ap ON p.id = ap.participant_id
      LEFT JOIN documents d ON p.id = d.participant_id
      LEFT JOIN online_sessions os ON p.id = os.participant_id
      WHERE p.id = ?
    `;

    const stats = db.prepare(statsQuery).get(id) as any;

    return {
      groups_count: stats.groups_count || 0,
      workshops_count: stats.workshops_count || 0,
      activities_count: stats.activities_count || 0,
      documents_count: stats.documents_count || 0,
      last_active: stats.last_active || undefined,
    };
  }
}
