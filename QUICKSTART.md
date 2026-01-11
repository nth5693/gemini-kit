# 🚀 Quick Start Guide

Get started with Gemini-Kit in 5 minutes!

## Prerequisites

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed
- Node.js 18+ (for MCP tools)

## Step 1: Install Gemini-Kit (30s)

```bash
# Clone repository
git clone https://github.com/nth5693/gemini-kit.git

# Navigate to the directory
cd gemini-kit

# Install dependencies
npm install
```

## Step 2: Configure Extension (30s)

Add to `~/.gemini/settings.json`:

```json
{
  "extensions": [
    {
      "name": "gemini-kit",
      "path": "/path/to/gemini-kit"
    }
  ]
}
```

## Step 3: First command! (1 minute)

```bash
# Open your project
cd /your/project

# Start Gemini CLI
gemini

# Run the first command
/status
```

**Sample output:**
```
📊 PROJECT STATUS
================
📋 Active Specs: 0
📝 Active Plans: 0
✅ Active Todos: 0
🏥 Compound Health: D (New)
```

---

## Essential Commands

### 🔥 Top 5 Commands for newcomers

| Command | Description | When to use |
|---------|-------------|--------------|
| `/status` | View project progress | Start of each session |
| `/explore` | Research before doing | Before new feature |
| `/plan` | Create plan | Before coding |
| `/work` | Execute plan | When plan exists |
| `/housekeeping` | Cleanup | Before pushing |

### 🤖 Primary Agents

| Agent | When needed |
|-------|-------------|
| Planner | "Create plan for feature X" |
| Coder | "Write code for Y" |
| Reviewer | "Review this code" |
| Debugger | "Find error in Z" |

---

## Basic Workflow

```
📝 /explore → Research
     ↓
📋 /plan → Plan
     ↓
💻 /work → Execute
     ↓
🔍 /review → Review
     ↓
🧹 /housekeeping → Cleanup
     ↓
📤 git push → Ship!
```

---

## Next Steps

1. **Read [FEATURES.md](docs/FEATURES.md)** - Understand all features
2. **Try `/kit:setup`** - Setup project context
3. **Try `/explore`** - Research a topic

---

## Need help?

- Type `/help` in Gemini CLI
- View [API Reference](docs/API.md)
- View [Critical Patterns](docs/solutions/patterns/critical-patterns.md)