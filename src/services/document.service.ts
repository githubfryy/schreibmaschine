import type { Database } from 'bun:sqlite';
import { db } from '@/config/database';
import type { Document } from '@/types/database';
import { generateShortId } from '@/utils/crypto';

export class DocumentService {
  private db: Database;

  constructor() {
    this.db = db;
  }

  /**
   * Save individual document (auto-save functionality)
   */
  async saveIndividualDocument(
    participantId: string,
    groupId: string,
    content: string,
    activityId?: string
  ): Promise<Document> {
    // Check if document already exists for this participant and group
    const existingQuery = this.db.query(`
      SELECT id FROM documents 
      WHERE participant_id = ? AND workshop_group_id = ? AND type = 'individual'
      ${activityId ? 'AND activity_id = ?' : 'AND activity_id IS NULL'}
    `);

    const existingDoc = activityId
      ? (existingQuery.get(participantId, groupId, activityId) as { id: string } | null)
      : (existingQuery.get(participantId, groupId) as { id: string } | null);

    if (existingDoc) {
      // Update existing document
      const updateQuery = this.db.query(`
        UPDATE documents 
        SET content = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      updateQuery.run(content, existingDoc.id);

      return (await this.getDocumentById(existingDoc.id)) as Document;
    } else {
      // Create new document
      const documentId = generateShortId();
      const insertQuery = this.db.query(`
        INSERT INTO documents (
          id, workshop_group_id, participant_id, activity_id,
          type, content, loro_state, version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      insertQuery.run(
        documentId,
        groupId,
        participantId,
        activityId || null,
        'individual',
        content,
        null, // No Loro state for individual docs
        1
      );

      return (await this.getDocumentById(documentId)) as Document;
    }
  }

  /**
   * Get individual document for participant
   */
  async getIndividualDocument(
    participantId: string,
    groupId: string,
    activityId?: string
  ): Promise<Document | null> {
    const query = this.db.query(`
      SELECT * FROM documents 
      WHERE participant_id = ? AND workshop_group_id = ? AND type = 'individual'
      ${activityId ? 'AND activity_id = ?' : 'AND activity_id IS NULL'}
    `);

    const result = activityId
      ? (query.get(participantId, groupId, activityId) as Document | null)
      : (query.get(participantId, groupId) as Document | null);

    return result;
  }

  /**
   * Get collaborative document
   */
  async getCollaborativeDocument(documentId: string): Promise<Document | null> {
    return await this.getDocumentById(documentId);
  }

  /**
   * Check if participant has access to document
   */
  async hasDocumentAccess(documentId: string, participantId: string): Promise<boolean> {
    const document = await this.getDocumentById(documentId);
    if (!document) return false;

    // Individual documents: only the owner has access
    if (document.type === 'individual') {
      return document.participant_id === participantId;
    }

    // Collaborative documents: check if participant is in the group
    const accessQuery = this.db.query(`
      SELECT 1 FROM group_participants 
      WHERE workshop_group_id = ? AND participant_id = ?
    `);

    return !!accessQuery.get(document.workshop_group_id, participantId);
  }

  /**
   * Apply collaborative operations (Loro CRDT)
   */
  async applyCollaborativeOperations(
    documentId: string,
    participantId: string,
    operations: any[],
    baseVersion: number
  ): Promise<{ success: boolean; newVersion: number; conflicts?: any[] }> {
    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // For now, we'll implement a simple version-based approach
    // In the future, this would integrate with Loro CRDT

    if (document.version !== baseVersion) {
      // Version conflict - would need to merge with Loro
      return {
        success: false,
        newVersion: document.version,
        conflicts: ['Version mismatch - document was modified by another user'],
      };
    }

    // Apply operations (simplified - real implementation would use Loro)
    const newVersion = document.version + 1;
    const newLoroState = JSON.stringify({
      operations,
      version: newVersion,
      timestamp: new Date().toISOString(),
      participant: participantId,
    });

    const updateQuery = this.db.query(`
      UPDATE documents 
      SET loro_state = ?, version = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    updateQuery.run(newLoroState, newVersion, documentId);

    // Broadcast changes to other collaborators
    // SSEManager.broadcastToGroup(document.workshop_group_id, {
    //   type: 'document_update',
    //   data: {
    //     documentId,
    //     participantId,
    //     operations,
    //     newVersion
    //   }
    // });

    return {
      success: true,
      newVersion,
    };
  }

  /**
   * Export group documents in various formats
   */
  async exportGroupDocuments(
    groupId: string,
    format: 'markdown' | 'html' | 'json'
  ): Promise<string> {
    const documentsQuery = this.db.query(`
      SELECT d.*, p.display_name, a.name as activity_name
      FROM documents d
      LEFT JOIN participants p ON d.participant_id = p.id
      LEFT JOIN activities a ON d.activity_id = a.id
      WHERE d.workshop_group_id = ?
      ORDER BY d.created_at
    `);

    const documents = documentsQuery.all(groupId) as Array<
      Document & {
        display_name: string;
        activity_name: string;
      }
    >;

    switch (format) {
      case 'markdown':
        return this.exportAsMarkdown(documents);

      case 'html':
        return this.exportAsHTML(documents);

      case 'json':
        return JSON.stringify(documents, null, 2);

      default:
        throw new Error('Unsupported export format');
    }
  }

  /**
   * Get all documents for an activity (for teamers)
   */
  async getActivityDocuments(activityId: string, requesterId: string): Promise<Document[]> {
    // Check if requester is teamer for this activity's group
    const activityQuery = this.db.query(`
      SELECT a.workshop_group_id 
      FROM activities a
      WHERE a.id = ?
    `);
    const activity = activityQuery.get(activityId) as { workshop_group_id: string } | null;

    if (!activity) {
      throw new Error('Activity not found');
    }

    const teamerQuery = this.db.query(`
      SELECT 1 FROM group_participants 
      WHERE workshop_group_id = ? AND participant_id = ? AND role = 'teamer'
    `);
    const isTeamer = !!teamerQuery.get(activity.workshop_group_id, requesterId);

    if (!isTeamer) {
      throw new Error('Only teamers can view all activity documents');
    }

    const documentsQuery = this.db.query(`
      SELECT d.*, p.display_name
      FROM documents d
      LEFT JOIN participants p ON d.participant_id = p.id
      WHERE d.activity_id = ?
      ORDER BY d.created_at
    `);

    return documentsQuery.all(activityId) as Document[];
  }

  /**
   * Check if participant can delete document
   */
  async canDeleteDocument(documentId: string, participantId: string): Promise<boolean> {
    const document = await this.getDocumentById(documentId);
    if (!document) return false;

    // Participants can delete their own individual documents
    if (document.type === 'individual' && document.participant_id === participantId) {
      return true;
    }

    // Teamers can delete any document in their groups
    const teamerQuery = this.db.query(`
      SELECT 1 FROM group_participants 
      WHERE workshop_group_id = ? AND participant_id = ? AND role = 'teamer'
    `);

    return !!teamerQuery.get(document.workshop_group_id, participantId);
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<void> {
    const existingDocument = await this.getDocumentById(documentId);
    if (!existingDocument) {
      throw new Error('Document not found');
    }

    const deleteQuery = this.db.query('DELETE FROM documents WHERE id = ?');
    deleteQuery.run(documentId);

    // Notify group if it was a collaborative document
    // if (document && document.type === 'collaborative') {
    //   SSEManager.broadcastToGroup(document.workshop_group_id, {
    //     type: 'document_deleted',
    //     data: { documentId }
    //   });
    // }
  }

  // Private helper methods

  private async getDocumentById(documentId: string): Promise<Document | null> {
    const query = this.db.query('SELECT * FROM documents WHERE id = ?');
    return query.get(documentId) as Document | null;
  }

  private exportAsMarkdown(
    documents: Array<Document & { display_name: string; activity_name: string }>
  ): string {
    let markdown = '# Schreibgruppe Export\n\n';

    for (const doc of documents) {
      markdown += `## ${doc.display_name}${doc.activity_name ? ` - ${doc.activity_name}` : ''}\n\n`;
      markdown += `*${doc.type === 'individual' ? 'Individueller Text' : 'Kollaborativer Text'}*\n\n`;
      markdown += `${doc.content}\n\n`;
      markdown += `---\n\n`;
    }

    return markdown;
  }

  private exportAsHTML(
    documents: Array<Document & { display_name: string; activity_name: string }>
  ): string {
    let html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Schreibgruppe Export</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .document { margin-bottom: 40px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .author { color: #666; font-weight: bold; }
    .activity { color: #888; font-style: italic; }
    .content { margin-top: 15px; line-height: 1.6; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>Schreibgruppe Export</h1>
`;

    for (const doc of documents) {
      html += `
  <div class="document">
    <div class="author">${doc.display_name}</div>
    ${doc.activity_name ? `<div class="activity">${doc.activity_name}</div>` : ''}
    <div class="content">${this.escapeHtml(doc.content)}</div>
  </div>
`;
    }

    html += `
</body>
</html>`;

    return html;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}
