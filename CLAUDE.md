# Schreibmaschine - Claude Memory Document

## Project Overview

**Schreibmaschine** is a collaborative writing app for creative writing workshops, designed to be local-first and work offline via Docker. Built with modern TypeScript, Bun 1.2.19, and Elysia.js 1.3.8.

### Core Concept
- **Local-first**: Works offline on LAN via Docker, easy for non-technical participants
- **Workshop-based**: Supports multiple workshops ("Sommer 2025", "Frühling 2024") with writing groups
- **Collaborative**: Real-time collaborative editing with Loro CRDT (future integration)
- **Activity-focused**: Flexible system for creative writing exercises

## Development Status: Backend-First Phase (January 2025)

**Current Focus**: Building solid backend foundation before frontend implementation  
**Documentation**: Complete API documentation available in `/docs/BACKEND_API_DOCUMENTATION.md`  
**Next Session Guide**: See end of document for immediate priorities

## Technical Stack

### Backend (Current Implementation)
- **Runtime**: Bun 1.2.19 (confirmed working version)
- **Framework**: Elysia.js 1.3.8 with method chaining best practices
- **Database**: SQLite with Bun.SQL, 213KB with sample data
- **Language**: TypeScript strict mode, zero compilation errors
- **Validation**: Elysia `t.Object` models (standardized across all API routes)
- **Authentication**: Full authentication system implemented (admin + participant)
- **Real-time**: Server-Sent Events (SSE) with connection management
- **Templates**: VentoJS with German localization filters
- **Linting**: Biome (68 warnings, all in vendor files)

### Frontend (Archived for Backend-First Approach) 📦
- **Status**: Moved to `_archived/` - will be reimplemented after backend is solid
- **Reason**: Complexity was distracting from core backend stability needed for collaboration
- **Future Plan**: VentoJS templates + Alpine.js after backend validation complete

## Database Architecture

### Core Entities
1. **Workshops** - "Frühling 2025", "Sommer 2024" (have multiple groups and participants)
2. **Writing Groups** - "Zusammen schreiben", "Hörspiele", "Sonettenmaschine" (concepts/templates)
3. **Participants** - "Nils", "Lisa", "Jonas" (full_name for admin, display_name for frontend)
4. **Workshop Groups** - Actual instances of writing groups within workshops
5. **Group Participants** - Junction table with roles (participant/teamer)
6. **Online Sessions** - Multi-device session tracking with browser cookies
7. **Activities** - Flexible system for writing exercises
8. **Activity Participants** - Who can access which activities
9. **Activity Turns** - Turn-based game progression (rhyming games)
10. **Documents** - Loro CRDT integration with metadata

### Key Features
- **Dual URL System**: 
  - Short: `/gruppe-p6` (2-3 character IDs)
  - Semantic: `/fruehling_2025/schoene_hoerspiele_im_winter_danach`
  - Lobby: `/fruehling_2025/schoene_hoerspiele_im_winter_danach/vorraum`
- **German Slugification**: "Schöne Hörspiele im Winter & danach" → "schoene_hoerspiele_im_winter_danach"
- **Real-time Updates**: SSE for online status, activity changes
- **Multi-device Support**: Seamless login across devices with cookies

## Activity System Design

### Activity Types
1. **collaborative_pad** - Shared writing space (teamer can control editing rights)
2. **individual_pad** - Personal writing with optional sharing
3. **rhyming_chain** - "Folded paper" rhyming game (see only previous line)
4. **paper_drawing** - Draw colored paper sheets with writing prompts
5. **timed_writing** - Time-limited writing exercises
6. **mashup_writing** - Combine individual stories into collaborative pieces

### Rhyming Game Logic
- Multiple "papers" circulate simultaneously (x papers for x people)
- Each person writes first line, passes to next
- Recipients see only the last line written, add their line, pass along
- "Check" option to skip turn with confirmation click
- Admin can set turn order around "virtual table"

## User Experience Flow

### Lobby System
1. Unauthenticated users go to `/workshop_slug/group_slug/vorraum`
2. See list of participants allowed in the group
3. Click on their name to "log in" (creates browser cookie)
4. Multi-device: shows popup if already online elsewhere, allows continuation

