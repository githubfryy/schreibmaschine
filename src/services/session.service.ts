import { db } from '@/config/database';
import { env } from '@/config/env';
import { generateSessionToken } from '@/utils/crypto';
import type { OnlineSession, Participant, WorkshopGroup } from '@/types/database';

/**
 * Session Management Service
 * Handles online status tracking, multi-device support, and session persistence
 */
export class SessionService {
  /**
   * Create or update a session when participant logs into a group
   */
  static async loginToGroup(
    participantId: string,
    workshopGroupId: string,
    deviceInfo?: string
  ): Promise<{ sessionToken: string; isMultiDevice: boolean }> {
    // Check if participant is already online in this group
    const existingSession = db
      .prepare(`
        SELECT * FROM online_sessions 
        WHERE participant_id = ? AND workshop_group_id = ?
        ORDER BY last_seen DESC LIMIT 1
      `)
      .get(participantId, workshopGroupId) as OnlineSession | undefined;

    const sessionToken = generateSessionToken();
    const now = new Date().toISOString();
    const isMultiDevice = !!existingSession;

    // Create new session
    db.prepare(`
      INSERT INTO online_sessions (
        id,
        workshop_group_id,
        participant_id,
        session_token,
        device_info,
        last_seen,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      workshopGroupId,
      participantId,
      sessionToken,
      deviceInfo || null,
      now,
      now
    );

    return { sessionToken, isMultiDevice };
  }

  /**
   * Update session activity (heartbeat)
   */
  static async updateSessionActivity(sessionToken: string): Promise<boolean> {
    const result = db
      .prepare(`
        UPDATE online_sessions 
        SET last_seen = ? 
        WHERE session_token = ?
      `)
      .run(new Date().toISOString(), sessionToken);

    return result.changes > 0;
  }

  /**
   * Logout from group (remove session)
   */
  static async logoutFromGroup(sessionToken: string): Promise<boolean> {
    const result = db
      .prepare(`DELETE FROM online_sessions WHERE session_token = ?`)
      .run(sessionToken);

    return result.changes > 0;
  }

  /**
   * Get all online participants in a group
   */
  static async getOnlineParticipants(workshopGroupId: string): Promise<Array<{
    participant: Participant;
    lastSeen: string;
    deviceCount: number;
  }>> {
    const cutoffTime = new Date(Date.now() - env.ONLINE_STATUS_TIMEOUT).toISOString();

    const results = db.prepare(`
      SELECT 
        p.id,
        p.full_name,
        p.display_name,
        MAX(os.last_seen) as last_seen,
        COUNT(os.id) as device_count
      FROM participants p
      JOIN online_sessions os ON p.id = os.participant_id
      WHERE os.workshop_group_id = ? 
        AND os.last_seen > ?
      GROUP BY p.id, p.full_name, p.display_name
      ORDER BY last_seen DESC
    `).all(workshopGroupId, cutoffTime) as Array<{
      id: string;
      full_name: string;
      display_name: string;
      last_seen: string;
      device_count: number;
    }>;

    return results.map(row => ({
      participant: {
        id: row.id,
        full_name: row.full_name,
        display_name: row.display_name,
        created_at: '', // Not needed for this view
        updated_at: ''
      },
      lastSeen: row.last_seen,
      deviceCount: row.device_count
    }));
  }

  /**
   * Get session info by token
   */
  static async getSessionInfo(sessionToken: string): Promise<{
    participant: Participant;
    workshopGroup: WorkshopGroup;
  } | null> {
    const result = db.prepare(`
      SELECT 
        p.id as participant_id,
        p.full_name,
        p.display_name,
        p.created_at as participant_created_at,
        p.updated_at as participant_updated_at,
        wg.id as workshop_group_id,
        wg.workshop_id,
        wg.writing_group_id,
        wg.name_override,
        wg.slug_override,
        wg.short_id,
        wg.status,
        wg.participant_order,
        wg.created_at as group_created_at,
        wg.updated_at as group_updated_at
      FROM online_sessions os
      JOIN participants p ON os.participant_id = p.id
      JOIN workshop_groups wg ON os.workshop_group_id = wg.id
      WHERE os.session_token = ?
        AND os.last_seen > ?
    `).get(
      sessionToken,
      new Date(Date.now() - env.ONLINE_STATUS_TIMEOUT).toISOString()
    ) as any;

    if (!result) return null;

    return {
      participant: {
        id: result.participant_id,
        full_name: result.full_name,
        display_name: result.display_name,
        created_at: result.participant_created_at,
        updated_at: result.participant_updated_at
      },
      workshopGroup: {
        id: result.workshop_group_id,
        workshop_id: result.workshop_id,
        writing_group_id: result.writing_group_id,
        name_override: result.name_override,
        slug_override: result.slug_override,
        short_id: result.short_id,
        status: result.status,
        participant_order: result.participant_order,
        created_at: result.group_created_at,
        updated_at: result.group_updated_at
      }
    };
  }

  /**
   * Get all online participants across all groups (for admin dashboard)
   */
  static async getAllOnlineParticipants(): Promise<Array<{
    participant: Participant;
    workshopName: string;
    groupName: string;
    lastSeen: string;
    deviceCount: number;
  }>> {
    const cutoffTime = new Date(Date.now() - env.ONLINE_STATUS_TIMEOUT).toISOString();

    const results = db.prepare(`
      SELECT 
        p.id,
        p.full_name,
        p.display_name,
        w.name as workshop_name,
        COALESCE(wg.name_override, wr.name) as group_name,
        MAX(os.last_seen) as last_seen,
        COUNT(os.id) as device_count
      FROM participants p
      JOIN online_sessions os ON p.id = os.participant_id
      JOIN workshop_groups wg ON os.workshop_group_id = wg.id
      JOIN workshops w ON wg.workshop_id = w.id
      JOIN writing_groups wr ON wg.writing_group_id = wr.id
      WHERE os.last_seen > ?
      GROUP BY p.id, w.name, wg.id
      ORDER BY last_seen DESC
    `).all(cutoffTime) as Array<{
      id: string;
      full_name: string;
      display_name: string;
      workshop_name: string;
      group_name: string;
      last_seen: string;
      device_count: number;
    }>;

    return results.map(row => ({
      participant: {
        id: row.id,
        full_name: row.full_name,
        display_name: row.display_name,
        created_at: '',
        updated_at: ''
      },
      workshopName: row.workshop_name,
      groupName: row.group_name,
      lastSeen: row.last_seen,
      deviceCount: row.device_count
    }));
  }

  /**
   * Cleanup expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const cutoffTime = new Date(Date.now() - env.ONLINE_STATUS_TIMEOUT).toISOString();
    
    const result = db
      .prepare(`DELETE FROM online_sessions WHERE last_seen < ?`)
      .run(cutoffTime);

    return result.changes;
  }

  /**
   * Check if participant is authorized for group
   */
  static async isParticipantAuthorized(
    participantId: string, 
    workshopGroupId: string
  ): Promise<boolean> {
    const result = db
      .prepare(`
        SELECT 1 FROM group_participants 
        WHERE participant_id = ? AND workshop_group_id = ?
      `)
      .get(participantId, workshopGroupId);

    return !!result;
  }

  /**
   * Get participant role in group
   */
  static async getParticipantRole(
    participantId: string,
    workshopGroupId: string
  ): Promise<'participant' | 'teamer' | null> {
    const result = db.prepare(`
      SELECT role FROM group_participants 
      WHERE participant_id = ? AND workshop_group_id = ?
    `).get(participantId, workshopGroupId) as { role: string } | undefined;

    return result?.role as 'participant' | 'teamer' | null;
  }
}

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  SessionService.cleanupExpiredSessions().then(cleaned => {
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
    }
  }).catch(console.error);
}, 5 * 60 * 1000);