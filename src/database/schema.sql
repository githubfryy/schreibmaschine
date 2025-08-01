-- Schreibmaschine Database Schema
-- SQLite database for collaborative writing workshops

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

-- Workshops (e.g., "Frühling 2025", "Sommer 2024")
CREATE TABLE IF NOT EXISTS workshops (
    id TEXT PRIMARY KEY,                    -- UUID
    name TEXT NOT NULL,                     -- "Frühling 2025"
    description TEXT,                       -- Optional description
    slug TEXT NOT NULL UNIQUE,              -- "fruehling_2025" (auto-generated, editable)
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'closed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Writing Groups Templates/Concepts (e.g., "Schöne Hörspiele")
CREATE TABLE IF NOT EXISTS writing_groups (
    id TEXT PRIMARY KEY,                    -- UUID
    name TEXT NOT NULL,                     -- "Schöne Hörspiele im Winter & danach"
    description TEXT,                       -- Optional description
    slug TEXT NOT NULL,                     -- "schoene_hoerspiele_im_winter_danach" 
    is_template BOOLEAN DEFAULT FALSE,      -- Can be used as template for new groups
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Participants (e.g., "Nils", "Laura", "Jonas")
CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,                    -- UUID
    full_name TEXT NOT NULL,                -- "Nils Olsson" (admin only)
    display_name TEXT NOT NULL,             -- "Nils" (shown in frontend)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workshop Groups (Actual group instances in workshops)
CREATE TABLE IF NOT EXISTS workshop_groups (
    id TEXT PRIMARY KEY,                    -- UUID
    workshop_id TEXT NOT NULL,              -- FK to workshops
    writing_group_id TEXT NOT NULL,         -- FK to writing_groups (template)
    name_override TEXT,                     -- Custom name for this instance
    slug_override TEXT,                     -- Custom slug for URLs
    short_id TEXT NOT NULL UNIQUE,         -- "p6", "Lz" for short URLs
    status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'active', 'paused', 'closed')),
    participant_order TEXT,                 -- JSON array of participant IDs for "table order"
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE,
    FOREIGN KEY (writing_group_id) REFERENCES writing_groups(id) ON DELETE RESTRICT,
    UNIQUE(workshop_id, writing_group_id)   -- One instance per template per workshop
);

-- Group Participants (Who's in which group)
CREATE TABLE IF NOT EXISTS group_participants (
    id TEXT PRIMARY KEY,                    -- UUID
    workshop_group_id TEXT NOT NULL,        -- FK to workshop_groups
    participant_id TEXT NOT NULL,           -- FK to participants
    role TEXT DEFAULT 'participant' CHECK (role IN ('participant', 'teamer')),
    table_position INTEGER,                 -- Position around virtual table (for turn order)
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workshop_group_id) REFERENCES workshop_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    UNIQUE(workshop_group_id, participant_id)
);

-- Online Sessions (Who's currently online)
CREATE TABLE IF NOT EXISTS online_sessions (
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

-- ============================================================================
-- ACTIVITY SYSTEM
-- ============================================================================

-- Activities (Flexible activity types)
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,                    -- UUID
    workshop_group_id TEXT NOT NULL,        -- FK to workshop_groups
    name TEXT NOT NULL,                     -- "Collaborative Story", "Rhyming Game"
    type TEXT NOT NULL CHECK (type IN (
        'collaborative_pad', 
        'individual_pad', 
        'rhyming_chain', 
        'paper_drawing', 
        'timed_writing',
        'mashup_writing'
    )),
    config TEXT,                            -- JSON config for activity-specific settings
    status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'active', 'paused', 'completed')),
    position INTEGER DEFAULT 0,             -- Order within group
    time_limit_minutes INTEGER,             -- Optional time limit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workshop_group_id) REFERENCES workshop_groups(id) ON DELETE CASCADE
);

