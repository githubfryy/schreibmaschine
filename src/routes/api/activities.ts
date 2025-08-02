import { Elysia } from 'elysia';
import { ActivityService } from '../../services/activity.service';
import { sessionMiddleware } from '../../middleware/session';
import { z } from 'zod';

// Input validation schemas
const ActivityCreateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['individual_pad', 'collaborative_pad', 'rhyming_chain', 'paper_drawing', 'timed_writing', 'mashup_writing']),
  description: z.string().optional(),
  settings: z.record(z.any()).optional(),
  max_participants: z.number().optional()
});

const ActivityUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['setup', 'active', 'paused', 'completed']).optional(),
  settings: z.record(z.any()).optional()
});

const ActivitySubmissionSchema = z.object({
  content: z.string().min(1)
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
  .get('/:activityId/state', async ({ params, activityService, participant }) => {
    if (!participant?.id) {
      throw new Error('Authentication required');
    }

    const state = await activityService.getActivityState(params.activityId, participant.id);
    return state;
  })

  // Create new activity (teamer only)
  .post('/groups/:groupId', async ({ params, body, activityService, participant }) => {
    if (!participant?.id) {
      throw new Error('Authentication required');
    }

    // Check if user is teamer for this group
    const isTeamer = await activityService.isTeamerForGroup(participant.id, params.groupId);
    if (!isTeamer) {
      throw new Error('Only teamers can create activities');
    }

    const validated = ActivityCreateSchema.parse(body);
    const activity = await activityService.createActivity(params.groupId, {
      ...validated,
      created_by: participant.id
    });

    return { activity };
  })

  // Update activity (teamer only)
  .put('/:activityId', async ({ params, body, activityService, participant }) => {
    if (!participant?.id) {
      throw new Error('Authentication required');
    }

    const activity = await activityService.getActivityById(params.activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    // Check if user is teamer for this group
    const isTeamer = await activityService.isTeamerForGroup(participant.id, activity.workshop_group_id);
    if (!isTeamer) {
      throw new Error('Only teamers can update activities');
    }

    const validated = ActivityUpdateSchema.parse(body);
    const updatedActivity = await activityService.updateActivity(params.activityId, validated);

    return { activity: updatedActivity };
  })

  // Submit content to activity (participant)
  .post('/:activityId/submit', async ({ params, body, activityService, participant }) => {
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
  .post('/:activityId/skip', async ({ params, activityService, participant }) => {
    if (!participant?.id) {
      throw new Error('Authentication required');
    }

    const result = await activityService.skipTurn(params.activityId, participant.id);
    return result;
  })

  // Delete activity (teamer only)
  .delete('/:activityId', async ({ params, activityService, participant }) => {
    if (!participant?.id) {
      throw new Error('Authentication required');
    }

    const activity = await activityService.getActivityById(params.activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    // Check if user is teamer for this group
    const isTeamer = await activityService.isTeamerForGroup(participant.id, activity.workshop_group_id);
    if (!isTeamer) {
      throw new Error('Only teamers can delete activities');
    }

    await activityService.deleteActivity(params.activityId);
    return { success: true };
  })

  // Error handling
  .onError(({ error, set }) => {
    console.error('Activity API error:', error);
    
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
    
    // Validation errors
    if (error.name === 'ZodError') {
      set.status = 400;
      return { error: 'Invalid input', details: error.errors };
    }
    
    // Internal server error
    set.status = 500;
    return { error: 'Internal server error' };
  });