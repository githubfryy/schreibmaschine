import { Elysia } from 'elysia';
import { sessionMiddleware } from '@/middleware/session';
import { SessionService } from '@/services/session.service';
import { env } from '@/config/env';
import type { SSEEvent, OnlineStatusEvent } from '@/types/api';

/**
 * Server-Sent Events (SSE) Routes
 * Handles real-time updates for group status, activities, and notifications
 */

// Track active SSE connections per workshop group
const activeConnections = new Map<string, Set<{
  controller: ReadableStreamDefaultController;
  participantId: string;
  workshopGroupId: string;
  lastHeartbeat: number;
}>>();

/**
 * SSE Connection Manager
 */
export class SSEManager {
  /**
   * Add connection to tracking
   */
  static addConnection(
    workshopGroupId: string,
    participantId: string,
    controller: ReadableStreamDefaultController
  ): void {
    if (!activeConnections.has(workshopGroupId)) {
      activeConnections.set(workshopGroupId, new Set());
    }

    const connections = activeConnections.get(workshopGroupId)!;
    connections.add({
      controller,
      participantId,
      workshopGroupId,
      lastHeartbeat: Date.now()
    });

    console.log(`📡 SSE connection added for ${participantId} in group ${workshopGroupId}`);
  }

  /**
   * Remove connection from tracking
   */
  static removeConnection(
    workshopGroupId: string,
    controller: ReadableStreamDefaultController
  ): void {
    const connections = activeConnections.get(workshopGroupId);
    if (!connections) return;

    for (const conn of connections) {
      if (conn.controller === controller) {
        connections.delete(conn);
        console.log(`📡 SSE connection removed for ${conn.participantId} in group ${workshopGroupId}`);
        break;
      }
    }

    // Clean up empty groups
    if (connections.size === 0) {
      activeConnections.delete(workshopGroupId);
    }
  }

  /**
   * Broadcast event to all connections in a workshop group
   */
  static broadcastToGroup(workshopGroupId: string, event: SSEEvent): void {
    const connections = activeConnections.get(workshopGroupId);
    if (!connections) return;

    const eventData = `data: ${JSON.stringify(event)}\n\n`;
    const deadConnections: ReadableStreamDefaultController[] = [];

    for (const conn of connections) {
      try {
        conn.controller.enqueue(eventData);
        conn.lastHeartbeat = Date.now();
      } catch (error) {
        console.warn(`Failed to send SSE event to ${conn.participantId}:`, error);
        deadConnections.push(conn.controller);
      }
    }

    // Clean up dead connections
    for (const deadController of deadConnections) {
      SSEManager.removeConnection(workshopGroupId, deadController);
    }
  }

