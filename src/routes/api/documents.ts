import { Elysia } from 'elysia';
import { z } from 'zod';
import { sessionMiddleware } from '../../middleware/session';
import { DocumentService } from '../../services/document.service';

// Input validation schemas
const IndividualDocumentSchema = z.object({
  groupId: z.string(),
  content: z.string(),
  activityId: z.string().optional(),
});

const CollaborativeDocumentSchema = z.object({
  documentId: z.string(),
  operations: z.array(z.unknown()), // Loro operations will be validated separately
  baseVersion: z.number(),
});

export const documentsRoutes = new Elysia({ prefix: '/documents' })
  .use(sessionMiddleware)
  .decorate('documentService', new DocumentService())

  // Save individual writing
  .post(
    '/individual',
    async ({
      body,
      documentService,
      participant,
    }: {
      body: unknown;
      documentService: DocumentService;
      participant?: import('../../types/database').Participant;
    }) => {
      if (!participant?.id) {
        throw new Error('Authentication required');
      }

      const validated = IndividualDocumentSchema.parse(body);
      const document = await documentService.saveIndividualDocument(
        participant.id,
        validated.groupId,
        validated.content,
        validated.activityId
      );

      return { document };
    }
  )

  // Get individual document
  .get(
    '/individual/:groupId',
    async ({
      params,
      documentService,
      participant,
    }: {
      params: { groupId: string };
      documentService: DocumentService;
      participant?: import('../../types/database').Participant;
    }) => {
      if (!participant?.id) {
        throw new Error('Authentication required');
      }

      const document = await documentService.getIndividualDocument(participant.id, params.groupId);

      return { document };
    }
  )

  // Get collaborative document state
  .get(
    '/collaborative/:documentId',
    async ({
      params,
      documentService,
      participant,
    }: {
      params: { documentId: string };
      documentService: DocumentService;
      participant?: import('../../types/database').Participant;
    }) => {
      if (!participant?.id) {
        throw new Error('Authentication required');
      }

      const document = await documentService.getCollaborativeDocument(params.documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Check if participant has access to this document
      const hasAccess = await documentService.hasDocumentAccess(params.documentId, participant.id);
      if (!hasAccess) {
        throw new Error('Access denied');
      }

      return { document };
    }
  )

  // Update collaborative document (Loro operations)
  .post(
    '/collaborative/:documentId/operations',
    async ({
      params,
      body,
      documentService,
      participant,
    }: {
      params: { documentId: string };
      body: unknown;
      documentService: DocumentService;
      participant?: import('../../types/database').Participant;
    }) => {
      if (!participant?.id) {
        throw new Error('Authentication required');
      }

      const validated = CollaborativeDocumentSchema.parse(body);

      // Check access
      const hasAccess = await documentService.hasDocumentAccess(params.documentId, participant.id);
      if (!hasAccess) {
        throw new Error('Access denied');
      }

      const result = await documentService.applyCollaborativeOperations(
        params.documentId,
        participant.id,
        validated.operations,
        validated.baseVersion
      );

      return result;
    }
  )

  // Export documents (various formats)
  .get(
    '/export/:groupId/:format',
    async ({
      params,
      documentService,
      participant,
      set,
    }: {
      params: { groupId: string; format: string };
      documentService: DocumentService;
      participant?: import('../../types/database').Participant;
      set: any;
    }) => {
      if (!participant?.id) {
        throw new Error('Authentication required');
      }

      const format = params.format as 'markdown' | 'html' | 'json';
      if (!['markdown', 'html', 'json'].includes(format)) {
        throw new Error('Invalid export format');
      }

      const exportData = await documentService.exportGroupDocuments(params.groupId, format);

      // Set appropriate content type
      const contentTypes = {
        markdown: 'text/markdown',
        html: 'text/html',
        json: 'application/json',
      };

      set.headers['Content-Type'] = contentTypes[format];
      set.headers['Content-Disposition'] = `attachment; filename="schreibgruppe-export.${format}"`;

      return exportData;
    }
  )

  // Get activity documents (for teamers)
  .get(
    '/activity/:activityId',
    async ({
      params,
      documentService,
      participant,
    }: {
      params: { activityId: string };
      documentService: DocumentService;
      participant?: import('../../types/database').Participant;
    }) => {
      if (!participant?.id) {
        throw new Error('Authentication required');
      }

      // Check if user is teamer (will be checked in service)
      const documents = await documentService.getActivityDocuments(
        params.activityId,
        participant.id
      );

      return { documents };
    }
  )

  // Delete document (participant or teamer)
  .delete(
    '/:documentId',
    async ({
      params,
      documentService,
      participant,
    }: {
      params: { documentId: string };
      documentService: DocumentService;
      participant?: import('../../types/database').Participant;
    }) => {
      if (!participant?.id) {
        throw new Error('Authentication required');
      }

      const hasAccess = await documentService.canDeleteDocument(params.documentId, participant.id);
      if (!hasAccess) {
        throw new Error('Access denied');
      }

      await documentService.deleteDocument(params.documentId);
      return { success: true };
    }
  )

  // Error handling
  .onError(({ error, set }: { error: any; set: any }) => {
    console.error('Document API error:', error);

    if (error.message === 'Authentication required') {
      set.status = 401;
      return { error: 'Authentication required' };
    }

    if (error.message === 'Document not found') {
      set.status = 404;
      return { error: 'Document not found' };
    }

    if (error.message === 'Access denied') {
      set.status = 403;
      return { error: 'Access denied' };
    }

    if (error.message === 'Invalid export format') {
      set.status = 400;
      return { error: 'Invalid export format. Use: markdown, html, json' };
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
