/**
 * Application-specific Types for Schreibmaschine
 * 
 * Types used throughout the application for business logic
 */

import type { ActivityType, Participant, WorkshopGroup } from './database';

// ============================================================================
// FRONTEND STATE TYPES
// ============================================================================

export interface AppState {
  currentUser: Participant | null;
  currentGroup: WorkshopGroup | null;
  sessionToken: string | null;
  isOnline: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastHeartbeat: string | null;
}

export interface GroupRoomState {
  participants: ParticipantStatus[];
  activities: ActivityStatus[];
  currentActivity: string | null;
  isTeamer: boolean;
  canManageActivities: boolean;
}

export interface ParticipantStatus {
  participant: Participant;
  role: 'participant' | 'teamer';
  isOnline: boolean;
  lastSeen: string;
  tablePosition: number | null;
  deviceInfo?: string;
}

export interface ActivityStatus {
  id: string;
  name: string;
  type: ActivityType;
  status: 'setup' | 'active' | 'paused' | 'completed';
  participantCount: number;
  progress?: number; // 0-100 percentage
  currentTurn?: {
    participant: Participant;
    paperId?: string;
    turnNumber: number;
  };
  timeRemaining?: number; // seconds, for timed activities
}

// ============================================================================
// ROUTING TYPES
// ============================================================================

export interface RouteParams {
  workshopSlug?: string;
  groupSlug?: string;
  shortId?: string;
  participantId?: string;
  activityId?: string;
}

export interface RouteContext {
  params: RouteParams;
  query: URLSearchParams;
  isLobby: boolean;
  isAuthenticated: boolean;
  currentUser?: Participant;
  currentGroup?: WorkshopGroup;
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  isActive?: boolean;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // ms, 0 for persistent
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
  }>;
}

export interface Modal {
  id: string;
  type: 'confirm' | 'form' | 'info' | 'custom';
  title: string;
  content: string | unknown; // HTML string or component data
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  actions?: Array<{
    label: string;
    action: () => void | Promise<void>;
    style: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
  }>;
}

// ============================================================================
// ACTIVITY UI TYPES
// ============================================================================

export interface ActivityUIConfig {
  type: ActivityType;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  supportsMultipleParticipants: boolean;
  supportsTurns: boolean;
  supportsTimer: boolean;
  defaultConfig: Record<string, unknown>;
  configFields: ActivityConfigField[];
}

export interface ActivityConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea';
  required?: boolean;
  defaultValue?: unknown;
  options?: Array<{ value: unknown; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  help?: string;
}

// ============================================================================
// DOCUMENT EDITING TYPES
// ============================================================================

export interface EditorState {
  documentId: string;
  content: string;
  isDirty: boolean;
  isOnline: boolean;
  lastSaved: string | null;
  collaborators: Array<{
    participant: Participant;
    cursor?: { line: number; column: number };
    selection?: { start: number; end: number };
    color: string;
  }>;
}

export interface DocumentPermissions {
  canRead: boolean;
  canWrite: boolean;
  canComment: boolean;
  canShare: boolean;
  canExport: boolean;
  isOwner: boolean;
}

// ============================================================================
// REAL-TIME EVENT TYPES
// ============================================================================

export interface ClientEvent {
  type: string;
  data: unknown;
  timestamp: string;
  participantId: string;
  workshopGroupId: string;
}

export interface HeartbeatEvent extends ClientEvent {
  type: 'heartbeat';
  data: {
    lastActivity: string;
    currentPage: string;
  };
}

export interface CursorMoveEvent extends ClientEvent {
  type: 'cursor_move';
  data: {
    documentId: string;
    position: { line: number; column: number };
  };
}

export interface TypingEvent extends ClientEvent {
  type: 'typing';
  data: {
    documentId: string;
    isTyping: boolean;
  };
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface FormField<T = unknown> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  value: T;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  help?: string;
  options?: Array<{ value: T; label: string }>;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: T) => string | null;
  };
}

export interface FormState {
  fields: Record<string, FormField>;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// ============================================================================
// ANIMATION & INTERACTION TYPES
// ============================================================================

export interface AnimationConfig {
  duration: number;
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  delay?: number;
  iterations?: number | 'infinite';
}

export interface DragDropItem {
  id: string;
  type: string;
  data: unknown;
  preview?: string | HTMLElement;
}

export interface DropZone {
  id: string;
  accepts: string[];
  onDrop: (item: DragDropItem) => void;
  canDrop?: (item: DragDropItem) => boolean;
  hoverClass?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type EventHandler<T = Event> = (event: T) => void | Promise<void>;

export type AsyncFunction<T extends unknown[] = [], R = unknown> = (...args: T) => Promise<R>;

export type Callback<T extends unknown[] = [], R = void> = (...args: T) => R;

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'test' | 'production';
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    adminDashboard: boolean;
    exportMarkdown: boolean;
    activitySystem: boolean;
    realtimeUpdates: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'de' | 'en';
    animations: boolean;
    sounds: boolean;
  };
  session: {
    maxAge: number;
    heartbeatInterval: number;
    timeoutWarning: number;
  };
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

export interface AppError extends Error {
  code: string;
  context?: Record<string, unknown>;
  userMessage?: string;
  retryable?: boolean;
  timestamp: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
  errorInfo?: {
    componentStack: string;
    errorBoundary: string;
  };
}

// ============================================================================
// LOGGING TYPES
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
  userId?: string;
  sessionId?: string;
  url?: string;
}

// ============================================================================
// PERFORMANCE MONITORING TYPES
// ============================================================================

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface NavigationTiming {
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
}