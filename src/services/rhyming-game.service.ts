import { Database } from 'bun:sqlite';
import db from '../config/database';
import type { ActivityTurn, Participant } from '../types/database';
import { generateShortId } from '../utils/crypto';

/**
 * Rhyming Chain Game Service
 * Implements the "folded paper" rhyming game logic
 */
export class RhymingGameService {
  private db: Database;

  constructor() {
    this.db = db;
  }

  /**
   * Initialize a rhyming chain game
   * Creates papers for circulation and sets up turn order
   */
  async initializeGame(activityId: string): Promise<{
    papers: Array<{ paperId: string, startingParticipant: string }>,
    turnOrder: string[]
  }> {
    // Get all participants in the activity
    const participantsQuery = this.db.query(`
      SELECT ap.participant_id, p.display_name
      FROM activity_participants ap
      JOIN participants p ON ap.participant_id = p.id
      WHERE ap.activity_id = ?
      ORDER BY ap.created_at
    `);
    
    const participants = participantsQuery.all(activityId) as Array<{
      participant_id: string,
      display_name: string
    }>;

    if (participants.length === 0) {
      throw new Error('No participants found for this activity');
    }

    // Create papers (one per participant)
    const papers: Array<{ paperId: string, startingParticipant: string }> = [];
    
    for (const participant of participants) {
      const paperId = generateShortId(6);
      papers.push({
        paperId,
        startingParticipant: participant.participant_id
      });

      // Create the initial turn entry for this paper
      const initialTurnId = generateShortId(8);
      const insertTurnQuery = this.db.query(`
        INSERT INTO activity_turns (
          id, activity_id, participant_id, turn_number, 
          paper_id, content, is_skip, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      insertTurnQuery.run(
        initialTurnId,
        activityId,
        participant.participant_id,
        1,
        paperId,
        '', // Empty initial content
        0
      );
    }

    return {
      papers,
      turnOrder: participants.map(p => p.participant_id)
    };
  }

  /**
   * Get current game state for a participant
   */
  async getGameState(activityId: string, participantId: string): Promise<{
    isMyTurn: boolean,
    currentPaper?: {
      paperId: string,
      previousLine: string | null,
      turnNumber: number
    },
    waitingFor?: string,
    myPapers: Array<{
      paperId: string,
      isComplete: boolean,
      totalTurns: number
    }>
  }> {
    // Get all participants and their order
    const participantsQuery = this.db.query(`
      SELECT ap.participant_id, p.display_name
      FROM activity_participants ap
      JOIN participants p ON ap.participant_id = p.id
      WHERE ap.activity_id = ?
      ORDER BY ap.created_at
    `);
    
    const participants = participantsQuery.all(activityId) as Array<{
      participant_id: string,
      display_name: string
    }>;

    const participantOrder = participants.map(p => p.participant_id);
    const currentParticipantIndex = participantOrder.indexOf(participantId);
    
    if (currentParticipantIndex === -1) {
      throw new Error('Participant not found in activity');
    }

    // Find papers that are currently at this participant's turn
    const currentPaperQuery = this.db.query(`
      SELECT 
        at.paper_id,
        at.turn_number,
        MAX(at.turn_number) as max_turn,
        COUNT(*) as total_turns
      FROM activity_turns at
      WHERE at.activity_id = ?
      GROUP BY at.paper_id
    `);

    const paperStates = currentPaperQuery.all(activityId) as Array<{
      paper_id: string,
      turn_number: number,
      max_turn: number,
      total_turns: number
    }>;

    // Check which paper should be with this participant
    const totalParticipants = participants.length;
    let currentPaper = null;
    let waitingFor = null;

    for (const paperState of paperStates) {
      // Calculate whose turn it is for this paper
      const currentTurnIndex = (paperState.max_turn - 1) % totalParticipants;
      const currentTurnParticipant = participantOrder[currentTurnIndex];

      if (currentTurnParticipant === participantId) {
        // This paper is waiting for this participant
        const previousLineQuery = this.db.query(`
          SELECT content FROM activity_turns
          WHERE activity_id = ? AND paper_id = ? AND turn_number = ? AND is_skip = 0
          ORDER BY created_at DESC LIMIT 1
        `);

        const previousLineResult = previousLineQuery.get(
          activityId, 
          paperState.paper_id, 
          paperState.max_turn
        ) as { content: string } | null;

        currentPaper = {
          paperId: paperState.paper_id,
          previousLine: previousLineResult?.content || null,
          turnNumber: paperState.max_turn + 1
        };
        break;
      } else {
        // Find who this paper is waiting for
        const waitingParticipant = participants.find(p => p.participant_id === currentTurnParticipant);
        if (waitingParticipant) {
          waitingFor = waitingParticipant.display_name;
        }
      }
    }

    // Get info about papers this participant started
    const myPapersQuery = this.db.query(`
      SELECT DISTINCT 
        at.paper_id,
        COUNT(at.id) as total_turns,
        CASE 
          WHEN COUNT(at.id) >= ? THEN 1 
          ELSE 0 
        END as is_complete
      FROM activity_turns at
      WHERE at.activity_id = ? 
        AND at.paper_id IN (
          SELECT paper_id FROM activity_turns 
          WHERE activity_id = ? AND participant_id = ? AND turn_number = 1
        )
      GROUP BY at.paper_id
    `);

    const myPapers = myPapersQuery.all(
      totalParticipants, 
      activityId, 
      activityId, 
      participantId
    ) as Array<{
      paper_id: string,
      total_turns: number,
      is_complete: number
    }>;

    return {
      isMyTurn: currentPaper !== null,
      currentPaper,
      waitingFor,
      myPapers: myPapers.map(paper => ({
        paperId: paper.paper_id,
        isComplete: paper.is_complete === 1,
        totalTurns: paper.total_turns
      }))
    };
  }

  /**
   * Submit a line for the rhyming game
   */
  async submitLine(
    activityId: string, 
    participantId: string, 
    paperId: string, 
    content: string
  ): Promise<{ success: boolean, nextParticipant?: string }> {
    // Verify it's actually this participant's turn for this paper
    const gameState = await this.getGameState(activityId, participantId);
    
    if (!gameState.isMyTurn || gameState.currentPaper?.paperId !== paperId) {
      throw new Error('Not your turn for this paper');
    }

    // Create the turn entry
    const turnId = generateShortId(8);
    const insertTurnQuery = this.db.query(`
      INSERT INTO activity_turns (
        id, activity_id, participant_id, turn_number, 
        paper_id, content, is_skip, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    insertTurnQuery.run(
      turnId,
      activityId,
      participantId,
      gameState.currentPaper.turnNumber,
      paperId,
      content,
      0
    );

    // Determine next participant
    const participantsQuery = this.db.query(`
      SELECT participant_id FROM activity_participants 
      WHERE activity_id = ? 
      ORDER BY created_at
    `);
    
    const participants = participantsQuery.all(activityId) as Array<{ participant_id: string }>;
    const participantOrder = participants.map(p => p.participant_id);
    const currentIndex = participantOrder.indexOf(participantId);
    const nextIndex = (currentIndex + 1) % participantOrder.length;
    const nextParticipant = participantOrder[nextIndex];

    return {
      success: true,
      nextParticipant
    };
  }

  /**
   * Skip turn for a paper
   */
  async skipTurn(
    activityId: string, 
    participantId: string, 
    paperId: string
  ): Promise<{ success: boolean, nextParticipant?: string }> {
    // Verify it's actually this participant's turn
    const gameState = await this.getGameState(activityId, participantId);
    
    if (!gameState.isMyTurn || gameState.currentPaper?.paperId !== paperId) {
      throw new Error('Not your turn for this paper');
    }

    // Create skip turn entry
    const turnId = generateShortId(8);
    const insertTurnQuery = this.db.query(`
      INSERT INTO activity_turns (
        id, activity_id, participant_id, turn_number, 
        paper_id, content, is_skip, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    insertTurnQuery.run(
      turnId,
      activityId,
      participantId,
      gameState.currentPaper!.turnNumber,
      paperId,
      'SKIP',
      1
    );

    // Determine next participant
    const participantsQuery = this.db.query(`
      SELECT participant_id FROM activity_participants 
      WHERE activity_id = ? 
      ORDER BY created_at
    `);
    
    const participants = participantsQuery.all(activityId) as Array<{ participant_id: string }>;
    const participantOrder = participants.map(p => p.participant_id);
    const currentIndex = participantOrder.indexOf(participantId);
    const nextIndex = (currentIndex + 1) % participantOrder.length;
    const nextParticipant = participantOrder[nextIndex];

    return {
      success: true,
      nextParticipant
    };
  }

  /**
   * Get completed papers for viewing (admin/teamer only)
   */
  async getCompletedPapers(activityId: string): Promise<Array<{
    paperId: string,
    lines: Array<{
      participantName: string,
      content: string,
      turnNumber: number,
      isSkip: boolean,
      createdAt: string
    }>
  }>> {
    const papersQuery = this.db.query(`
      SELECT DISTINCT 
        at.paper_id,
        COUNT(at.id) as total_turns
      FROM activity_turns at
      WHERE at.activity_id = ?
      GROUP BY at.paper_id
    `);

    const papers = papersQuery.all(activityId) as Array<{
      paper_id: string,
      total_turns: number
    }>;

    const result = [];

    for (const paper of papers) {
      const linesQuery = this.db.query(`
        SELECT 
          at.content,
          at.turn_number,
          at.is_skip,
          at.created_at,
          p.display_name as participant_name
        FROM activity_turns at
        LEFT JOIN participants p ON at.participant_id = p.id
        WHERE at.activity_id = ? AND at.paper_id = ?
        ORDER BY at.turn_number
      `);

      const lines = linesQuery.all(activityId, paper.paper_id) as Array<{
        content: string,
        turn_number: number,
        is_skip: number,
        created_at: string,
        participant_name: string
      }>;

      result.push({
        paperId: paper.paper_id,
        lines: lines.map(line => ({
          participantName: line.participant_name || 'Unknown',
          content: line.content,
          turnNumber: line.turn_number,
          isSkip: line.is_skip === 1,
          createdAt: line.created_at
        }))
      });
    }

    return result;
  }

  /**
   * Check if the game is complete
   */
  async isGameComplete(activityId: string): Promise<boolean> {
    const participantCountQuery = this.db.query(`
      SELECT COUNT(*) as count FROM activity_participants WHERE activity_id = ?
    `);
    
    const participantCount = (participantCountQuery.get(activityId) as { count: number }).count;

    const paperCompletionQuery = this.db.query(`
      SELECT 
        paper_id,
        COUNT(*) as turn_count
      FROM activity_turns 
      WHERE activity_id = ?
      GROUP BY paper_id
      HAVING COUNT(*) >= ?
    `);

    const completedPapers = paperCompletionQuery.all(activityId, participantCount) as Array<{
      paper_id: string,
      turn_count: number
    }>;

    // Get total number of papers
    const totalPapersQuery = this.db.query(`
      SELECT COUNT(DISTINCT paper_id) as count FROM activity_turns WHERE activity_id = ?
    `);
    
    const totalPapers = (totalPapersQuery.get(activityId) as { count: number }).count;

    return completedPapers.length === totalPapers;
  }
}