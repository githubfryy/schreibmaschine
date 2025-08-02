import type { Database } from 'bun:sqlite';
import db from '../config/database';
import type {
  Activity,
  ActivityState,
  CreateActivityData,
  UpdateActivityData,
} from '../types/database';
import { generateShortId } from '../utils/crypto';
import { RhymingGameService } from './rhyming-game.service';

export class ActivityService {
  private db: Database;
  private rhymingGameService: RhymingGameService;

  constructor() {
    this.db = db;
    this.rhymingGameService = new RhymingGameService();
  }

  /**
   * Get all activities for a workshop group
   */
  async getActivitiesForGroup(groupId: string): Promise<Activity[]> {
    const query = this.db.query(`
      SELECT a.*, 
             COUNT(ap.participant_id) as participant_count,
             MAX(at.created_at) as last_turn_at
      FROM activities a
      LEFT JOIN activity_participants ap ON a.id = ap.activity_id
      LEFT JOIN activity_turns at ON a.id = at.activity_id
      WHERE a.workshop_group_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);

    return query.all(groupId) as Activity[];
  }

  /**
   * Get activity by ID
   */
  async getActivityById(activityId: string): Promise<Activity | null> {
    const query = this.db.query(`
      SELECT a.*, 
             COUNT(ap.participant_id) as participant_count
      FROM activities a
      LEFT JOIN activity_participants ap ON a.id = ap.activity_id
      WHERE a.id = ?
      GROUP BY a.id
    `);

    const result = query.get(activityId) as Activity | null;
    return result;
  }

  /**
   * Get activity state for specific participant
   */
  async getActivityState(activityId: string, participantId: string): Promise<ActivityState> {
    const activity = await this.getActivityById(activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    const baseState: ActivityState = {
      activityId,
      participantId,
      isParticipant: false,
      canParticipate: false,
      isMyTurn: false,
      currentPlayer: null,
      previousLine: null,
      turnOrder: [],
      myTurnNumber: null,
    };

    // Check if participant is part of this activity
    const participantQuery = this.db.query(`
      SELECT * FROM activity_participants 
      WHERE activity_id = ? AND participant_id = ?
    `);
    const isParticipant = participantQuery.get(activityId, participantId);
    baseState.isParticipant = !!isParticipant;
    baseState.canParticipate = activity.status === 'active' && !!isParticipant;

    // Handle different activity types
    switch (activity.type) {
      case 'rhyming_chain':
        return await this.getRhymingChainState(activityId, participantId, baseState);

      case 'individual_pad':
        return await this.getIndividualPadState(activityId, participantId, baseState);

      case 'collaborative_pad':
        return await this.getCollaborativePadState(activityId, participantId, baseState);

      default:
        return baseState;
    }
  }

  /**
   * Create new activity
   */
  async createActivity(groupId: string, data: CreateActivityData): Promise<Activity> {
    const activityId = generateShortId();

    const insertQuery = this.db.query(`
      INSERT INTO activities (
        id, workshop_group_id, name, type, description, 
        status, settings, max_participants, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    insertQuery.run(
      activityId,
      groupId,
      data.name,
      data.type,
      data.description || null,
      'setup',
      JSON.stringify(data.settings || {}),
      data.max_participants || null,
      data.created_by
    );

    // Add all group participants to the activity by default
    await this.addGroupParticipantsToActivity(activityId, groupId);

    // Notify group about new activity (would use SSEManager in real implementation)
    // SSEManager.broadcastToGroup(groupId, {
    //   type: 'activity_update',
    //   data: { activityId, action: 'created' }
    // });

    const activity = await this.getActivityById(activityId);
    return activity!;
  }

  /**
   * Update activity
   */
  async updateActivity(activityId: string, data: UpdateActivityData): Promise<Activity> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updateFields.push('name = ?');
      values.push(data.name);
    }

    if (data.description !== undefined) {
      updateFields.push('description = ?');
      values.push(data.description);
    }

    if (data.status !== undefined) {
      updateFields.push('status = ?');
      values.push(data.status);
    }

    if (data.settings !== undefined) {
      updateFields.push('settings = ?');
      values.push(JSON.stringify(data.settings));
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push("updated_at = datetime('now')");
    values.push(activityId);

    const updateQuery = this.db.query(`
      UPDATE activities 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);

    updateQuery.run(...values);

    const activity = await this.getActivityById(activityId);

    // Initialize rhyming game when status changes to 'active'
    if (data.status === 'active' && activity?.type === 'rhyming_chain') {
      try {
        await this.rhymingGameService.initializeGame(activityId);
        console.log(`🎭 Rhyming game initialized for activity ${activityId}`);
      } catch (error) {
        console.error('Failed to initialize rhyming game:', error);
      }
    }

    // Get group ID for notifications
    // if (activity) {
    //   SSEManager.broadcastToGroup(activity.workshop_group_id, {
    //     type: 'activity_update',
    //     data: { activityId, action: 'updated', status: data.status }
    //   });
    // }

    return activity!;
  }

  /**
   * Submit content to activity
   */
  async submitToActivity(activityId: string, participantId: string, content: string): Promise<any> {
    const activity = await this.getActivityById(activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    if (activity.status !== 'active') {
      throw new Error('Activity is not active');
    }

    // Check if participant is allowed
    const participantQuery = this.db.query(`
      SELECT * FROM activity_participants 
      WHERE activity_id = ? AND participant_id = ?
    `);
    const isParticipant = participantQuery.get(activityId, participantId);
    if (!isParticipant) {
      throw new Error('Not a participant in this activity');
    }

    switch (activity.type) {
      case 'rhyming_chain':
        return await this.submitRhyme(activityId, participantId, content);

      case 'individual_pad':
        return await this.submitIndividualContent(activityId, participantId, content);

      default:
        throw new Error('Submission not supported for this activity type');
    }
  }

  /**
   * Skip turn in turn-based activity
   */
  async skipTurn(activityId: string, participantId: string): Promise<any> {
    const activity = await this.getActivityById(activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    if (activity.type !== 'rhyming_chain') {
      throw new Error('Turn skipping only available for rhyming chain activities');
    }

    try {
      // Get current state to find which paper to skip
      const state = await this.getActivityState(activityId, participantId);
      if (!state.isMyTurn) {
        throw new Error('Not your turn');
      }

      // Extract paper ID from the state
      const currentPaper = (state as any).currentPaper;
      if (!currentPaper?.paperId) {
        throw new Error('No paper assigned to this participant');
      }

      // Use rhyming game service to skip turn
      const result = await this.rhymingGameService.skipTurn(
        activityId,
        participantId,
        currentPaper.paperId
      );

      // Broadcast turn update
      // SSEManager.broadcastToGroup(activity.workshop_group_id, {
      //   type: 'turn_update',
      //   data: {
      //     activityId,
      //     participantId,
      //     paperId: currentPaper.paperId,
      //     nextParticipant: result.nextParticipant,
      //     action: 'skip'
      //   }
      // });

      return { success: true, skipped: true, nextParticipant: result.nextParticipant };
    } catch (error) {
      console.error('Error skipping turn:', error);
      throw error;
    }
  }

  /**
   * Delete activity
   */
  async deleteActivity(activityId: string): Promise<void> {
    // Get activity info before deletion for notifications
    // const activity = await this.getActivityById(activityId);

    // Delete in correct order due to foreign key constraints
    this.db.query('DELETE FROM activity_turns WHERE activity_id = ?').run(activityId);
    this.db.query('DELETE FROM activity_participants WHERE activity_id = ?').run(activityId);
    this.db.query('DELETE FROM activities WHERE id = ?').run(activityId);

    // Notify group
    // if (activity) {
    //   SSEManager.broadcastToGroup(activity.workshop_group_id, {
    //     type: 'activity_update',
    //     data: { activityId, action: 'deleted' }
    //   });
    // }
  }

  /**
   * Check if participant is teamer for group
   */
  async isTeamerForGroup(participantId: string, groupId: string): Promise<boolean> {
    const query = this.db.query(`
      SELECT 1 FROM group_participants 
      WHERE workshop_group_id = ? AND participant_id = ? AND role = 'teamer'
    `);

    return !!query.get(groupId, participantId);
  }

  // Private helper methods

  private async getRhymingChainState(
    activityId: string,
    participantId: string,
    baseState: ActivityState
  ): Promise<ActivityState> {
    try {
      // Use the dedicated rhyming game service
      const gameState = await this.rhymingGameService.getGameState(activityId, participantId);

      baseState.isMyTurn = gameState.isMyTurn;
      baseState.previousLine = gameState.currentPaper?.previousLine || null;
      baseState.myTurnNumber = gameState.currentPaper?.turnNumber || null;
      baseState.currentPlayer = gameState.waitingFor || null;

      // Store additional rhyming game specific data
      (baseState as any).currentPaper = gameState.currentPaper;
      (baseState as any).myPapers = gameState.myPapers;

      return baseState;
    } catch (error) {
      console.error('Error getting rhyming chain state:', error);
      return baseState;
    }
  }

  private async getIndividualPadState(
    _activityId: string,
    _participantId: string,
    baseState: ActivityState
  ): Promise<ActivityState> {
    // Individual pads are always available for participants
    return baseState;
  }

  private async getCollaborativePadState(
    _activityId: string,
    _participantId: string,
    baseState: ActivityState
  ): Promise<ActivityState> {
    // Collaborative pads need document ID and editing permissions
    return baseState;
  }

  private async addGroupParticipantsToActivity(activityId: string, groupId: string): Promise<void> {
    const participantsQuery = this.db.query(`
      SELECT participant_id FROM group_participants WHERE workshop_group_id = ?
    `);
    const participants = participantsQuery.all(groupId) as Array<{ participant_id: string }>;

    const insertParticipantQuery = this.db.query(`
      INSERT INTO activity_participants (activity_id, participant_id, created_at)
      VALUES (?, ?, datetime('now'))
    `);

    for (const participant of participants) {
      insertParticipantQuery.run(activityId, participant.participant_id);
    }
  }

  private async submitRhyme(
    activityId: string,
    participantId: string,
    content: string
  ): Promise<any> {
    try {
      // Get current state to find which paper to submit to
      const state = await this.getActivityState(activityId, participantId);
      if (!state.isMyTurn) {
        throw new Error('Not your turn');
      }

      // Extract paper ID from the state (added by getRhymingChainState)
      const currentPaper = (state as any).currentPaper;
      if (!currentPaper?.paperId) {
        throw new Error('No paper assigned to this participant');
      }

      // Use rhyming game service to submit
      const result = await this.rhymingGameService.submitLine(
        activityId,
        participantId,
        currentPaper.paperId,
        content
      );

      // Get activity for broadcasting
      // const activity = await this.getActivityById(activityId);

      // Broadcast turn update
      // SSEManager.broadcastToGroup(activity!.workshop_group_id, {
      //   type: 'turn_update',
      //   data: {
      //     activityId,
      //     participantId,
      //     content,
      //     paperId: currentPaper.paperId,
      //     nextParticipant: result.nextParticipant,
      //     action: 'submit'
      //   }
      // });

      return { success: true, submitted: true, nextParticipant: result.nextParticipant };
    } catch (error) {
      console.error('Error submitting rhyme:', error);
      throw error;
    }
  }

  private async submitIndividualContent(
    _activityId: string,
    _participantId: string,
    _content: string
  ): Promise<any> {
    // For individual pads, we save to documents table
    // This will be handled by DocumentService
    return { success: true, saved: true };
  }
}
