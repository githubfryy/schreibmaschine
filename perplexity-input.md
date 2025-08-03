# Schreibmaschine - Claude Memory Document

## Quick Commands
- `bun run test:static` - Full validation (TypeScript + Biome + Templates)
- `bun run type-check` - TypeScript validation only
- `bun run lint` - Biome linting
- `bun run test:templates` - VentoJS template validation offline
- `bun run db:seed` - Reset sample data
- **NEVER RUN**: `bun run dev` (user manages server)

## Current Template System
- **Engine**: VentoJS v1.15.2 (migrated from custom mustache)
- **Templates**: `src/views/` with `.vto` extensions
- **Layouts**: `{{{ content }}}` for unescaped HTML
- **Syntax**: `{{ variable }}` (escaped), `{{{ html }}}` (unescaped)

## Migration Status
- ✅ VentoJS templates: `welcome.vto`, `admin-login.vto`, `admin-dashboard.vto`, `error.vto`
- ⏳ To migrate: `lobby.html`, `group-room.html` → `.vto` format
- 🧹 Check for old template files (see cleanup commands below)

## File Structure Rules
- Templates: `src/views/pages/*.vto` and `src/views/layouts/*.vto`
- CSS: `public/css/` (component-based)
- JS: `public/js/` (Alpine.js + plugins offline)
- Services: `src/services/*.ts` (all business logic)

## Database
- Location: `./data/schreibmaschine.db`
- Status: Complete with sample data
- **NEVER** edit directly - use services

## Development Workflow
1. User starts `bun run dev`
2. Claude uses static testing only
3. User reports server status for endpoint testing
4. Clear separation of responsibilities

## Code Style
- TypeScript strict mode
- ES module imports (`import`/`export`)
- Biome formatting (no semicolons, single quotes)
- Alpine.js for reactive UI
- VentoJS for server-side templates


---

Best Practices for Claude Code v1.0.67
1. Extended Thinking Mode

Use thinking triggers for complex problems:

    "think" - Basic thinking mode

    "think hard" - More thorough planning

    "think harder" - Deep analysis

    "ultrathink" - Maximum computation

2. Workflow Optimization

bash
# Your ideal workflow:
# 1. Explore: Read files, understand context
# 2. Plan: Use "think hard" for architecture decisions
# 3. Code: Implement with static validation
# 4. Validate: Run test:static before user testing

3. Subagent Usage

For complex tasks, request subagents:

text
"Use a subagent to investigate the VentoJS template migration status and identify any remaining .html files that need conversion"

4. Specific Instructions

Instead of: "Fix the templates"
Use: "Convert lobby.html to lobby.vto using VentoJS syntax, following the pattern in welcome.vto. Ensure Alpine.js integration remains intact and update the route handler to use the new template."

5. Visual Context

For UI work, provide:

    Screenshots of current interface

    Design mockups or wireframes

    Error screenshots for debugging

Development Commands Organized by Safety
Claude Code Safe (Static)

bash
bun run test:static     # Full validation suite
bun run type-check      # TypeScript only
bun run lint           # Biome linting
bun run test:templates  # Template validation
bun run db:seed        # Database seeding

User-Managed Only

bash
bun run dev            # Development server
curl localhost:3000    # Endpoint testing

Collaborative (User Reports Status)

bash
# User runs, reports results:
bun run dev
# Claude can then test endpoints based on status

Migration Validation Checklist

To ensure your template migration is clean:

    All VentoJS templates render correctly (bun run test:templates)

    No old template files remain (use find commands above)

    All route handlers updated to use .vto extensions

    Template service only references VentoJS (no mixed systems)

    Static validation passes (bun run test:static)

    Database integration works with new templates

Your current setup is excellent for Claude Code - the separation between static testing (Claude-safe) and server management (user-managed) is exactly the right approach for collaborative development with AI assistance.


---

I can see you've provided a YouTube video link about mastering Claude Code workflows from technical founders. Since I already have access to the transcript from this video (attachment #8), let me extract the most relevant advanced tips for your Schreibmaschine project:

## 🚀 Advanced Claude Code Tips from the Video

### 1. **The "My Developer" Prompt Trick** (Timestamp: 27:35)
This is one of the most powerful techniques mentioned:

```
// Instead of asking Claude to critique its own plan
"I came up with this plan, what do you think?"

// Use this instead for unbiased feedback
"My developer came up with this plan to do [task]. What's your assessment?"
```

**Why this works**: Claude won't critique itself harshly, but it will give honest feedback about another "developer's" work.

### 2. **Double Escape Method for Context Preservation** (Timestamp: 23:40)
Perfect for your template migration work:

```bash
# Build up context (spend tokens on exploration)
"Prepare to discuss how our VentoJS template system works"

# After Claude builds 50k tokens of context, double escape (esc esc)
# This forks the conversation while preserving all context

# Now you can:
- Open multiple tabs with the same rich context
- Try different approaches without losing the setup
- Resume with /resume command in new terminals
```

### 3. **Context Building Strategy** (Timestamp: 22:25)
For your complex Schreibmaschine codebase:

