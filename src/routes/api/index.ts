/**
 * API Routes Index
 * 
 * Combines all API routes for the Schreibmaschine application
 */

import { Elysia } from 'elysia';
import { workshopRoutes } from './workshops';
import { participantRoutes } from './participants';

export const apiRoutes = new Elysia({ prefix: '/api' })
  // API Health check
  .get('/health', () => ({
    success: true,
    service: 'schreibmaschine-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      workshops: '/api/workshops',
      participants: '/api/participants',
      // TODO: Add more endpoints as they're implemented
      groups: '/api/groups (coming soon)',
      activities: '/api/activities (coming soon)',
      sessions: '/api/sessions (coming soon)'
    }
  }))
  
  // Mount all API route groups
  .use(workshopRoutes)
  .use(participantRoutes)
  
  // TODO: Add more route groups as they're implemented
  // .use(writingGroupRoutes)
  // .use(workshopGroupRoutes)
  // .use(activityRoutes)
  // .use(sessionRoutes)
  
  // Global API error handling
  .onError(({ code, error, set }) => {
    console.error(`[API Error ${code}]`, error);
    
    // Set appropriate status codes
    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return {
          success: false,
          error: 'Validation failed',
          details: error.message,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        };
      case 'NOT_FOUND':
        set.status = 404;
        return {
          success: false,
          error: 'Endpoint not found',
          timestamp: new Date().toISOString()
        };
      default:
        set.status = 500;
        return {
          success: false,
          error: 'Internal server error',
          details: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        };
    }
  });