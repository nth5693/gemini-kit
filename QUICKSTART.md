# 🚀 Quick Start Guide

Get started with Gemini-Kit in 5 minutes!

---

## Prerequisites

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed and configured
- Node.js 18+

---

## Installation

### Step 1: Clone & Build (2 min)

```bash
# Clone repository
git clone https://github.com/nth5693/gemini-kit.git ~/.gemini/extensions/gemini-kit

# Install dependencies
cd ~/.gemini/extensions/gemini-kit
npm install && npm run build

# Link extension
gemini extensions link $(pwd)
```

### Step 2: Verify Installation

```bash
# Go to your project
cd /your/project

# Start Gemini CLI
gemini

# Check status
> /status
```

**Expected output:**
```
📊 PROJECT STATUS
================
📋 Active Specs: 0
📝 Active Plans: 0
✅ Active Todos: 0
🏥 Compound Health: Good
```

---

## Essential Commands

### The Compound Loop (Recommended Workflow)

```
/explore  →  Research topic, understand best practices
    ↓
/plan     →  Create detailed implementation plan
    ↓
/work     →  Execute the plan, write code
    ↓
/review   →  Review code, find issues
    ↓
/compound →  Document solution for future use
    ↓
/housekeeping → Cleanup, then git push!
```

### Top 5 Commands

| Command | What it does | When to use |
|---------|--------------|-------------|
| `/status` | Show project status | Start of each session |
| `/explore [topic]` | Research before implementing | Before new feature |
| `/plan [description]` | Create implementation plan | Before coding |
| `/work` | Execute plan step by step | When plan exists |
| `/housekeeping` | Cleanup before push | Before git push |

---

## Using Agents

### 19 Specialized Agents

Mention an agent by name to get specialized help:

```bash
> Use the security-auditor agent to review authentication
> Use the frontend-specialist to optimize React components
> Use the backend-specialist to design API architecture
> Use the devops-engineer to setup CI/CD pipeline
```

### Primary Agents

| Agent | Use for |
|-------|---------|
| **Planner** | "Create plan for feature X" |
| **Coder** | "Write code for Y" |
| **Reviewer** | "Review this code" |
| **Debugger** | "Find error in Z" |
| **Security Auditor** | "Check for vulnerabilities" |
| **Frontend Specialist** | "Optimize React performance" |
| **Backend Specialist** | "Design REST API" |
| **DevOps Engineer** | "Setup GitHub Actions" |

---

## Using Skills

Skills are **loaded automatically** based on your task. No configuration needed.

### Available Skills (15 categories)

| Category | Skills |
|----------|--------|
| **Frontend** | react-patterns, nextjs, tailwind, performance |
| **Backend** | api-design, docker, security |
| **Mobile** | mobile |
| **Testing** | testing |
| **Workflow** | code-review, debug, session-resume, compound-docs, file-todos, examples |

---

## Example Workflows

### Starting a New Feature

```bash
> /explore JWT authentication best practices
> /plan Add JWT authentication with refresh tokens
> /work
> /review
> /housekeeping
```

### Debugging an Issue

```bash
> /debug Why does the API return 500 on large file uploads?
```

### Security Audit

```bash
> Use the security-auditor agent to audit src/api/auth.ts
```

### Creating Tests

```bash
> /test Write tests for src/services/UserService.ts
```

---

## Project Setup (Optional)

For first-time setup, run:

```bash
> /kit-setup
```

This creates project context files in `.gemini-kit/`:
- `product.md` - Product description
- `tech-stack.md` - Technologies used
- `guidelines.md` - Coding guidelines

---

## Update to Latest Version

```bash
cd ~/.gemini/extensions/gemini-kit
git pull && npm install && npm run build
```

---

## Need Help?

- Type `/help` in Gemini CLI
- View [README.md](README.md) for full documentation
- View [API Reference](docs/API.md) for MCP tools
- View [CHANGELOG.md](CHANGELOG.md) for version history

---

## Stats (v4.0.0)

| Metric | Value |
|--------|-------|
| Agents | 19 |
| Skills | 15 categories |
| Commands | 33+ |
| Tests | 291 passing |