### Group Room Experience
- **Shared room metaphor**: Like sitting at a table, see others and materials
- **Personal view**: Each participant sees their own perspective of shared space
- **Online status**: Real-time display of who's currently in the room
- **Activity phases**: Admin/teamer can open/close activities, set up sequences

### Admin Interface
- **Simple password protection** initially (admin URL + password)
- **Full CRUD**: Workshops, groups, participants, activities
- **Real-time Dashboard**: See who's online in which groups
- **Export System**: All documents exportable as markdown
- **No peeking**: Admin can't see participant work until published

## Backend Implementation Status (January 2025)

### ✅ Core Infrastructure
- [x] **SQLite Database** - Complete schema with all relationships, 213KB sample data
- [x] **TypeScript Configuration** - Strict mode, zero compilation errors
- [x] **Elysia.js 1.3.8** - Method chaining, proper validation models
- [x] **Bun 1.2.19 Runtime** - Confirmed working version
- [x] **Development Workflow** - `bun run test:static` validation
- [x] **Type System** - Comprehensive database, API, and app types

### ✅ API Routes (95% Complete - Structural Issues Fixed)
- [x] **Workshop API** (`/api/workshops`) - Full CRUD, search, validation ✅
- [x] **Participant API** (`/api/participants`) - Full CRUD, bulk operations ✅  
- [x] **Activity API** (`/api/activities`) - CRUD, clean architecture, full authentication ✅
- [x] **Document API** (`/api/documents`) - Elysia validation, full authentication ✅
- [x] **Admin API** (`/admin/*`) - Password auth, dashboard, management ✅
- [x] **Group Routes** (`/*`) - URL resolution, lobby system ✅
- [x] **SSE Routes** (`/api/*/events`) - Clean implementation, full authentication ✅

### ✅ Service Layer (100% Complete - Architecture Standardized)
- [x] **WorkshopService** - All operations working ✅
- [x] **ParticipantService** - All operations working, imports fixed ✅
- [x] **ActivityService** - Static methods only, 400+ lines cleaned ✅
- [x] **DocumentService** - Full document lifecycle ✅
- [x] **AdminService** - Authentication & session management ✅
- [x] **SessionService** - Multi-device support ✅
- [x] **RhymingGameService** - Turn-based game logic ✅
- [x] **UrlService** - Dual URL system ✅
- [x] **TemplateService** - VentoJS with German filters ✅

### ✅ Authentication & Authorization
- [x] **Admin Authentication** - Password-based with secure sessions ✅
- [x] **Session Management** - Multi-device cookie handling ✅
- [x] **Participant Authentication** - Cookie-based with role permissions ✅
- [x] **Authorization Middleware** - Complete route protection implemented ✅

### ✅ Real-Time & Communication
- [x] **SSE Infrastructure** - Connection management, broadcasting ✅
- [x] **Event System** - Online status, activity updates ✅
- [x] **SSE Middleware Integration** - Auth integration complete ✅
- [ ] **WebSocket Planning** - For future Loro CRDT ⏸️

### ✅ Critical Issues Resolved (January 2025)

**📋 All structural issues fixed - see `/docs/BACKEND_API_DOCUMENTATION.md` for details**

1. ✅ **Import Consistency** - All services use standardized `import { db } from '@/config/database'`
2. ✅ **Authentication Complete** - Full participant authentication implemented  
3. ✅ **Service Architecture** - All services use static methods only (400+ lines cleaned)
4. ✅ **Validation Consistency** - All APIs use Elysia `t.Object` validation exclusively
5. ✅ **Code Cleanup** - Removed unused SSEService, cleaned TypeScript errors

### 📦 Archived Frontend Components

**Status**: Moved to `_archived/` for backend-first approach

**Previously Implemented**:
- Complete VentoJS template system with Alpine.js integration
- CSS design system and responsive components  
- Activity UI components for all activity types
- Real-time SSE integration with reactive updates
- Admin dashboard with live monitoring
- Progressive enhancement patterns

**Reason**: Frontend complexity was distracting from backend stability needed for collaborative features.

## File Structure

