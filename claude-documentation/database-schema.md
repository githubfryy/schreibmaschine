# Schreibmaschine Database Schema (Archive)

*Note: This is an archived planning document. Current schema status is in [CURRENT-STATUS.md](./CURRENT-STATUS.md)*

## Overview
SQLite database with Bun.SQL for local-first collaborative writing workshops.

## Core Entities

### 1. Workshops
```sql
CREATE TABLE workshops (
    id TEXT PRIMARY KEY,                    -- UUID
    name TEXT NOT NULL,                     -- "Frühling 2025"
    description TEXT,                       -- Optional description
    slug TEXT NOT NULL UNIQUE,              -- "fruehling_2025" (auto-generated, editable)
    status TEXT NOT NULL DEFAULT 'planning', -- 'planning', 'active', 'closed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Writing Groups (Templates & Concepts)
```sql
CREATE TABLE writing_groups (
    id TEXT PRIMARY KEY,                    -- UUID
    name TEXT NOT NULL,                     -- "Schöne Hörspiele im Winter & danach"
    description TEXT,                       -- Optional description
    slug TEXT NOT NULL,                     -- "schoene_hoerspiele_im_winter_danach" 
    is_template BOOLEAN DEFAULT FALSE,      -- Can be used as template for new groups
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Workshop Groups (Actual Group Instances)
```sql
CREATE TABLE workshop_groups (
    id TEXT PRIMARY KEY,                    -- UUID
    workshop_id TEXT NOT NULL,              -- FK to workshops
    writing_group_id TEXT NOT NULL,         -- FK to writing_groups (template)
    name_override TEXT,                     -- Custom name for this instance
    slug_override TEXT,                     -- Custom slug for URLs
    short_id TEXT NOT NULL UNIQUE,         -- "p6", "Lz" for short URLs
    status TEXT NOT NULL DEFAULT 'setup',  -- 'setup', 'active', 'paused', 'closed'
    participant_order TEXT,                 -- JSON array of participant IDs for "table order"
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE,
    FOREIGN KEY (writing_group_id) REFERENCES writing_groups(id) ON DELETE RESTRICT,
    UNIQUE(workshop_id, writing_group_id)   -- One instance per template per workshop
);
```

### 4. Participants
```sql
CREATE TABLE participants (
    id TEXT PRIMARY KEY,                    -- UUID
    full_name TEXT NOT NULL,                -- "Nils Olsson" (admin only)
    display_name TEXT NOT NULL,             -- "Nils" (shown in frontend)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Group Participants (Who's in which group)
```sql
CREATE TABLE group_participants (
    id TEXT PRIMARY KEY,                    -- UUID
    workshop_group_id TEXT NOT NULL,        -- FK to workshop_groups
    participant_id TEXT NOT NULL,           -- FK to participants
    role TEXT DEFAULT 'participant',       -- 'participant', 'teamer' (can direct activities)
    table_position INTEGER,                 -- Position around virtual table (for turn order)
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workshop_group_id) REFERENCES workshop_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    UNIQUE(workshop_group_id, participant_id)
);
```

### 6. Online Sessions (Who's currently online)
```sql
CREATE TABLE online_sessions (
    id TEXT PRIMARY KEY,                    -- UUID
    workshop_group_id TEXT NOT NULL,        -- FK to workshop_groups
    participant_id TEXT NOT NULL,           -- FK to participants
    session_token TEXT NOT NULL,            -- Browser cookie identifier
    device_info TEXT,                       -- Optional device fingerprint
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workshop_group_id) REFERENCES workshop_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    UNIQUE(workshop_group_id, participant_id, session_token)
);
```

## Activity System

### 7. Activities (Flexible activity types)
```sql
CREATE TABLE activities (
    id TEXT PRIMARY KEY,                    -- UUID
    workshop_group_id TEXT NOT NULL,        -- FK to workshop_groups
    name TEXT NOT NULL,                     -- "Collaborative Story", "Rhyming Game"
    type TEXT NOT NULL,                     -- 'collaborative_pad', 'individual_pad', 'rhyming_chain', 'paper_drawing', 'timed_writing'
    config TEXT,                            -- JSON config for activity-specific settings
    status TEXT NOT NULL DEFAULT 'setup',  -- 'setup', 'active', 'paused', 'completed'
    position INTEGER DEFAULT 0,             -- Order within group
    time_limit_minutes INTEGER,             -- Optional time limit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workshop_group_id) REFERENCES workshop_groups(id) ON DELETE CASCADE
);
```

### 8. Activity Participants (Who can access what)
```sql
CREATE TABLE activity_participants (
    id TEXT PRIMARY KEY,                    -- UUID
    activity_id TEXT NOT NULL,              -- FK to activities
    participant_id TEXT NOT NULL,           -- FK to participants
    role TEXT DEFAULT 'participant',       -- 'participant', 'observer', 'editor'
    turn_order INTEGER,                     -- For turn-based activities like rhyming game
    current_turn BOOLEAN DEFAULT FALSE,     -- Is it this person's turn?
    can_skip BOOLEAN DEFAULT TRUE,          -- Can skip their turn
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    UNIQUE(activity_id, participant_id)
);
```

### 9. Activity Turns (For turn-based games like rhyming)
```sql
CREATE TABLE activity_turns (
    id TEXT PRIMARY KEY,                    -- UUID
    activity_id TEXT NOT NULL,              -- FK to activities
    participant_id TEXT,                    -- FK to participants (NULL if skipped)
    turn_number INTEGER NOT NULL,           -- Sequential turn number
    paper_id TEXT NOT NULL,                 -- Which "paper" this turn is on
    content TEXT,                           -- What was written (or NULL if skipped)
    is_skipped BOOLEAN DEFAULT FALSE,       -- Did participant skip this turn?
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE SET NULL,
    UNIQUE(activity_id, turn_number, paper_id)
);
```

### 10. Documents (For Loro CRDT integration)
```sql
CREATE TABLE documents (
    id TEXT PRIMARY KEY,                    -- UUID
    activity_id TEXT,                       -- FK to activities (NULL for personal docs)
    participant_id TEXT,                    -- FK to participants (owner for personal docs)
    workshop_group_id TEXT NOT NULL,        -- FK to workshop_groups
    title TEXT NOT NULL,                    -- Document title
    type TEXT NOT NULL,                     -- 'collaborative', 'individual', 'rhyme_paper'
    loro_doc_id TEXT NOT NULL UNIQUE,       -- Loro document identifier
    is_published BOOLEAN DEFAULT FALSE,     -- Can others see this document?
    export_as_markdown BOOLEAN DEFAULT TRUE, -- Include in markdown export?
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    FOREIGN KEY (workshop_group_id) REFERENCES workshop_groups(id) ON DELETE CASCADE
);
```

## URL Management & Routing

### URL Patterns
1. **Short Group URL**: `localhost:3000/gruppe-{short_id}`
   - Example: `localhost:3000/gruppe-p6`
   - Maps to `workshop_groups.short_id`

2. **Semantic Group URL**: `localhost:3000/{workshop_slug}/{group_slug}`
   - Example: `localhost:3000/fruehling_2025/schoene_hoerspiele_im_winter_danach`
   - Maps to `workshops.slug` + `writing_groups.slug` (or `workshop_groups.slug_override`)

3. **Lobby URL**: `localhost:3000/{workshop_slug}/{group_slug}/vorraum`
   - Automatic redirect for unauthenticated users

### Slug Generation Rules
```typescript
// German characters to ASCII mapping
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};
```

## Indexes for Performance
```sql
-- URL routing indexes
CREATE INDEX idx_workshops_slug ON workshops(slug);
CREATE INDEX idx_writing_groups_slug ON writing_groups(slug);
CREATE INDEX idx_workshop_groups_short_id ON workshop_groups(short_id);
CREATE INDEX idx_workshop_groups_slugs ON workshop_groups(workshop_id, slug_override);

