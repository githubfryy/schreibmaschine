import { Elysia } from 'elysia';
import { env } from '@/config/env';
import { AdminService } from '@/services/admin.service';

/**
 * Admin authentication middleware
 * Provides password-based authentication for admin access
 */

export interface AdminContext {
  isAdminAuthenticated: boolean;
  adminSessionToken?: string;
  adminSessionInfo?: { createdAt: number; lastActivity: number };
}

/**
 * Admin authentication middleware plugin
 */
export const adminMiddleware = new Elysia({ name: 'admin' }).derive(async ({ cookie }) => {
  const adminSessionToken = cookie['admin_session']?.value;

  if (!adminSessionToken) {
    return {
      isAdminAuthenticated: false,
      adminSessionToken: undefined,
      adminSessionInfo: undefined,
    };
  }

  // Validate and update admin session activity
  const sessionInfo = AdminService.getAdminSessionInfo(adminSessionToken);
  
  if (!sessionInfo.isValid) {
    return {
      isAdminAuthenticated: false,
      adminSessionToken: undefined,
      adminSessionInfo: undefined,
    };
  }

  // Update activity
  AdminService.updateAdminActivity(adminSessionToken);

  return {
    isAdminAuthenticated: true,
    adminSessionToken,
    adminSessionInfo: {
      createdAt: sessionInfo.createdAt!,
      lastActivity: sessionInfo.lastActivity!,
    },
  };
});

/**
 * Require admin authentication middleware
 */
export const requireAdmin = new Elysia({ name: 'requireAdmin' })
  .use(adminMiddleware)
  .guard({
    beforeHandle(context: any) {
      const { isAdminAuthenticated, set } = context;
      if (!isAdminAuthenticated) {
        set.status = 401;
        return { error: 'Admin authentication required' };
      }
      // Explicitly return undefined for successful auth
      return undefined;
    },
  });

/**
 * Admin helper functions
 */
export class AdminHelpers {
  /**
   * Set admin session cookie
   */
  static setAdminSessionCookie(
    cookie: Record<string, any>,
    sessionToken: string,
    maxAge: number = 24 * 60 * 60 * 1000 // 24 hours
  ): void {
    cookie['admin_session'] = {
      value: sessionToken,
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/admin',
    };
  }

  /**
   * Clear admin session cookie
   */
  static clearAdminSessionCookie(cookie: Record<string, any>): void {
    cookie['admin_session'] = {
      value: '',
      maxAge: 0,
      path: '/admin',
    };
  }

  /**
   * Handle admin login
   */
  static loginAdmin(
    password: string,
    cookie: Record<string, any>
  ): { success: boolean; error?: string } {
    const result = AdminService.authenticateAdmin(password);
    
    if (!result.success) {
      return { success: false, error: result.error || 'Authentication failed' };
    }

    // Set admin session cookie
    AdminHelpers.setAdminSessionCookie(cookie, result.sessionToken!);

    return { success: true };
  }

  /**
   * Handle admin logout
   */
  static logoutAdmin(
    sessionToken: string,
    cookie: Record<string, any>
  ): boolean {
    const success = AdminService.logoutAdmin(sessionToken);
    AdminHelpers.clearAdminSessionCookie(cookie);
    return success;
  }
}

/**
 * Admin authentication routes plugin
 */
export const adminAuthRoutes = new Elysia({ name: 'adminAuthRoutes' })
  .use(adminMiddleware)

  // Admin login endpoint
  .post('/admin/login', async ({ body, cookie, set }) => {
    const { password } = body as { password: string };

    if (!password) {
      set.status = 400;
      return { error: 'Password is required' };
    }

    const result = AdminHelpers.loginAdmin(password, cookie);

    if (!result.success) {
      set.status = 401;
      return { error: result.error };
    }

    return {
      success: true,
      message: 'Admin logged in successfully',
    };
  })

  // Admin logout endpoint
  .post('/admin/logout', async (context: any) => {
    const { adminSessionToken, cookie } = context;
    
    if (!adminSessionToken) {
      return { success: true, message: 'No active admin session' };
    }

    const success = AdminHelpers.logoutAdmin(adminSessionToken, cookie);

    return {
      success,
      message: success ? 'Admin logged out successfully' : 'Logout failed',
    };
  })

  // Admin session status endpoint
  .get('/admin/session', (context: any) => {
    const { isAdminAuthenticated, adminSessionInfo } = context;
    
    if (!isAdminAuthenticated) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      sessionInfo: adminSessionInfo,
    };
  });