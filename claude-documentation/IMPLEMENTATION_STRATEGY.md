# Schreibmaschine Implementation Strategy

## Current Status & Next Steps

### ✅ Foundation Complete (Winter 2024/2025)
- Complete backend infrastructure (Elysia.js + SQLite)
- Activity system with rhyming games and document management
- Session management with multi-device support
- Admin authentication and dashboard
- Alpine.js frontend foundation with SSE integration

### 🎯 Priority Focus: Activity System Frontend Integration

Based on the comprehensive analysis of implementation guides and current project state, here's the strategic approach:

## Phase 1: Enhanced Activity UI Components (Current Priority)

### 1.1 Alpine.js Activity Integration Strategy

**Approach:** Progressive enhancement of existing group room with activity-specific components

**Key Decisions:**
- **Alpine AJAX**: Use for seamless frontend-backend communication
- **Alpine Persist**: Auto-save individual writing per participant
- **SSE Integration**: Real-time activity state updates
- **Component-based**: Each activity type gets dedicated Alpine component

### 1.2 Activity Types Implementation Order

1. **Individual Pad** (Simplest, foundation for others)
   - Auto-saving text editor with Alpine Persist
   - Word count and writing stats
   - Publication controls (private/shared)

2. **Rhyming Chain Game** (Turn-based logic)
   - Turn management with real-time updates
   - Previous line visibility only
   - Skip turn functionality with confirmation

3. **Collaborative Pad** (Future: Loro CRDT integration)
   - Shared writing space
   - Teamer editing controls
   - Real-time participant awareness

### 1.3 Technical Implementation Decisions

**Frontend Architecture:**
```javascript
// Unified Alpine component for all activities
Alpine.data('activityManager', (groupId, currentParticipant) => ({
  currentActivity: null,
  activities: [],
  
  // Activity-specific states
  individualText: Alpine.$persist('').as(`individual-${currentParticipant.id}`),
  rhymingState: { isMyTurn: false, previousLine: '', currentPlayer: '' },
  collaborativeState: { participants: [], canEdit: false },
  
  // Unified activity switching
  selectActivity(activityId) {
    this.loadActivityState(activityId);
    this.currentActivity = this.activities.find(a => a.id === activityId);
  }
}))
```

**API Integration:**
- Use existing `/api/activities/:id/state` for activity state
- Use existing `/api/activities/:id/submit` for content submission
- Use existing `/api/activities/:id/skip` for turn skipping
- Extend with `/api/documents/individual` for auto-saving

## Phase 2: Document System Enhancement

### 2.1 Unified Loro CRDT Strategy (Future Implementation)

**Key Decision:** Use unified Loro CRDT for ALL writing scenarios
- Individual writing: Offline-first Loro documents
- Collaborative writing: Real-time Loro synchronization
- Rhyming games: Loro with business logic visibility restrictions

**Benefits:**
- Architectural simplicity (one document system)
- Seamless transitions between writing modes
- Offline-first perfect for workshop environments
- Unified export system for markdown/printing

### 2.2 Document Lifecycle
```typescript
// Phase 2: Enhanced document creation
interface DocumentConfig {
  type: 'individual' | 'collaborative' | 'rhyme_paper'
  participants: string[]
  syncMode: 'offline-first' | 'real-time' | 'turn-based'
  visibilityMode?: 'full' | 'last-line-only'
}

// Seamless mode transitions
async function upgradeToCollaborative(docId: string, participants: string[]) {
  const doc = await getDocument(docId)
  doc.addParticipants(participants)
  doc.enableRealTimeSync()
}
```

## Phase 3: Admin Interface Enhancement

### 3.1 Activity Management Controls
- Create/start/stop activities from admin dashboard
- Real-time monitoring of activity progress
- Participant activity assignment and role management

### 3.2 Document Export System
- Unified markdown export for all document types
- Workshop content compilation
- Print-friendly formatting with CSS
- Structured JSON export with metadata

## Implementation Files Structure

### Frontend Components
```
src/views/pages/
├── group-room.html (✅ exists, needs activity integration)
└── admin-dashboard.html (✅ exists, needs activity controls)

public/js/
├── common.js (✅ exists, needs activity helpers)
├── activity-components.js (📝 to create)
└── document-editor.js (📝 future Loro integration)

public/css/
├── group-room.css (✅ exists, needs activity styles)
└── activity-components.css (📝 to create)
```

### Backend Integration
```
src/services/
├── activity.service.ts (✅ complete)
├── document.service.ts (✅ complete)
└── loro-document.service.ts (📝 future integration)

src/routes/api/
├── activities.ts (✅ complete)
├── documents.ts (✅ complete)
└── loro.ts (📝 future integration)
```

