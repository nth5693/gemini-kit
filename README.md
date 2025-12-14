# Gemini-Kit Extension

Super Engineer - Team of AI Agents for software development.

## Installation

### Quick Install (from GitHub)
```bash
gemini extensions install github.com/your-username/gemini-kit
```

### Manual Install
```bash
# Clone or copy to extensions directory
cd ~/.gemini/extensions/gemini-kit

# Install dependencies
npm install

# Build
npm run build

# Link extension
gemini extensions link $(pwd)

# Restart Gemini CLI
```

## Commands

| Command | Description |
|---------|-------------|
| `/cook` | Full workflow: Plan → Scout → Code → Test → Review |
| `/plan` | Create implementation plan |
| `/scout` | Explore codebase structure |
| `/code` | Write/modify code |
| `/test` | Create and run tests |
| `/review` | Code review |
| `/debug` | Debug issues |
| `/git` | Git operations |

## MCP Tools

- `kit_create_checkpoint` - Create git checkpoint before changes
- `kit_restore_checkpoint` - Restore to previous checkpoint
- `kit_get_project_context` - Gather project context
- `kit_handoff_agent` - Handoff between agents
- `kit_save_artifact` - Save artifacts
- `kit_list_checkpoints` - List available checkpoints

## Hooks

- **session-start** - Initialize on session start
- **before-agent** - Inject context before processing
- **before-tool** - Security validation (block secrets)
- **after-tool** - Auto-run tests after code changes
- **session-end** - Cleanup and save logs

## License

MIT