```
src/
├── config/              # Configuration files
│   ├── env.ts          # Environment validation (Zod)
│   └── database.ts     # Database connection & management
├── database/           # Database related
│   ├── schema.sql      # Complete SQLite schema
│   ├── migrate.ts      # Migration runner
│   └── seed.ts         # Development seeding
├── types/              # TypeScript definitions
│   ├── database.ts     # Database entity types
│   ├── api.ts          # API request/response types
│   └── app.ts          # Application-specific types
├── utils/              # Utility functions
│   ├── crypto.ts       # ID generation, session tokens
│   └── slugify.ts      # German URL slugification
├── routes/             # API & page routes ✅
│   ├── api/            # REST API endpoints
│   │   ├── index.ts    # API router setup
│   │   ├── workshops.ts # Workshop CRUD
│   │   ├── participants.ts # Participant CRUD
│   │   ├── activities.ts # Activity management ✅
│   │   └── documents.ts # Document management ✅
│   ├── admin.ts        # Admin routes & dashboard ✅ (VentoJS)
│   ├── groups.ts       # Group URLs & lobby system ✅ (VentoJS)
│   └── sse.ts          # Server-Sent Events ✅
├── services/           # Business logic ✅
│   ├── workshop.service.ts # Workshop operations
│   ├── participant.service.ts # Participant operations (imports fixed)
│   ├── activity.service.ts # Activity management (cleaned, static methods)
│   ├── admin.service.ts # Admin authentication ✅
│   ├── document.service.ts # Document operations (imports fixed)
│   ├── rhyming-game.service.ts # Turn-based games ✅
│   ├── session.service.ts # Session management ✅
│   ├── url.service.ts  # URL resolution & routing
│   └── template.service.ts # VentoJS template engine ✅
├── views/              # VentoJS templates ✅
│   ├── layouts/        # Base layouts
│   │   ├── base.html   # Legacy layout (backup)
│   │   └── base.vto    # VentoJS main layout ✅
│   ├── pages/          # Page templates
│   │   ├── welcome.vto # Welcome page ✅
│   │   ├── lobby.html  # Group lobby (to migrate)
│   │   ├── group-room.html # Group room (to migrate)
│   │   ├── admin-login.vto # Admin login ✅
│   │   ├── admin-dashboard.vto # Admin dashboard ✅
│   │   └── error.vto   # Error pages ✅
│   └── components/     # Reusable components
│       └── activity-content.html # Activity templates (to migrate)
└── middleware/         # Elysia middleware ✅
    ├── session.ts      # Participant session management
    └── admin.ts        # Admin authentication ✅

public/                 # Static assets ✅
├── css/               # Stylesheets
│   ├── main.css       # Base styles
│   ├── lobby.css      # Lobby page styles
│   ├── group-room.css # Group room styles
│   └── admin.css      # Admin interface styles ✅
└── js/                # Client-side JavaScript
    └── common.js      # Authentication & utilities

test-templates.js      # Offline template testing ✅
DEVELOPMENT.md         # Development workflow guide ✅
```

## Development Commands

```bash
# Development (User-managed)
bun run dev             # Start development server with hot reload

# Static Testing (Claude Code safe)
bun run test:static     # Full validation: type-check + lint + templates
bun run type-check      # TypeScript validation
bun run lint            # Biome linting  
bun run test:templates  # Test VentoJS templates offline

# Build & Deploy
bun run build           # Build for production
bun run start           # Start production server

# Database
bun run db:migrate      # Run database migrations
bun run db:seed         # Seed development data

# Code Quality
bun run lint:fix        # Auto-fix linting issues
bun run format          # Auto-format code

# Template Development (VentoJS)
# Note: VentoJS templates (.vto) are validated at runtime
# Use error fallback system for graceful template debugging
```

## Key Design Decisions

1. **VentoJS over Custom Templates**: TypeScript-native, async-first, better maintainability (January 2025)
2. **SQLite over PostgreSQL**: Better for local-first, workshop deployment model
3. **SSE over WebSocket**: Better for DataStar integration and offline-first approach
4. **Alpine.js over React/Vue**: Progressive enhancement for workshop reliability
5. **Dual URL system**: User-friendly semantic URLs + short sharing URLs
6. **Multi-device sessions**: Same user can be online on multiple devices seamlessly
7. **Activity-first design**: Everything revolves around structured writing activities

## Next Session Focus (Backend-First Approach)

