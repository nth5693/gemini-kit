# ClaudeKit Reference Documentation

> Tài liệu này được tổng hợp từ:
> - https://docs.claudekit.cc/
> - https://github.com/kaitranntt/ccs
> - https://www.vividkit.dev/vi/guides
>
> **QUAN TRỌNG:** Đây là tài liệu tham chiếu chính thức. Gemini-Kit PHẢI theo đúng kiến trúc này.

---

## 1. The 14 Specialized Agents

### Development Agents (4)
| Agent | Chức năng | Command liên quan |
|-------|-----------|-------------------|
| **planner** | Research, analyze, create implementation plans | `/plan` |
| **scout** | Quickly locate relevant files using parallel search | `/scout` |
| **debugger** | Investigate issues, analyze logs, diagnose problems | `/debug` |
| **tester** | Validate code quality through comprehensive testing | `/test` |

### Quality Assurance (1)
| Agent | Chức năng | Command liên quan |
|-------|-----------|-------------------|
| **code-reviewer** | Comprehensive code review and quality assessment | `/code-review` |

### Documentation & Project Management (2)
| Agent | Chức năng | Command liên quan |
|-------|-----------|-------------------|
| **docs-manager** | Manage technical documentation and standards | `/docs:*` |
| **project-manager** | Comprehensive project oversight and coordination | `/watzup` |

### Creative & Design (3)
| Agent | Chức năng | Command liên quan |
|-------|-----------|-------------------|
| **ui-ux-designer** | Design interfaces, wireframes, user experiences | `/design:*` |
| **copywriter** | Create high-converting marketing copy | `/content:cro` |
| **brainstormer** | Explore ideas, challenge assumptions, debate decisions | `/brainstorm` |

### Research & Writing (2)
| Agent | Chức năng | Command liên quan |
|-------|-----------|-------------------|
| **researcher** | Multi-source research with documentation analysis | `/research` |
| **journal-writer** | Document technical difficulties and project journey | `/journal` |

### DevOps & Infrastructure (2)
| Agent | Chức năng | Command liên quan |
|-------|-----------|-------------------|
| **git-manager** | Stage, commit, push code with professional standards | `/git:*` |
| **database-admin** | Database optimization, query analysis, administration | `/db:*` |

---

## 2. Agent Orchestration Patterns

### Sequential (Default)
Agents run one after another, each building on the previous agent's work:

```
planner → code → tester → code-reviewer → git-manager
```

**Use when:** Tasks depend on each other

### Parallel
Multiple agents run simultaneously for faster results:

```
scout (dir1) ┐
scout (dir2) ├─→ Aggregate Results → planner
scout (dir3) ┘
```

**Use when:** Tasks are independent

### Hybrid
Combination of sequential and parallel:

```
Parallel Scouts → Sequential Planning → Parallel Implementation → Sequential Testing
```

**Use when:** Complex tasks with mixed dependencies

---

## 3. Trình Tự Thực Hiện Dự Án (Project Execution Order)

### Khi user chạy `/cook [add user authentication]`:

```
1. planner Agent
   ├── Researches authentication best practices
   ├── Analyzes current codebase architecture
   └── Creates detailed implementation plan → plans/auth-feature.md

2. scout Agent (if needed)
   ├── Locates existing auth-related files
   └── Identifies integration points

3. Implementation (Automatic)
   ├── Code is written following plan
   └── Tests are generated

4. tester Agent
   ├── Runs test suite
   ├── Validates security
   └── Checks coverage

5. code-reviewer Agent
   ├── Reviews code quality
   ├── Checks best practices
   └── Validates security patterns

6. docs-manager Agent
   ├── Updates API documentation
   ├── Creates usage guides
   └── Updates architecture docs

7. git-manager Agent
   ├── Creates conventional commit
   ├── Stages all changes
   └── Pushes to remote
```

---

## 4. Agent Handoff Protocol

### Shared Context:
- Project documentation (`docs/`)
- Implementation plans (`plans/`)
- Code standards
- System architecture

### Handoff Flow:
```
planner Agent Output:
  - Implementation plan saved to plans/auth-feature.md
            ↓
Code Agent Input:
  - Reads plans/auth-feature.md
  - Implements according to plan
            ↓
Code Agent Output:
  - New files created
  - Tests generated
            ↓
tester Agent Input:
  - Runs tests on new files
```

---

## 5. When Agents are Invoked

### 1. Automatically (Recommended)
ClaudeKit automatically orchestrates agents based on:
- Command used (`/cook`, `/fix:hard`, etc.)
- Task complexity
- Workflow requirements

