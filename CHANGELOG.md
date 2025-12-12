# Changelog

All notable changes to Gemini-Kit will be documented in this file.

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

- **CLIProxyAPI Support** - Multi-model access via proxy
  - Support for custom baseURL
  - Access Gemini, Claude, OpenAI via proxy

### Changed
- All agents now integrate with team context
- Git manager generates context-aware commit messages
- Code reviewer uses relevant files from scout
- Docs manager documents team progress

## [0.1.0] - 2024-12-12

### Added
- Initial release with 100% ClaudeKit parity
- 15 specialized agents
- 38+ CLI commands
- Multi-model support (Gemini, Claude, OpenAI)
- Core workflows: cook, plan, scout, fix, git, docs, design, content, research
