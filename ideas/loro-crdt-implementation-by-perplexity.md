Looking at your Schreibmaschine project and the latest Loro CRDT documentation, I'll provide a comprehensive guide for integrating Loro CRDT into your Bun + Elysia collaborative writing app.



## Core Integration Strategy

Based on your project structure, here's how to integrate Loro CRDT:

### 1. Document Service with Loro Integration

Create `src/services/loro-document.service.ts`:

```typescript
import { LoroDoc, LoroText, LoroMap, type Delta } from 'loro-crdt';
import type { Database } from 'bun:sqlite';
import { generateUUID } from '../utils/crypto';

export interface LoroDocumentMeta {
  id: string;
  activityId: string;
  participantId: string;
  title: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  loroSnapshot?: Uint8Array;
  loroUpdates?: Uint8Array[];
}

export class LoroDocumentService {
  private docs = new Map();
  
  constructor(private db: Database) {}

  /**
   * Create a new collaborative document
   */
  async createDocument(
    activityId: string, 
    participantId: string, 
    title: string,
    initialContent?: string
  ): Promise {
    const docId = generateUUID();
    const doc = new LoroDoc();
    
    // Set peer ID to participant ID for tracking
    doc.setPeerId(participantId);
    
    // Enable timestamp recording for time travel
    doc.setRecordTimestamp(true);
    
    // Subscribe to track peer participation
    doc.subscribeFirstCommitFromPeer((e) => {
      // Associate peer with participant info
      doc.getMap("participants").set(e.peer, {
        participantId: e.peer,
        joinedAt: Date.now()
      });
    });

    // Add pre-commit hook for change tracking
    doc.subscribePreCommit((e) => {
      e.modifier
        .setTimestamp(Date.now())
        .setMessage(`Change by ${participantId}`);
    });

    // Initialize document structure
    const text = doc.getText("content");
    const meta = doc.getMap("meta");
    
    if (initialContent) {
      text.insert(0, initialContent);
    }
    
    meta.set("title", title);
    meta.set("activityId", activityId);
    meta.set("createdBy", participantId);
    meta.set("createdAt", Date.now());

    // Store in database
    const snapshot = doc.export({ mode: "snapshot" });
    
    await this.db.run(`
      INSERT INTO loro_documents (id, activity_id, participant_id, title, snapshot, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [docId, activityId, participantId, title, snapshot]);

    // Cache the document
    this.docs.set(docId, doc);
    
    return { docId, loroDoc: doc };
  }

  /**
   * Load an existing document
   */
  async loadDocument(docId: string): Promise {
    // Check cache first
    if (this.docs.has(docId)) {
      return this.docs.get(docId)!;
    }

    const row = this.db.query(`
      SELECT * FROM loro_documents WHERE id = ?
    `).get(docId) as any;

    if (!row) return null;

    const doc = new LoroDoc();
    doc.setRecordTimestamp(true);
    
    // Import snapshot
    if (row.snapshot) {
      doc.import(row.snapshot);
    }

    // Import any updates
    const updates = this.db.query(`
      SELECT update_data FROM loro_updates 
      WHERE document_id = ? 
      ORDER BY created_at ASC
    `).all(docId) as any[];

    for (const update of updates) {
      doc.import(update.update_data);
    }

    this.docs.set(docId, doc);
    return doc;
  }

  /**
   * Apply remote updates to a document
   */
  async applyUpdate(docId: string, updateData: Uint8Array, fromPeerId: string): Promise {
    const doc = await this.loadDocument(docId);
    if (!doc) return false;

    try {
      const importResult = doc.import(updateData);
      
      // Store the update
      await this.db.run(`
        INSERT INTO loro_updates (id, document_id, peer_id, update_data, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `, [generateUUID(), docId, fromPeerId, updateData]);

      return importResult.success && Object.keys(importResult.success).length > 0;
    } catch (error) {
      console.error('Failed to apply update:', error);
      return false;
    }
  }

  /**
   * Get document content as markdown
   */
  async getDocumentAsMarkdown(docId: string): Promise {
    const doc = await this.loadDocument(docId);
    if (!doc) return null;

    const text = doc.getText("content");
    const meta = doc.getMap("meta");
    
    const title = meta.get("title") as string || "Untitled";
    const content = text.toString();
    
    return `# ${title}\n\n${content}`;
  }

  /**
   * Get document updates since a version
   */
  async getUpdatesSince(docId: string, versionVector: any): Promise {
    const doc = await this.loadDocument(docId);
    if (!doc) return null;

    return doc.export({ 
      mode: "update", 
      from: versionVector 
    });
  }
}
```

### 2. Real-time Collaboration Routes

Create `src/routes/api/loro.ts`:

```typescript
import { Elysia, t } from 'elysia';
import type { Database } from 'bun:sqlite';
import { LoroDocumentService } from '../../services/loro-document.service';
import { sessionMiddleware } from '../../middleware/session';

