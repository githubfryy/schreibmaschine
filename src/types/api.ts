/**
 * API Request/Response Types for Schreibmaschine
 * 
 * TypeScript interfaces for HTTP API endpoints
 */

import type { 
  Workshop, 
  WritingGroup, 
  Participant, 
  WorkshopGroup,
  Activity,
  OnlineStatus,
  SessionInfo,
  GroupUrl,
  ActivityType,
  ActivityConfig,
  PaginatedResult,
  WorkshopWithGroups,
  WorkshopGroupWithDetails 
} from './database';

// ============================================================================
// COMMON API TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
  code?: string;
  timestamp: string;
}

export interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  details: {
    field: string;
    message: string;
  }[];
}

// ============================================================================
// SERVER-SENT EVENTS
// ============================================================================

export interface SSEEvent {
  id?: string;
  type?: string;
  data?: any;
}

export interface SSEConnectionEvent extends SSEEvent {
  type: 'connected';
  data: {
    groupId: string;
    participantId: string;
  };
}

export interface SSEOnlineStatusEvent extends SSEEvent {
  type: 'online_status';
  data: {
    online_participants: Array<{
      participant_id: string;
      last_seen: string;
    }>;
  };
}

export interface SSEActivityUpdateEvent extends SSEEvent {
  type: 'activity_update';
  data: {
    activityId: string;
    action: 'created' | 'updated' | 'deleted';
    status?: string;
  };
}

export interface SSETurnUpdateEvent extends SSEEvent {
  type: 'turn_update';
  data: {
    activityId: string;
    participantId: string;
    action: 'submit' | 'skip';
    content?: string;
    turnNumber: number;
  };
}

export interface SSEDocumentUpdateEvent extends SSEEvent {
  type: 'document_update';
  data: {
    documentId: string;
    participantId: string;
    operations: any[];
    newVersion: number;
  };
}

export interface SSEHeartbeatEvent extends SSEEvent {
  type: 'heartbeat';
  data: {
    timestamp: string;
  };
}

// ============================================================================
// WORKSHOP API
// ============================================================================

export interface CreateWorkshopRequest {
  name: string;
  description?: string;
  slug?: string;
}

export interface UpdateWorkshopRequest {
  name?: string;
  description?: string;
  slug?: string;
  status?: 'planning' | 'active' | 'closed';
}

export interface WorkshopResponse extends ApiResponse<Workshop> {}
export interface WorkshopsResponse extends ApiResponse<PaginatedResult<Workshop>> {}
export interface WorkshopDetailResponse extends ApiResponse<WorkshopWithGroups> {}

// ============================================================================
// WRITING GROUP API
// ============================================================================

export interface CreateWritingGroupRequest {
  name: string;
  description?: string;
  slug?: string;
  is_template?: boolean;
}

export interface UpdateWritingGroupRequest {
  name?: string;
  description?: string;
  slug?: string;
  is_template?: boolean;
}

export interface WritingGroupResponse extends ApiResponse<WritingGroup> {}
export interface WritingGroupsResponse extends ApiResponse<PaginatedResult<WritingGroup>> {}

// ============================================================================
// PARTICIPANT API
// ============================================================================

export interface CreateParticipantRequest {
  full_name: string;
  display_name: string;
}

export interface UpdateParticipantRequest {
  full_name?: string;
  display_name?: string;
}

export interface ParticipantResponse extends ApiResponse<Participant> {}
export interface ParticipantsResponse extends ApiResponse<PaginatedResult<Participant>> {}

// ============================================================================
// WORKSHOP GROUP API
// ============================================================================

export interface CreateWorkshopGroupRequest {
  workshop_id: string;
  writing_group_id: string;
  name_override?: string;
  slug_override?: string;
}

export interface UpdateWorkshopGroupRequest {
  name_override?: string;
  slug_override?: string;
  status?: 'setup' | 'active' | 'paused' | 'closed';
  participant_order?: string[]; // Array of participant IDs
}

export interface AddParticipantToGroupRequest {
  participant_id: string;
  role?: 'participant' | 'teamer';
  table_position?: number;
}

export interface WorkshopGroupResponse extends ApiResponse<WorkshopGroup> {}
export interface WorkshopGroupDetailResponse extends ApiResponse<WorkshopGroupWithDetails> {}

// ============================================================================
// ACTIVITY API
// ============================================================================

export interface CreateActivityRequest {
  name: string;
  type: ActivityType;
  config?: ActivityConfig;
  time_limit_minutes?: number;
  position?: number;
}

export interface UpdateActivityRequest {
  name?: string;
  config?: ActivityConfig;
  status?: 'setup' | 'active' | 'paused' | 'completed';
  time_limit_minutes?: number;
  position?: number;
}

export interface ActivityResponse extends ApiResponse<Activity> {}
export interface ActivitiesResponse extends ApiResponse<Activity[]> {}

// ============================================================================
// SESSION & AUTHENTICATION API
// ============================================================================

export interface LoginRequest {
  participant_id: string;
  workshop_group_id: string;
  device_info?: string;
}

export interface LoginResponse extends ApiResponse<{
  session_token: string;
  participant: Participant;
  workshop_group: WorkshopGroupWithDetails;
  expires_at: string;
}> {}

export interface SessionStatusResponse extends ApiResponse<SessionInfo> {}

export interface LogoutRequest {
  session_token: string;
}

// ============================================================================
// LOBBY & GROUP ACCESS API
// ============================================================================

export interface LobbyInfoRequest {
  workshop_slug: string;
  group_slug: string;
}

