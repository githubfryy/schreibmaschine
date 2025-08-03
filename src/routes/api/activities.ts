/**
 * Activity API Routes
 *
 * REST API endpoints for activity management
 * Following Elysia 1.3.8 method chaining best practices
 */

import { Elysia, t } from 'elysia';
import { ActivityService } from '@/services/activity.service';
import { sessionMiddleware, requireAuth, requireTeamer } from '@/middleware/session';
import type { ApiError } from '@/types/api';

// Activity validation models
const ActivityModel = {
  query: t.Object({
    page: t.Optional(t.Numeric({ minimum: 1 })),
    limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
    group_id: t.Optional(t.String()),
    status: t.Optional(t.Union([
      t.Literal('setup'),
      t.Literal('active'), 
      t.Literal('paused'),
      t.Literal('completed')
    ])),
  }),
  
  params: {
    id: t.Object({ id: t.String() }),
    groupId: t.Object({ groupId: t.String() }),
  },
  
  body: {
    create: t.Object({
      name: t.String({ minLength: 1, maxLength: 200 }),
      type: t.Union([
        t.Literal('individual_pad'),
        t.Literal('collaborative_pad'),
        t.Literal('rhyming_chain'),
        t.Literal('paper_drawing'),
        t.Literal('timed_writing'),
        t.Literal('mashup_writing'),
      ]),
      description: t.Optional(t.String({ maxLength: 1000 })),
      settings: t.Optional(t.Record(t.String(), t.Any())),
      max_participants: t.Optional(t.Numeric({ minimum: 1 })),
    }),
    
    update: t.Object({
      name: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
      description: t.Optional(t.String({ maxLength: 1000 })),
      status: t.Optional(t.Union([
        t.Literal('setup'),
        t.Literal('active'),
        t.Literal('paused'),
        t.Literal('completed')
      ])),
      settings: t.Optional(t.Record(t.String(), t.Any())),
    }),
    
    submit: t.Object({
      content: t.String({ minLength: 1 }),
    }),
  },
};

export const activitiesRoutes = new Elysia({ prefix: '/activities' })
  .use(sessionMiddleware)
  // Register models for better type inference
  .model({
    'activity.query': ActivityModel.query,
    'activity.create': ActivityModel.body.create,
    'activity.update': ActivityModel.body.update,
    'activity.submit': ActivityModel.body.submit,
  })
  
  // Get all activities with pagination and filtering
  .get('/', async ({ query }) => {
    const {
      page = 1,
      limit = 20,
      group_id,
      status,
    } = query;

    const result = await ActivityService.findAll({
      page: Number(page),
      limit: Number(limit),
      ...(group_id && { group_id }),
      ...(status && { status }),
    });

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }, {
    query: 'activity.query',
  })
  
  // Get activity by ID
  .get('/:id', async ({ params, set }) => {
    const activity = await ActivityService.findById(params.id);

    if (!activity) {
      set.status = 404;
      const apiError: ApiError = {
        success: false,
        error: 'Activity not found',
        timestamp: new Date().toISOString(),
      };
      return apiError;
    }

    return {
      success: true,
      data: activity,
      timestamp: new Date().toISOString(),
    };
  }, {
    params: ActivityModel.params.id,
  })

  // Get activities for a specific group
  .get('/groups/:groupId', async ({ params }) => {
    const activities = await ActivityService.getActivitiesForGroup(params.groupId);
    
    return {
      success: true,
      data: activities,
      timestamp: new Date().toISOString(),
    };
  }, {
    params: ActivityModel.params.groupId,
  })

  // Get activity state for current participant (requires auth)
  .use(requireAuth)
  .get('/:id/state', async (context: any) => {
    const { params, participant } = context;
    const state = await ActivityService.getActivityState(params.id, participant.id);
    
    return {
      success: true,
      data: state,
      timestamp: new Date().toISOString(),
    };
  }, {
    params: ActivityModel.params.id,
  })

  // Create new activity for a group (requires teamer role)
  .use(requireTeamer)
  .post('/groups/:groupId', async (context: any) => {
    const { params, body, set, participant } = context;
    const activity = await ActivityService.createActivity(params.groupId, {
      ...body,
      created_by: participant.id,
    });

    set.status = 201;
    return {
      success: true,
      data: activity,
      message: 'Activity created successfully',
      timestamp: new Date().toISOString(),
    };
  }, {
    params: ActivityModel.params.groupId,
    body: 'activity.create',
  })

  // Update activity (requires teamer role)
  .use(requireTeamer)
  .put('/:id', async (context: any) => {
    const { params, body, set } = context;
    const activity = await ActivityService.updateActivity(params.id, body);

    if (!activity) {
      set.status = 404;
      const apiError: ApiError = {
        success: false,
        error: 'Activity not found',
        timestamp: new Date().toISOString(),
      };
      return apiError;
    }

    return {
      success: true,
      data: activity,
      message: 'Activity updated successfully',
      timestamp: new Date().toISOString(),
    };
  }, {
    params: ActivityModel.params.id,
    body: 'activity.update',
  })

  // Submit content to activity (requires participant auth)
  .use(requireAuth)
  .post('/:id/submit', async (context: any) => {
    const { params, body, participant } = context;
    const result = await ActivityService.submitToActivity(
      params.id,
      participant.id,
      body.content
    );

    return {
      success: true,
      data: result,
      message: 'Content submitted successfully',
      timestamp: new Date().toISOString(),
    };
  }, {
    params: ActivityModel.params.id,
    body: 'activity.submit',
  })

  // Skip turn in activity (for turn-based activities, requires participant auth)
  .use(requireAuth)
  .post('/:id/skip', async (context: any) => {
    const { params, participant } = context;
    const result = await ActivityService.skipTurn(params.id, participant.id);
    
    return {
      success: true,
      data: result,
      message: 'Turn skipped successfully',
      timestamp: new Date().toISOString(),
    };
  }, {
    params: ActivityModel.params.id,
  })

  // Delete activity (requires teamer role)
  .use(requireTeamer)
  .delete('/:id', async (context: any) => {
    const { params, set } = context;
    const deleted = await ActivityService.deleteActivity(params.id);

    if (!deleted) {
      set.status = 404;
      const apiError: ApiError = {
        success: false,
        error: 'Activity not found',
        timestamp: new Date().toISOString(),
      };
      return apiError;
    }

    return {
      success: true,
      message: 'Activity deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }, {
    params: ActivityModel.params.id,
  })

  // Add global error handling for activity routes
  .onError(({ code, error, set }) => {
    console.error(`[Activity API Error ${code}]`, error);

    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return {
          success: false,
          error: 'Validation failed',
          details: error.message,
          timestamp: new Date().toISOString(),
        };
      case 'NOT_FOUND':
        set.status = 404;
        return {
          success: false,
          error: 'Resource not found',
          timestamp: new Date().toISOString(),
        };
      default:
        set.status = 500;
        return {
          success: false,
          error: 'Internal server error',
          details: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        };
    }
  });
