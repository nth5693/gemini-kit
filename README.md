# Gemini-Kit Extension

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/nth5693/gemini-kit/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **Super Engineer** - Team of AI Agents for software development.

## ✨ Features

- 🤖 **15 AI Agents** - Specialized roles (Planner, Scout, Coder, Tester, etc.)
- 🔄 **Workflow Orchestration** - Smart routing & team sessions
- 📚 **Learning System** - AI learns from your feedback
- ✅ **39 Unit Tests** - Verified with Vitest
- 🔒 **Security Hooks** - Secret detection, path traversal prevention

## 📦 Installation

```bash
# Install from GitHub
gemini extensions install nth5693/gemini-kit
```

### Manual Install
```bash
cd ~/.gemini/extensions/gemini-kit
npm install && npm run build
gemini extensions link $(pwd)
```

## 🚀 Commands

| Command | Description |
|---------|-------------|
| `/cook` | Full workflow: Plan → Scout → Code → Test → Review |
| `/plan` | Create implementation plan |
| `/scout` | Explore codebase structure |
| `/code` | Write/modify code |
| `/test` | Create and run tests |
| `/review` | Code review |
| `/debug` | Debug issues |
| `/git` | Git operations |

## 🤖 AI Agents

| Agent | Role |
|-------|------|
| Planner | Implementation plans, estimation |
| Scout | Codebase exploration, monorepo |
| Coder | Clean code, conventions |
| Tester | Unit/integration tests, Vitest |
| Reviewer | Code review, security audit |
| Debugger | Root cause analysis |
| Git Manager | Version control, hooks |
| Database Admin | Schema, queries, migrations |
| Researcher | API research, comparison |
| UI Designer | Dark mode, animations |
| Docs Manager | README, ADR, changelog |
| Brainstormer | Ideas, SCAMPER, Six Hats |
| Fullstack Dev | End-to-end development |
| Project Manager | Agile, sprint planning |
| Copywriter | Marketing, CRO |

## 🔧 MCP Tools

### Core
- `kit_create_checkpoint` - Git checkpoint before changes
- `kit_restore_checkpoint` - Rollback to checkpoint
- `kit_get_project_context` - Project analysis
- `kit_handoff_agent` - Agent-to-agent communication

### Learning
- `kit_save_learning` - Save feedback as lessons
- `kit_get_learnings` - Retrieve relevant learnings

### Team Orchestration
- `kit_team_start` / `kit_team_end` - Session management
- `kit_run_workflow` - Execute predefined workflows
- `kit_smart_route` - Auto-select best workflow

📖 **Full API Reference**: [docs/API.md](docs/API.md)

## 🔒 Security Hooks

- **before-tool**: Block secrets (30+ patterns), path traversal prevention
- **after-tool**: Auto-run tests after code changes

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## 📄 License

MIT

