# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2024-12-18

### Refactored
- **kit-server.ts**: Reduced from 418 to 260 lines
- **Extracted Modules**:
  - `core.ts` - Project context, handoff, artifact tools (100% coverage)
  - `config.ts` - Configuration utilities (100% coverage)
- **Async File Scanning**: Added `findFilesAsync` for non-blocking file operations

### Added
- `core.test.ts` - 8 tests for core tools
- `config.test.ts` - 6 tests for config utilities

### Stats
- **Tests**: 251 passing
- **Coverage**: 86.54%

---

## [2.1.0] - 2024-12-18

### Improved
- **Type Safety**: Removed `eslint-disable` from 13 test files
  - Added proper TypeScript interfaces: `ToolHandler`, `RegisteredTool`, `MockMcpServer`
  - Used `ReturnType<typeof vi.fn>` for Mock types
- **Comments**: Fixed confusing "FIX:" comments in `security.ts`
- **Test Coverage**: 237 tests passing, 84.92% coverage

### Fixed
- Fixed type casting in registration test files
- Removed unused `mock-types.ts` file

---

## [2.0.0] - 2024-12-16

### 🎉 Major Release Highlights
This release focuses on **documentation quality**, **testing infrastructure**, and **developer experience**.

### Added
- **Unit Tests**: Vitest test suite with 39 tests for core modules
  - `security.test.ts` - Security utilities tests
  - `workflows.test.ts` - Workflow engine tests
- **API Documentation**: Comprehensive `docs/API.md` with all MCP tools reference
- **AI Prompting Tips**: Added to Researcher, Planner, Scout, and Tester agents

### Enhanced Agents (8 agents improved)
- **Researcher**: AI-assisted research, GitHub/SO search techniques, comparison matrix
- **Planner**: Microservices example, T-shirt/story point estimation, Linear/Jira integration
- **Scout**: Monorepo exploration (Turborepo/Nx), legacy codebase strategies, scouting modes
- **Tester**: Vitest patterns, snapshot testing, MSW, fake timers
- **Git Manager**: Husky hooks, rebasing strategy, lint-staged
- **UI Designer**: Dark mode guidelines, animations, prefers-reduced-motion
- **Docs Manager**: ADR (Architecture Decision Records) template
- **Project Manager**: Agile ceremonies, sprint planning, Kanban vs Scrum

### Security
- 30+ secret patterns (Bearer tokens, Anthropic API, NPM/PyPI tokens, private keys)
- Path traversal prevention
- Sensitive file blocking (.env, .key, .pem)
- Connection string detection (MongoDB, PostgreSQL, MySQL)

### Infrastructure
- Test scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`
- Vitest configuration with coverage reporting
- Cross-references between related agents

## [1.1.0] - 2024-12-16

### Added
- **Learning System**: `kit_save_learning` and `kit_get_learnings` for AI to learn from user feedback
- **Cross-platform file finder**: Replace Unix shell commands with Node.js implementation
- **Conflict detection**: `kit_apply_stored_diff` now checks for file changes before applying
- **Smart routing**: `kit_smart_route` auto-selects best workflow based on task description
- **Team orchestration**: `kit_team_start`, `kit_team_status`, `kit_team_end` for session management
- **Workflow engine**: `kit_run_workflow`, `kit_list_workflows` for predefined workflows

### Fixed
- FIX 9.2: Data loss prevention - conflict detection before applying stored diffs
- FIX 9.3: Platform compatibility - works on Windows, macOS, and Linux
- FIX 9.4: Better regex patterns for function/class detection in indexer
- FIX 9.5: Learning delimiter conflicts resolved with unique markers

### Security
- Path traversal prevention with `validatePath` utility
- Enhanced secret detection patterns (AWS, GitHub, OpenAI, Google, Slack)
- Safe command execution with `execFileSync` instead of shell

### Changed
- Improved error messages with stderr details in git operations
- Better keyword extraction for semantic learning search

## [1.0.0] - 2024-11-01

### Added
- Initial release
- 15 AI agents (Planner, Scout, Coder, Tester, Reviewer, etc.)
- 42 slash commands for various development tasks
- MCP server with core tools:
  - `kit_create_checkpoint` - Git checkpoint management
  - `kit_restore_checkpoint` - Rollback support
  - `kit_get_project_context` - Project analysis
  - `kit_handoff_agent` - Agent-to-agent communication
  - `kit_save_artifact` - Artifact storage
- Lifecycle hooks:
  - `session-start` - Initialize session
  - `before-agent` - Context injection
  - `before-tool` - Security validation
  - `after-tool` - Auto-test runner
  - `session-end` - Cleanup

### Security
- Secret detection in `before-tool` hook
- Dangerous command blocking
