# ClaudeKit Documentation Summary

> Tổng hợp từ https://docs.claudekit.cc/
> Cập nhật: 2024-12-14

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [CLI](#cli)
3. [Agents (14)](#agents)
4. [Commands (38+)](#commands)
5. [Orchestration Patterns](#orchestration-patterns)
6. [Workflows](#workflows)

---

## Tổng Quan

**ClaudeKit** = Build Software Like You Have a Team

### Why ClaudeKit?

- **Specialized Agents**: 14 expert agents (planner, tester, debugger, designer)
- **Eliminate Repetitive Work**: Reclaim 50-70% of time spent on repetitive tasks
- **Stay in Control**: You're the reviewer, AI is the implementer. Checkpoints and rollback.

### Core Workflow

```
/plan → /code → /test → /debug → /git:cm
```

---

## CLI

**ClaudeKit CLI** (`ck`) - Command-line tool to manage ClaudeKit starter kits.

### Installation

```bash
# Requires purchase from claudekit.cc
bun install -g @claudekit/cli
```

### Core Commands

| Command | Description |
|---------|-------------|
| `ck init` | Initialize or update ClaudeKit in project |
| `ck update` | Update CLI itself |
| `ck versions` | List available versions |

### ck init

```bash
# Interactive mode (recommended)
ck init

# With kit selection
ck init --kit engineer

# Specific version
ck init --kit engineer --version v1.0.0

# Exclude patterns
ck init --exclude "local-config/**"

# Global mode
ck init --global
```

**Options:**
- `--dir <dir>` - Target directory
- `--kit <kit>` - Kit: `engineer` or `marketing`
- `--version <version>` - Specific version
- `--exclude <pattern>` - Exclude glob patterns
- `--global, -g` - Use platform-specific config

### Configuration

**Location:** `~/.claudekit/config.json`

```json
{
  "github": { "token": "stored_in_keychain" },
  "defaults": { "kit": "engineer", "dir": "." }
}
```

### Protected Files (Never Overwritten)

- `.env`, `.env.local`, `.env.*.local`
- `*.key`, `*.pem`, `*.p12`
- `node_modules/**`, `.git/**`
- `dist/**`, `build/**`

### Authentication

Multi-tier fallback:
1. GitHub CLI (`gh`)
2. Environment variable
3. Keychain
4. Prompt

---

## Agents

ClaudeKit has **17 specialized agents**:

### Development & Implementation

#### 📋 Planner Agent
**When to Use:**
- Before major features - Break down complex work
- Technical decisions - Evaluate approaches
- Large refactors - Map dependencies
- CI/CD failures - Analyze and create fix plans

**Commands:** `/plan`, `/plan:two`, `/plan:hard`, `/plan:cro`

**Output:** `plans/[feature-name]-YYYYMMDD-HHMMSS.md`

---

#### 💻 Fullstack Developer Agent
**When to Use:**
- Implementing phases from `/plan:parallel`
- Backend + Frontend work simultaneously
- File-level isolation for parallel execution

**Key Rules:**
- NEVER modify files not in ownership list
- STOP if conflict detected
- Only read shared files, never write

---

#### 🔍 Scout Agent
**When to Use:**
- Feature work: Find files before implementation
- Debugging: Locate integration points
- Onboarding: Map project structure
- Refactoring: Identify affected files

**Scale Guidelines:**
- 1-3: Small projects (<100 files)
- 4-6: Medium (100-500 files)
- 7-10: Large codebases (500+)

**Command:** `/scout "query" [scale]`

---

#### 🌐 Scout External Agent
- Researches external documentation
- Gathers context before planning

---

#### 🐛 Debugger Agent
**When to Use:**
- API 500 errors
- CI/CD pipeline failures
- Database connection issues
- Production incidents

---

#### 🧪 Tester Agent
**When to Use:**
- Pre-commit validation
- CI/CD pipeline verification

**Commands:** `/test`, `/fix:test`

**Pro Tips:**
- 80%+ coverage on critical paths
- Zero flaky tests
- Fail fast before starting new work

---

### Quality & Review

#### 🔎 Code Reviewer Agent
**When to Use:**
- Pre-merge quality gates
- Security vulnerability detection
- Type safety validation
- Performance analysis

**Categories:**
- **Critical**: Must fix (security, data loss)
- **High**: Should fix (performance, types)
- **Medium**: Recommended (maintainability)
- **Low**: Optional (style)

**Command:** `/review [scope]`

---

#### 🗄️ Database Admin Agent
- Database operations
- Schema validation
- Query optimization

---

### Documentation & Management

#### 📚 Docs Manager Agent
**When to Use:**
- After implementing new features
- Initial project setup (`/docs:init`)
- Syncing docs with code (`/docs:update`)

---

#### 📊 Project Manager Agent
- Project oversight
- Task coordination

---

#### 📓 Journal Writer Agent
- Dev journal entries
- Progress tracking

**Command:** `/journal`

---

#### 🔧 Git Manager Agent
**When to Use:**
- Auto-generate semantic commits
- Prevent secrets leaking
- Create pull requests

**Commands:** `/git:cm`, `/git:cp`, `/git:pr`

---

### Creative & Research

#### 🎨 UI/UX Designer Agent
**When to Use:**
- Landing pages, dashboards, web apps
- Recreating from screenshots/videos
- 3D with Three.js/WebGL
- Design systems with CSS tokens

**Commands:** `/design:fast`, `/design:good`, `/design:3d`, `/design:screenshot`, `/design:video`

---

#### ✍️ Copywriter Agent
- Content creation
- Marketing copy

**Commands:** `/content:fast`, `/content:good`, `/content:cro`

---

#### 💡 Brainstormer Agent
- Feature ideation
- Feasibility exploration

**Command:** `/brainstorm`

---

#### 🔬 Researcher Agent
**When to Use:**
- New tech evaluation before adopting
- Pre-implementation research
- Technical comparison
- Deep dive validation (10+ sources)

**Output:** Structured markdown report with 15+ cited sources

---

### Integration

#### 🔌 MCP Manager Agent
- MCP server management
- Tool integration

---

## Commands

ClaudeKit has **38+ commands**:

### Core Development

| Command | Description |
|---------|-------------|
| `/bootstrap` | Initialize new projects |
| `/cook` | Develop new features |
| `/plan` | Create implementation plans |
| `/brainstorm` | Explore feasibility |
| `/ask` | Ask about codebase |
| `/watzup` | Get project status |
| `/scout` | Find files |
| `/test` | Run tests |
| `/debug` | Diagnose issues |

### Bug Fixing

| Command | Description |
|---------|-------------|
| `/fix` | Smart fix (auto-selects approach) |
| `/fix:fast` | Quick fix for minor bugs |
| `/fix:hard` | Thorough fix for complex bugs |
| `/fix:ci` | Fix CI failures |
| `/fix:logs` | Fix from logs |
| `/fix:test` | Fix failing tests |
| `/fix:ui` | Fix UI issues |
| `/fix:types` | Fix TypeScript errors |

### Documentation

| Command | Description |
|---------|-------------|
| `/docs:init` | Initialize docs |
| `/docs:update` | Update docs |
| `/docs:summarize` | Summarize docs |

### Git Operations

| Command | Description |
|---------|-------------|
| `/git:cm` | Stage and commit |
| `/git:cp` | Commit and push |
| `/git:pr` | Create pull request |

### Planning

| Command | Description |
|---------|-------------|
| `/plan:ci` | Plan CI fix |
| `/plan:two` | Plan with 2 approaches |
| `/plan:cro` | Conversion optimization plan |

### Design & UI

| Command | Description |
|---------|-------------|
| `/design:3d` | 3D with Three.js |
| `/design:describe` | Extract from screenshots |
| `/design:fast` | Quick design |
| `/design:good` | Complete design |
| `/design:screenshot` | Screenshot to code |
| `/design:video` | Video to code |

### Content & Marketing

| Command | Description |
|---------|-------------|
| `/content:cro` | Conversion-optimized |
| `/content:enhance` | Enhance content |
| `/content:fast` | Quick content |
| `/content:good` | High-quality content |

### Integrations

| Command | Description |
|---------|-------------|
| `/integrate:polar` | Polar.sh payments |
| `/integrate:sepay` | SePay.vn (Vietnam) |

### Journaling

| Command | Description |
|---------|-------------|
| `/journal` | Dev journal entries |

---

## Orchestration Patterns

### Sequential (Default)

Agents run in order:

```
planner → code → tester → code-reviewer → git-manager
```

### Parallel

Independent agents run simultaneously:

```
scout (dir1) ┐
scout (dir2) ├─→ Aggregate → planner
scout (dir3) ┘
```

### Hybrid

Mix of sequential and parallel.

### Agent Communication

- **Shared files**: `docs/`, `plans/`, code standards
- **Handoff protocols**: Each agent receives previous output
- **TodoWrite**: Real-time progress tracking

### Handoff Example

```
planner output → plans/auth-feature.md
         ↓
code reads plan → implements → creates files + tests
         ↓
tester runs tests → validates coverage
         ↓
code-reviewer audits → security + quality report
         ↓
git-manager commits → conventional commit + push
```

---

## Workflows

### Building a New Feature

```bash
# 1. Plan
/plan [add real-time notifications with WebSocket]

# 2. Implement
/cook [implement WebSocket notifications]

# 3. Test
/test [WebSocket notifications]
```

### Debugging Production Issues

```bash
/debug [users reporting timeout errors on checkout]
# Agent workflow:
# 1. Searches logs for timeout patterns
# 2. Traces code execution paths
# 3. Identifies bottleneck
# 4. Suggests fixes
# 5. Generates regression tests
```

### Refactoring Legacy Code

```bash
# Scout
/scout [analyze authentication system]

# Plan
/plan [migrate from sessions to JWT]

# Code
/cook [implement JWT authentication]

# Test
/test [authentication system]
```

### Quick Reference

```bash
# Feature Development
/plan [feature description]
/code @plans/feature.md

# Bug Fixing
/fix [any issue]          # Smart fix
/fix:fast [simple bug]    # Quick
/fix:hard [complex issue] # Thorough

# Documentation
/docs:init                # First-time
/docs:update              # After changes

# Git Workflow
/git:cm                   # Commit
/git:cp                   # Commit and push
/git:pr [to-branch]       # Create PR

# Project Status
/watzup                   # Current state
/ask [question]           # Ask about codebase
```

---

## Quick Reference Links

| Topic | URL |
|-------|-----|
| Home | https://docs.claudekit.cc/ |
| CLI | https://docs.claudekit.cc/docs/cli/ |
| Agents | https://docs.claudekit.cc/docs/agents/ |
| Commands | https://docs.claudekit.cc/docs/commands/ |

---

## So sánh với Gemini-Kit

| Feature | ClaudeKit | Gemini-Kit |
|---------|-----------|------------|
| **Agents** | 14 | 15+ |
| **Commands** | 38+ | 31 |
| **Workflows** | Sequential/Parallel | 8 pre-defined |
| **MCP Tools** | - | 24 |
| **Hooks** | - | 5 |
| **Platform** | Claude | Gemini CLI |
| **Pricing** | Paid | Free |
