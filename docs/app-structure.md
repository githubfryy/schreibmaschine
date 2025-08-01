# Schreibmaschine App Structure

## Project Overview
A local-first collaborative writing app built with modern TypeScript, Bun, and Elysia.js.

## Directory Structure

```
schreibmaschine/
├── src/                          # Main TypeScript source code
│   ├── index.ts                  # Main entry point - Elysia app setup
│   ├── config/                   # Configuration files
│   │   ├── env.ts               # Environment validation with Zod
│   │   └── database.ts          # Database connection config
│   ├── database/                 # Database related files
│   │   ├── schema.sql           # Database schema definitions
│   │   ├── migrations/          # Database migration files
│   │   ├── migrate.ts           # Migration runner
│   │   └── seed.ts              # Database seeding
│   ├── types/                    # TypeScript type definitions
│   │   ├── database.ts          # Database entity types
│   │   ├── api.ts               # API request/response types
│   │   └── app.ts               # Application-specific types
│   ├── services/                 # Business logic services
│   │   ├── workshop.service.ts  # Workshop management
│   │   ├── group.service.ts     # Writing group management
│   │   ├── participant.service.ts # Participant management
│   │   ├── session.service.ts   # Online session tracking
│   │   ├── activity.service.ts  # Activity management
│   │   └── url.service.ts       # URL generation and routing
│   ├── middleware/               # Elysia middleware
│   │   ├── auth.ts              # Authentication middleware
│   │   ├── session.ts           # Session management
│   │   └── cors.ts              # CORS configuration
│   ├── routes/                   # API route handlers
│   │   ├── api/                 # REST API routes
│   │   │   ├── workshops.ts     # Workshop CRUD
│   │   │   ├── groups.ts        # Group management
│   │   │   ├── participants.ts  # Participant management
│   │   │   └── activities.ts    # Activity management
│   │   ├── admin/               # Admin interface routes
│   │   │   ├── dashboard.ts     # Admin dashboard
│   │   │   └── management.ts    # CRUD operations
│   │   ├── groups.ts            # Group page routing
│   │   ├── lobby.ts             # Lobby/login pages
│   │   └── sse.ts               # Server-Sent Events
│   ├── utils/                    # Utility functions
│   │   ├── slugify.ts           # URL slug generation
│   │   ├── crypto.ts            # Cryptographic utilities
│   │   └── validation.ts        # Data validation helpers
│   └── views/                    # HTML templates (separate from TS)
│       ├── layouts/             # Base HTML layouts
│       │   ├── main.html        # Main app layout
│       │   └── admin.html       # Admin interface layout
│       ├── pages/               # Full page templates
│       │   ├── lobby.html       # Group lobby page
│       │   ├── group.html       # Group workspace page
│       │   └── admin/           # Admin pages
│       │       ├── dashboard.html
│       │       └── workshops.html
│       └── components/          # Reusable HTML components
│           ├── participant-list.html
│           ├── activity-panel.html
│           └── online-status.html
├── public/                       # Static assets
│   ├── css/                     # Stylesheets
│   │   ├── main.css             # Main application styles
│   │   ├── admin.css            # Admin interface styles
│   │   └── components.css       # Component-specific styles
│   ├── js/                      # Client-side JavaScript
│   │   ├── alpine-setup.js      # Alpine.js configuration
│   │   ├── datastar-setup.js    # DataStar configuration
│   │   └── lobby.js             # Lobby-specific JS
│   └── assets/                  # Images, fonts, etc.
├── tests/                        # Test files
│   ├── unit/                    # Unit tests
│   └── integration/             # Integration tests
├── docs/                         # Documentation
│   ├── database-schema.md       # Database design
│   ├── app-structure.md         # This file
│   └── api-documentation.md     # API endpoints
├── package.json                  # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── biome.json                   # Biome linting/formatting
└── README.md                    # Project overview
```

## Key Design Principles

### 1. Separation of Concerns
- **TypeScript (src/)**: All business logic, API routes, and backend functionality
- **HTML (src/views/)**: All templates and markup, separate from TypeScript
- **CSS (public/css/)**: Styling with modern vanilla CSS
- **JavaScript (public/js/)**: Minimal client-side code (Alpine.js/DataStar)

### 2. Local-First Architecture
- SQLite database for data persistence
- Offline-capable design with sync when online
- Session management for multi-device support

### 3. URL Routing Strategy
- **Short URLs**: `/gruppe-{short_id}` for easy sharing
- **Semantic URLs**: `/{workshop_slug}/{group_slug}` for readable links
- **Lobby URLs**: `/{workshop_slug}/{group_slug}/vorraum` for authentication

### 4. Real-time Updates
- Server-Sent Events (SSE) for real-time status updates
- DataStar integration for reactive UI updates
- Alpine.js for interactive components

## File Naming Conventions

### TypeScript Files
- Services: `*.service.ts`
- Types: `*.ts` in `/types` directory
- Routes: `*.ts` in `/routes` directory
- Utilities: `*.ts` in `/utils` directory

### HTML Templates
- Layouts: `*.html` in `/views/layouts`
- Pages: `*.html` in `/views/pages`
- Components: `*.html` in `/views/components`

### CSS Files
- Main styles: `main.css`
- Feature-specific: `{feature}.css`
- Component styles: `components.css`

## Development Workflow

1. **Backend Development**: Work in `src/` directory with TypeScript
2. **Frontend Templates**: Create HTML files in `src/views/`
3. **Styling**: Write CSS in `public/css/`
4. **Testing**: Add tests in `tests/` directory
5. **Database**: Manage schema and migrations in `src/database/`

## Build Process

- **Development**: `bun dev` - watches TypeScript files
- **Type Checking**: `bun run type-check` - validates TypeScript
- **Linting**: `bun run lint` - checks code quality with Biome
- **Testing**: `bun test` - runs test suite
- **Production**: `bun build` - creates optimized bundle

## Key Features Supported

1. **Workshop Management**: Create and manage writing workshops
2. **Group Activities**: Flexible activity system for different writing exercises
3. **Real-time Collaboration**: Online status and live updates
4. **URL Management**: Dual URL system (short + semantic)
5. **Session Handling**: Multi-device support with seamless transitions
6. **Admin Interface**: Complete management dashboard
7. **Offline Support**: Local-first with sync capabilities
8. **Export System**: Markdown export for all written content

This structure supports the complete creative writing workshop application while maintaining clean separation between backend logic and frontend presentation.