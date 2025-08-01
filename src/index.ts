import { html } from '@elysiajs/html';
import { staticPlugin } from '@elysiajs/static';
import { Elysia } from 'elysia';

import { env, isDevelopment } from '@/config/env';
import { apiRoutes } from '@/routes/api';
import { groupRoutes } from '@/routes/groups';
import { TemplateService } from '@/services/template.service';

// TODO: Import remaining route handlers when implemented
// import { adminRoutes } from '@/routes/admin';
// import { sseRoutes } from '@/routes/sse';

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
const app = new Elysia({ name: 'schreibmaschine' })
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
    const html = TemplateService.render('welcome', {
      bun_version: process.versions.bun || 'unknown',
      environment: env.NODE_ENV,
      port: env.PORT
    }, {
      title: 'Schreibmaschine',
      showHeader: false,
      showFooter: false
    });
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  })

  // Mount API routes
  .use(apiRoutes)
  
  // Mount group routes (handles workshop group URLs and lobby)
  .use(groupRoutes)
  
  // TODO: Add remaining route groups when implemented
  // .group('/admin', (app) => app.use(adminRoutes))
  // .use(sseRoutes)

  // Start server
  .listen(env.PORT, () => {
    console.log('🖋️  Schreibmaschine Server gestartet');
    console.log(`📍 Server: http://${env.HOST}:${env.PORT}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`💾 Database: ${env.DATABASE_PATH}`);

    if (isDevelopment) {
      console.log('🔧 Development Mode - Hot Reload aktiv');
      console.log(`📊 Health Check: http://${env.HOST}:${env.PORT}/health`);
    }
  });

export type App = typeof app;
export default app;
