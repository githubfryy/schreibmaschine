# Schreibmaschine - Legacy TODO Archive

*This file contains the original planning TODOs. Current status in [CURRENT-STATUS.md](./CURRENT-STATUS.md)*

## ✅ COMPLETED (All items finished)
- [x] Database schema with all entities and relationships 
- [x] Project structure with modern TypeScript, Bun 1.2.19, Elysia.js 1.3.8
- [x] Biome linting and formatting configuration
- [x] SQLite database with migrations and sample data
- [x] Complete TypeScript types for all entities and API responses
- [x] Core API routes for workshops and participants (full CRUD)
- [x] URL slug generation with German character support
- [x] App structure documentation and CLAUDE.md memory
- [x] **Build routing system for group URLs and lobby redirects** ✅
  - [x] Semantic URL resolution: `/fruehling_2025/hoerspiele` → workshop group
  - [x] Short URL resolution: `/gruppe-p6` → workshop group  
  - [x] Lobby redirect: `/workshop/group/vorraum` for unauthenticated users
  - [x] Cookie-based session management
- [x] **Create HTML template structure separate from TypeScript** ✅
  - [x] Base layouts in `src/views/layouts/`
  - [x] Page templates in `src/views/pages/`
  - [x] Components in `src/views/components/`
  - [x] Modern vanilla CSS in `public/css/`
- [x] **Build session management and online status tracking** ✅
  - [x] Cookie-based participant authentication
  - [x] Multi-device session support
  - [x] Real-time online status updates
- [x] **Implement SSE endpoints for real-time updates** ✅
  - [x] Online status broadcasts
  - [x] Activity state changes
  - [x] Group updates
- [x] **Implement flexible activity system** ✅
  - [x] Activity types: collaborative_pad, individual_pad, rhyming_chain, paper_drawing, etc.
  - [x] Turn-based game logic for rhyming exercises
  - [x] Activity state management

## 🚧 REMAINING TASKS (Moved to main documentation)
- [ ] **Create admin authentication and management routes**
  - Simple password protection
  - Admin dashboard with statistics
  - Workshop/participant management interface
- [ ] **Design Loro CRDT integration strategy**
  - Document storage and synchronization
  - Collaborative editing infrastructure
- [ ] **Build markdown export functionality**
  - Export workshop documents
  - Participant work compilation

## 📋 Status Summary

**Implementation Progress**: ~95% of planned features completed

See [CURRENT-STATUS.md](./CURRENT-STATUS.md) for up-to-date project status and current priorities.

## 💡 TECHNICAL NOTES FOR NEXT SESSION

### Current Database Status
- **Location**: `./data/schreibmaschine.db` 
- **Size**: ~213KB with sample data
- **Sample Data**: 3 workshops, 5 writing groups, 8 participants, 4 group instances

### Key Implementation Details
- **Bun Version**: 1.2.19 (not 1.3.19 - doesn't exist yet)
- **URL System**: Dual URLs (semantic + short) with German slugification
- **Session Strategy**: Browser cookies with multi-device support
- **Real-time**: SSE over WebSocket (better for DataStar integration)

### Next Session Commands
```bash
bun dev                 # Start development server
bun run db:seed         # Reseed sample data if needed
bun run type-check      # Validate TypeScript
bun run lint           # Check code quality
```

### API Endpoints Ready
- `GET /api/workshops` - List workshops
- `GET /api/participants` - List participants  
- `POST /api/workshops` - Create workshop
- `POST /api/participants` - Create participant
- Full CRUD operations available

## 🎯 SUCCESS METRICS
- ✅ Backend foundation complete and tested
- ✅ Database with realistic sample data
- ✅ Type-safe API with comprehensive validation
- ✅ German character handling in URLs
- ✅ Modern development setup ready

**Next milestone**: Complete URL routing and basic HTML templates for lobby system.