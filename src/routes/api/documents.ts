import { Elysia, t } from 'elysia';
import { requireAuth } from '../../middleware/session';
import { DocumentService } from '../../services/document.service';

// Input validation models  
const DocumentModel = {
  individual: t.Object({
    groupId: t.String(),
    content: t.String(),
    activityId: t.Optional(t.String()),
  }),
  
  collaborative: t.Object({
    documentId: t.String(),
    operations: t.Array(t.Any()), // Loro operations will be validated separately
    baseVersion: t.Number(),
  }),
  
  params: {
    groupId: t.Object({ groupId: t.String() }),
    documentId: t.Object({ documentId: t.String() }),
    activityId: t.Object({ activityId: t.String() }),
    export: t.Object({ 
      groupId: t.String(), 
      format: t.Union([
        t.Literal('markdown'),
        t.Literal('html'), 
        t.Literal('json')
      ])
    }),
  },
};

export const documentsRoutes = new Elysia({ prefix: '/documents' })
  .use(requireAuth)
  .decorate('documentService', new DocumentService())
  .model({
    'document.individual': DocumentModel.individual,
    'document.collaborative': DocumentModel.collaborative,
  })

  // Save individual writing
  .post(
    '/individual',
    async ({
      body,
      documentService,
      participant,
    }: {
      body: typeof DocumentModel.individual.static;
      documentService: DocumentService;
      participant?: import('../../types/database').Participant;
    }) => {
      // Authentication handled by requireAuth middleware
      const document = await documentService.saveIndividualDocument(
        participant!.id,
        body.groupId,
        body.content,
        body.activityId
      );

      return { document };
    },
    {
      body: 'document.individual',
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
      // Authentication handled by requireAuth middleware
      const document = await documentService.getIndividualDocument(participant!.id, params.groupId);

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
      // Authentication handled by requireAuth middleware
      const document = await documentService.getCollaborativeDocument(params.documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Check if participant has access to this document
      const hasAccess = await documentService.hasDocumentAccess(params.documentId, participant!.id);
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
      body: typeof DocumentModel.collaborative.static;
      documentService: DocumentService;
      participant?: import('../../types/database').Participant;
    }) => {
      // Authentication handled by requireAuth middleware
      // Check access
      const hasAccess = await documentService.hasDocumentAccess(params.documentId, participant!.id);
      if (!hasAccess) {
        throw new Error('Access denied');
      }

      const result = await documentService.applyCollaborativeOperations(
        params.documentId,
        participant!.id,
        body.operations,
        body.baseVersion
      );

      return result;
    },
    {
      params: DocumentModel.params.documentId,
      body: 'document.collaborative',
    }
  )

  // Export documents (various formats)
  .get(
    '/export/:groupId/:format',
    async ({
      params,
      documentService,
      set,
    }: {
      params: typeof DocumentModel.params.export.static;
      documentService: DocumentService;
      set: any;
    }) => {
      // Authentication handled by requireAuth middleware
      const exportData = await documentService.exportGroupDocuments(params.groupId, params.format);

      // Set appropriate content type
      const contentTypes = {
        markdown: 'text/markdown',
        html: 'text/html',
        json: 'application/json',
      };

      set.headers['Content-Type'] = contentTypes[params.format];
      set.headers['Content-Disposition'] = `attachment; filename="schreibgruppe-export.${params.format}"`;

      return exportData;
    },
    {
      params: DocumentModel.params.export,
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
      // Authentication handled by requireAuth middleware
      // Check if user is teamer (will be checked in service)
      const documents = await documentService.getActivityDocuments(
        params.activityId,
        participant!.id
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
      // Authentication handled by requireAuth middleware
      const hasAccess = await documentService.canDeleteDocument(params.documentId, participant!.id);
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

    // Authentication errors handled by requireAuth middleware

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

    // Validation errors (Elysia handles these automatically)

    // Internal server error
    set.status = 500;
    return { error: 'Internal server error' };
  });