  /**
   * Broadcast online status update
   */
  static async broadcastOnlineStatus(workshopGroupId: string): Promise<void> {
    const onlineParticipants = await SessionService.getOnlineParticipants(workshopGroupId);
    
    const event: OnlineStatusEvent = {
      type: 'online_status',
      data: {
        workshop_group_id: workshopGroupId,
        online_participants: onlineParticipants.map(p => ({
          participant_id: p.participant.id,
          display_name: p.participant.display_name,
          last_seen: p.lastSeen,
          device_count: p.deviceCount
        })),
        total_online: onlineParticipants.length,
        last_updated: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      workshop_group_id: workshopGroupId
    };

    SSEManager.broadcastToGroup(workshopGroupId, event);
  }

  /**
   * Send heartbeat to all connections
   */
  static sendHeartbeat(): void {
    const heartbeatEvent = {
      type: 'heartbeat',
      data: { timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
      workshop_group_id: ''
    };

    for (const [workshopGroupId, connections] of activeConnections) {
      const eventData = `data: ${JSON.stringify({ ...heartbeatEvent, workshop_group_id: workshopGroupId })}\n\n`;
      
      for (const conn of connections) {
        try {
          conn.controller.enqueue(eventData);
        } catch (error) {
          // Connection is dead, will be cleaned up later
        }
      }
    }
  }

  /**
   * Clean up stale connections
   */
  static cleanupStaleConnections(): void {
    const staleThreshold = Date.now() - env.ONLINE_STATUS_TIMEOUT;
    
    for (const [workshopGroupId, connections] of activeConnections) {
      const staleConnections: ReadableStreamDefaultController[] = [];
      
      for (const conn of connections) {
        if (conn.lastHeartbeat < staleThreshold) {
          staleConnections.push(conn.controller);
        }
      }
      
      for (const staleController of staleConnections) {
        SSEManager.removeConnection(workshopGroupId, staleController);
      }
    }
  }

  /**
   * Get connection stats
   */
  static getStats(): {
    totalConnections: number;
    groupConnections: Record<string, number>;
  } {
    let totalConnections = 0;
    const groupConnections: Record<string, number> = {};

    for (const [workshopGroupId, connections] of activeConnections) {
      const count = connections.size;
      totalConnections += count;
      groupConnections[workshopGroupId] = count;
    }

    return { totalConnections, groupConnections };
  }
}

// Setup periodic tasks
setInterval(() => {
  SSEManager.sendHeartbeat();
}, env.SSE_HEARTBEAT_INTERVAL);

setInterval(() => {
  SSEManager.cleanupStaleConnections();
}, env.SSE_HEARTBEAT_INTERVAL * 2);

/**
 * SSE Routes
 */
export const sseRoutes = new Elysia({ name: 'sse' })
  .use(sessionMiddleware)

  // Main SSE endpoint for group updates
  .get('/api/groups/:groupId/events', async ({ params, participant, workshopGroup, isAuthenticated, set }) => {
    if (!isAuthenticated || !participant || !workshopGroup) {
      set.status = 401;
      return { error: 'Authentication required' };
    }

    if (workshopGroup.id !== params.groupId) {
      set.status = 403;
      return { error: 'Access denied to this group' };
    }

    // Set SSE headers
    set.headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    };

    // Create readable stream for SSE
    const stream = new ReadableStream({
      start(controller) {
        // Add connection to tracking
        SSEManager.addConnection(params.groupId, participant.id, controller);

        // Send initial connection event
        const initialEvent = {
          type: 'connected',
          data: {
            participant_id: participant.id,
            workshop_group_id: params.groupId,
            message: 'Connected to group events'
          },
          timestamp: new Date().toISOString(),
          workshop_group_id: params.groupId
        };

        controller.enqueue(`data: ${JSON.stringify(initialEvent)}\n\n`);

        // Send initial online status
        SSEManager.broadcastOnlineStatus(params.groupId);
      },
      
      cancel() {
        // Remove connection when client disconnects
        SSEManager.removeConnection(params.groupId, this as any);
      }
    });

    return new Response(stream);
  })

  // Trigger online status update (for testing)
  .post('/api/groups/:groupId/events/refresh', async ({ params, isAuthenticated, set }) => {
    if (!isAuthenticated) {
      set.status = 401;
      return { error: 'Authentication required' };
    }

    await SSEManager.broadcastOnlineStatus(params.groupId);
    
    return { 
      success: true, 
      message: 'Online status update broadcasted' 
    };
  })

  // Admin endpoint: Get SSE connection stats
  .get('/api/admin/sse/stats', () => {
    return SSEManager.getStats();
  })

  // Admin endpoint: Broadcast custom event to group
  .post('/api/admin/groups/:groupId/broadcast', async ({ params, body, set }) => {
    const { type, data, message } = body as {
      type: string;
      data?: unknown;
      message?: string;
    };

    if (!type) {
      set.status = 400;
      return { error: 'Event type is required' };
    }

    const event: SSEEvent = {
      type: type as any,
      data: data || { message: message || 'Admin broadcast' },
      timestamp: new Date().toISOString(),
      workshop_group_id: params.groupId
    };

    SSEManager.broadcastToGroup(params.groupId, event);

    return {
      success: true,
      message: `Event '${type}' broadcasted to group ${params.groupId}`
    };
  });