### 🎯 Immediate Priorities
1. **Elysia.js API Validation** - Test all routes against Elysia 1.3.8 documentation
2. **Authentication Simplification** - Clear auth vs non-auth route separation for testing
3. **Core API Testing** - CRUD operations with SQLite database validation
4. **SSE Implementation Validation** - Real-time updates functionality testing

### 🔧 Technical Strategy Decisions
- **SSE**: One-way real-time updates (online status, activity changes, notifications)
- **WebSocket**: Bi-directional collaboration (Loro CRDT document sync)
- **Route Structure**: Public, Participant (cookie auth), Admin (admin auth), WebSocket (future)

### 📋 Success Criteria
- All API endpoints respond correctly
- Authentication flows work for both participant and admin
- SSE connection stable and receives events
- Database operations execute without errors
- TypeScript compiles cleanly
- Clear WebSocket integration plan documented

**Reference**: See `NEXT_SESSION_GUIDE.md` for detailed session plan and commands.

## Key Technical Achievements

### Frontend Architecture Decision
**Alpine.js over DataStar** - Chosen for workshop reliability:
- **Progressive enhancement**: Works without JavaScript in poor connectivity
- **Mature ecosystem**: Battle-tested with extensive documentation  
- **Offline resilience**: Critical for "thick buildings in outer country"
- **Multi-device excellence**: Alpine Persist handles device switching seamlessly

### Alpine.js Integration Complete
- **File structure**: All dependencies in `/public/js/alpinejs/` for offline use
- **Plugin ecosystem**: Persist, AJAX, Focus, Intersect loaded in correct order
- **Template integration**: Lobby and group room converted to reactive Alpine components
- **SSE integration**: Real-time updates flow through Alpine's reactive system
- **Auto-save**: Individual writing auto-saves using Alpine Persist per participant

### Admin System Achievement
- **Complete Authentication**: Password-based admin system with secure session management
- **Admin Dashboard**: Real-time monitoring interface with tabbed navigation (workshops/participants/online status)
- **Environment Integration**: Proper .env file support for admin password configuration
- **Security Implementation**: Protected routes, secure cookies, session validation, and cleanup
- **Production Ready**: Fully functional admin interface at `/admin` with Alpine.js reactive UI
- **Monitoring Capabilities**: Live participant tracking, workshop statistics, and system health monitoring

### Participant Authentication System Achievement (Latest)
- **Complete Implementation**: Full participant authentication system replacing all mock IDs
- **Cookie-Based Sessions**: Secure HTTP-only cookies using Elysia 1.3.8 reactive cookie API
- **Role-Based Authorization**: Participant and teamer roles with proper permission checks
- **Multi-Device Support**: Seamless login across devices with session management
- **Protected API Routes**: All 14 routes requiring authentication now properly secured
- **Real-Time Integration**: SSE connections authenticated with participant context
- **Database Integration**: Session tokens stored securely with timeout handling
- **Middleware Architecture**: Clean separation with `requireAuth` and `requireTeamer` guards

### Code Quality Achievements (Updated January 2025)
- **TypeScript**: Zero compilation errors, strict type checking enabled
- **Biome Linting**: Clean validation (68 warnings only, all vendor files excluded)
- **Type Safety**: All `any` types replaced with proper interfaces (except strategic framework integration points)
- **Null Safety**: All non-null assertions (`!`) replaced with proper null checks
- **API Routes**: Complete parameter typing for all Elysia handlers
- **Service Layer**: Consistent static methods, cleaned unused code (400+ lines removed)
- **Import Consistency**: Standardized database imports across all services
- **Validation Uniformity**: All APIs use Elysia validation exclusively
- **Production Ready**: `bun run test:static` passes cleanly

## Important Notes

- **Development Workflow**: User runs `bun run dev`, Claude uses `bun run test:static` for validation
- **HTML separate from TS**: ✅ Implemented - templates in `src/views/` with `TemplateService`
- **German character handling**: ✅ Implemented - proper slugification for umlauts (ä→ae, ö→oe, ü→ue, ß→ss)
- **Local-first focus**: Everything should work offline and sync when reconnected
- **Workshop metaphor**: Think of physical creative writing workshops - groups sit at tables, pass papers around
- **Flexibility first**: Activity system designed to support future creative writing exercises
- **Claude Code Terminal**: zsh environment works perfectly, Bun 1.2.19 + Node.js v22.3.0 available

