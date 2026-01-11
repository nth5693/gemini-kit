# 🚀 Gemini-Kit

<div align="center">

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/nth5693/gemini-kit/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-291%20passed-brightgreen.svg)]()
[![Agents](https://img.shields.io/badge/AI%20Agents-15-purple.svg)]()
[![Commands](https://img.shields.io/badge/Commands-42-orange.svg)]()

### 🎯 Turn Your Terminal Into an AI Engineering Team

**Gemini-Kit** is an extension for [Gemini CLI](https://github.com/google-gemini/gemini-cli) that brings **15 specialized AI agents** to help you code 10x faster.

[🚀 Installation](#-installation) • [📖 Usage](#-usage) • [🤖 Agents](#-agents) • [⌨️ Commands](#️-all-commands) • [📚 API](docs/API.md)

</div>

---

## 📋 Table of Contents

- [What is Gemini-Kit?](#-what-is-gemini-kit)
- [How It Works](#-how-it-works)
- [Benefits](#-benefits)
- [Installation](#-installation)
- [Usage](#-usage)
- [Agents](#-agents)
- [All Commands](#️-all-commands)
- [MCP Tools](#-mcp-tools)
- [FAQ](#-faq)

---

## 📖 Documentation

| Guide | Description |
|-------|-------------|
| [🚀 Quick Start](QUICKSTART.md) | Start in 5 minutes |
| [📚 Features Reference](docs/FEATURES.md) | All detailed features |
| [🔄 Workflows Guide](docs/WORKFLOWS.md) | Workflow guide |
| [🎯 Best Practices](docs/BEST-PRACTICES.md) | Tips and troubleshooting |
| [📡 API Reference](docs/API.md) | MCP tools API |

---

## 🤔 What is Gemini-Kit?

**Gemini-Kit** is an extension for Gemini CLI that transforms your terminal into a **virtual engineering office** with 15 specialized AI agents:

| Agent | Role |
|-------|------|
| 📋 **Planner** | Create plans, break down tasks |
| 🔍 **Scout** | Explore and analyze codebase |
| 💻 **Coder** | Write clean, efficient code |
| 🧪 **Tester** | Create unit & integration tests |
| 👀 **Reviewer** | Code review, find bugs |
| 🐛 **Debugger** | Debug complex issues |
| 🔀 **Git Manager** | Manage Git, commits, branches |
| 🗄️ **Database Admin** | Schema design, queries |
| 🔬 **Researcher** | Research new technologies |
| 🎨 **UI Designer** | Design UI/UX |
| 📝 **Docs Manager** | Write documentation |
| 💡 **Brainstormer** | Brainstorm ideas |
| 🌐 **Fullstack Dev** | End-to-end development |
| 📊 **Project Manager** | Project management |
| ✍️ **Copywriter** | Write marketing content |

### Key Features

- **42 slash commands** for every situation
- **One-command workflow**: `/cook` = Plan → Scout → Code → Test → Review
- **Auto-checkpoint**: Automatic backup before changes
- **Learning System**: AI learns from your feedback
- **Security Hooks**: Block secret leaks (30+ patterns)

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        GEMINI-KIT ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   GEMINI     │───▶│  GEMINI-KIT  │───▶│  MCP SERVER  │      │
│  │     CLI      │    │  EXTENSION   │    │  (15 Tools)  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  42 COMMANDS │    │   15 AGENTS  │    │    HOOKS     │      │
│  │  /cook /plan │    │ Planner,Coder│    │ before-tool  │      │
│  │  /scout /test│    │ Tester,Scout │    │ after-tool   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### The `/cook` Workflow (Full Development Cycle)

```
📋 PLAN     →  🔍 SCOUT   →  💻 CODE    →  🧪 TEST    →  👀 REVIEW
Create      Find relevant   Implement    Write &      Code review
plan        files           solution     run tests   & quality
```

---

## 💎 Benefits

<table>
<tr>
<td width="50%">

### ❌ Before Gemini-Kit

```
😩 Coding alone, no support
😩 Debugging for hours
😩 Forgetting to write tests
😩 Accidentally committing API keys
😩 Repeating workflows manually
😩 Onboarding takes weeks
```

</td>
<td width="50%">

### ✅ After Gemini-Kit

```
🚀 15 AI agents available 24/7
🚀 Debugger finds root cause
🚀 Tester writes tests automatically
🚀 Blocks secrets BEFORE commit
🚀 /cook automates everything
🚀 /scout analyzes codebase in minutes
```

</td>
</tr>
</table>

### Time Savings

| Task | Manual | With Gemini-Kit |
|------|--------|-----------------|
| Analyze new codebase | 2-4 hours | 5 min (`/scout`) |
| Plan a feature | 1-2 hours | 10 min (`/plan`) |
| Implement + Test + Review | 1 day | 1-2 hours (`/cook`) |
| Debug complex issue | 2-4 hours | 30 min (`/debug`) |
| Write documentation | 2-3 hours | 20 min (`/docs`) |

---

## 📦 Installation

### System Requirements

| Requirement | Version | Check |
|-------------|---------|-------|
| Node.js | ≥ 18.0 | `node --version` |
| Git | ≥ 2.0 | `git --version` |
| npm | ≥ 8.0 | `npm --version` |

### Step 1: Install Gemini CLI

```bash
# macOS / Linux
npm install -g @anthropics/gemini-cli

# Windows (PowerShell as Admin)
npm install -g @anthropics/gemini-cli

# Verify installation
gemini --version
```

First run will prompt for configuration:

```bash
# Run for the first time
gemini

# Follow prompts to:
# 1. Sign in with Google account
# 2. Authorize Gemini CLI
```

### Step 2: Install Gemini-Kit Extension

```bash
# Clone the repository
git clone https://github.com/nth5693/gemini-kit.git ~/.gemini/extensions/gemini-kit

# Navigate to directory
cd ~/.gemini/extensions/gemini-kit

# Install dependencies and build
npm install && npm run build

# Link extension
gemini extensions link $(pwd)
```

### Step 3: Verify Installation

```bash
# Go to your project
cd /path/to/your/project

# Start Gemini
gemini

# Try a command
> /help

# If you see the command list → Success! 🎉
```

### Update to Latest Version

```bash
cd ~/.gemini/extensions/gemini-kit
git pull origin main
npm install && npm run build
```

---

## 💻 Usage

### Basic Workflow

```bash
# 1. Navigate to your project
cd my-project

# 2. Start Gemini
gemini

# 3. Use commands
> /cook Add user authentication with JWT
```

### Common Scenarios

#### 🆕 Starting a New Feature

```bash
# Plan first
> /plan Add user authentication with JWT

# Or run full workflow
> /cook Implement JWT authentication
```

#### 🐛 Fixing a Bug

```bash
# Debug the issue
> /debug Why does API return 500 when uploading large files?

# Or quick fix
> /fix TypeError: Cannot read property 'id' of undefined at line 42
```

#### 🔍 Exploring a New Codebase

```bash
# Analyze entire project
> /scout

# Focus on specific directory
> /scout src/services
```

#### 📝 Writing Documentation

```bash
# Generate README
> /docs Generate README for this project

# Create API docs
> /docs Create API documentation for src/api
```

---

## 🤖 Agents

### Core Agents

| Agent | File | Function | When to Use |
|-------|------|----------|-------------|
| 📋 **Planner** | `agents/planner.md` | Create detailed plans with timeline | Starting new features |
| 🔍 **Scout** | `agents/scout.md` | Analyze codebase structure | New projects, onboarding |
| 💻 **Coder** | `agents/coder.md` | Write clean code | Implementing features |
| 🧪 **Tester** | `agents/tester.md` | Write tests, ensure coverage | Quality assurance |
| 👀 **Reviewer** | `agents/reviewer.md` | Code review, find bugs | Before merging PRs |

### Specialized Agents

| Agent | Function | When to Use |
|-------|----------|-------------|
| 🐛 **Debugger** | Root cause analysis | Runtime errors |
| 🔀 **Git Manager** | Commit, branch strategy | Version control |
| 🗄️ **Database Admin** | Schema design, migrations | Database work |
| 🔬 **Researcher** | Research packages | Technology decisions |
| 🎨 **UI Designer** | Dark mode, animations | Frontend UI/UX |
| 📝 **Docs Manager** | README, API docs | Documentation |
| 💡 **Brainstormer** | Brainstorm ideas | Problem solving |
| 🌐 **Fullstack** | End-to-end implementation | Full features |
| 📊 **PM** | Sprint planning | Project management |
| ✍️ **Copywriter** | Marketing copy | Content creation |

---

## ⌨️ All Commands

### 🍳 Workflow Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/cook` | Full development cycle | `/cook Add payment integration` |
| `/plan` | Create detailed plan | `/plan Migrate to PostgreSQL` |
| `/scout` | Explore codebase | `/scout src/services` |
| `/code` | Implement code | `/code Create UserService class` |
| `/test` | Write and run tests | `/test Write tests for auth module` |
| `/review` | Code review | `/review src/api/users.ts` |

### 🐛 Debug & Fix

| Command | Description | Example |
|---------|-------------|---------|
| `/debug` | Analyze and fix bugs | `/debug Memory leak in handler` |
| `/fix` | Quick fix | `/fix ESLint errors in src/utils` |

### 📚 Documentation

| Command | Description | Example |
|---------|-------------|---------|
| `/docs` | Create/update docs | `/docs Generate API reference` |
| `/content` | Create content | `/content Write auth tutorial` |

### 🔀 Git

| Command | Description | Example |
|---------|-------------|---------|
| `/git` | Git operations | `/git commit "feat: add auth"` |
| `/pr` | Create Pull Request | `/pr Create PR for feature` |
| `/review-pr` | Review Pull Request | `/review-pr 123` |

### 🛠️ Utilities

| Command | Description |
|---------|-------------|
| `/help` | Show help |
| `/session` | Manage session |
| `/team` | Team orchestration |
| `/workflow` | Run specific workflow |
| `/ask` | Quick Q&A |
| `/chat` | Free chat |

---

## 🔧 MCP Tools

### Core Tools

| Tool | Function |
|------|----------|
| `kit_create_checkpoint` | Create Git checkpoint before changes |
| `kit_restore_checkpoint` | Rollback to checkpoint |
| `kit_get_project_context` | Get project information |
| `kit_handoff_agent` | Transfer context between agents |

### Knowledge Tools

| Tool | Function |
|------|----------|
| `kit_save_learning` | Save feedback for AI learning |
| `kit_get_learnings` | Get saved learnings |
| `kit_index_codebase` | Index codebase for search |
| `kit_keyword_search` | Search in codebase |

### Integration Tools

| Tool | Function |
|------|----------|
| `kit_github_create_pr` | Create GitHub PR |
| `kit_github_get_issue` | Get issue details |
| `kit_jira_get_ticket` | Get Jira ticket info |

---

## 🔒 Security Features

### Secret Detection (30+ patterns)

- ✅ AWS Access Keys
- ✅ GitHub Tokens
- ✅ OpenAI API Keys
- ✅ Private Keys
- ✅ Database Connection Strings

### Dangerous Command Blocking

- 🚫 `rm -rf /`
- 🚫 Fork bombs
- 🚫 `curl | sh`

---

## ❓ FAQ

### Is Gemini-Kit free?
✅ **Yes**, completely free and open source (MIT License).

### Do I need an API key?
You need to configure **Gemini CLI** with your Google account. No separate API key needed.

### Which languages are supported?
✅ TypeScript, JavaScript, Python, Go, Rust, Java, and many more.

### Which OS is supported?
✅ macOS, Linux, Windows (WSL recommended)

---

## 🤝 Contributing

Contributions welcome! 

1. Fork the repo
2. Create branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Create Pull Request

---

## 📄 License

MIT © 2024

---

<p align="center">
  Made with ❤️ by the Gemini-Kit Team<br>
  <a href="https://github.com/nth5693/gemini-kit">GitHub</a> •
  <a href="https://github.com/nth5693/gemini-kit/releases">Releases</a> •
  <a href="https://github.com/nth5693/gemini-kit/issues">Issues</a>
</p>