```
// Instead of: "Read the markdown file and fix templates"
// Use this to force deep exploration:

"Prepare to work on VentoJS template migration. Read through our template service, 
understand our Alpine.js integration, and dig deep into how our lobby system works. 
Prepare to discuss the ins and outs of how it all connects."
```

**Result**: Claude will spend significant tokens building comprehensive understanding before attempting changes.

### 4. **Three-Shot Planning for Complex Tasks** (Timestamp: 31:25)
For your remaining template migrations:

1. **Shot 1**: "Create a plan for migrating lobby.html to VentoJS"
2. **Shot 2**: Use "My Developer" trick to critique the plan
3. **Shot 3**: Refine based on feedback before execution

### 5. **Avoid Backwards Compatibility** (Timestamp: 31:25)
Specifically mentioned in the video - tell Claude:

```
"Write elegant code that completes this task. 
Do NOT include backwards compatibility or graceful fallbacks. 
I want clean, modern code that replaces the old system entirely."
```

### 6. **GitHub Integration for Parallel Work** (Timestamps: 5:32, 14:15)
For your project scale:

```bash
# Set up GitHub integration
gh auth login
# Configure Claude Code with GitHub

# Create issues for each template migration
# Tag Claude in issues: "@claude migrate lobby.html to VentoJS"
# Let it work in parallel while you handle server management
```

### 7. **Enhanced .claude_code_config.json**
Based on the video's recommendations:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(mkdir:*)",
      "Bash(bun install:*)",
      "Bash(bun add:*)",
      "Bash(bun run:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      
      // Enable GitHub CLI (mentioned in video)
      "Bash(gh:*)",
      
      // Static testing improvements
      "Bash(bunx biome check:*)",
      "Bash(bunx biome format:*)",
      "Bash(tsc:*)",
      "Bash(node test-templates.js:*)",
      
      // Documentation access
      "WebFetch(domain:docs.anthropic.com)",
      "WebFetch(domain:vento.js.org)",
      "WebFetch(domain:loro.dev)",
      "WebFetch(domain:elysiajs.com)",
      "WebFetch(domain:biomejs.dev)",
      "WebFetch(domain:alpinejs.dev)",
      
      // Enable subagent workflows
      "Edit(src/**/*)",
      "Edit(public/**/*)",
      "Edit(*.md)",
      "Edit(*.json)",
      "Edit(*.ts)",
      "Edit(*.html)",
      "Edit(*.css)",
      "Edit(*.js)"
    ],
    "deny": [
      "Read(.docs)",
      "Read(node_modules)",
      "Read(data/*.db-*)",
      "Bash(bun run dev:*)",
      "Bash(rm -rf:*)",
      "Bash(kill:*)"
    ]
  },
  // Add MCP servers as mentioned in video
  "mcp": {
    "mcpServers": {
      "filesystem": {
        "command": "npx",
        "args": ["@modelcontextprotocol/server-filesystem", "/path/to/schreibmaschine"],
        "env": {}
      }
    }
  }
}
```

### 8. **Command Creation for Repetitive Tasks**
Create a custom command for your template migrations:

```bash
# Create .claude/commands/migrate-template.md
```

```markdown
# Migrate HTML Template to VentoJS

## Context Building Phase
1. Read the existing HTML template thoroughly
2. Understand the Alpine.js integration points
3. Review our VentoJS template service configuration
4. Check the corresponding CSS and JS dependencies

## Migration Phase  
1. Convert template syntax from mustache-style to VentoJS
2. Ensure layout inheritance works with base.vto
3. Preserve all Alpine.js data attributes and functionality
4. Update route handlers to use new .vto extension
5. Test with realistic data using our template test system

## Validation Phase
1. Run `bun run test:templates` to validate syntax
2. Check TypeScript compilation with new template references
3. Verify Alpine.js functionality remains intact
4. Ensure responsive design is preserved
```

### 9. **Opus vs Sonnet Selection Strategy**
From the video (Timestamp: 14:15):

- **Use Opus** for complex architectural decisions (template system design)
- **Use Sonnet** for routine template conversions and bug fixes
- **Switch with**: `/model` command in Claude Code

### 10. **Context Window Management**
Key insights from timestamps 34:40-35:45:

- **Never use `/compact`** - destroys valuable context
- **Use `/rewind`** instead to preserve high-quality context
- **Double escape frequently** to maintain multiple high-context sessions
- **Resume contexts** across multiple terminal tabs for parallel work

## 🎯 Applied to Your Current Tasks

### For Template Migration:
1. **Build context** with deep exploration of your template system
2. **Use double escape** to preserve that context
3. **Create multiple tabs** for parallel lobby.html and group-room.html migrations
4. **Apply "My Developer" trick** to validate migration approaches

### For VentoJS Issues:
1. **Don't ask Claude to debug its own template service**
2. **Use the "My Developer" trick**: "My developer created this VentoJS configuration, but templates aren't loading correctly. What's wrong with their approach?"

### For Complex Features:
1. **Three-shot planning** for Loro CRDT integration
2. **GitHub integration** for parallel development streams
3. **Subagent workflows** for different aspects (backend, frontend, real-time)

These techniques should significantly improve your Claude Code productivity, especially for the remaining template migrations and complex architectural work ahead!