## Documentation Maintenance Process

### 📋 How to Keep Documentation Up-to-Date

When implementing new features or making changes:

1. **Always update CLAUDE.md first** - This is the primary memory document
2. **Update completion status** - Move items from "pending" to "completed" sections
3. **Add new todos** - Include new requirements in the current todo list
4. **Update file structure** - Reflect any new files or directories added
5. **Document key decisions** - Add important architectural choices to memory

## 🚀 Next Session Priorities (Backend-First - Updated January 2025)

### ✅ COMPLETED: Backend Foundation Complete

1. **✅ Critical Infrastructure Issues**
   - ✅ Unified database import patterns across all services
   - ✅ Standardized service architecture (static methods only)
   - ✅ Removed unused `SSEService` (kept only `SSEManager`)
   - ✅ Converted all API validation from Zod to Elysia
   - ✅ Fixed TypeScript compilation errors and unused imports

2. **✅ Authentication System Complete**
   - ✅ Replaced all mock authentication with real implementation (14 routes)
   - ✅ Implemented cookie-based session management with Elysia 1.3.8
   - ✅ Added role-based authorization (participant/teamer)
   - ✅ Integrated multi-device session handling
   - ✅ Secured all API routes and SSE connections
   - ⚠️ Minor session validation refinement needed (timestamp handling)

### 🎯 NEW HIGH PRIORITY: Frontend Integration Phase

1. **Template System Completion**
   - Migrate remaining HTML templates to VentoJS (.vto)
   - Complete lobby and group room template conversion
   - Integrate authentication with frontend templates
   - Test complete user flow from lobby to authenticated rooms

2. **Activity System Frontend**
   - Implement activity UI components for all 6 activity types
   - Connect frontend to authenticated API endpoints
   - Test real-time collaboration features
   - Validate document persistence and export functionality

### 🛠️ Medium Priority (Polish & Testing)

1. **Session Management Refinement**
   - Fix session validation timestamp handling
   - Test extensive multi-device scenarios
   - Optimize session cleanup and timeout handling
   - Add session management to admin dashboard

2. **Integration Testing & Performance**
   - End-to-end testing of complete user workflows
   - Performance testing of SQLite operations under load
   - Real-time event broadcasting stress testing
   - Document export functionality validation

### 📋 Commands for Next Session

```bash
# Fix critical issues first
bun run test:static  # Ensure everything still compiles

# Test API endpoints
curl http://localhost:3000/api/workshops
curl http://localhost:3000/api/participants  
curl http://localhost:3000/api/activities

# Test SSE
curl -N http://localhost:3000/api/test-sse

# Test admin interface
curl http://localhost:3000/admin/api/stats
```

### 🎯 Success Criteria (Updated Progress)

- [x] All mock authentication replaced with real implementation ✅
- [x] Service architecture consistent (all static methods) ✅
- [x] All API routes working with proper authentication ✅
- [x] SSE integration stable with real participant data ✅
- [x] Zero TypeScript compilation errors maintained ✅
- [x] Clean `bun run test:static` validation ✅

## 📚 Reference Documentation

### Current Documentation
- **`/docs/BACKEND_API_DOCUMENTATION.md`** - Complete API and service documentation with issues identified
- **`/CLAUDE.md`** - This file, project memory and current status
- **`/DEVELOPMENT.md`** - Development workflow guide for Claude Code integration

### Key Files Completed (Authentication Implementation)
- `src/routes/api/activities.ts` - ✅ Replaced all 8 mock-participant-id placeholders
- `src/routes/api/documents.ts` - ✅ Replaced all 6 mock authentication calls
- `src/middleware/session.ts` - ✅ Complete unified authentication middleware
- `src/services/session.service.ts` - ✅ Fully integrated with API routes
- `src/routes/sse.ts` - ✅ Added authentication to SSE connections

### Database & Testing
- **Database**: `./data/schreibmaschine.db` (213KB, complete sample data)
- **Validation**: `bun run test:static` (TypeScript + Biome + Templates)
- **API Testing**: Browser test page at `/public/test-api.html`