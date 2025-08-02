import { html } from '@elysiajs/html';
import { staticPlugin } from '@elysiajs/static';
import { Elysia } from 'elysia';

import { env, isDevelopment } from '@/config/env';
import { sessionRoutes } from '@/middleware/session';
import { apiRoutes } from '@/routes/api';
import { groupRoutes } from '@/routes/groups';
import { sseRoutes } from '@/routes/sse';
import { TemplateService } from '@/services/template.service';

// TODO: Import remaining route handlers when implemented
// import { adminRoutes } from '@/routes/admin';

// TODO: Import middleware when implemented
// import { authMiddleware } from '@/middleware/auth';
// import { sessionMiddleware } from '@/middleware/session';
// import { corsMiddleware } from '@/middleware/cors';

/**
 * Schreibmaschine - Collaborative Writing App
 *
 * A local-first collaborative writing application for creative writing workshops.
 * Built with Bun, Elysia.js, and modern TypeScript.
 */
const app = new Elysia()
  // Global plugins
  .use(html())
  .use(
    staticPlugin({
      assets: './public',
      prefix: '/',
    })
  )

  // Global error handling
  .onError(({ code, error, set }) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${code}] ${errorMessage}`);

    switch (code) {
      case 'NOT_FOUND':
        set.status = 404;
        return 'Seite nicht gefunden';
      case 'VALIDATION':
        set.status = 400;
        return { error: 'Validierungsfehler', details: errorMessage };
      case 'INTERNAL_SERVER_ERROR':
        set.status = 500;
        return isDevelopment
          ? {
              error: 'Interner Serverfehler',
              details: errorMessage,
              stack: error instanceof Error ? error.stack : undefined,
            }
          : 'Ein Fehler ist aufgetreten';
      default:
        set.status = 500;
        return 'Ein unbekannter Fehler ist aufgetreten';
    }
  })

  // Health check endpoint
  .get('/health', () => ({
    status: 'ok',
    service: 'schreibmaschine',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  }))

  // Welcome page
  .get('/', () => {
    const html = TemplateService.render(
      'welcome',
      {
        bun_version: process.versions.bun || 'unknown',
        environment: env.NODE_ENV,
        port: env.PORT,
      },
      {
        title: 'Schreibmaschine',
        showHeader: false,
        showFooter: false,
      }
    );

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  })

  // Mount API routes
  .use(apiRoutes)

  // Mount session routes (login/logout/status)
  .use(sessionRoutes)

  // Mount SSE routes (real-time updates)
  .use(sseRoutes)

  // Mount group routes (handles workshop group URLs and lobby)
  .use(groupRoutes);

// TODO: Add remaining route groups when implemented
// .group('/admin', (app) => app.use(adminRoutes))

// For development, let Bun handle the server startup
export type App = typeof app;
export default {
  port: env.PORT,
  hostname: env.HOST,
  fetch: app.fetch,
};
