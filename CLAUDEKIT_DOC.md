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

**Skills:**
- Codebase analysis (reads project structure)
- Implementation roadmap creation
- Time estimation with rollback plans
- Security checklist generation

**Commands:** `/plan`, `/plan:two`, `/plan:hard`, `/plan:cro`

**Output:** `plans/[feature-name]-YYYYMMDD-HHMMSS.md`

**Example:**
```bash
/plan [add WebSocket notifications with Socket.io and Redis]
# Output: Plan with setup steps, auth integration, database schema, test strategy
```

---

#### 💻 Fullstack Developer Agent
**When to Use:**
- Implementing phases from `/plan:parallel`
- Backend + Frontend work simultaneously
- File-level isolation for parallel execution

**Skills:**
- Phase file reading and validation
- Parallel task execution
- File ownership management
- TypeScript/Test verification

**Key Rules:**
- NEVER modify files not in ownership list
- STOP if conflict detected
- Only read shared files, never write

**Process:**
```
Phase Analysis → Implementation → npm run typecheck → npm test → Report
```

---

#### 🔍 Scout Agent
**When to Use:**
- Feature work: Find files before implementation
- Debugging: Locate integration points
- Onboarding: Map project structure
- Refactoring: Identify affected files

**Skills:**
- Parallel file search (multi-agent)
- Git-aware filtering
- Relevance ranking
- Directory mapping

**Scale Guidelines:**
- 1-3: Small projects (<100 files) → 1-2 min
- 4-6: Medium (100-500 files) → 2-4 min
- 7-10: Large codebases (500+) → 3-5 min

**Command:** `/scout "query" [scale]`

**Example:**
```bash
/scout "locate all authentication-related files" 5
# Output: auth services, middleware, routes, tests, config
```

---

#### 🌐 Scout External Agent
**Skills:**
- External documentation research
- API docs gathering
- Third-party library analysis

---

#### 🐛 Debugger Agent
**When to Use:**
- API 500 errors
- CI/CD pipeline failures
- Database connection issues
- Production incidents

**Skills:**
- Log pattern searching
- Code execution tracing
- Bottleneck identification
- Fix suggestion with performance impact
- Regression test generation

**Example:**
```bash
/debug [users reporting timeout errors on checkout]
# Agent traces: logs → execution paths → bottleneck → fixes → tests
```

---

#### 🧪 Tester Agent
**When to Use:**
- Pre-commit validation
- CI/CD pipeline verification

**Skills:**
- Multi-framework test execution (Jest, pytest, Flutter)
- Coverage analysis
- Flaky test detection
- JSON report generation for CI

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

**Skills:**
- OWASP compliance checking
- `any` type detection
- N+1 query detection
- Security audit reporting

**Categories:**
- **Critical**: Must fix (security, data loss)
- **High**: Should fix (performance, types)
- **Medium**: Recommended (maintainability)
- **Low**: Optional (style)

**Command:** `/review [scope]`

**Example:**
```bash
/review [security audit of auth module]
# Output: OWASP compliance report, vulnerability list, remediation steps
```

---

#### 🗄️ Database Admin Agent
**When to Use:**
- Dashboard queries timing out (>5s)
- Tables growing but queries slowing
- Schema design for new features
- Connection pool exhaustion

**Skills:**
- Query plan analysis (EXPLAIN)
- Index recommendation
- Schema design
- Connection pool management
- Backup strategy planning

---

### Documentation & Management

#### 📚 Docs Manager Agent
**When to Use:**
- After implementing new features
- Initial project setup
- Syncing docs with code

**Skills:**
- README generation
- API reference creation
- Codebase summarization (Repomix)
- Architecture documentation

**Commands:** `/docs:init`, `/docs:update`, `/docs:summarize`

---

#### 📊 Project Manager Agent
**When to Use:**
- Weekly progress reviews
- Feature completion verification
- Multi-agent coordination

**Skills:**
- Status report generation
- Milestone tracking
- Task completeness verification
- Sprint planning

**Command:** `/watzup`

**Output:** `plans/reports/` directory

---

#### 📓 Journal Writer Agent
**When to Use:**
- Production down >30min or data loss
- Critical bugs caught before release
- Failed deployments
- Repeated issues

**Skills:**
- Incident report creation
- Timeline documentation
- Root cause analysis
- Lessons learned extraction

**Command:** `/journal`

**Example:**
```bash
/journal Context: Found race condition in payment system 2hrs before release.
# Output: Full incident report with code snippets, failed attempts, final fix
```

---

#### 🔧 Git Manager Agent
**When to Use:**
- Auto-generate semantic commits
- Prevent secrets leaking
- Create pull requests

**Skills:**
- Conventional commit format (`type(scope): description`)
- Pre-commit secret scanning
- PR description generation
- Branch management

**Commands:** `/git:cm`, `/git:cp`, `/git:pr`

---

### Creative & Research

#### 🎨 UI/UX Designer Agent
**When to Use:**
- Landing pages, dashboards, web apps
- Recreating from screenshots/videos
- 3D with Three.js/WebGL
- Design systems with CSS tokens

**Skills:**
- Responsive layout creation
- CSS variable systems
- Three.js integration
- Screenshot-to-code conversion
- Video-to-code conversion

**Commands:** `/design:fast`, `/design:good`, `/design:3d`, `/design:screenshot`, `/design:video`

---

#### ✍️ Copywriter Agent
**When to Use:**
- Landing pages, hero sections, CTAs
- Twitter/X threads, LinkedIn posts
- Email campaigns
- Low-converting pages (CRO)

**Skills:**
- A/B test variant creation
- Social proof integration
- Psychological trigger application
- Conversion rate optimization

**Commands:** `/content:fast`, `/content:good`, `/content:cro`

**Example:**
```bash
/content:good [create hero section for AI analytics SaaS targeting enterprise CTOs]
# Output: Multiple versions (ROI-focused, time-focused), A/B test plan
```

---

#### 💡 Brainstormer Agent
**When to Use:**
- Evaluating architectural approaches
- Challenging assumptions
- Technical decision debates
- "Second opinion" on complex problems

**Skills:**
- Trade-off analysis
- YAGNI assessment
- Success criteria definition
- Recommendation generation

**Command:** `/brainstorm`

**Example:**
```bash
/brainstorm [should we use REST API or GraphQL for our mobile app?]
# Output: Pros/cons, team fit analysis, recommendation with reasoning
```

**Key Takeaway:** Saves you from writing the wrong code. 10 minutes prevents weeks of refactoring.

---

#### 🔬 Researcher Agent
**When to Use:**
- New tech evaluation before adopting
- Pre-implementation research
- Technical comparison
- Deep dive validation (10+ sources)

**Skills:**
- Multi-source search (Google, YouTube, GitHub, docs)
- 15+ source cross-validation
- Security concern identification
- Best practices extraction

**Output:** Structured markdown report with citations

**Example:**
```bash
/plan research Stripe vs PayPal integration for SaaS billing
# Output: 15-page comparison with security audit, pricing, code examples
```

---

### Integration

#### 🔌 MCP Manager Agent
**Skills:**
- MCP server configuration
- Tool registration
- External service integration

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
