Based on your project documentation and current setup, here are my recommendations for code quality tools with Claude Code:

## **Ultracite: The Top Choice for Your Setup**

**Ultracite is excellent for your project** - it's specifically designed to be "AI-ready" and works perfectly with Claude Code. Here's why it's ideal:

### **Pros of Ultracite:**
- **Zero-config setup** - Just `extends: ["ultracite"]` in your biome.json[1]
- **AI-optimized** - Designed specifically for AI coding workflows[2]
- **25x faster than Prettier, 15x faster than ESLint**[3]
- **Extremely opinionated and strict** - Perfect for maintaining quality[4]
- **Built on Biome** - Single tool for linting + formatting[5]
- **TypeScript strict mode ready** - Works with your strict TS config[6]

### **Cons of Ultracite:**
- **Very opinionated** - Less customizable than ESLint
- **Newer ecosystem** - Fewer plugins than ESLint
- **Stricter rules** - May require code changes initially

## **Setup for Your Project**

Since you already have Biome configured, upgrading to Ultracite is straightforward:

```bash
bun add -d ultracite
```

Update your `biome.json`:
```json
{
  "extends": ["ultracite"]
}
```

Update your `package.json` scripts:
```json
{
  "scripts": {
    "lint": "npx ultracite lint",
    "format": "npx ultracite format",
    "check": "npx ultracite check"
  }
}
```

## **Claude Code Integration Strategies**

### **1. Pre-commit Hooks (Recommended)**
Add to your `.claude/settings.json`:
```json
{
  "hooks": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command", 
          "command": "npx ultracite format \"$CLAUDE_FILE_PATHS\""
        }
      ]
    },
    {
      "matcher": "Edit",
      "hooks": [
        {
          "type": "command",
          "command": "if [[ \"$CLAUDE_FILE_PATHS\" =~ \\.(ts|tsx)$ ]]; then npx ultracite check \"$CLAUDE_FILE_PATHS\" || echo '⚠️ Code quality issues detected'; fi"
        }
      ]
    }
  ]
}
```

### **2. Enhanced Static Testing**
Update your existing static test command:
```json
{
  "scripts": {
    "test:static": "bun run type-check && npx ultracite check && bun run test:templates"
  }
}
```

### **3. Rulens Integration**
Consider adding [Rulens](https://www.mh4gf.dev/articles/rulens-introduction) to automatically generate AI-friendly coding guidelines:
```bash
bun add -d rulens
npx rulens generate
```
This creates markdown documentation of your linting rules that Claude can read[7].

## **Alternative Options Comparison**

### **Biome (vanilla)**
- **Pro**: Fast, single tool, good defaults
- **Con**: Requires manual rule configuration
- **Use if**: You want more control over rules

### **ESLint + Prettier (traditional)**
- **Pro**: Massive ecosystem, highly customizable
- **Con**: Slower, complex configuration, multiple tools
- **Use if**: You need specific ESLint plugins

### **Rome (predecessor)**
- **Con**: Project discontinued, became Biome

## **Implementation Strategy for Your Project**

Given your current Biome setup in Schreibmaschine:

1. **Immediate**: Switch to Ultracite (minimal changes needed)
2. **Add hooks**: Integrate with Claude Code via settings.json
3. **Update scripts**: Enhance your existing `test:static` command
4. **Optional**: Add Rulens for AI-friendly rule documentation

## **Performance Benefits for Claude Code**

- **Faster validation cycles**: Subsecond linting means Claude gets feedback instantly
- **Consistent formatting**: No more format-then-check loops
- **Better error messages**: Ultracite provides clear, actionable feedback[8]
- **Single command**: `npx ultracite check` handles everything

## **Migration Path**

Since you already have Biome working:
1. Install Ultracite
2. Update biome.json to extend Ultracite
3. Test with your existing codebase
4. Add Claude Code hooks
5. Remove any ESLint/Prettier configs if present

**Verdict**: Ultracite is perfect for your TypeScript/Bun/Elysia stack with Claude Code. It maintains code quality automatically while being fast enough for real-time AI workflows.

[1] https://github.com/haydenbleasel/ultracite
[2] https://www.ultracite.ai
[3] https://codemod.com/blog/eslint-to-biome
[4] https://www.npmjs.com/package/ultracite/v/4.2.1
[5] https://www.ultracite.dev/faq
[6] https://www.ultracite.ai/setup
[7] https://www.mh4gf.dev/articles/rulens-introduction
[8] https://blog.appsignal.com/2025/05/07/migrating-a-javascript-project-from-prettier-and-eslint-to-biomejs.html
[9] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/964bafbb-f107-42e9-ac56-887595752036/CLAUDE.md
[10] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/235ea02f-bc1d-4629-9add-41d1d9ae8d86/PROJECT-HISTORY.md
[11] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/aacbff6f-577e-4a52-b35f-8d63bcb6e068/TODO.md
[12] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/01d72b33-9180-4c45-96be-488aefdd15a4/CURRENT-STATUS.md
[13] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/889f4bf1-8bd8-4d6f-9c82-1116dc03d194/README.md
[14] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/72a3fbab-d237-49ee-88d7-78b37585561d/DEVELOPMENT.md
[15] https://www.next-forge.com/migrations/formatting/eslint
[16] https://www.youtube.com/watch?v=lEkXbneUnWg
[17] https://www.builder.io/blog/claude-code
[18] https://www.dhiwise.com/post/biome-vs-eslint
[19] https://dev.to/ramunarasinga-11/biomejs-a-toolchain-to-format-and-lint-your-web-project-4bmn
[20] https://natesnewsletter.substack.com/p/the-claude-code-complete-guide-learn
[21] https://betterstack.com/community/guides/scaling-nodejs/biomejs-explained/
[22] https://publish.obsidian.md/aixplore/AI+Development+&+Agents/claude-code-best-practices
[23] https://github.com/biomejs/biome
[24] https://blog.tericcabrel.com/nodejs-typescript-biome/
[25] https://news.ycombinator.com/item?id=43913950
[26] https://biomejs.dev/guides/migrate-eslint-prettier/



This setup will give you the best code quality automation for Claude Code while maintaining the high standards your project already has. Ultracite's AI-ready rules are particularly well-suited for your collaborative writing app's codebase.
