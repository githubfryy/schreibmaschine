import { html } from '@elysiajs/html';
import { staticPlugin } from '@elysiajs/static';
import { Elysia } from 'elysia';

import { env, isDevelopment } from '@/config/env';
import { apiRoutes } from '@/routes/api';

// TODO: Import remaining route handlers when implemented
// import { groupRoutes } from '@/routes/groups';
// import { lobbyRoutes } from '@/routes/lobby';
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

  // Temporary welcome page (will be replaced with proper routing)
  .get('/', () => {
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Schreibmaschine</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
          .welcome { text-align: center; margin: 3rem 0; }
          .status { background: #f0f9ff; padding: 1rem; border-radius: 8px; margin: 2rem 0; }
          .todo { background: #fffbeb; padding: 1rem; border-radius: 8px; margin: 2rem 0; }
          ul { text-align: left; }
        </style>
      </head>
      <body>
        <div class="welcome">
          <h1>🖋️ Schreibmaschine</h1>
          <p>Kollaborative Schreibapp für kreative Schreibwerkstätten</p>
        </div>
        
        <div class="status">
          <h2>✅ Backend läuft</h2>
          <ul>
            <li>Bun ${process.versions.bun || 'unknown'}</li>
            <li>Elysia.js Server</li>
            <li>TypeScript mit strikter Konfiguration</li>
            <li>Environment: ${env.NODE_ENV}</li>
            <li>Port: ${env.PORT}</li>
          </ul>
        </div>
        
        <div class="todo">
          <h2>🚧 In Entwicklung</h2>
          <ul>
            <li>SQLite Datenbank Setup</li>
            <li>Workshop & Gruppen Verwaltung</li>
            <li>Teilnehmer Management</li>
            <li>URL Routing System</li>
            <li>Session Management</li>
            <li>SSE für Echtzeit-Updates</li>
            <li>Admin Interface</li>
            <li>HTML Templates</li>
          </ul>
        </div>
        
        <div class="status">
          <h2>📊 API Endpunkte</h2>
          <ul>
            <li><a href="/health">GET /health</a> - Server Status</li>
            <li><a href="/api/health">GET /api/health</a> - API Status</li>
            <li><a href="/api/workshops">GET /api/workshops</a> - Workshop API</li>
            <li><a href="/api/participants">GET /api/participants</a> - Participant API</li>
            <li>GET /admin - (Coming Soon)</li>
          </ul>
        </div>
      </body>
      </html>
    `,
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  })

  // Mount API routes
  .use(apiRoutes)
  
  // TODO: Add route groups when implemented
  // .group('/admin', (app) => app.use(adminRoutes))
  // .use(groupRoutes)
  // .use(lobbyRoutes)
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
