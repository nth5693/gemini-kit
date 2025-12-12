# Changelog

All notable changes to Gemini-Kit will be documented in this file.

## [0.2.2] - 2024-12-13

### Added
- **Coder Agent File Writing** - Coder now actually writes code files to disk!
  - `extractCodeBlocks()` with 4 regex patterns for AI response parsing
  - `writeFiles()` creates files and directories automatically
  - Cook workflow Step 3 now runs coder agent

- **CLI Proxy API Integration** - Use Gemini via proxy server
  - Custom User-Agent header to bypass Cloudflare
  - baseURL requires `/v1` suffix
  - Supports gemini-2.5-flash, gemini-2.5-pro, gemini-3-pro-preview

- **Comprehensive CLI Proxy Documentation** in README
  - Step-by-step setup guide
  - Available models table
  - Troubleshooting section

### Fixed
- Fix 403 Forbidden when using CLI Proxy API (User-Agent header)
- Fix 404 Not Found (baseURL needs /v1)
- Cook command now passes actual task to agents (not hardcoded)

### Changed
- Build size: 148KB
- .gitignore updated to exclude config files, demo-apps, plans

## [0.2.0] - 2024-12-12

### Added
- **Team Context Sharing** - Agents now communicate like a real development team
  - Messages (handoff, request, result, info)
  - Shared artifacts (plans, code, tests, docs)
  - Shared knowledge base (relevant files, findings)
  - Progress tracking (planned, tested, reviewed, documented)

- **Session Persistence** - Save and resume team sessions
  - `gk session save [name]` - Save current session
  - `gk session load [id]` - Load session
  - `gk session list` - List all sessions
  - `gk session info` - Show current session
  - `gk session delete <id>` - Delete session

- **Auto-Retry Loop** - Automatic test failure handling
  - Tester fails → Debugger analyzes → Retry tester
  - Max 2 retries per agent
  - Automatic in cook workflow

- **Session Memory** - Agents remember context between sessions
  - `loadProjectContext()` - reads README, package.json
  - `resumeSession()` - auto-loads previous context
  - `endSession()` - saves context and summary
  - Previous session info injected to agent prompts

- **CLIProxyAPI Support** - Multi-model access via proxy
  - Support for custom baseURL
  - Access Gemini, Claude, OpenAI via proxy

### Changed
- All agents now integrate with team context
- Git manager generates context-aware commit messages
- Code reviewer uses relevant files from scout
- Docs manager documents team progress
- Build size: 141KB

## [0.1.0] - 2024-12-12

### Added
- Initial release with 100% ClaudeKit parity
- 15 specialized agents
- 38+ CLI commands
- Multi-model support (Gemini, Claude, OpenAI)
- Core workflows: cook, plan, scout, fix, git, docs, design, content, research
