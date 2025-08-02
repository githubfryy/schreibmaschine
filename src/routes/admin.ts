import { Elysia } from 'elysia';
import { adminAuthRoutes, adminMiddleware, requireAdmin } from '@/middleware/admin';
import { TemplateService } from '@/services/template.service';
import { WorkshopService } from '@/services/workshop.service';
import { ParticipantService } from '@/services/participant.service';
import { SessionService } from '@/services/session.service';
import { env, isDevelopment } from '@/config/env';

/**
 * Admin Routes
 * Provides admin interface for managing workshops, participants, and activities
 */
export const adminRoutes = new Elysia({ name: 'adminRoutes' })
  .use(adminAuthRoutes)
  .use(adminMiddleware)

  // Admin login page
  .get('/admin', (context: any) => {
    const { isAdminAuthenticated } = context;
    
    if (isAdminAuthenticated) {
      // Already authenticated, redirect to dashboard
      return new Response(null, {
        status: 302,
        headers: { Location: '/admin/dashboard' },
      });
    }

    // Show login page
    const html = TemplateService.render(
      'admin-login',
      {
        isDevelopment,
      },
      {
        title: 'Admin-Anmeldung - Schreibmaschine',
        showHeader: false,
        showFooter: false,
        additionalCSS: '/css/admin.css',
        additionalJS: '/js/alpinejs/alpine.min.js',
      }
    );

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  })

  // Admin dashboard (requires authentication)
  .get('/admin/dashboard', async (context: any) => {
    const { isAdminAuthenticated } = context;
    
    if (!isAdminAuthenticated) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/admin' },
      });
    }

    // Get dashboard data
    const [workshopsResult, participantsResult, onlineStats] = await Promise.all([
      WorkshopService.findAll(),
      ParticipantService.findAll(),
      SessionService.getAllOnlineParticipants(),
    ]);

    const workshops = workshopsResult.data;
    const participants = participantsResult.data;

    const dashboardData = {
      totalWorkshops: workshops.length,
      totalParticipants: participants.length,
      onlineParticipants: onlineStats.length,
      workshops: workshops.slice(0, 5), // Show recent 5
      recentParticipants: participants.slice(0, 10), // Show recent 10
      onlineStats,
    };

    const html = TemplateService.render(
      'admin-dashboard',
      dashboardData,
      {
        title: 'Admin Dashboard - Schreibmaschine',
        showHeader: false,
        showFooter: false,
        additionalCSS: '/css/admin.css',
        additionalJS: '/js/alpinejs/alpine.min.js',
      }
    );

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  })

  // Admin API endpoints (require authentication)
  .group('/admin/api', (app) =>
    app
      .use(requireAdmin)
      
      // Dashboard stats
      .get('/stats', async () => {
        const [workshopsResult, participantsResult, onlineStats] = await Promise.all([
          WorkshopService.findAll(),
          ParticipantService.findAll(),
          SessionService.getAllOnlineParticipants(),
        ]);

        const workshops = workshopsResult.data;
        const participants = participantsResult.data;

        return {
          totalWorkshops: workshops.length,
          totalParticipants: participants.length,
          onlineParticipants: onlineStats.length,
          activeWorkshops: workshops.filter((w: any) => w.status === 'active').length,
        };
      })

      // Online participants monitoring
      .get('/online', async () => {
        const onlineParticipants = await SessionService.getAllOnlineParticipants();
        return { onlineParticipants };
      })

      // Workshop management
      .get('/workshops', async () => {
        const result = await WorkshopService.findAll();
        return { workshops: result.data };
      })

      .get('/workshops/:id', async ({ params }) => {
        const workshop = await WorkshopService.findById(params.id);
        if (!workshop) {
          return { error: 'Workshop not found' };
        }
        return { workshop };
      })

      // Participant management
      .get('/participants', async () => {
        const result = await ParticipantService.findAll();
        return { participants: result.data };
      })

      .get('/participants/:id', async ({ params }) => {
        const participant = await ParticipantService.findById(params.id);
        if (!participant) {
          return { error: 'Participant not found' };
        }
        return { participant };
      })

      // System health
      .get('/health', () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        adminSessionsActive: require('@/services/admin.service').AdminService.getActiveSessionCount(),
      }))

      // Debug endpoint (development only)
      .get('/debug/env', () => {
        if (env.NODE_ENV === 'production') {
          return { error: 'Debug not available in production' };
        }
        return {
          adminPasswordSet: !!env.ADMIN_PASSWORD,
          adminPasswordLength: env.ADMIN_PASSWORD?.length || 0,
          adminPasswordValue: isDevelopment ? env.ADMIN_PASSWORD : '[HIDDEN]',
          nodeEnv: env.NODE_ENV,
          allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('ADMIN')),
        };
      })
  );