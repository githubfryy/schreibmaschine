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

### Frontend (COMPLETED - January 2025) ✅
- **Templates**: VentoJS `.vto` with layout system & async support 
- **Styling**: Modern CSS 2025 with design system & component architecture
- **Interactivity**: Alpine.js 3.14.9 with progressive enhancement
- **Communication**: Alpine AJAX + Server-Sent Events for real-time updates
- **Architecture**: Complete component library with workshop-focused patterns
- **Future**: Loro CRDT + ProseMirror for advanced collaborative editing

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

### ✅ Recently Completed (January 2025 - VentoJS System Complete)
- [x] **VentoJS Template System Fully Operational** - Layout rendering, content display working correctly
- [x] **Template Configuration Fixed** - `autoescape: false` resolves all content rendering issues  
- [x] **Static File Serving Optimized** - Assets reorganized to depth 2+ structure for reliable serving
- [x] **Welcome Page Complete** - Modern Anthropic-inspired design rendering beautifully
- [x] **Comprehensive VentoJS Documentation** - Complete implementation guide created in `docs/VENTOJS_IMPLEMENTATION_LEARNINGS.md`
- [x] **Route System Stabilized** - Guards added to prevent static file conflicts
- [x] **Template Debugging Resolved** - Root cause analysis and systematic fixes applied

### ✅ Admin System (COMPLETED & TESTED!)
- [x] **Admin Authentication System** - Complete password-based authentication with session management
- [x] **Admin Login Page** - Dedicated login interface with Alpine.js integration  
- [x] **Admin Dashboard** - Management interface for workshops, participants, and real-time monitoring
- [x] **Admin Routes & Middleware** - Secure API endpoints with proper authentication guards
- [x] **Real-time Monitoring** - Live online participant tracking with 30-second updates
- [x] **Environment Configuration** - Working .env support for admin password configuration
- [x] **Production Ready** - Full admin system tested and functional at `/admin`

### ✅ Activity System Frontend (COMPLETED - January 2025)
- [x] **Activity UI Components** - Complete interfaces for individual_pad, collaborative_pad, rhyming_chain
- [x] **Individual Writing Pad** - Auto-save, word count, session tracking, Alpine Persist integration
- [x] **Rhyming Game Enhancement** - Turn management, previous line display, skip functionality
- [x] **Real-time Activity State** - SSE integration for live activity updates
- [x] **Database Integration** - Load real activities from database instead of mock data
- [x] **Teamer Controls** - Activity start/stop/pause controls in group room interface
- [x] **Comprehensive Styling** - Activity-specific CSS with responsive design and animations

### ✅ VentoJS Template Engine Migration (COMPLETED - January 2025)
- [x] **VentoJS Installation & Setup** - TypeScript-native template engine with async support
- [x] **Custom Template Service** - Modern wrapper replacing custom mustache implementation
- [x] **Admin Template Migration** - Fixed admin login/dashboard rendering issues
- [x] **Base Layout System** - Unified VentoJS layout with Alpine.js integration
- [x] **Error & Welcome Templates** - Complete page templates with responsive design
- [x] **Custom German Filters** - Date formatting, activity status, participant count localization
- [x] **Async Route Integration** - All template calls converted to async/await pattern
- [x] **TypeScript Type Safety** - Full type safety with proper VentoJS API usage
- [x] **Implementation Documentation** - Comprehensive learning guide for future reference

### ✅ Complete Frontend Implementation Strategy (COMPLETED - January 2025)
- [x] **Modern CSS Design System** - Complete variable system with CSS layers, container queries, and intrinsic layouts
- [x] **Component Library Architecture** - Organized VentoJS components in ui/, workshop/, and activities/ directories
- [x] **Alpine.js Component System** - Workshop room state management, real-time sync, notification system
- [x] **Template Migration** - Lobby and group-room converted to new VentoJS patterns with Alpine.js integration
- [x] **Activity Interface Components** - Complete individual_pad, collaborative_pad, rhyming_chain, paper_drawing, timed_writing interfaces
- [x] **UI Component System** - Reusable button, modal, notification components with variant support
- [x] **Real-time Integration** - SSE with Alpine reactive updates, multi-device session management
- [x] **Workshop-Specific Components** - Participant sidebar, activity workspace, session management
- [x] **Progressive Enhancement** - Works without JavaScript, enhanced with Alpine.js for workshop reliability

### High Priority (Next Up)
1. [pending] **Loro CRDT Integration** - Replace document system with conflict-free collaborative editing
2. [pending] **Document Export System** - Markdown export functionality for workshop content compilation  
3. [pending] **Enhanced Admin Activity Management** - Full activity creation and configuration interface with CRUD operations
4. [pending] **Production Template Deployment** - Replace existing templates with new architecture

### Medium Priority
1. [pending] **Advanced Activity Types** - Implement remaining activity variations
2. [pending] **Activity State Management** - Enhanced progression tracking
3. [pending] **Admin User Management** - CRUD operations for participants and workshop setup

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
│   ├── admin.ts        # Admin routes & dashboard ✅ (VentoJS)
│   ├── groups.ts       # Group URLs & lobby system ✅ (VentoJS)
│   └── sse.ts          # Server-Sent Events ✅
├── services/           # Business logic ✅
│   ├── workshop.service.ts # Workshop operations
│   ├── participant.service.ts # Participant operations
│   ├── activity.service.ts # Activity management ✅
│   ├── admin.service.ts # Admin authentication ✅
│   ├── document.service.ts # Document operations ✅
│   ├── rhyming-game.service.ts # Turn-based games ✅
│   ├── session.service.ts # Session management ✅
│   ├── sse.service.ts  # Event broadcasting ✅
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

## Next Session Priorities

1. **Document Export System**: Implement markdown export functionality for workshop content compilation 
   - Create export service for document aggregation and markdown generation
   - Add export API routes and admin interface for download functionality
   - Support multiple formats: individual documents, workshop compilations, participant portfolios

2. **Enhanced Admin Activity Management**: Complete CRUD interface for activity creation and configuration
   - Activity creation forms with type selection and settings
   - Real-time activity monitoring and participant assignment
   - Enhanced admin dashboard with comprehensive activity controls

3. **Advanced Real-time Features**: More granular SSE updates and collaboration enhancements
   - Live activity state monitoring, typing indicators, enhanced turn management
   - Real-time collaboration feedback and participant activity tracking

4. **Loro CRDT Integration**: Unified collaborative editing system (Phase 2)
   - Replace current document system with conflict-free collaborative editing
   - Implement ProseMirror integration for rich text collaborative writing

5. **Production Deployment**: Docker containerization and workshop deployment preparation

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

### Admin System Achievement (Latest)
- **Complete Authentication**: Password-based admin system with secure session management
- **Admin Dashboard**: Real-time monitoring interface with tabbed navigation (workshops/participants/online status)
- **Environment Integration**: Proper .env file support for admin password configuration
- **Security Implementation**: Protected routes, secure cookies, session validation, and cleanup
- **Production Ready**: Fully functional admin interface at `/admin` with Alpine.js reactive UI
- **Monitoring Capabilities**: Live participant tracking, workshop statistics, and system health monitoring

### Code Quality Achievements
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