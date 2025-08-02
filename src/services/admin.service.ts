import { env } from '@/config/env';
import { generateSecureToken } from '@/utils/crypto';

/**
 * Admin Authentication Service
 * Provides password-based authentication for admin access
 */
export class AdminService {
  private static readonly ADMIN_SESSION_PREFIX = 'admin_';
  private static readonly ADMIN_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static activeSessions = new Map<string, { createdAt: number; lastActivity: number }>();

  /**
   * Authenticate admin with password
   */
  static authenticateAdmin(password: string): {
    success: boolean;
    sessionToken?: string;
    error?: string;
  } {
    if (!password || password !== env.ADMIN_PASSWORD) {
      return { success: false, error: 'Invalid admin password' };
    }

    // Generate admin session token
    const sessionToken = `${AdminService.ADMIN_SESSION_PREFIX}${generateSecureToken()}`;
    const now = Date.now();

    // Store session
    AdminService.activeSessions.set(sessionToken, {
      createdAt: now,
      lastActivity: now,
    });

    return { success: true, sessionToken };
  }

  /**
   * Validate admin session token
   */
  static validateAdminSession(sessionToken: string): boolean {
    if (!sessionToken || !sessionToken.startsWith(AdminService.ADMIN_SESSION_PREFIX)) {
      return false;
    }

    const session = AdminService.activeSessions.get(sessionToken);
    if (!session) {
      return false;
    }

    const now = Date.now();

    // Check if session has expired
    if (now - session.createdAt > AdminService.ADMIN_SESSION_DURATION) {
      AdminService.activeSessions.delete(sessionToken);
      return false;
    }

    // Update last activity
    session.lastActivity = now;
    return true;
  }

  /**
   * Update admin session activity (heartbeat)
   */
  static updateAdminActivity(sessionToken: string): boolean {
    if (!AdminService.validateAdminSession(sessionToken)) {
      return false;
    }

    const session = AdminService.activeSessions.get(sessionToken);
    if (session) {
      session.lastActivity = Date.now();
      return true;
    }

    return false;
  }

  /**
   * Logout admin session
   */
  static logoutAdmin(sessionToken: string): boolean {
    if (!sessionToken) {
      return false;
    }

    return AdminService.activeSessions.delete(sessionToken);
  }

  /**
   * Get admin session info
   */
  static getAdminSessionInfo(sessionToken: string): {
    isValid: boolean;
    createdAt?: number;
    lastActivity?: number;
  } {
    if (!AdminService.validateAdminSession(sessionToken)) {
      return { isValid: false };
    }

    const session = AdminService.activeSessions.get(sessionToken);
    if (!session) {
      return { isValid: false };
    }

    return {
      isValid: true,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
    };
  }

  /**
   * Clean up expired admin sessions
   */
  static cleanupExpiredSessions(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionToken, session] of AdminService.activeSessions.entries()) {
      if (now - session.createdAt > AdminService.ADMIN_SESSION_DURATION) {
        AdminService.activeSessions.delete(sessionToken);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get count of active admin sessions
   */
  static getActiveSessionCount(): number {
    AdminService.cleanupExpiredSessions();
    return AdminService.activeSessions.size;
  }
}
