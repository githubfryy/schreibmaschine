import type { SSEEvent } from '../types/api';

/**
 * Server-Sent Events Service
 * Manages real-time communication with connected clients
 */
export class SSEService {
  private static instance: SSEService;
  private connections: Map<string, Set<WritableStream>> = new Map();

  private constructor() {}

  public static getInstance(): SSEService {
    if (!SSEService.instance) {
      SSEService.instance = new SSEService();
    }
    return SSEService.instance;
  }

  /**
   * Add a client connection for a specific group
   */
  addConnection(groupId: string, stream: WritableStream): void {
    if (!this.connections.has(groupId)) {
      this.connections.set(groupId, new Set());
    }
    this.connections.get(groupId)!.add(stream);
  }

  /**
   * Remove a client connection
   */
  removeConnection(groupId: string, stream: WritableStream): void {
    const groupConnections = this.connections.get(groupId);
    if (groupConnections) {
      groupConnections.delete(stream);
      if (groupConnections.size === 0) {
        this.connections.delete(groupId);
      }
    }
  }

  /**
   * Broadcast an event to all clients in a group
   */
  broadcastToGroup(groupId: string, event: SSEEvent): void {
    const groupConnections = this.connections.get(groupId);
    if (!groupConnections) return;

    const eventData = this.formatSSEMessage(event);
    const encoder = new TextEncoder();
    const data = encoder.encode(eventData);

    // Send to all connections in the group
    for (const stream of groupConnections) {
      try {
        const writer = stream.getWriter();
        writer.write(data);
        writer.releaseLock();
      } catch (error) {
        // Connection is broken, remove it
        console.warn('Removing broken SSE connection:', error);
        this.removeConnection(groupId, stream);
      }
    }
  }

  /**
   * Send an event to a specific participant
   */
  sendToParticipant(groupId: string, participantId: string, event: SSEEvent): void {
    // For now, we'll broadcast to the whole group
    // In a more sophisticated implementation, we'd track participant-to-connection mapping
    this.broadcastToGroup(groupId, event);
  }

  /**
   * Get count of active connections for a group
   */
  getConnectionCount(groupId: string): number {
    return this.connections.get(groupId)?.size || 0;
  }

  /**
   * Get all groups with active connections
   */
  getActiveGroups(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Format event as SSE message
   */
  private formatSSEMessage(event: SSEEvent): string {
    let message = '';
    
    if (event.id) {
      message += `id: ${event.id}\n`;
    }
    
    if (event.type) {
      message += `event: ${event.type}\n`;
    }
    
    if (event.data) {
      const dataString = typeof event.data === 'string' 
        ? event.data 
        : JSON.stringify(event.data);
      
      // SSE data can be multi-line, each line needs "data: " prefix
      const dataLines = dataString.split('\n');
      for (const line of dataLines) {
        message += `data: ${line}\n`;
      }
    }
    
    // Empty line to signal end of event
    message += '\n';
    
    return message;
  }

  /**
   * Send heartbeat to all connections
   */
  sendHeartbeat(): void {
    const heartbeatEvent: SSEEvent = {
      type: 'heartbeat',
      data: { timestamp: new Date().toISOString() }
    };

    for (const groupId of this.getActiveGroups()) {
      this.broadcastToGroup(groupId, heartbeatEvent);
    }
  }

  /**
   * Clean up broken connections periodically
   */
  cleanup(): void {
    for (const [groupId, connections] of this.connections.entries()) {
      const workingConnections = new Set<WritableStream>();
      
      for (const stream of connections) {
        try {
          // Test if connection is still alive
          const writer = stream.getWriter();
          writer.releaseLock();
          workingConnections.add(stream);
        } catch (error) {
          // Connection is broken, don't add to working set
          console.warn('Removing broken connection during cleanup');
        }
      }
      
      if (workingConnections.size === 0) {
        this.connections.delete(groupId);
      } else {
        this.connections.set(groupId, workingConnections);
      }
    }
  }
}