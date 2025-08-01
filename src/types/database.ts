/**
 * Database Entity Types for Schreibmaschine
 * 
 * TypeScript interfaces that match the SQLite database schema
 */

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface Workshop {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: 'planning' | 'active' | 'closed';
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface WritingGroup {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  full_name: string; // Admin only
  display_name: string; // Frontend display
  created_at: string;
  updated_at: string;
}

export interface WorkshopGroup {
  id: string;
  workshop_id: string;
  writing_group_id: string;
  name_override: string | null;
  slug_override: string | null;
  short_id: string; // e.g., "p6", "Lz"
  status: 'setup' | 'active' | 'paused' | 'closed';
  participant_order: string | null; // JSON array of participant IDs
  created_at: string;
  updated_at: string;
}

export interface GroupParticipant {
  id: string;
  workshop_group_id: string;
  participant_id: string;
  role: 'participant' | 'teamer';
  table_position: number | null;
  joined_at: string;
}

export interface OnlineSession {
  id: string;
  workshop_group_id: string;
  participant_id: string;
  session_token: string;
  device_info: string | null;
  last_seen: string;
  created_at: string;
}

// ============================================================================
// ACTIVITY SYSTEM
// ============================================================================

export type ActivityType = 
  | 'collaborative_pad' 
  | 'individual_pad' 
  | 'rhyming_chain' 
  | 'paper_drawing' 
  | 'timed_writing'
  | 'mashup_writing';

export interface Activity {
  id: string;
  workshop_group_id: string;
  name: string;
  type: ActivityType;
  config: string | null; // JSON config
  status: 'setup' | 'active' | 'paused' | 'completed';
  position: number;
  time_limit_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  participant_id: string;
  role: 'participant' | 'observer' | 'editor';
  turn_order: number | null;
  current_turn: boolean;
  can_skip: boolean;
  joined_at: string;
}

export interface ActivityTurn {
  id: string;
  activity_id: string;
  participant_id: string | null; // NULL if skipped
  turn_number: number;
  paper_id: string; // Which "paper" this turn is on
  content: string | null;
  is_skipped: boolean;
  created_at: string;
}

export type DocumentType = 'collaborative' | 'individual' | 'rhyme_paper';

export interface Document {
  id: string;
  activity_id: string | null;
  participant_id: string | null;
  workshop_group_id: string;
  title: string;
  type: DocumentType;
  loro_doc_id: string;
  is_published: boolean;
  export_as_markdown: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ACTIVITY CONFIG TYPES
// ============================================================================

export interface CollaborativePadConfig {
  editable_by?: 'all' | 'teamer_only' | 'assigned_participants';
  max_participants?: number;
  allow_comments?: boolean;
}

export interface IndividualPadConfig {
  time_limit?: number; // minutes
  word_limit?: number;
  prompt?: string;
  allow_save_draft?: boolean;
}

export interface RhymeChainConfig {
  papers_count?: number; // How many "papers" to pass around
  turns_per_paper?: number;
  rhyme_scheme?: string; // e.g., "ABAB", "AABB"
  show_previous_lines?: number; // How many previous lines to show
}

export interface PaperDrawingConfig {
  colors?: string[];
  prompts?: string[];
  random_draw?: boolean;
  draw_count?: number; // How many papers each person draws
}

export interface TimedWritingConfig {
  duration_minutes: number;
  prompt?: string;
  word_target?: number;
  show_timer?: boolean;
}

export interface MashupWritingConfig {
  pairs?: boolean; // Work in pairs
  group_size?: number; // Or larger groups
  combine_stories?: boolean;
  mashup_method?: 'sentence_by_sentence' | 'paragraph_by_paragraph' | 'theme_mixing';
}

export type ActivityConfig = 
  | CollaborativePadConfig 
  | IndividualPadConfig 
  | RhymeChainConfig 
  | PaperDrawingConfig 
  | TimedWritingConfig
  | MashupWritingConfig;

// ============================================================================
// JOINED TYPES (FOR API RESPONSES)
// ============================================================================

export interface WorkshopWithGroups extends Workshop {
  groups: WorkshopGroupWithDetails[];
}

export interface WorkshopGroupWithDetails extends WorkshopGroup {
  workshop: Workshop;
  writing_group: WritingGroup;
  participants: ParticipantWithRole[];
  activities: ActivityWithParticipants[];
  online_count: number;
}

export interface ParticipantWithRole extends Participant {
  role: 'participant' | 'teamer';
  table_position: number | null;
  is_online: boolean;
}

export interface ActivityWithParticipants extends Activity {
  participants: ActivityParticipant[];
  current_turn_participant?: Participant;
}

export interface WritingGroupTemplate extends WritingGroup {
  usage_count: number; // How many times used in workshops
}

// ============================================================================
// URL ROUTING TYPES
// ============================================================================

export interface GroupUrl {
  workshop_slug: string;
  group_slug: string;
  short_id: string;
  full_semantic_url: string; // /workshop_slug/group_slug
  short_url: string; // /gruppe-short_id
  lobby_url: string; // /workshop_slug/group_slug/vorraum
}

// ============================================================================
// SESSION MANAGEMENT TYPES
// ============================================================================

export interface SessionInfo {
  participant: Participant;
  workshop_group: WorkshopGroupWithDetails;
  session_token: string;
  last_seen: string;
  is_online: boolean;
  device_info?: string;
}

export interface OnlineStatus {
  workshop_group_id: string;
  online_participants: Array<{
    participant: Participant;
    role: 'participant' | 'teamer';
    last_seen: string;
    device_info?: string;
  }>;
  total_participants: number;
  online_count: number;
}

// ============================================================================
// ACTIVITY TURN MANAGEMENT
// ============================================================================

export interface TurnState {
  activity_id: string;
  current_turn_participant: Participant | null;
  turn_order: Participant[];
  papers: Array<{
    paper_id: string;
    turns: ActivityTurn[];
    current_participant: Participant | null;
    is_complete: boolean;
  }>;
  can_advance: boolean;
}

// ============================================================================
// CREATE/UPDATE TYPES
// ============================================================================

export interface CreateWorkshop {
  name: string;
  description?: string;
  slug?: string; // Auto-generated if not provided
}

export interface UpdateWorkshop {
  name?: string;
  description?: string;
  slug?: string;
  status?: Workshop['status'];
}

export interface CreateWritingGroup {
  name: string;
  description?: string;
  slug?: string;
  is_template?: boolean;
}

export interface CreateParticipant {
  full_name: string;
  display_name: string;
}

export interface UpdateParticipant {
  full_name?: string;
  display_name?: string;
}

export interface CreateWorkshopGroup {
  workshop_id: string;
  writing_group_id: string;
  name_override?: string;
  slug_override?: string;
  participant_ids?: string[]; // Participants to add immediately
}

export interface CreateActivity {
  workshop_group_id: string;
  name: string;
  type: ActivityType;
  config?: ActivityConfig;
  time_limit_minutes?: number;
  participant_ids?: string[]; // Participants to add to activity
}

// ============================================================================
// DATABASE QUERY HELPERS
// ============================================================================

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface SearchOptions extends PaginationOptions {
  query?: string;
  filters?: Record<string, unknown>;
}