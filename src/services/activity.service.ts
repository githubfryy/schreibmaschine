import { db } from '@/config/database';
import type { Activity } from '@/types/database';
import { generateShortId } from '@/utils/crypto';

export class ActivityService {

  /**
   * Static methods for API routes - following Elysia service pattern
   */
  
  /**
   * Find all activities with pagination and filtering
   */
  static async findAll(options: {
    page: number;
    limit: number;
    group_id?: string;
    status?: string;
  }) {
    const offset = (options.page - 1) * options.limit;
    let whereClause = '1=1';
    const params: any[] = [];

    if (options.group_id) {
      whereClause += ' AND a.workshop_group_id = ?';
      params.push(options.group_id);
    }

    if (options.status) {
      whereClause += ' AND a.status = ?';
      params.push(options.status);
    }

    const countQuery = db.query(`
      SELECT COUNT(*) as total 
      FROM activities a 
      WHERE ${whereClause}
    `);
    const totalResult = countQuery.get(...params) as { total: number };
    const total = totalResult.total;

    const dataQuery = db.query(`
      SELECT a.*, 
             COUNT(ap.participant_id) as participant_count,
             MAX(at.created_at) as last_turn_at
      FROM activities a
      LEFT JOIN activity_participants ap ON a.id = ap.activity_id
      LEFT JOIN activity_turns at ON a.id = at.activity_id
      WHERE ${whereClause}
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const data = dataQuery.all(...params, options.limit, offset) as Activity[];

    return {
      data,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        total_pages: Math.ceil(total / options.limit),
        has_next: options.page * options.limit < total,
        has_prev: options.page > 1,
      },
    };
  }

  /**
   * Find activity by ID
   */
  static async findById(id: string): Promise<Activity | null> {
    const query = db.query(`
      SELECT a.*, 
             COUNT(ap.participant_id) as participant_count
      FROM activities a
      LEFT JOIN activity_participants ap ON a.id = ap.activity_id
      WHERE a.id = ?
      GROUP BY a.id
    `);

    return query.get(id) as Activity | null;
  }

  /**
   * Create new activity
   */
  static async createActivity(groupId: string, data: any): Promise<Activity> {
    const activityId = crypto.randomUUID();
    const shortId = generateShortId();
    
    const query = db.query(`
      INSERT INTO activities (
        id, short_id, workshop_group_id, name, type, description, 
        settings, max_participants, status, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'setup', ?, datetime('now'), datetime('now'))
      RETURNING *
    `);

    return query.get(
      activityId,
      shortId,
      groupId,
      data.name,
      data.type,
      data.description || '',
      JSON.stringify(data.settings || {}),
      data.max_participants || null,
      data.created_by
    ) as Activity;
  }

  /**
   * Update activity
   */
  static async updateActivity(id: string, data: any): Promise<Activity | null> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }
    if (data.settings !== undefined) {
      updates.push('settings = ?');
      params.push(JSON.stringify(data.settings));
    }

    if (updates.length === 0) {
      return ActivityService.findById(id);
    }

    updates.push('updated_at = datetime(\'now\')');
    params.push(id);

    const query = db.query(`
      UPDATE activities 
      SET ${updates.join(', ')}
      WHERE id = ?
      RETURNING *
    `);

    return query.get(...params) as Activity | null;
  }

  /**
   * Delete activity
   */
  static async deleteActivity(id: string): Promise<boolean> {
    const query = db.query('DELETE FROM activities WHERE id = ?');
    const result = query.run(id);
    return result.changes > 0;
  }

  /**
   * Get activity state for participant
   */
  static async getActivityState(activityId: string, participantId: string): Promise<any> {
    // For now, return a simple mock state
    return {
      activityId,
      participantId,
      isParticipant: true,
      canParticipate: true,
      isMyTurn: false,
      currentPlayer: null,
      status: 'active',
    };
  }

  /**
   * Submit content to activity
   */
  static async submitToActivity(activityId: string, participantId: string, content: string): Promise<any> {
    // TODO: Implement proper submission logic based on activity type
    return {
      activityId,
      participantId,
      content,
      submittedAt: new Date().toISOString(),
    };
  }

  /**
   * Skip turn in activity
   */
  static async skipTurn(activityId: string, participantId: string): Promise<any> {
    // TODO: Implement proper skip turn logic
    return {
      activityId,
      participantId,
      skipped: true,
      skippedAt: new Date().toISOString(),
    };
  }

  /**
   * Get all activities for a workshop group
   */
  static async getActivitiesForGroup(groupId: string): Promise<Activity[]> {
    const query = db.query(`
      SELECT a.*, 
             COUNT(ap.participant_id) as participant_count,
             MAX(at.created_at) as last_turn_at
      FROM activities a
      LEFT JOIN activity_participants ap ON a.id = ap.activity_id
      LEFT JOIN activity_turns at ON a.id = at.activity_id
      WHERE a.workshop_group_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);

    return query.all(groupId) as Activity[];
  }

}
