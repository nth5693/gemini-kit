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

ClaudeKit has **14 specialized agents**:

### Development & Implementation

| Agent | Description |
|-------|-------------|
| **planner** | Creates implementation plans |
| **fullstack-developer** | Implements features |
| **scout** | Finds files in codebase |
| **scout-external** | Researches external docs |
| **debugger** | Investigates issues |
| **tester** | Writes and runs tests |

### Quality & Review

| Agent | Description |
|-------|-------------|
| **code-reviewer** | Reviews code quality |
| **database-admin** | Database operations |

### Documentation & Management

| Agent | Description |
|-------|-------------|
| **docs-manager** | Documentation |
| **project-manager** | Project oversight |
| **journal-writer** | Dev journal |
| **git-manager** | Git operations |

### Creative & Research

| Agent | Description |
|-------|-------------|
| **ui-ux-designer** | UI/UX design |
| **copywriter** | Content writing |
| **brainstormer** | Ideation |
| **researcher** | Research |

### Integration

| Agent | Description |
|-------|-------------|
| **mcp-manager** | MCP server management |

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