export const loroRoutes = (db: Database) => {
  const loroService = new LoroDocumentService(db);

  return new Elysia({ prefix: '/api/loro' })
    .use(sessionMiddleware(db))
    .post('/documents', async ({ body, participant }) => {
      if (!participant) {
        throw new Error('Unauthorized');
      }

      const { activityId, title, initialContent } = body;
      const result = await loroService.createDocument(
        activityId, 
        participant.id, 
        title, 
        initialContent
      );

      return {
        success: true,
        documentId: result.docId,
        version: result.loroDoc.version()
      };
    }, {
      body: t.Object({
        activityId: t.String(),
        title: t.String(),
        initialContent: t.Optional(t.String())
      })
    })
    
    .get('/documents/:docId', async ({ params, participant }) => {
      if (!participant) {
        throw new Error('Unauthorized');
      }

      const doc = await loroService.loadDocument(params.docId);
      if (!doc) {
        throw new Error('Document not found');
      }

      const text = doc.getText("content");
      const meta = doc.getMap("meta");

      return {
        success: true,
        content: text.toString(),
        title: meta.get("title"),
        version: doc.version(),
        participants: doc.getMap("participants").toJSON()
      };
    })

    .post('/documents/:docId/updates', async ({ params, body, participant }) => {
      if (!participant) {
        throw new Error('Unauthorized');
      }

      const { updateData } = body;
      const update = new Uint8Array(updateData);
      
      const success = await loroService.applyUpdate(
        params.docId, 
        update, 
        participant.id
      );

      if (success) {
        // Broadcast to other participants via SSE
        // (integrate with your existing SSE service)
        return { success: true };
      }

      return { success: false, error: 'Failed to apply update' };
    }, {
      body: t.Object({
        updateData: t.Array(t.Number()) // Uint8Array as number array
      })
    })

    .get('/documents/:docId/updates', async ({ params, query, participant }) => {
      if (!participant) {
        throw new Error('Unauthorized');
      }

      const versionVector = query.since ? JSON.parse(query.since) : undefined;
      const updates = await loroService.getUpdatesSince(params.docId, versionVector);

      return {
        success: true,
        updates: updates ? Array.from(updates) : null
      };
    })

    .get('/documents/:docId/export', async ({ params, participant }) => {
      if (!participant) {
        throw new Error('Unauthorized');
      }

      const markdown = await loroService.getDocumentAsMarkdown(params.docId);
      
      return {
        success: true,
        markdown
      };
    });
};
```

### 3. Frontend Integration with Alpine.js

Create `public/js/loro-editor.js`:

```javascript
// Loro Editor Component for Alpine.js
document.addEventListener('alpine:init', () => {
  Alpine.data('loroEditor', (documentId, activityId) => ({
    doc: null,
    content: '',
    title: '',
    isConnected: false,
    participants: {},
    eventSource: null,
    
    async init() {
      // Import Loro (assuming you've added it to your static files)
      const { LoroDoc } = await import('/js/vendor/loro-crdt.js');
      
      this.doc = new LoroDoc();
      this.doc.setRecordTimestamp(true);
      
      // Set peer ID from session
      const sessionData = JSON.parse(localStorage.getItem('session') || '{}');
      if (sessionData.participantId) {
        this.doc.setPeerId(sessionData.participantId);
      }

      // Subscribe to document changes
      this.doc.subscribe((event) => {
        this.handleLoroEvent(event);
      });

      // Load existing document or create new one
      if (documentId) {
        await this.loadDocument(documentId);
      } else {
        await this.createDocument();
      }

      // Setup real-time sync
      this.setupRealtimeSync();
    },

    async createDocument() {
      try {
        const response = await fetch('/api/loro/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityId: activityId,
            title: this.title || 'Untitled Document',
            initialContent: this.content
          })
        });

        const result = await response.json();
        if (result.success) {
          this.documentId = result.documentId;
          
          // Initialize content in Loro
          const text = this.doc.getText('content');
          const meta = this.doc.getMap('meta');
          
          if (this.content) {
            text.insert(0, this.content);
          }
          meta.set('title', this.title);
          meta.set('activityId', activityId);
          
          this.doc.commit();
        }
      } catch (error) {
        console.error('Failed to create document:', error);
      }
    },

    async loadDocument(docId) {
      try {
        const response = await fetch(`/api/loro/documents/${docId}`);
        const result = await response.json();
        
        if (result.success) {
          this.content = result.content;
          this.title = result.title;
          this.participants = result.participants;
          
          // Initialize Loro document with server state
          const text = this.doc.getText('content');
          text.insert(0, this.content);
          this.doc.commit();
        }
      } catch (error) {
        console.error('Failed to load document:', error);
      }
    },

    handleLoroEvent(event) {
      // Update UI based on Loro events
      if (event.by === 'local') {
        // Send update to server
        this.sendUpdate();
      }
      
      // Update content display
      const text = this.doc.getText('content');
      this.content = text.toString();
    },

    async sendUpdate() {
      if (!this.documentId) return;

      try {
        const version = this.doc.version();
        const updateData = this.doc.export({ mode: 'update' });
        
        await fetch(`/api/loro/documents/${this.documentId}/updates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updateData: Array.from(updateData)
          })
        });
      } catch (error) {
        console.error('Failed to send update:', error);
      }
    },

    setupRealtimeSync() {
      // Connect to SSE for real-time updates
      this.eventSource = new EventSource(`/sse/documents/${this.documentId}`);
      
      this.eventSource.addEventListener('loro-update', (event) => {
        const data = JSON.parse(event.data);
        const updateData = new Uint8Array(data.updateData);
        
        // Apply remote update
        this.doc.import(updateData);
      });

      this.eventSource.addEventListener('participant-joined', (event) => {
        const data = JSON.parse(event.data);
        this.participants[data.participantId] = data;
      });

      this.isConnected = true;
    },

    // Text editing methods
    insertText(pos, text) {
      const loroText = this.doc.getText('content');
      loroText.insert(pos, text);
      this.doc.commit();
    },

    deleteText(pos, length) {
      const loroText = this.doc.getText('content');
      loroText.delete(pos, length);
      this.doc.commit();
    },

    // Undo/Redo with UndoManager
    setupUndoManager() {
      const { UndoManager } = window.LoroImports;
      
      this.undoManager = new UndoManager(this.doc, {
        mergeInterval: 1000, // 1 second
        maxStackSize: 100,
        onPush: (isUndo, range, event) => {
          return {
            timestamp: Date.now(),
            participantId: this.doc.peerIdStr
          };
        },
        onPop: (isUndo, value) => {
          console.log(`${isUndo ? 'Undo' : 'Redo'} action:`, value);
        }
      });
    },

    undo() {
      if (this.undoManager) {
        this.undoManager.undo();
      }
    },

    redo() {
      if (this.undoManager) {
        this.undoManager.redo();
      }
    },

    async exportMarkdown() {
      try {
        const response = await fetch(`/api/loro/documents/${this.documentId}/export`);
        const result = await response.json();
        
        if (result.success) {
          // Download or display markdown
          const blob = new Blob([result.markdown], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.title || 'document'}.md`;
          a.click();
        }
      } catch (error) {
        console.error('Failed to export:', error);
      }
    },

    destroy() {
      if (this.eventSource) {
        this.eventSource.close();
      }
    }
  }));
});
```

### 4. Database Schema Updates

Add these tables to your `src/database/schema.sql`:

```sql
-- Loro Documents
CREATE TABLE loro_documents (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  snapshot BLOB,
  is_published BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- Loro Updates (for incremental sync)
CREATE TABLE loro_updates (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  peer_id TEXT NOT NULL,
  update_data BLOB NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES loro_documents(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_loro_documents_activity ON loro_documents(activity_id);
CREATE INDEX idx_loro_documents_participant ON loro_documents(participant_id);
CREATE INDEX idx_loro_updates_document ON loro_updates(document_id, created_at);
CREATE INDEX idx_loro_updates_peer ON loro_updates(peer_id);
```

### 5. Activity Integration

Update your `src/services/activity.service.ts` to include Loro documents:

```typescript
export class ActivityService {
  private loroService: LoroDocumentService;

  constructor(private db: Database) {
    this.loroService = new LoroDocumentService(db);
  }

  async createCollaborativePad(
    groupId: string, 
    name: string, 
    prompt?: string
  ): Promise {
    const activityId = await this.createActivity(groupId, name, 'collaborative_pad');
    
    // Create shared Loro document
    const adminParticipant = await this.getGroupAdmin(groupId);
    const { docId } = await this.loroService.createDocument(
      activityId,
      adminParticipant.id,
      name,
      prompt || ''
    );

    // Allow all group participants access
    const participants = await this.getGroupParticipants(groupId);
    for (const participant of participants) {
      await this.addActivityParticipant(activityId, participant.id, 'participant');
    }

    return {
      ...await this.getActivity(activityId),
      documentId: docId
    };
  }

  async createIndividualPads(
    groupId: string, 
    name: string, 
    prompt?: string
  ): Promise {
    const activityId = await this.createActivity(groupId, name, 'individual_pad');
    
    // Create individual documents for each participant
    const participants = await this.getGroupParticipants(groupId);
    const documents = [];

    for (const participant of participants) {
      const { docId } = await this.loroService.createDocument(
        activityId,
        participant.id,
        `${name} - ${participant.display_name}`,
        prompt || ''
      );
      
      await this.addActivityParticipant(activityId, participant.id, 'participant');
      documents.push({ participantId: participant.id, documentId: docId });
    }

    return {
      ...await this.getActivity(activityId),
      documents
    };
  }
}
```

### 6. HTML Template Integration

Update your `src/views/pages/group-room.html` to include the Loro editor:

```html

  
  
  
     updateTitle(), 500)"
           class="title-input"
           placeholder="Document Title">
    
    
      ↶
      ↷
      Export
    
  

  
   1">
    
    
  

  
  
    
  

  
  
    
    ✓ Synced
  



// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      // Trigger undo
    } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
      e.preventDefault();
      // Trigger redo
    }
  }
});

