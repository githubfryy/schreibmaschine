/**
 * Workshop API Routes
 * 
 * REST API endpoints for workshop management
 */

import { Elysia, t } from 'elysia';
import { WorkshopService } from '@/services/workshop.service';
import type { 
  WorkshopResponse, 
  WorkshopsResponse, 
  WorkshopDetailResponse,
  CreateWorkshopRequest,
  UpdateWorkshopRequest,
  ApiError 
} from '@/types/api';

export const workshopRoutes = new Elysia({ prefix: '/workshops' })
  // Get all workshops with pagination and search
  .get('/', async ({ query }) => {
    try {
      const {
        page = 1,
        limit = 20,
        q: searchQuery,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = query;
      
      const result = await WorkshopService.findAll({
        page: Number(page),
        limit: Number(limit),
        query: searchQuery || undefined,
        sort_by: String(sort_by),
        sort_order: sort_order as 'asc' | 'desc'
      });
      
      const response: WorkshopsResponse = {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
      
      return response;
    } catch (error) {
      const apiError: ApiError = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
      return apiError;
    }
  }, {
    query: t.Object({
      page: t.Optional(t.Numeric()),
      limit: t.Optional(t.Numeric()),
      q: t.Optional(t.String()),
      sort_by: t.Optional(t.String()),
      sort_order: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')]))
    })
  })
  
  // Get workshop by ID
  .get('/:id', async ({ params, set }) => {
    try {
      const workshop = await WorkshopService.findById(params.id);
      
      if (!workshop) {
        set.status = 404;
        const apiError: ApiError = {
          success: false,
          error: 'Workshop not found',
          timestamp: new Date().toISOString()
        };
        return apiError;
      }
      
      const response: WorkshopResponse = {
        success: true,
        data: workshop,
        timestamp: new Date().toISOString()
      };
      
      return response;
    } catch (error) {
      set.status = 500;
      const apiError: ApiError = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
      return apiError;
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  
  // Get workshop by slug
  .get('/slug/:slug', async ({ params, set }) => {
    try {
      const workshop = await WorkshopService.findBySlug(params.slug);
      
      if (!workshop) {
        set.status = 404;
        const apiError: ApiError = {
          success: false,
          error: 'Workshop not found',
          timestamp: new Date().toISOString()
        };
        return apiError;
      }
      
      const response: WorkshopResponse = {
        success: true,
        data: workshop,
        timestamp: new Date().toISOString()
      };
      
      return response;
    } catch (error) {
      set.status = 500;
      const apiError: ApiError = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
      return apiError;
    }
  }, {
    params: t.Object({
      slug: t.String()
    })
  })
  
  // Get workshop with all groups and details
  .get('/:id/details', async ({ params, set }) => {
    try {
      const workshopWithGroups = await WorkshopService.findWithGroups(params.id);
      
      if (!workshopWithGroups) {
        set.status = 404;
        const apiError: ApiError = {
          success: false,
          error: 'Workshop not found',
          timestamp: new Date().toISOString()
        };
        return apiError;
      }
      
      const response: WorkshopDetailResponse = {
        success: true,
        data: workshopWithGroups,
        timestamp: new Date().toISOString()
      };
      
      return response;
    } catch (error) {
      set.status = 500;
      const apiError: ApiError = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
      return apiError;
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  
  // Create new workshop
  .post('/', async ({ body, set }) => {
    try {
      const workshop = await WorkshopService.create(body);
      
      set.status = 201;
      const response: WorkshopResponse = {
        success: true,
        data: workshop,
        message: 'Workshop created successfully',
        timestamp: new Date().toISOString()
      };
      
      return response;
    } catch (error) {
      set.status = 400;
      const apiError: ApiError = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create workshop',
        timestamp: new Date().toISOString()
      };
      return apiError;
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 1, maxLength: 200 }),
      description: t.Optional(t.String({ maxLength: 1000 })),
      slug: t.Optional(t.String({ minLength: 1, maxLength: 100 }))
    })
  })
  
  // Update workshop
  .put('/:id', async ({ params, body, set }) => {
    try {
      const workshop = await WorkshopService.update(params.id, body);
      
      if (!workshop) {
        set.status = 404;
        const apiError: ApiError = {
          success: false,
          error: 'Workshop not found',
          timestamp: new Date().toISOString()
        };
        return apiError;
      }
      
      const response: WorkshopResponse = {
        success: true,
        data: workshop,
        message: 'Workshop updated successfully',
        timestamp: new Date().toISOString()
      };
      
      return response;
    } catch (error) {
      set.status = 400;
      const apiError: ApiError = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update workshop',
        timestamp: new Date().toISOString()
      };
      return apiError;
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
      description: t.Optional(t.String({ maxLength: 1000 })),
      slug: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
      status: t.Optional(t.Union([
        t.Literal('planning'),
        t.Literal('active'),
        t.Literal('closed')
      ]))
    })
  })
  
  // Delete workshop
  .delete('/:id', async ({ params, set }) => {
    try {
      const deleted = await WorkshopService.delete(params.id);
      
      if (!deleted) {
        set.status = 404;
        const apiError: ApiError = {
          success: false,
          error: 'Workshop not found',
          timestamp: new Date().toISOString()
        };
        return apiError;
      }
      
      return {
        success: true,
        message: 'Workshop deleted successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      set.status = 400;
      const apiError: ApiError = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete workshop',
        timestamp: new Date().toISOString()
      };
      return apiError;
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  
  // Get workshop statistics
  .get('/:id/stats', async ({ params, set }) => {
    try {
      const stats = await WorkshopService.getStats(params.id);
      
      if (!stats) {
        set.status = 404;
        const apiError: ApiError = {
          success: false,
          error: 'Workshop not found',
          timestamp: new Date().toISOString()
        };
        return apiError;
      }
      
      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      set.status = 500;
      const apiError: ApiError = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get workshop statistics',
        timestamp: new Date().toISOString()
      };
      return apiError;
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  
  // Check if slug is available
  .get('/check-slug/:slug', async ({ params, query }) => {
    try {
      const { exclude_id } = query;
      const isAvailable = await WorkshopService.isSlugAvailable(
        params.slug, 
        exclude_id ? String(exclude_id) : undefined
      );
      
      return {
        success: true,
        data: {
          slug: params.slug,
          available: isAvailable
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const apiError: ApiError = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check slug availability',
        timestamp: new Date().toISOString()
      };
      return apiError;
    }
  }, {
    params: t.Object({
      slug: t.String()
    }),
    query: t.Object({
      exclude_id: t.Optional(t.String())
    })
  });