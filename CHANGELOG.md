# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2026-01-22

### 🎉 Major Release - Antigravity Kit Integration

Integrated features from Antigravity Compound Engineering Plugin and Antigravity Kit.

### ✨ New Agents (4)

- **Security Auditor**: Master cybersecurity specialist for code audit, vulnerability scanning, OWASP compliance
- **Frontend Specialist**: Frontend architect expert in React, Next.js, UI/UX, SEO, performance
- **Backend Specialist**: Backend architect expert in API design, database architecture, Docker
- **DevOps Engineer**: Infrastructure & CI/CD expert for Docker, Kubernetes, GitHub Actions

### 🛠️ New Skills (8)

- **react-patterns**: Modern React hooks, state management, component composition
- **nextjs**: App Router, Server Components, data fetching strategies
- **security**: OWASP Top 10, JWT security, XSS/CSRF prevention
- **api-design**: RESTful patterns, validation, rate limiting
- **docker**: Multi-stage builds, Docker Compose, container security
- **mobile**: React Native, Flutter, mobile performance
- **performance**: Core Web Vitals, caching strategies, optimization
- **tailwind**: Tailwind CSS v4 patterns, responsive design

### 📊 Stats

- **Total Agents**: 19 (was 15)
- **Total Skills**: 15 categories (was 7)
- **Tests**: 291 passing
- **Lint**: 0 warnings, 0 errors
- **Build**: Successful

---


## [3.0.0] - 2024-12-20

### 🎉 Major Release - Comprehensive Bug Fix & Quality Improvement

Full codebase review and fix of 14 issues across security, reliability, and code quality.

### 🔴 Critical Fixes

- **Stack Overflow Prevention**: `findFilesAsync` converted from recursion to queue-based approach
  - Prevents stack overflow with deeply nested directories
  - File: `src/tools/security.ts`

- **Session ID Collision**: Added UUID suffix to session IDs
  - Format: `session-{timestamp}-{uuid8}`
  - Prevents collision when multiple sessions created in same millisecond
  - File: `src/tools/team-state.ts`

- **Data Loss Prevention**: Reduced debounce from 500ms to 150ms
  - Added `hasPendingChanges` flag for tracking unsaved changes
  - Added `flushSession()` export for immediate save
  - File: `src/tools/team-state.ts`

### 🟡 Medium Fixes

- **Null Safety**: Added bounds check for negative `currentStep` in `getNextStep`
  - File: `src/tools/orchestrator.ts`

- **Algorithm Improvement**: `autoSelectWorkflow` now uses weight-based scoring
  - Prevents false positives like "Add error handling" → quickfix
  - Strong signals (+10), weak signals (+3-5)
  - File: `src/tools/workflows.ts`

- **Jira ADF Support**: Improved schema validation for Atlassian Document Format
  - Added `AdfContentSchema` permissive schema
  - Added `extractAdfText()` helper for recursive text extraction
  - File: `src/tools/integration.ts`

- **Integer Overflow Protection**: `MAX_OUTPUT_SIZE` now validates with `Number.isFinite()`
  - File: `src/tools/team-state.ts`

### 🟢 Code Quality

- **ESLint Clean**: Fixed all 6 warnings, now 0 warnings
  - Removed unused variables: `_fullPath`, `_data`, `_err`, `_e`
  - Removed unused import: `getContext` in orchestrator.ts
  - Files: `hooks/*.js`, `src/tools/*.ts`

- **Regex Safety**: Added `escapeRegex()` in `before-agent.js` to prevent ReDoS
  - File: `hooks/before-agent.js`

- **Magic Numbers**: Extracted `SCOUT_MODE_TIMEOUT_MS` constant
  - File: `hooks/scout-block.js`

### 🔒 Security Audit (OWASP)

All security checks PASSED:
- ✅ Command Injection: Protected via `execFileSync`
- ✅ Path Traversal: Protected via `validatePath`
- ✅ DoS: Protected via size limits and BFS queue
- ✅ ReDoS: Protected via input escaping
- ✅ Secrets: No hardcoded credentials

### 📊 Stats

- **Tests**: 291 passing (5x stress test verified)
- **Lint**: 0 warnings, 0 errors
- **Build**: Successful
- **Coverage**: 81.74%

### Testing Performed

- ✅ Unit Tests (291)
- ✅ Stress Tests (100 sessions, concurrent ops)
- ✅ Edge Case Tests (100KB input, Unicode, empty strings)
- ✅ Security Tests (path traversal, injection)
- ✅ Performance Tests (file indexing <2ms)
- ✅ Regression Tests (5x repeated, shuffle order)

---


## [2.3.0] - 2024-12-18

### Security
- **HIGH:** Path traversal fix in `kit_apply_stored_diff` - re-validates paths from stored JSON
- **HIGH:** DoS prevention in `kit_index_codebase` - 1MB file size limit

### Improved
- **Zod Validation:** Added schemas for JSON parsing in `knowledge.ts` and `integration.ts`
- **Timeouts:** Increased defaults - git 10s→30s, gh 30s→60s for large repos

### Stats
- **Tests**: 251 passing
- **Coverage**: 86.54%

---

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