```bash
/cook [add payment integration]
# Automatically invokes:
# planner → code → tester → code-reviewer → docs-manager → git-manager
```

### 2. Through Commands
Specific commands invoke specific agents:

```bash
/plan [feature]    # Invokes planner + researcher
/test              # Invokes tester
/debug [issue]     # Invokes debugger
/git:cm            # Invokes git-manager
/docs:update       # Invokes docs-manager
```

### 3. Explicitly (Advanced)
You can explicitly request specific agents:

```
"Use the scout agent to find all authentication files, 
then use the planner agent to create a migration strategy"
```

---

## 6. Workflows (Quy Trình)

### Feature Development
```bash
/plan "add user authentication with OAuth"
/code @plans/user-auth.md
/fix:test
/git:pr "feature/user-auth"
```

### Bug Fixing
```bash
/debug "login button not working"
/fix:hard
/fix:test
/git:cm
```

### Documentation
```bash
/docs:init
/docs:update "after feature changes"
```

### Setup New Project
```bash
ck init my-project --kit engineer
cd my-project
/plan "set up project structure"
/code @plans/project-setup.md
```

### Add New Feature
```bash
/plan "add [feature description]"
/code @plans/your-feature.md
/design:good "UI mockups if needed"
/fix:test
/git:cm
```

### Multi-agent Collaboration
```bash
/plan "complex feature with multiple components"
# Spawns: planner → researcher → frontend dev → backend dev → tester

/fix:hard "production bug"
# Spawns: debugger → researcher → dev → tester → reviewer
```

---

## 7. CCS - Claude Code Switch

### Installation
```bash
npm install -g @kaitranntt/ccs
# or
pnpm add -g @kaitranntt/ccs
```

### Profile Priority Order
1. CLIProxy profiles (gemini, codex, agy) - OAuth-based, zero config
2. CLIProxy variants (user-defined) - Custom model settings
3. Settings-based profiles (glm, kimi) - API key required
4. Account-based profiles (work, personal) - Isolated Claude instances
5. Default - Claude CLI with subscription

### Features
- Switch between multiple Claude accounts
- Switch between AI models (GLM, Kimi)
- Multi-account support with concurrent sessions
- React 19 dashboard with real-time updates

---

## 8. VividKit Daily Routine

### 1. Cập Nhật CLI
```bash
# Update ClaudeKit CLI
claudekit-cli update
```

### 2. Cập Nhật Engineer Kit
```bash
# Update engineer kit để lấy prompt và AI capabilities mới nhất
```

---

## 9. Project Structure (ClaudeKit Style)

```
project/
├── .claude/                  # ClaudeKit configuration
│   ├── config.json
│   ├── agents/               # Custom agent definitions
│   └── commands/             # Custom commands
├── docs/                     # Project documentation
│   ├── api/
│   ├── code-standards.md
│   ├── system-architecture.md
│   └── codebase-summary.md
├── plans/                    # Implementation plans
│   └── feature-name.md
├── journals/                 # Development journals
│   └── 2024-12-09.md
├── src/                      # Source code
├── tests/                    # Test suite
└── README.md
```

---

## 10. Key Commands Reference

### Core Workflow
| Command | Agent(s) Invoked | Description |
|---------|------------------|-------------|
| `/cook` | planner → code → tester → reviewer → git | All-in-one development |
| `/bootstrap` | researcher → planner → code → tester | Project generation |
| `/plan` | planner + researcher | Create implementation plan |
| `/scout` | scout | Search codebase |
| `/test` | tester | Run tests |
| `/debug` | debugger | Investigate issues |

### Fix Commands
| Command | Description |
|---------|-------------|
| `/fix` | Smart router - auto-selects approach |
| `/fix:fast` | Quick fixes |
| `/fix:hard` | Complex investigation |
| `/fix:types` | TypeScript errors |
| `/fix:ui` | UI issues |
| `/fix:ci` | CI/CD issues |
| `/fix:test` | Failing tests |
| `/fix:logs` | Log analysis |

### Git Commands
| Command | Description |
|---------|-------------|
| `/git:cm` | Stage and commit |
| `/git:cp` | Commit and push |
| `/git:pr` | Create pull request |

### Design Commands
| Command | Description |
|---------|-------------|
| `/design:fast` | Quick mockups |
| `/design:good` | Premium designs |
| `/design:3d` | Three.js scenes |

### Content Commands
| Command | Description |
|---------|-------------|
| `/content:good` | Quality content |
| `/content:cro` | Conversion copy |

### Docs Commands
| Command | Description |
|---------|-------------|
| `/docs:init` | Initialize documentation |
| `/docs:update` | Update documentation |