export interface LobbyInfoResponse extends ApiResponse<{
  workshop: Workshop;
  writing_group: WritingGroup;
  participants: Participant[];
  urls: GroupUrl;
  is_active: boolean;
}> {}

export interface GroupAccessRequest {
  workshop_slug: string;
  group_slug: string;
  participant_id?: string; // Optional if already in session
}

export interface GroupAccessResponse extends ApiResponse<{
  workshop_group: WorkshopGroupWithDetails;
  participant: Participant;
  session_token: string;
  urls: GroupUrl;
}> {}

// ============================================================================
// REAL-TIME & SSE API
// ============================================================================

export interface OnlineStatusRequest {
  workshop_group_id: string;
}

export interface OnlineStatusResponse extends ApiResponse<OnlineStatus> {}

export interface SSEEvent {
  type: 'online_status' | 'activity_update' | 'turn_change' | 'document_update' | 'group_update';
  data: unknown;
  timestamp: string;
  workshop_group_id: string;
}

export interface OnlineStatusEvent extends SSEEvent {
  type: 'online_status';
  data: OnlineStatus;
}

export interface ActivityUpdateEvent extends SSEEvent {
  type: 'activity_update';
  data: {
    activity_id: string;
    status: Activity['status'];
    updated_by: Participant;
  };
}

export interface TurnChangeEvent extends SSEEvent {
  type: 'turn_change';
  data: {
    activity_id: string;
    current_participant: Participant | null;
    next_participant: Participant | null;
    paper_id?: string;
  };
}

export interface DocumentUpdateEvent extends SSEEvent {
  type: 'document_update';
  data: {
    document_id: string;
    updated_by: Participant;
    update_type: 'content' | 'title' | 'published';
  };
}

export interface GroupUpdateEvent extends SSEEvent {
  type: 'group_update';
  data: {
    workshop_group_id: string;
    update_type: 'participant_joined' | 'participant_left' | 'status_changed' | 'settings_updated';
    updated_by?: Participant;
  };
}

// ============================================================================
// ADMIN API
// ============================================================================

export interface AdminLoginRequest {
  password: string;
}

export interface AdminLoginResponse extends ApiResponse<{
  admin_token: string;
  expires_at: string;
}> {}

export interface AdminDashboardResponse extends ApiResponse<{
  workshops: {
    total: number;
    active: number;
    recent: Workshop[];
  };
  participants: {
    total: number;
    online: number;
    recent: Participant[];
  };
  groups: {
    total: number;
    active: number;
    recent: WorkshopGroup[];
  };
  activities: {
    total: number;
    active: number;
    by_type: Record<ActivityType, number>;
  };
}> {}

// ============================================================================
// URL RESOLUTION API
// ============================================================================

export interface ResolveUrlRequest {
  path: string; // e.g., "/fruehling_2025/hoerspiele" or "/gruppe-p6"
}

export interface ResolveUrlResponse extends ApiResponse<{
  workshop_group: WorkshopGroupWithDetails;
  urls: GroupUrl;
  resolved_from: 'semantic' | 'short_id';
}> {}

// ============================================================================
// ACTIVITY TURN MANAGEMENT API
// ============================================================================

export interface AdvanceTurnRequest {
  activity_id: string;
  paper_id?: string; // For multi-paper activities
  skip?: boolean; // Skip current participant's turn
}

export interface AdvanceTurnResponse extends ApiResponse<{
  current_participant: Participant | null;
  next_participant: Participant | null;
  turn_number: number;
  paper_id?: string;
  is_complete: boolean;
}> {}

export interface SubmitTurnRequest {
  activity_id: string;
  paper_id: string;
  content: string;
}

export interface SubmitTurnResponse extends ApiResponse<{
  turn_id: string;
  next_participant: Participant | null;
  is_paper_complete: boolean;
  is_activity_complete: boolean;
}> {}

// ============================================================================
// EXPORT API
// ============================================================================

export interface ExportRequest {
  workshop_group_id: string;
  format: 'markdown' | 'json' | 'pdf';
  include_unpublished?: boolean;
  include_activities?: ActivityType[];
  include_participants?: string[]; // Participant IDs
}

export interface ExportResponse extends ApiResponse<{
  download_url: string;
  filename: string;
  expires_at: string;
  size_bytes: number;
}> {}

// ============================================================================
// SEARCH API
// ============================================================================

export interface SearchRequest {
  query: string;
  type?: 'workshops' | 'groups' | 'participants' | 'activities' | 'all';
  workshop_id?: string; // Limit search to specific workshop
  limit?: number;
}

export interface SearchResult {
  type: 'workshop' | 'group' | 'participant' | 'activity';
  id: string;
  title: string;
  description?: string;
  url?: string;
  highlight?: string; // Matched text snippet
}

export interface SearchResponse extends ApiResponse<{
  results: SearchResult[];
  total: number;
  query: string;
  took_ms: number;
}> {}

// ============================================================================
// BULK OPERATIONS API
// ============================================================================

export interface BulkCreateParticipantsRequest {
  participants: CreateParticipantRequest[];
  workshop_group_id?: string; // Automatically add to group
}

export interface BulkCreateParticipantsResponse extends ApiResponse<{
  created: Participant[];
  errors: Array<{
    index: number;
    error: string;
    data: CreateParticipantRequest;
  }>;
}> {}

export interface BulkUpdateGroupParticipantsRequest {
  workshop_group_id: string;
  updates: Array<{
    participant_id: string;
    role?: 'participant' | 'teamer';
    table_position?: number;
  }>;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response
  );
}

export function isValidationError(response: unknown): response is ValidationError {
  return (
    isApiError(response) &&
    response.code === 'VALIDATION_ERROR' &&
    Array.isArray(response.details)
  );
}