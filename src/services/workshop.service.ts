/**
 * Workshop Service
 * 
 * Business logic for workshop management in Schreibmaschine
 */

import { db } from '@/config/database';
import type { 
  Workshop, 
  CreateWorkshop, 
  UpdateWorkshop, 
  WorkshopWithGroups,
  PaginatedResult,
  SearchOptions 
} from '@/types/database';
import { generateId, isValidUUID } from '@/utils/crypto';
import { slugify, makeUniqueSlug, isValidSlug } from '@/utils/slugify';

export class WorkshopService {
  /**
   * Get all workshops with pagination and search
   */
  static async findAll(options: SearchOptions = {}): Promise<PaginatedResult<Workshop>> {
    const { page = 1, limit = 20, query, sort_by = 'created_at', sort_order = 'desc' } = options;
    const offset = (page - 1) * limit;
    
    // Build base query
    let whereClause = '';
    const params: (string | number)[] = [];
    
    if (query) {
      whereClause = 'WHERE name LIKE ? OR description LIKE ?';
      params.push(`%${query}%`, `%${query}%`);
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM workshops ${whereClause}`;
    const countResult = db.prepare(countQuery).get(...params) as { count: number };
    const total = countResult.count;
    
    // Get workshops
    const dataQuery = `
      SELECT * FROM workshops 
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);
    
    const workshops = db.prepare(dataQuery).all(...params) as Workshop[];
    
    return {
      data: workshops,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page * limit < total,
        has_prev: page > 1
      }
    };
  }
  
  /**
   * Get workshop by ID
   */
  static async findById(id: string): Promise<Workshop | null> {
    if (!isValidUUID(id)) {
      return null;
    }
    
    const query = 'SELECT * FROM workshops WHERE id = ?';
    const workshop = db.prepare(query).get(id) as Workshop | undefined;
    
    return workshop || null;
  }
  
  /**
   * Get workshop by slug
   */
  static async findBySlug(slug: string): Promise<Workshop | null> {
    if (!isValidSlug(slug)) {
      return null;
    }
    
    const query = 'SELECT * FROM workshops WHERE slug = ?';
    const workshop = db.prepare(query).get(slug) as Workshop | undefined;
    
    return workshop || null;
  }
  
  /**
   * Get workshop with all its groups and participants
   */
  static async findWithGroups(id: string): Promise<WorkshopWithGroups | null> {
    const workshop = await this.findById(id);
    if (!workshop) {
      return null;
    }
    
    // Get workshop groups with details
    const groupsQuery = `
      SELECT 
        wg.*,
        w.name as workshop_name,
        w.slug as workshop_slug,
        wr.name as writing_group_name,
        wr.slug as writing_group_slug,
        COUNT(gp.id) as participant_count,
        COUNT(os.id) as online_count
      FROM workshop_groups wg
      JOIN workshops w ON wg.workshop_id = w.id
      JOIN writing_groups wr ON wg.writing_group_id = wr.id
      LEFT JOIN group_participants gp ON wg.id = gp.workshop_group_id
      LEFT JOIN online_sessions os ON wg.id = os.workshop_group_id 
        AND datetime(os.last_seen) > datetime('now', '-1 minute')
      WHERE wg.workshop_id = ?
      GROUP BY wg.id
      ORDER BY wg.created_at
    `;
    
    const groups = db.prepare(groupsQuery).all(id);
    
    return {
      ...workshop,
      groups: groups as any[] // Will be properly typed in the actual implementation
    };
  }
  
  /**
   * Create new workshop
   */
  static async create(data: CreateWorkshop): Promise<Workshop> {
    const id = generateId();
    const slug = data.slug || slugify(data.name);
    
    // Ensure slug is unique
    const existingSlugs = db.prepare('SELECT slug FROM workshops').all().map((w: any) => w.slug);
    const uniqueSlug = makeUniqueSlug(slug, existingSlugs);
    
    const insertQuery = `
      INSERT INTO workshops (id, name, description, slug, status)
      VALUES (?, ?, ?, ?, 'planning')
    `;
    
    db.prepare(insertQuery).run(id, data.name, data.description || null, uniqueSlug);
    
    const workshop = await this.findById(id);
    if (!workshop) {
      throw new Error('Failed to create workshop');
    }
    
    return workshop;
  }
  
  /**
   * Update workshop
   */
  static async update(id: string, data: UpdateWorkshop): Promise<Workshop | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }
    
    const updateFields: string[] = [];
    const params: (string | number)[] = [];
    
    if (data.name !== undefined) {
      updateFields.push('name = ?');
      params.push(data.name);
    }
    
    if (data.description !== undefined) {
      updateFields.push('description = ?');
      params.push(data.description);
    }
    
    if (data.slug !== undefined) {
      // Ensure slug is unique (excluding current workshop)
      const existingSlugs = db.prepare('SELECT slug FROM workshops WHERE id != ?')
        .all(id).map((w: any) => w.slug);
      const uniqueSlug = makeUniqueSlug(data.slug, existingSlugs);
      
      updateFields.push('slug = ?');
      params.push(uniqueSlug);
    }
    
    if (data.status !== undefined) {
      updateFields.push('status = ?');
      params.push(data.status);
    }
    
    if (updateFields.length === 0) {
      return existing;
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const updateQuery = `UPDATE workshops SET ${updateFields.join(', ')} WHERE id = ?`;
    db.prepare(updateQuery).run(...params);
    
    return await this.findById(id);
  }
  
  /**
   * Delete workshop
   */
  static async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      return false;
    }
    
    // Check if workshop has active groups
    const activeGroupsQuery = `
      SELECT COUNT(*) as count 
      FROM workshop_groups 
      WHERE workshop_id = ? AND status IN ('active', 'paused')
    `;
    const activeGroups = db.prepare(activeGroupsQuery).get(id) as { count: number };
    
    if (activeGroups.count > 0) {
      throw new Error('Cannot delete workshop with active groups');
    }
    
    const deleteQuery = 'DELETE FROM workshops WHERE id = ?';
    const result = db.prepare(deleteQuery).run(id);
    
    return result.changes > 0;
  }
  
  /**
   * Get workshop statistics
   */
  static async getStats(id: string): Promise<{
    participants: number;
    groups: number;
    activities: number;
    online_now: number;
  } | null> {
    const workshop = await this.findById(id);
    if (!workshop) {
      return null;
    }
    
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT gp.participant_id) as participants,
        COUNT(DISTINCT wg.id) as groups,
        COUNT(DISTINCT a.id) as activities,
        COUNT(DISTINCT os.participant_id) as online_now
      FROM workshops w
      LEFT JOIN workshop_groups wg ON w.id = wg.workshop_id
      LEFT JOIN group_participants gp ON wg.id = gp.workshop_group_id
      LEFT JOIN activities a ON wg.id = a.workshop_group_id
      LEFT JOIN online_sessions os ON wg.id = os.workshop_group_id 
        AND datetime(os.last_seen) > datetime('now', '-1 minute')
      WHERE w.id = ?
    `;
    
    const stats = db.prepare(statsQuery).get(id) as any;
    
    return {
      participants: stats.participants || 0,
      groups: stats.groups || 0,
      activities: stats.activities || 0,
      online_now: stats.online_now || 0
    };
  }
  
  /**
   * Check if slug is available
   */
  static async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    if (!isValidSlug(slug)) {
      return false;
    }
    
    let query = 'SELECT COUNT(*) as count FROM workshops WHERE slug = ?';
    const params: unknown[] = [slug];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const result = db.prepare(query).get(...params) as { count: number };
    return result.count === 0;
  }
}