-- Session management indexes
CREATE INDEX idx_online_sessions_group_participant ON online_sessions(workshop_group_id, participant_id);
CREATE INDEX idx_online_sessions_last_seen ON online_sessions(last_seen);

-- Activity performance indexes
CREATE INDEX idx_activities_group_position ON activities(workshop_group_id, position);
CREATE INDEX idx_activity_turns_activity_paper ON activity_turns(activity_id, paper_id, turn_number);
CREATE INDEX idx_documents_activity ON documents(activity_id);
CREATE INDEX idx_documents_participant ON documents(participant_id);
```

## Key Features Supported

1. **Flexible URL System**: Both short and semantic URLs with real-time editing
2. **Activity Framework**: Supports current and future writing games/activities
3. **Turn Management**: Proper rhyming game with "folded paper" visibility
4. **Session Tracking**: Multi-device support with seamless transitions
5. **Document Management**: Loro CRDT integration with optional publishing
6. **Role-Based Access**: Participants vs teamers (activity directors)
7. **Workshop Lifecycle**: From planning to closed with proper state management
8. **Offline-First Ready**: Document storage prepared for local-first sync

## Migration Strategy
- Start with core tables (workshops, writing_groups, participants)
- Add workshop_groups and group_participants for basic functionality
- Implement session management
- Build activity system incrementally
- Add document management when Loro integration is ready