## Immediate Development Plan

### ✅ Step 1: Activity UI Foundation (COMPLETED)
1. ✅ **Enhanced activity display** in group room with visual status indicators
2. ✅ **Individual writing component** with auto-save, word count, and session tracking
3. ✅ **Rhyming game component** with turn management and previous line display
4. ✅ **Activity state synchronization** via SSE with real-time updates
5. ✅ **Real activity loading** from database instead of mock data
6. ✅ **Teamer controls** for activity management in group room
7. ✅ **Comprehensive styling** with activity-specific components and responsive design

### ✅ Step 1.5: VentoJS Template Engine Migration (COMPLETED - January 2025)
1. ✅ **VentoJS Installation** - Modern TypeScript-native template engine (v1.15.2)
2. ✅ **Custom Template Service** - Replaced mustache-style with VentoJS wrapper
3. ✅ **Admin Templates Migration** - Fixed admin login/dashboard rendering issues
4. ✅ **Base Layout System** - Unified VentoJS layout with Alpine.js integration
5. ✅ **Error & Welcome Templates** - Modern page templates with responsive design
6. ✅ **Custom German Filters** - Date, status, count localization for workshop context
7. ✅ **Async Route Integration** - All template rendering converted to async/await
8. ✅ **TypeScript Type Safety** - Full VentoJS API integration with proper types
9. ✅ **Implementation Documentation** - Comprehensive learning guide (`VENTOJS_IMPLEMENTATION_LEARNINGS.md`)

### Step 2: Complete Template Migration
1. **Lobby template migration** - Convert `lobby.html` to `lobby.vto`
2. **Group room template migration** - Convert `group-room.html` to `group-room.vto`
3. **Component migration** - Convert activity components to VentoJS format
4. **Template validation** - Test all migrated templates with real data

### Step 3: Admin Activity Controls
1. **Activity creation forms** in admin dashboard
2. **Real-time activity monitoring**
3. **Activity start/stop controls**

### Step 4: Document Export
1. **Markdown export API** endpoints
2. **Export UI** in admin dashboard
3. **Workshop compilation** functionality

## Technical Decisions Documentation

### Template Engine Choice: VentoJS (NEW - January 2025)
**Rationale:** Modern TypeScript-native template system
- Native TypeScript support with proper type checking
- Async-first architecture for real-time features
- Unified `{{ }}` syntax easier than Nunjucks `{% %}`
- Pipeline filters with `|>` operator for data transformation
- Better error messages and debugging vs custom implementation
- Battle-tested alternative to custom mustache-style system

### Frontend Framework Choice: Alpine.js
**Rationale:** Perfect for workshop reliability
- Progressive enhancement (works without JavaScript)
- Offline resilience for "thick buildings in outer country"
- Multi-device excellence with Alpine Persist
- Mature ecosystem with extensive plugins

### Backend CRDT Strategy: Unified Loro
**Rationale:** Architectural simplicity and future-proofing
- Single document interface for all writing scenarios
- Seamless transitions between individual/collaborative modes
- Conflict-free offline synchronization
- Consistent export and printing capabilities

### Database Approach: SQLite + Future CRDT
**Rationale:** Local-first with collaboration capabilities
- Current: SQLite for metadata and simple document storage
- Future: Loro CRDT for collaborative document content
- Hybrid approach maintains performance and simplicity

## Success Metrics

### Phase 1 Complete When:
- [x] Participants can select and engage with activities in group room
- [x] Individual writing auto-saves and persists across devices
- [x] Rhyming games function with proper turn management
- [x] Real-time activity updates work via SSE
- [x] Teamers can control activity flow from admin interface

### Phase 2 Complete When:
- [ ] Unified Loro CRDT integration for all document types
- [ ] Seamless offline/online synchronization
- [ ] Real-time collaborative editing with conflict resolution
- [ ] Advanced document version history and time travel

### Phase 3 Complete When:
- [ ] Complete workshop content export system
- [ ] Advanced admin analytics and monitoring
- [ ] Production Docker deployment ready
- [ ] Full multi-workshop scale testing complete

---

## Key Implementation Principles

1. **Progressive Enhancement**: Everything works without JavaScript
2. **Offline-First**: All writing survives connectivity issues
3. **Workshop Reliability**: Simple, predictable user experience
4. **Architectural Consistency**: Unified patterns across all features
5. **Future-Proof**: Easy to extend with new activity types

This strategy ensures Schreibmaschine evolves from a solid foundation into a comprehensive collaborative writing platform optimized for creative writing workshops.