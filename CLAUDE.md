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

## Completed Work

### ✅ Database & Infrastructure
- [x] Complete SQLite schema with all tables and relationships
- [x] Database migration and seeding system with sample data
- [x] Bun 1.2.19 + Elysia.js 1.3.8 setup with proper configuration
- [x] TypeScript strict configuration with path mapping
- [x] Biome linting and formatting configuration
- [x] Comprehensive TypeScript types (database, API, app)
- [x] Cryptographic utilities (UUID, short IDs, session tokens)
- [x] German-aware URL slugification system
- [x] Environment configuration with Zod validation

### Database Status
- **Location**: `./data/schreibmaschine.db`
- **Size**: ~213KB with sample data
- **Sample Data**: 3 workshops, 5 writing groups, 8 participants, 4 group instances, activities

## Current Todo List

### High Priority (Immediate)
1. [pending] **Build core API routes** for workshops, groups, and participants
2. [pending] **Build routing system** for group URLs and lobby redirects  
3. [pending] **Create HTML template structure** separate from TypeScript

### Medium Priority
1. [pending] **Implement flexible activity system** with different activity types
2. [pending] **Build session management** and online status tracking
3. [pending] **Implement SSE endpoints** for real-time updates
4. [pending] **Create admin authentication** and management routes

### Low Priority (Future)
1. [pending] **Design Loro CRDT integration** strategy for documents
2. [pending] **Build markdown export functionality**

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
├── routes/             # API routes (TODO)
├── services/           # Business logic (TODO)
├── middleware/         # Elysia middleware (TODO)
└── views/              # HTML templates (TODO)
```

## Development Commands

```bash
bun dev                 # Start development server with hot reload
bun run type-check      # TypeScript validation
bun run lint            # Biome linting
bun run format          # Auto-format code
bun run db:migrate      # Run database migrations
bun run db:seed         # Seed development data
```

## Key Design Decisions

1. **SQLite over PostgreSQL**: Better for local-first, workshop deployment model
2. **SSE over WebSocket**: Better for DataStar integration and offline-first approach
3. **Separate HTML files**: Easier maintenance, cleaner separation of concerns
4. **Dual URL system**: User-friendly semantic URLs + short sharing URLs
5. **Multi-device sessions**: Same user can be online on multiple devices seamlessly
6. **Activity-first design**: Everything revolves around structured writing activities

## Next Session Priorities

1. **API Routes**: Build REST endpoints for core entities
2. **URL Routing**: Implement semantic and short URL resolution
3. **HTML Templates**: Create base layouts and component structure
4. **Session Management**: Cookie-based authentication system
5. **SSE Implementation**: Real-time updates for online status

## Important Notes

- **HTML separate from TS**: Never write large HTML chunks in TypeScript - use separate HTML files
- **German character handling**: Proper slugification for umlauts (ä→ae, ö→oe, ü→ue, ß→ss)
- **Local-first focus**: Everything should work offline and sync when reconnected
- **Workshop metaphor**: Think of physical creative writing workshops - groups sit at tables, pass papers around
- **Flexibility first**: Activity system designed to support future creative writing exercises

## Questions for User (If Needed)

- Activity progression tracking implementation details
- Offline writing storage strategy (browser IndexedDB vs database)
- Admin capabilities scope (pause activities, time limits, etc.)
- Document storage approach for Loro CRDT integration