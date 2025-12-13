# Changelog

All notable changes to Gemini-Kit will be documented in this file.

## [0.4.0] - 2024-12-13

### Changed
- **Gemini-only Provider** - Removed Claude and OpenAI support
  - Simplified ProviderManager
  - Added GEMINI_API_KEY env var support
  - Removed @anthropic-ai/sdk and openai dependencies

### Added
- **Migration to Gemini CLI** (in progress)
  - Cloned google-gemini/gemini-cli as reference
  - Backed up original source to `src-backup-gemini-kit/`
  - Copied 15 agents to Gemini CLI structure

### Removed
- `src/providers/claude.ts`
- `src/providers/openai.ts`
- Multi-model support (Claude, OpenAI, CLIProxyAPI)

## [0.3.1] - 2024-12-13

### Added
- **Beautiful CLI Interface** ✨ (ClaudeKit-style)
  - Gradient text with `gradient-string`
  - Animated spinners with `ora`
  - Beautiful boxes with `boxen`
  - Progress bars with `cli-progress`

- **AI Router - Auto Agent Selection**
  - Analyzes task and automatically selects best agents
  - AI-powered workflow decision making
  - Fallback keyword matching for reliability
  - Like ClaudeKit's intelligent routing

- **Project Context System** (like ClaudeKit)
  - `ProjectContextManager` for project scanning
  - `gk docs init` creates `docs/codebase-summary.md`
  - All agents can access project context via `getProjectContext()`

- **Level 1 Skills - All Agents Save to Files**:
  - Researcher → `docs/research/`
  - Brainstormer → `docs/brainstorm/`
  - Copywriter → `docs/copy/`
  - UI-UX-Designer → `docs/design/`
  - Database-Admin → `docs/database/`
  - Project-Manager → `docs/reports/`

- **Level 2 Skills**:
  - Scout: `buildDependencyGraph()` → `docs/analysis/`
  - Code-Reviewer: `runSecurityScan()` via npm audit

### Fixed
- All 4 lint errors resolved
- TypeScript type errors fixed

### Changed
- Build size: 180KB

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
