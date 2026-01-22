# 🚀 Gemini-Kit

<div align="center">

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/nth5693/gemini-kit/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-291%20passed-brightgreen.svg)]()
[![Agents](https://img.shields.io/badge/AI%20Agents-19-purple.svg)]()
[![Skills](https://img.shields.io/badge/Skills-15-orange.svg)]()

### 🎯 Transform Your Terminal into an AI Engineering Team

**Gemini-Kit** is an extension for [Gemini CLI](https://github.com/google-gemini/gemini-cli) that brings **19 specialized AI agents** and **15 skill modules** to help you code 10x faster.

[🚀 Quick Start](#-quick-start) • [🤖 Agents](#-agents) • [🛠️ Skills](#️-skills) • [⌨️ Commands](#️-commands) • [📚 API](docs/API.md)

</div>

---

## 📋 Table of Contents

- [What is Gemini-Kit?](#-what-is-gemini-kit)
- [Quick Start](#-quick-start)
- [Agents](#-agents)
- [Skills](#️-skills)
- [Commands](#️-commands)
- [MCP Tools](#-mcp-tools)
- [Security](#-security)
- [FAQ](#-faq)

---

## 🤔 What is Gemini-Kit?

**Gemini-Kit** transforms Gemini CLI into a **virtual engineering team** with:

| Feature | Count | Description |
|---------|-------|-------------|
| 🤖 **AI Agents** | 19 | Specialized roles (Security, Frontend, Backend, DevOps...) |
| 🛠️ **Skills** | 15 | Knowledge modules (React, Next.js, Docker, Security...) |
| ⌨️ **Commands** | 33+ | Slash commands for every workflow |
| 🔒 **Security** | 30+ | Secret detection patterns |

### Key Features

- **Compound Loop**: `/explore → /plan → /work → /review → /compound` - Each iteration builds knowledge
- **Learning System**: AI learns from your feedback
- **Auto-checkpoint**: Automatic backup before changes
- **Security Hooks**: Block secret leaks (30+ patterns)

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Check |
|-------------|---------|-------|
| Node.js | ≥ 18.0 | `node --version` |
| Git | ≥ 2.0 | `git --version` |
| Gemini CLI | Latest | `gemini --version` |

### Installation (2 minutes)

```bash
# 1. Clone repository
git clone https://github.com/nth5693/gemini-kit.git ~/.gemini/extensions/gemini-kit

# 2. Install & build
cd ~/.gemini/extensions/gemini-kit
npm install && npm run build

# 3. Link extension
gemini extensions link $(pwd)
```

### First Run

```bash
# Go to your project
cd /path/to/your/project

# Start Gemini CLI
gemini

# Try these commands:
> /status           # Check project status
> /explore React    # Research a topic
> /plan Add auth    # Create implementation plan
```

### Update

```bash
cd ~/.gemini/extensions/gemini-kit
git pull && npm install && npm run build
```

---

## 🤖 Agents

### 19 Specialized AI Agents

#### Core Development (5)

| Agent | Role | When to Use |
|-------|------|-------------|
| 📋 **Planner** | Create detailed plans | Starting new features |
| 🔍 **Scout** | Explore codebase | New projects, onboarding |
| 💻 **Coder** | Write clean code | Implementing features |
| 🧪 **Tester** | Write & run tests | Quality assurance |
| 👀 **Reviewer** | Code review | Before merging PRs |

#### Specialists (8) - NEW in v4.0

| Agent | Role | When to Use |
|-------|------|-------------|
| 🔐 **Security Auditor** | Security audit, OWASP | Security reviews |
| ⚛️ **Frontend Specialist** | React, Next.js, UI/UX | Frontend development |
| 🖥️ **Backend Specialist** | API, Database, Docker | Backend development |
| 🚀 **DevOps Engineer** | CI/CD, K8s, GitHub Actions | Infrastructure |
| 🐛 **Debugger** | Root cause analysis | Runtime errors |
| 🗄️ **Database Admin** | Schema, migrations | Database work |
| 🎨 **UI Designer** | Design, animations | UI/UX |
| 🌐 **Fullstack** | End-to-end | Full features |

#### Support (6)

| Agent | Role | When to Use |
|-------|------|-------------|
| 🔀 **Git Manager** | Commits, branches | Version control |
| 📝 **Docs Manager** | Documentation | README, API docs |
| 🔬 **Researcher** | Research | Technology decisions |
| 💡 **Brainstormer** | Ideas | Problem solving |
| 📊 **Project Manager** | Sprint planning | Project management |
| ✍️ **Copywriter** | Marketing copy | Content |

### How to Use Agents

```bash
# Mention agent in your request
> Use the security-auditor agent to review authentication
> Use the frontend-specialist to optimize React components
> Use the backend-specialist to design API architecture
```

---

## 🛠️ Skills

### 15 Knowledge Modules

Skills are loaded automatically based on context and agent configuration.

#### Frontend (4)

| Skill | Content |
|-------|---------|
| **react-patterns** | Hooks, state management, component composition |
| **nextjs** | App Router, Server Components, data fetching |
| **tailwind** | Tailwind CSS v4, responsive design |
| **performance** | Core Web Vitals, caching, optimization |

#### Backend (3)

| Skill | Content |
|-------|---------|
| **api-design** | RESTful patterns, validation, rate limiting |
| **docker** | Multi-stage builds, Compose, container security |
| **security** | OWASP Top 10, JWT, XSS/CSRF prevention |

#### Mobile & Testing (2)

| Skill | Content |
|-------|---------|
| **mobile** | React Native, Flutter, mobile performance |
| **testing** | Vitest, MSW, snapshot testing |

#### Workflow (6)

| Skill | Content |
|-------|---------|
| **code-review** | Review checklist, patterns |
| **debug** | 4-phase debugging methodology |
| **session-resume** | Context recovery |
| **compound-docs** | Knowledge documentation |
| **file-todos** | Task tracking |
| **examples** | Supabase, integrations |

---

## ⌨️ Commands

### Core Workflow

| Command | Description | Example |
|---------|-------------|---------|
| `/explore` | Research before doing | `/explore React Server Components` |
| `/plan` | Create detailed plan | `/plan Add user authentication` |
| `/work` | Execute plan | `/work` (after plan exists) |
| `/review` | Code review | `/review src/api/auth.ts` |
| `/compound` | Document knowledge | `/compound` (after solving problem) |
| `/housekeeping` | Cleanup before push | `/housekeeping` |

### Development

| Command | Description |
|---------|-------------|
| `/debug` | Debug issues |
| `/test` | Write and run tests |
| `/fix` | Quick fix |
| `/code` | Implement code |

### Documentation

| Command | Description |
|---------|-------------|
| `/doc` | Update documentation |
| `/adr` | Create Architecture Decision Record |
| `/changelog` | Generate changelog |

### Utilities

| Command | Description |
|---------|-------------|
| `/status` | Show project status |
| `/help` | Show help |
| `/kit-setup` | Initialize project context |
| `/cycle` | Full workflow cycle |

---

## 🔧 MCP Tools

### Core Tools

| Tool | Function |
|------|----------|
| `kit_create_checkpoint` | Git checkpoint before changes |
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

## 🔒 Security

### Secret Detection (30+ patterns)

- ✅ AWS Access Keys, Secrets
- ✅ GitHub, GitLab Tokens
- ✅ OpenAI, Anthropic API Keys
- ✅ Private Keys (RSA, SSH)
- ✅ Database Connection Strings
- ✅ JWT Secrets

### Command Blocking

- 🚫 `rm -rf /`
- 🚫 Fork bombs
- 🚫 Pipe to shell (`curl | sh`)

---

## ❓ FAQ

### Is Gemini-Kit free?
✅ **Yes**, completely free and open source (MIT License).

### Do I need an API key?
Configure **Gemini CLI** with your Google account. No separate API key needed.

### Which languages are supported?
✅ TypeScript, JavaScript, Python, Go, Rust, Java, C++, and more.

### Which OS is supported?
✅ macOS, Linux, Windows (WSL recommended)

---

## 📊 Stats (v4.0.0)

| Metric | Value |
|--------|-------|
| Tests | 291 passing |
| Lint | 0 errors |
| Agents | 19 |
| Skills | 15 categories |
| Commands | 33+ |
| Coverage | ~81% |

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

MIT © 2024-2026

---

<p align="center">
  Made with ❤️ by the Gemini-Kit Team<br>
  <a href="https://github.com/nth5693/gemini-kit">GitHub</a> •
  <a href="https://github.com/nth5693/gemini-kit/releases">Releases</a> •
  <a href="https://github.com/nth5693/gemini-kit/issues">Issues</a>
</p>
