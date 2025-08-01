# Schreibmaschine - Current TODOs

## ✅ COMPLETED (Ready for next session)
- [x] Database schema with all entities and relationships 
- [x] Project structure with modern TypeScript, Bun 1.2.19, Elysia.js 1.3.8
- [x] Biome linting and formatting configuration
- [x] SQLite database with migrations and sample data
- [x] Complete TypeScript types for all entities and API responses
- [x] Core API routes for workshops and participants (full CRUD)
- [x] URL slug generation with German character support
- [x] App structure documentation and CLAUDE.md memory

## 🚀 HIGH PRIORITY (Next session focus)
- [ ] **Build routing system for group URLs and lobby redirects**
  - Semantic URL resolution: `/fruehling_2025/hoerspiele` → workshop group
  - Short URL resolution: `/gruppe-p6` → workshop group  
  - Lobby redirect: `/workshop/group/vorraum` for unauthenticated users
  - Cookie-based session management

- [ ] **Create HTML template structure separate from TypeScript**
  - Base layouts in `src/views/layouts/`
  - Page templates in `src/views/pages/`
  - Components in `src/views/components/`
  - Modern vanilla CSS in `public/css/`

## 🔄 MEDIUM PRIORITY
- [ ] **Build session management and online status tracking**
  - Cookie-based participant authentication
  - Multi-device session support
  - Real-time online status updates

- [ ] **Implement SSE endpoints for real-time updates**
  - Online status broadcasts
  - Activity state changes
  - Group updates

- [ ] **Create admin authentication and management routes**
  - Simple password protection
  - Admin dashboard with statistics
  - Workshop/participant management interface

- [ ] **Implement flexible activity system**
  - Activity types: collaborative_pad, individual_pad, rhyming_chain, paper_drawing, etc.
  - Turn-based game logic for rhyming exercises
  - Activity state management

## 🔮 LOW PRIORITY (Future)
- [ ] **Design Loro CRDT integration strategy**
  - Document storage and synchronization
  - Collaborative editing infrastructure

- [ ] **Build markdown export functionality**
  - Export workshop documents
  - Participant work compilation

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