-- Activity Participants (Who can access what)
CREATE TABLE IF NOT EXISTS activity_participants (
    id TEXT PRIMARY KEY,                    -- UUID
    activity_id TEXT NOT NULL,              -- FK to activities
    participant_id TEXT NOT NULL,           -- FK to participants
    role TEXT DEFAULT 'participant' CHECK (role IN ('participant', 'observer', 'editor')),
    turn_order INTEGER,                     -- For turn-based activities like rhyming game
    current_turn BOOLEAN DEFAULT FALSE,     -- Is it this person's turn?
    can_skip BOOLEAN DEFAULT TRUE,          -- Can skip their turn
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    UNIQUE(activity_id, participant_id)
);

-- Activity Turns (For turn-based games like rhyming)
CREATE TABLE IF NOT EXISTS activity_turns (
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

-- Documents (For Loro CRDT integration)
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,                    -- UUID
    activity_id TEXT,                       -- FK to activities (NULL for personal docs)
    participant_id TEXT,                    -- FK to participants (owner for personal docs)
    workshop_group_id TEXT NOT NULL,        -- FK to workshop_groups
    title TEXT NOT NULL,                    -- Document title
    type TEXT NOT NULL CHECK (type IN ('collaborative', 'individual', 'rhyme_paper')),
    loro_doc_id TEXT NOT NULL UNIQUE,       -- Loro document identifier
    is_published BOOLEAN DEFAULT FALSE,     -- Can others see this document?
    export_as_markdown BOOLEAN DEFAULT TRUE, -- Include in markdown export?
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    FOREIGN KEY (workshop_group_id) REFERENCES workshop_groups(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- URL routing indexes
CREATE INDEX IF NOT EXISTS idx_workshops_slug ON workshops(slug);
CREATE INDEX IF NOT EXISTS idx_writing_groups_slug ON writing_groups(slug);
CREATE INDEX IF NOT EXISTS idx_workshop_groups_short_id ON workshop_groups(short_id);
CREATE INDEX IF NOT EXISTS idx_workshop_groups_slugs ON workshop_groups(workshop_id, slug_override);
CREATE INDEX IF NOT EXISTS idx_workshop_groups_workshop ON workshop_groups(workshop_id);

-- Session management indexes
CREATE INDEX IF NOT EXISTS idx_online_sessions_group_participant ON online_sessions(workshop_group_id, participant_id);
CREATE INDEX IF NOT EXISTS idx_online_sessions_last_seen ON online_sessions(last_seen);
CREATE INDEX IF NOT EXISTS idx_online_sessions_token ON online_sessions(session_token);

-- Activity performance indexes
CREATE INDEX IF NOT EXISTS idx_activities_group_position ON activities(workshop_group_id, position);
CREATE INDEX IF NOT EXISTS idx_activity_participants_activity ON activity_participants(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_turns_activity_paper ON activity_turns(activity_id, paper_id, turn_number);
CREATE INDEX IF NOT EXISTS idx_documents_activity ON documents(activity_id);
CREATE INDEX IF NOT EXISTS idx_documents_participant ON documents(participant_id);
CREATE INDEX IF NOT EXISTS idx_documents_group ON documents(workshop_group_id);

-- Relationship indexes
CREATE INDEX IF NOT EXISTS idx_group_participants_workshop_group ON group_participants(workshop_group_id);
CREATE INDEX IF NOT EXISTS idx_group_participants_participant ON group_participants(participant_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================================================

-- Update timestamps on record changes
CREATE TRIGGER IF NOT EXISTS update_workshops_timestamp 
    AFTER UPDATE ON workshops
BEGIN
    UPDATE workshops SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_writing_groups_timestamp 
    AFTER UPDATE ON writing_groups
BEGIN
    UPDATE writing_groups SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_participants_timestamp 
    AFTER UPDATE ON participants
BEGIN
    UPDATE participants SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_workshop_groups_timestamp 
    AFTER UPDATE ON workshop_groups
BEGIN
    UPDATE workshop_groups SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_activities_timestamp 
    AFTER UPDATE ON activities
BEGIN
    UPDATE activities SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_documents_timestamp 
    AFTER UPDATE ON documents
BEGIN
    UPDATE documents SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update last_seen in online_sessions on any update
CREATE TRIGGER IF NOT EXISTS update_online_sessions_last_seen 
    AFTER UPDATE ON online_sessions
BEGIN
    UPDATE online_sessions SET last_seen = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;