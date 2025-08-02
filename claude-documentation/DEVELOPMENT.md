# Schreibmaschine - Development Guide

## Claude Code Terminal Integration Solution

### Problem Summary
Claude Code's Bash tool has limitations with long-running development servers due to:
- Hot reload race conditions causing port conflicts
- Interactive process output suppression
- Development server URL access issues

### Solved: Environment & Tools ✅
Claude Code now correctly inherits your zsh environment including:
- ✅ **PATH**: Includes Bun (1.2.19), Node.js (v22.3.0), and all custom paths
- ✅ **Tools**: `bun`, `node`, `npm` all available and working
- ✅ **Environment Variables**: All zsh config loaded correctly

### Development Workflow

#### 1. Server Management (User-Managed)
```bash
# Start development server (you run this)
bun run dev

# Check server status
curl http://localhost:3000/health

# Stop server when needed (Ctrl+C)
```

#### 2. Static Validation (Claude Code)
```bash
# Full static test suite
bun run test:static

# Individual components
bun run type-check      # TypeScript validation
bun run lint           # Code quality
bun run test:templates # Template system test
```

#### 3. Template Testing (Offline)
```bash
# Test templates without server
node test-templates.js

# Or via npm script
bun run test:templates
```

### Available Scripts

| Script | Purpose | Claude Code Safe |
|--------|---------|------------------|
| `bun run dev` | Start development server | ❌ User only |
| `bun run build` | Build for production | ✅ Yes |
| `bun run type-check` | TypeScript validation | ✅ Yes |
| `bun run lint` | Code quality check | ✅ Yes |
| `bun run test:templates` | Test templates offline | ✅ Yes |
| `bun run test:static` | Full static validation | ✅ Yes |
| `bun run db:migrate` | Database migrations | ✅ Yes |
| `bun run db:seed` | Seed sample data | ✅ Yes |

### Testing Strategy

#### Template Testing
- **Offline Testing**: `test-templates.js` validates all templates without server
- **Test Data**: Realistic sample data for lobby, group room, error pages
- **Validation**: Checks for unprocessed variables, output length, syntax errors

#### API Testing
- **Static Testing**: TypeScript validation catches API type errors
- **Manual Testing**: User starts server, Claude uses curl for endpoint testing
- **Database Testing**: Direct database operations for data validation

#### Integration Testing
- **User starts server** → **Reports status** → **Claude tests endpoints**
- Clear separation of responsibilities
- No Claude Code server management attempts

### Communication Protocol

#### When Starting Development Session:
1. User: `bun run dev`
2. User: Reports server status (success/failure/URL)
3. Claude: Proceeds with static testing or endpoint validation

#### When Issues Occur:
1. Claude: Never attempts to restart/manage server
2. Claude: Uses static tools for debugging
3. User: Manages server restarts as needed

### File Structure
```
src/views/
├── layouts/        # Base HTML templates
│   └── base.html   # Main layout
├── pages/          # Page templates
│   ├── welcome.html
│   ├── lobby.html
│   ├── group-room.html
│   └── error.html
└── components/     # Reusable components
    └── activity-content.html

public/
├── css/           # Stylesheets
│   ├── main.css
│   ├── lobby.css
│   └── group-room.css
└── js/            # JavaScript
    └── common.js

test-templates.js  # Offline template testing
```

### Environment Details
- **Shell**: zsh with full environment loaded
- **Node**: v22.3.0 via NVM
- **Bun**: 1.2.19
- **TypeScript**: Strict mode enabled
- **Database**: SQLite at `./data/schreibmaschine.db`

### Success Metrics ✅
- ✅ Claude Code can find all development tools
- ✅ Templates render correctly offline
- ✅ Static validation works reliably
- ✅ Clear user/Claude responsibility separation
- ✅ No more development server conflicts

## Next Steps
Continue with pending tasks:
- Session management and online status tracking
- SSE endpoints for real-time updates
- Activity system implementation
- Admin authentication routes