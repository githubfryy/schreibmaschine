import { Elysia } from 'elysia';
import { env } from '@/config/env';
import { SessionService } from '@/services/session.service';
import type { Participant, WorkshopGroup } from '@/types/database';

/**
 * Session middleware for cookie-based authentication
 * Handles participant login/logout and session management
 */

export interface SessionContext {
  participant?: Participant;
  workshopGroup?: WorkshopGroup;
  sessionToken?: string;
  isAuthenticated: boolean;
}

/**
 * Session middleware plugin
 */
export const sessionMiddleware = new Elysia({ name: 'session' }).derive(async ({ cookie }) => {
  const sessionToken = cookie['session_token']?.value;

  if (!sessionToken) {
    return {
      participant: undefined,
      workshopGroup: undefined,
      sessionToken: undefined,
      isAuthenticated: false,
    };
  }

  // Update session activity (heartbeat)
  const isActive = await SessionService.updateSessionActivity(sessionToken);
  if (!isActive) {
    return {
      participant: undefined,
      workshopGroup: undefined,
      sessionToken: undefined,
      isAuthenticated: false,
    };
  }

  // Get session info
  const sessionInfo = await SessionService.getSessionInfo(sessionToken);
  if (!sessionInfo) {
    return {
      participant: undefined,
      workshopGroup: undefined,
      sessionToken: undefined,
      isAuthenticated: false,
    };
  }

  return {
    participant: sessionInfo.participant,
    workshopGroup: sessionInfo.workshopGroup,
    sessionToken,
    isAuthenticated: true,
  };
});

/**
 * Require authentication middleware
 */
export const requireAuth = new Elysia({ name: 'requireAuth' }).use(sessionMiddleware).guard({
  beforeHandle(context: any) {
    const { isAuthenticated, set } = context;
    if (!isAuthenticated) {
      set.status = 401;
      return { error: 'Authentication required' };
    }
    // Explicitly return undefined for successful auth
    return undefined;
  },
});

/**
 * Require teamer role middleware
 */
export const requireTeamer = new Elysia({ name: 'requireTeamer' }).use(requireAuth).guard({
  async beforeHandle(context: any) {
    const { participant, workshopGroup, set } = context;
    if (!participant || !workshopGroup) {
      set.status = 401;
      return { error: 'Authentication required' };
    }

    const role = await SessionService.getParticipantRole(participant.id, workshopGroup.id);

    if (role !== 'teamer') {
      set.status = 403;
      return { error: 'Teamer access required' };
    }

    // Explicitly return undefined for successful auth
    return undefined;
  },
});

/**
 * Login helper functions
 */
export class SessionHelpers {
  /**
   * Set session cookie
   */
  static setSessionCookie(
    cookie: Record<string, any>,
    sessionToken: string,
    maxAge: number = env.SESSION_MAX_AGE
  ): void {
    cookie['session_token'] = {
      value: sessionToken,
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    };
  }

  /**
   * Clear session cookie
   */
  static clearSessionCookie(cookie: Record<string, any>): void {
    cookie['session_token'] = {
      value: '',
      maxAge: 0,
      path: '/',
    };
  }

  /**
   * Get device info from request headers
   */
  static getDeviceInfo(headers: Record<string, string | undefined>): string {
    const userAgent = headers['user-agent'] || 'unknown';
    const acceptLanguage = headers['accept-language'] || '';

    // Create a simple device fingerprint
    return `${userAgent.slice(0, 100)}-${acceptLanguage.slice(0, 20)}`;
  }

  /**
   * Handle participant login to group
   */
  static async loginParticipant(
    participantId: string,
    workshopGroupId: string,
    cookie: Record<string, any>,
    headers: Record<string, string | undefined>
  ): Promise<{ success: boolean; isMultiDevice: boolean; error?: string }> {
    try {
      // Check if participant is authorized for this group
      const isAuthorized = await SessionService.isParticipantAuthorized(
        participantId,
        workshopGroupId
      );

      if (!isAuthorized) {
        return {
          success: false,
          isMultiDevice: false,
          error: 'Participant not authorized for this group',
        };
      }

      // Create session
      const deviceInfo = SessionHelpers.getDeviceInfo(headers);
      const { sessionToken, isMultiDevice } = await SessionService.loginToGroup(
        participantId,
        workshopGroupId,
        deviceInfo
      );

      // Set session cookie
      SessionHelpers.setSessionCookie(cookie, sessionToken);

      return { success: true, isMultiDevice };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        isMultiDevice: false,
        error: 'Login failed',
      };
    }
  }

  /**
   * Handle participant logout
   */
  static async logoutParticipant(
    sessionToken: string,
    cookie: Record<string, any>
  ): Promise<boolean> {
    try {
      const success = await SessionService.logoutFromGroup(sessionToken);
      SessionHelpers.clearSessionCookie(cookie);
      return success;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }
}

/**
 * Session routes plugin
 */
export const sessionRoutes = new Elysia({ name: 'sessionRoutes' })
  .use(sessionMiddleware)

  // Login endpoint
  .post('/api/login', async ({ body, cookie, headers, set }) => {
    const { participantId, workshopGroupId } = body as {
      participantId: string;
      workshopGroupId: string;
    };

    if (!participantId || !workshopGroupId) {
      set.status = 400;
      return { error: 'Missing participantId or workshopGroupId' };
    }

    const result = await SessionHelpers.loginParticipant(
      participantId,
      workshopGroupId,
      cookie,
      headers
    );

    if (!result.success) {
      set.status = 401;
      return { error: result.error };
    }

    return {
      success: true,
      isMultiDevice: result.isMultiDevice,
      message: result.isMultiDevice
        ? 'Logged in successfully (multi-device detected)'
        : 'Logged in successfully',
    };
  })

  // Logout endpoint
  .post('/api/logout', async (context: any) => {
    const { sessionToken, cookie, set } = context;
    if (!sessionToken) {
      set.status = 400;
      return { error: 'No active session' };
    }

    const success = await SessionHelpers.logoutParticipant(sessionToken, cookie);

    return {
      success,
      message: success ? 'Logged out successfully' : 'Logout failed',
    };
  })

  // Session status endpoint
  .get('/api/session', (context: any) => {
    const { participant, workshopGroup, isAuthenticated } = context;
    if (!isAuthenticated) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      participant,
      workshopGroup,
    };
  })

  // Online participants endpoint
  .get('/api/groups/:groupId/online', async ({ params }) => {
    const onlineParticipants = await SessionService.getOnlineParticipants(params.groupId);

    return { onlineParticipants };
  })

  // Admin: All online participants
  .get('/api/admin/online', async () => {
    const allOnline = await SessionService.getAllOnlineParticipants();
    return { allOnline };
  });
