/**
 * Workshop API Routes
 *
 * REST API endpoints for workshop management
 * Following Elysia 1.3.8 method chaining best practices
 */

import { Elysia, t } from 'elysia';
import { WorkshopService } from '@/services/workshop.service';
import type {
  ApiError,
  WorkshopDetailResponse,
  WorkshopResponse,
  WorkshopsResponse,
} from '@/types/api';

// Workshop validation models
const WorkshopModel = {
  query: t.Object({
    page: t.Optional(t.Numeric({ minimum: 1 })),
    limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
    q: t.Optional(t.String()),
    sort_by: t.Optional(t.String()),
    sort_order: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  }),
  
  params: {
    id: t.Object({ id: t.String() }),
    slug: t.Object({ slug: t.String() }),
  },
  
  body: {
    create: t.Object({
      name: t.String({ minLength: 1, maxLength: 200 }),
      description: t.Optional(t.String({ maxLength: 1000 })),
      slug: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
    }),
    
    update: t.Object({
      name: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
      description: t.Optional(t.String({ maxLength: 1000 })),
      slug: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
      status: t.Optional(
        t.Union([t.Literal('planning'), t.Literal('active'), t.Literal('closed')])
      ),
    }),
  },
};

export const workshopRoutes = new Elysia({ prefix: '/workshops' })
  // Register models for better type inference
  .model({
    'workshop.query': WorkshopModel.query,
    'workshop.create': WorkshopModel.body.create,
    'workshop.update': WorkshopModel.body.update,
  })
  // Get all workshops with pagination and search
  .get('/', async ({ query }) => {
    const {
      page = 1,
      limit = 20,
      q: searchQuery,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = query;

    const result = await WorkshopService.findAll({
      page: Number(page),
      limit: Number(limit),
      query: searchQuery || '',
      sort_by: String(sort_by),
      sort_order: sort_order as 'asc' | 'desc',
    });

    const response: WorkshopsResponse = {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };

    return response;
  }, {
    query: 'workshop.query',
  })

  // Get workshop by ID
  .get('/:id', async ({ params, set }) => {
    const workshop = await WorkshopService.findById(params.id);

    if (!workshop) {
      set.status = 404;
      const apiError: ApiError = {
        success: false,
        error: 'Workshop not found',
        timestamp: new Date().toISOString(),
      };
      return apiError;
    }

    const response: WorkshopResponse = {
      success: true,
      data: workshop,
      timestamp: new Date().toISOString(),
    };

    return response;
  }, {
    params: WorkshopModel.params.id,
  })

  // Get workshop by slug
  .get('/slug/:slug', async ({ params, set }) => {
    const workshop = await WorkshopService.findBySlug(params.slug);

    if (!workshop) {
      set.status = 404;
      const apiError: ApiError = {
        success: false,
        error: 'Workshop not found',
        timestamp: new Date().toISOString(),
      };
      return apiError;
    }

    const response: WorkshopResponse = {
      success: true,
      data: workshop,
      timestamp: new Date().toISOString(),
    };

    return response;
  }, {
    params: WorkshopModel.params.slug,
  })

  // Get workshop with all groups and details
  .get('/:id/details', async ({ params, set }) => {
    const workshopWithGroups = await WorkshopService.findWithGroups(params.id);

    if (!workshopWithGroups) {
      set.status = 404;
      const apiError: ApiError = {
        success: false,
        error: 'Workshop not found',
        timestamp: new Date().toISOString(),
      };
      return apiError;
    }

    const response: WorkshopDetailResponse = {
      success: true,
      data: workshopWithGroups,
      timestamp: new Date().toISOString(),
    };

    return response;
  }, {
    params: WorkshopModel.params.id,
  })

  // Create new workshop
  .post('/', async ({ body, set }) => {
    const workshop = await WorkshopService.create(body);

    set.status = 201;
    const response: WorkshopResponse = {
      success: true,
      data: workshop,
      message: 'Workshop created successfully',
      timestamp: new Date().toISOString(),
    };

    return response;
  }, {
    body: 'workshop.create',
  })

  // Update workshop
  .put('/:id', async ({ params, body, set }) => {
    const workshop = await WorkshopService.update(params.id, body);

    if (!workshop) {
      set.status = 404;
      const apiError: ApiError = {
        success: false,
        error: 'Workshop not found',
        timestamp: new Date().toISOString(),
      };
      return apiError;
    }

    const response: WorkshopResponse = {
      success: true,
      data: workshop,
      message: 'Workshop updated successfully',
      timestamp: new Date().toISOString(),
    };

    return response;
  }, {
    params: WorkshopModel.params.id,
    body: 'workshop.update',
  })

  // Delete workshop
  .delete('/:id', async ({ params, set }) => {
    const deleted = await WorkshopService.delete(params.id);

    if (!deleted) {
      set.status = 404;
      const apiError: ApiError = {
        success: false,
        error: 'Workshop not found',
        timestamp: new Date().toISOString(),
      };
      return apiError;
    }

    return {
      success: true,
      message: 'Workshop deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }, {
    params: WorkshopModel.params.id,
  })

  // Get workshop statistics
  .get('/:id/stats', async ({ params, set }) => {
    const stats = await WorkshopService.getStats(params.id);

    if (!stats) {
      set.status = 404;
      const apiError: ApiError = {
        success: false,
        error: 'Workshop not found',
        timestamp: new Date().toISOString(),
      };
      return apiError;
    }

    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }, {
    params: WorkshopModel.params.id,
  })

  // Check if slug is available
  .get('/check-slug/:slug', async ({ params, query }) => {
    const { exclude_id } = query;
    const isAvailable = await WorkshopService.isSlugAvailable(
      params.slug,
      exclude_id ? String(exclude_id) : undefined
    );

    return {
      success: true,
      data: {
        slug: params.slug,
        available: isAvailable,
      },
      timestamp: new Date().toISOString(),
    };
  }, {
    params: WorkshopModel.params.slug,
    query: t.Object({
      exclude_id: t.Optional(t.String()),
    }),
  })
  
  // Add global error handling for workshop routes
  .onError(({ code, error, set }) => {
    console.error(`[Workshop API Error ${code}]`, error);

    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return {
          success: false,
          error: 'Validation failed',
          details: error.message,
          timestamp: new Date().toISOString(),
        };
      case 'NOT_FOUND':
        set.status = 404;
        return {
          success: false,
          error: 'Resource not found',
          timestamp: new Date().toISOString(),
        };
      default:
        set.status = 500;
        return {
          success: false,
          error: 'Internal server error',
          details: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        };
    }
  });
