# Schreibmaschine - Claude Memory Document

## Project Overview

**Schreibmaschine** is a collaborative writing app for creative writing workshops, designed to be local-first and work offline via Docker. Built with modern TypeScript, Bun 1.2.19, and Elysia.js 1.3.8.

### Core Concept
- **Local-first**: Works offline on LAN via Docker, easy for non-technical participants
- **Workshop-based**: Supports multiple workshops ("Sommer 2025", "Frühling 2024") with writing groups
- **Collaborative**: Real-time collaborative editing with Loro CRDT (future integration)
- **Activity-focused**: Flexible system for creative writing exercises

## Technical Stack

### Backend (Current Focus)
- **Runtime**: Bun 1.2.19 (not 1.3.19 - that version doesn't exist yet)
- **Framework**: Elysia.js 1.3.8 with Server-Sent Events (SSE) for real-time updates
- **Database**: SQLite with Bun.SQL for local-first approach
- **Language**: TypeScript with strict 2025 configuration
- **Linting**: Biome for formatting and code quality

### Frontend (Future)
- **HTML**: Modern 2025 vanilla HTML separate from TypeScript files
- **CSS**: Modern 2025 vanilla CSS
- **JavaScript**: Alpine.js 3.14.9 + plugins (persist, ajax)
- **Alternative**: DataStar 1.0 RC4 for reactive updates
- **Collaboration**: Loro CRDT + ProseMirror for markdown-compatible editing

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

## Completed Work ✅

### ✅ Foundation & Infrastructure
- [x] Complete SQLite schema with all tables and relationships
- [x] Database migration and seeding system with sample data  
- [x] Bun 1.2.19 + Elysia.js 1.3.8 setup with proper configuration
- [x] TypeScript strict configuration with path mapping
- [x] Biome linting and formatting configuration
- [x] Comprehensive TypeScript types (database, API, app)
- [x] Cryptographic utilities (UUID, short IDs, session tokens)
- [x] German-aware URL slugification system
- [x] Environment configuration with Zod validation

### ✅ API & Routing (COMPLETED!)
- [x] **Core API routes** - Full CRUD for workshops, participants, groups
- [x] **URL routing system** - Semantic URLs, short URLs, lobby redirects
- [x] **Group routes** - Complete lobby system and group room access
- [x] **Dual URL resolution** - Both `/gruppe-p6` and `/workshop/group` formats
- [x] **Authentication flow** - Cookie-based session management

### ✅ HTML Templates & Frontend (COMPLETED!)
- [x] **HTML template structure** - Separate from TypeScript as requested
- [x] **Template service** - Mustache-style templating system
- [x] **Complete page templates** - Welcome, lobby, group room, error pages
- [x] **Modern CSS** - Responsive design with component stylesheets  
- [x] **JavaScript utilities** - Common functions for authentication and activities
- [x] **Offline testing** - `test-templates.js` validates templates without server

### ✅ Alpine.js Frontend Integration (COMPLETED!)
- [x] **Alpine.js 3.14.9 + plugins** - Offline-first setup with all dependencies downloaded
- [x] **Progressive enhancement** - Works without JavaScript for workshop reliability
- [x] **Alpine AJAX integration** - Seamless frontend-backend communication
- [x] **Alpine Persist** - Auto-save and multi-device session handling
- [x] **Reactive lobby system** - Smart login with multi-device detection
- [x] **Real-time group room** - SSE integration with live participant tracking
- [x] **Activity framework UI** - Ready for individual writing and rhyming games

### ✅ Session Management & Real-time (COMPLETED!)
- [x] **Cookie-based authentication** - Multi-device login system
- [x] **Online status tracking** - Real-time participant presence
- [x] **SSE implementation** - Server-Sent Events for live updates
- [x] **Session cleanup** - Automatic expired session management
- [x] **Multi-device support** - Seamless device switching capability

### ✅ Activity System (COMPLETED!)
- [x] **Activity service** - Complete business logic for all activity types
- [x] **Activity API routes** - Full CRUD operations with validation
- [x] **Turn-based games** - Rhyming game service with progression tracking
- [x] **Activity participants** - Role-based access control system
- [x] **Real-time updates** - SSE integration for activity state changes

### ✅ Document System (COMPLETED!)
- [x] **Document service** - Complete document lifecycle management
- [x] **Document API routes** - Full CRUD with metadata handling
- [x] **Activity integration** - Documents linked to activities and participants
- [x] **Publication control** - Privacy settings for document sharing
- [x] **Export preparation** - Ready for markdown export implementation

### ✅ Claude Code Integration (SOLVED!)
- [x] **Terminal environment** - zsh configuration working perfectly
- [x] **Tool availability** - Bun 1.2.19, Node.js v22.3.0 accessible
- [x] **Development workflow** - User manages server, Claude does static work
- [x] **Testing infrastructure** - `bun run test:static` for complete validation
- [x] **Documentation** - `DEVELOPMENT.md` with complete workflow guide

### ✅ Code Quality & Type Safety (COMPLETED!)
- [x] **TypeScript Compilation** - Zero errors, clean static validation
- [x] **Type Safety** - Replaced all dangerous `any` types with proper interfaces
- [x] **Null Safety** - Removed non-null assertions with proper null checks
- [x] **Biome Configuration** - Vendor files excluded, source code fully linted
- [x] **Production Readiness** - Clean `bun run test:static` validation
- [x] **API Route Types** - All Elysia handlers properly typed
- [x] **Service Layer** - Fixed generateShortId calls and return types

### Database Status
- **Location**: `./data/schreibmaschine.db`
- **Size**: ~213KB with sample data
- **Sample Data**: 3 workshops, 5 writing groups, 8 participants, 4 group instances, activities
- **Status**: ✅ Complete with all entities and relationships implemented

## Current Todo List

### ✅ Recently Completed (Since Last Update)
- [x] **Activity System Implementation** - Complete flexible framework with services
- [x] **Document System** - Full document management with metadata
- [x] **Rhyming Game Service** - Turn-based game logic with skip functionality
- [x] **SSE Service** - Real-time event broadcasting system
- [x] **Activity Routes** - Complete API endpoints for activity management
- [x] **Document Routes** - Full CRUD operations for documents
- [x] **Code Quality Cleanup** - Complete Biome linting and TypeScript type safety fixes

### High Priority (Next Up)
1. [pending] **Admin Authentication** - Password-protected management interface
2. [pending] **Enhanced Activity UI** - Frontend integration for activity management
3. [pending] **Document Export** - Markdown export functionality

### Medium Priority
1. [pending] **Advanced Activity Types** - Implement remaining activity variations
2. [pending] **Admin Dashboard** - Real-time monitoring interface
3. [pending] **Activity State Management** - Enhanced progression tracking

### Low Priority (Future)
1. [pending] **Loro CRDT Integration** - Replace document system with CRDT
2. [pending] **Docker Deployment** - Production container setup
3. [pending] **Advanced Export** - Workshop content compilation

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
│   ├── groups.ts       # Group URLs & lobby system
│   └── sse.ts          # Server-Sent Events ✅
├── services/           # Business logic ✅
│   ├── workshop.service.ts # Workshop operations
│   ├── participant.service.ts # Participant operations
│   ├── activity.service.ts # Activity management ✅
│   ├── document.service.ts # Document operations ✅
│   ├── rhyming-game.service.ts # Turn-based games ✅
│   ├── session.service.ts # Session management ✅
│   ├── sse.service.ts  # Event broadcasting ✅
│   ├── url.service.ts  # URL resolution & routing
│   └── template.service.ts # HTML template rendering
├── views/              # HTML templates ✅
│   ├── layouts/        # Base layouts
│   │   └── base.html   # Main layout template
│   ├── pages/          # Page templates
│   │   ├── welcome.html # Welcome page
│   │   ├── lobby.html  # Group lobby
│   │   ├── group-room.html # Group room
│   │   └── error.html  # Error pages
│   └── components/     # Reusable components
│       └── activity-content.html # Activity templates
└── middleware/         # Elysia middleware (TODO)

public/                 # Static assets ✅
├── css/               # Stylesheets
│   ├── main.css       # Base styles
│   ├── lobby.css      # Lobby page styles
│   └── group-room.css # Group room styles
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
bun run test:templates  # Test HTML templates offline

# Build & Deploy
bun run build           # Build for production
bun run start           # Start production server

# Database
bun run db:migrate      # Run database migrations
bun run db:seed         # Seed development data

# Code Quality
bun run lint:fix        # Auto-fix linting issues
bun run format          # Auto-format code
```

## Key Design Decisions

1. **SQLite over PostgreSQL**: Better for local-first, workshop deployment model
2. **SSE over WebSocket**: Better for DataStar integration and offline-first approach
3. **Separate HTML files**: Easier maintenance, cleaner separation of concerns
4. **Dual URL system**: User-friendly semantic URLs + short sharing URLs
5. **Multi-device sessions**: Same user can be online on multiple devices seamlessly
6. **Activity-first design**: Everything revolves around structured writing activities

## Next Session Priorities

1. **Admin Interface**: Simple password-protected management dashboard
2. **Frontend Activity Integration**: Connect Alpine.js with activity services
3. **Document Export**: Implement markdown export functionality
4. **Enhanced UI**: Improve activity management interface

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

### Code Quality Achievements (Latest)
- **TypeScript**: Zero compilation errors, strict type checking enabled
- **Biome Linting**: Clean validation (68 warnings only, all vendor files excluded)
- **Type Safety**: All `any` types replaced with proper interfaces (except strategic framework integration points)
- **Null Safety**: All non-null assertions (`!`) replaced with proper null checks
- **API Routes**: Complete parameter typing for all Elysia handlers
- **Service Layer**: Fixed function calls and improved error handling
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

### 🔄 Documentation Structure

- **Primary**: `/CLAUDE.md` - Complete project memory and status
- **Archive**: `/claude-documentation/` - Historical planning and references
- **User**: `/readme.md` - Public project overview in German

### 📅 Update Triggers

Update documentation when:
- ✅ Completing major features or services
- 🆕 Adding new API routes or services  
- 🏗️ Making architectural decisions
- 🐛 Solving significant implementation challenges
- 📊 Reaching development milestones

### 🎯 Key Documentation Principles

- **Accuracy**: Documentation reflects actual implementation, not plans
- **Completeness**: All major features and decisions are documented
- **Maintenance**: Regular updates during development, not at the end
- **User Focus**: Remember this is Claude's memory for future sessions

## Questions for User (If Needed)

- Admin interface design preferences (dashboard layout, management features)
- Markdown export format requirements (individual docs vs compiled workshops)
- Loro CRDT integration timeline and priorities
- Docker deployment requirements for workshop environments