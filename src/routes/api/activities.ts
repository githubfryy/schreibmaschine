import { Elysia } from 'elysia';
import { z } from 'zod';
import { sessionMiddleware } from '../../middleware/session';
import { ActivityService } from '../../services/activity.service';

// Input validation schemas
const ActivityCreateSchema = z.object({
  name: z.string().min(1),
  type: z
    .string()
    .refine(
      (val) =>
        [
          'individual_pad',
          'collaborative_pad',
          'rhyming_chain',
          'paper_drawing',
          'timed_writing',
          'mashup_writing',
        ].includes(val),
      { message: 'Invalid activity type' }
    ),
  description: z.string().optional(),
  settings: z.record(z.string(), z.any()).optional(),
  max_participants: z.number().optional(),
});

const ActivityUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z
    .string()
    .refine((val) => ['setup', 'active', 'paused', 'completed'].includes(val), {
      message: 'Invalid status',
    })
    .optional(),
  settings: z.record(z.string(), z.any()).optional(),
});

const ActivitySubmissionSchema = z.object({
  content: z.string().min(1),
});

export const activitiesRoutes = new Elysia({ prefix: '/activities' })
  .use(sessionMiddleware)
  .decorate('activityService', new ActivityService())

  // Get activities for a group
  .get('/groups/:groupId', async ({ params, activityService }) => {
    const activities = await activityService.getActivitiesForGroup(params.groupId);
    return { activities };
  })

  // Get specific activity details
  .get('/:activityId', async ({ params, activityService }) => {
    const activity = await activityService.getActivityById(params.activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }
    return { activity };
  })

  // Get activity state (for current participant)
  .get('/:activityId/state', async (context: any) => {
    const { params, activityService, participant } = context;
    if (!participant?.id) {
      throw new Error('Authentication required');
    }

    const state = await activityService.getActivityState(params.activityId, participant.id);
    return state;
  })

  // Create new activity (teamer only)
  .post('/groups/:groupId', async (context: any) => {
    const { params, body, activityService, participant } = context;
    if (!participant?.id) {
      throw new Error('Authentication required');
    }

    // Check if user is teamer for this group
    const isTeamer = await activityService.isTeamerForGroup(participant.id, params.groupId);
    if (!isTeamer) {
      throw new Error('Only teamers can create activities');
    }

    const validated = ActivityCreateSchema.parse(body);
    const activityData = {
      name: validated.name,
      type: validated.type,
      description: validated.description || '',
      settings: validated.settings || {},
      max_participants: validated.max_participants,
      created_by: participant.id,
    };
    const activity = await activityService.createActivity(params.groupId, activityData);

    return { activity };
  })

  // Update activity (teamer only)
  .put('/:activityId', async (context: any) => {
    const { params, body, activityService, participant } = context;
    if (!participant?.id) {
      throw new Error('Authentication required');
    }

    const activity = await activityService.getActivityById(params.activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    // Check if user is teamer for this group
    const isTeamer = await activityService.isTeamerForGroup(
      participant.id,
      activity.workshop_group_id
    );
    if (!isTeamer) {
      throw new Error('Only teamers can update activities');
    }

    const validated = ActivityUpdateSchema.parse(body);
    const updateData = {
      ...(validated.name !== undefined && { name: validated.name }),
      ...(validated.description !== undefined && { description: validated.description }),
      ...(validated.status !== undefined && { status: validated.status }),
      ...(validated.settings !== undefined && { settings: validated.settings }),
    };
    const updatedActivity = await activityService.updateActivity(params.activityId, updateData);

    return { activity: updatedActivity };
  })

  // Submit content to activity (participant)
  .post('/:activityId/submit', async (context: any) => {
    const { params, body, activityService, participant } = context;
    if (!participant?.id) {
      throw new Error('Authentication required');
    }

    const validated = ActivitySubmissionSchema.parse(body);
    const result = await activityService.submitToActivity(
      params.activityId,
      participant.id,
      validated.content
    );

    return result;
  })

  // Skip turn in activity (for turn-based activities)
  .post('/:activityId/skip', async (context: any) => {
    const { params, activityService, participant } = context;
    if (!participant?.id) {
      throw new Error('Authentication required');
    }

    const result = await activityService.skipTurn(params.activityId, participant.id);
    return result;
  })

  // Delete activity (teamer only)
  .delete('/:activityId', async (context: any) => {
    const { params, activityService, participant } = context;
    if (!participant?.id) {
      throw new Error('Authentication required');
    }

    const activity = await activityService.getActivityById(params.activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    // Check if user is teamer for this group
    const isTeamer = await activityService.isTeamerForGroup(
      participant.id,
      activity.workshop_group_id
    );
    if (!isTeamer) {
      throw new Error('Only teamers can delete activities');
    }

    await activityService.deleteActivity(params.activityId);
    return { success: true };
  })

  // Error handling
  .onError((context: any) => {
    const { error, set } = context;
    console.error('Activity API error:', error);

    // Handle Error objects
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        set.status = 401;
        return { error: 'Authentication required' };
      }

      if (error.message === 'Activity not found') {
        set.status = 404;
        return { error: 'Activity not found' };
      }

      if (error.message.includes('Only teamers')) {
        set.status = 403;
        return { error: error.message };
      }
    }

    // Validation errors (ZodError)
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      set.status = 400;
      return { error: 'Invalid input', details: (error as any).errors };
    }

    // Internal server error
    set.status = 500;
    return { error: 'Internal server error' };
  });