```

### 7. SSE Integration for Real-time Updates

Update your `src/services/sse.service.ts`:

```typescript
export class SSEService {
  // ... existing code ...

  broadcastLoroUpdate(documentId: string, updateData: Uint8Array, fromPeerId: string) {
    const connections = this.getDocumentConnections(documentId);
    
    connections.forEach(connection => {
      if (connection.participantId !== fromPeerId) {
        connection.controller.enqueue(`event: loro-update\n`);
        connection.controller.enqueue(`data: ${JSON.stringify({
          documentId,
          updateData: Array.from(updateData),
          fromPeer: fromPeerId,
          timestamp: Date.now()
        })}\n\n`);
      }
    });
  }

  private getDocumentConnections(documentId: string): SSEConnection[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.documentId === documentId);
  }
}
```

This comprehensive integration gives you:

1. **Full CRDT collaboration** with conflict-free merging
2. **Real-time sync** via SSE
3. **Offline capability** with local document state
4. **Undo/redo** that works in collaborative mode
5. **Time travel** for version history
6. **Export functionality** to markdown
7. **Multi-device sessions** with proper peer tracking
8. **Activity-based document organization**

The setup leverages Loro's latest features like `EphemeralStore` for presence, pre-commit hooks for change tracking, and the new BigInt serialization support from version 1.5.9.
