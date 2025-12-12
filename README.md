<p align="center">
  <img src="https://img.shields.io/badge/Gemini--Kit-v0.1.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Multi--Model-Gemini%20%7C%20Claude%20%7C%20OpenAI-purple?style=for-the-badge" alt="Multi-Model">
</p>

<h1 align="center">🚀 Gemini-Kit</h1>

<p align="center">
  <strong>Build Software Like You Have a Team</strong><br>
  An AI-powered command-line tool that helps you code faster
</p>

<p align="center">
  <a href="#-what-is-gemini-kit">What is this?</a> •
  <a href="#-quick-start-5-minutes">Quick Start</a> •
  <a href="#-your-first-commands">First Commands</a> •
  <a href="#-all-commands">All Commands</a> •
  <a href="#-faq">FAQ</a>
</p>

---

## 🤔 What is Gemini-Kit?

**Gemini-Kit is like having a team of AI assistants in your terminal.** 

Instead of copy-pasting code between ChatGPT and your editor, you can:

```bash
# Ask AI to plan a feature
gk plan feature "add login page"

# Ask AI to find relevant files
gk scout "authentication"

# Ask AI to fix bugs
gk fix hard "button not working"

# Ask AI to commit your code
gk git cm
```

### 💡 Think of it like this:

| Traditional Way | With Gemini-Kit |
|-----------------|-----------------|
| Open ChatGPT → Copy question → Paste answer → Repeat | Just type `gk cook "add feature"` |
| Manually search files | `gk scout "pattern"` finds them |
| Write commit messages | `gk git cm` generates them |
| Debug for hours | `gk fix hard "issue"` investigates |

---

## 📋 Prerequisites

Before installing Gemini-Kit, make sure you have:

### 1. Node.js (v18 or higher)

Check if you have Node.js:
```bash
node --version
# Should show v18.0.0 or higher
```

If not installed, download from: https://nodejs.org/

### 2. pnpm (Package Manager)

```bash
# Install pnpm
npm install -g pnpm

# Verify installation
pnpm --version
```

### 3. Git

```bash
git --version
# Should show git version 2.x.x
```

### 4. An AI API Key (Choose One)

| Provider | Get API Key | Free Tier |
|----------|-------------|-----------|
| **Google Gemini** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | ✅ Yes |
| **OpenAI** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | ❌ Paid |
| **Claude** | [console.anthropic.com](https://console.anthropic.com/) | ❌ Paid |

**Recommendation for beginners:** Start with **Google Gemini** - it's free!

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/nth5693/gemini-kit.git

# Go into the folder
cd gemini-kit

# Install dependencies (this may take 1-2 minutes)
pnpm install
```

**Expected output:**
```
Packages: +150
++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 150, reused 100, downloaded 50, added 150
Done in 45s
```

### Step 2: Build the Project

```bash
pnpm build
```

**Expected output:**
```
CLI Building entry: src/cli/index.ts
ESM dist/index.js     93.93 KB
ESM ⚡️ Build success in 25ms
```

### Step 3: Configure Your API Key

```bash
# Create config folder
mkdir -p ~/.gemini-kit

# Create config file (replace YOUR_API_KEY with your actual key)
echo '{
  "defaultProvider": "gemini",
  "providers": {
    "gemini": {
      "apiKey": "YOUR_API_KEY_HERE",
      "model": "gemini-1.5-pro"
    }
  }
}' > ~/.gemini-kit/config.json
```

### Step 4: Link Globally (Optional but Recommended)

```bash
pnpm link --global
```

Now you can use `gk` from anywhere!

### Step 5: Test It Works

```bash
gk --help
```

**Expected output:**
```
╔═══════════════════════════════════════════╗
║           Gemini-Kit v0.1.0               ║
║       100% ClaudeKit Parity (38+)         ║
╚═══════════════════════════════════════════╝

Usage: gk [options] [command]

Commands:
  cook <task>        All-in-one workflow
  plan               Planning
  scout <query>      Search codebase
  ...
```

🎉 **Congratulations! You're ready to use Gemini-Kit!**

---

## 👋 Your First Commands

### 1. Ask About a Codebase

Go to any project folder and ask:

```bash
cd your-project
gk ask "What does this project do?"
```

**Example output:**
```
❓ Ask About Codebase...

Question: What does this project do?

📋 Answer:

This appears to be a React e-commerce application that:
- Handles product listings
- Manages shopping cart
- Processes checkout flow
...
```

### 2. Search for Files

```bash
gk scout "database"
```

**Example output:**
```
🔍 Scouting codebase...

Found 5 relevant files:

📁 src/database/
  ├── connection.ts    - Database connection setup
  ├── models/user.ts   - User model
  └── models/product.ts - Product model
...
```

### 3. Plan a Feature

```bash
gk plan feature "add dark mode toggle"
```

**Example output:**
```
📋 Planning...

Research complete
Plan created

📁 Saved: plans/dark-mode-toggle.md

The plan includes:
1. Create ThemeContext
2. Add toggle button
3. Store preference
4. Apply CSS variables
...
```

### 4. Commit Your Changes

After making code changes:

```bash
gk git cm
```

**Example output:**
```
🔧 Git Commit...

Generated commit: feat(ui): add dark mode toggle with localStorage persistence

✅ Changes committed successfully
```

---

## 📖 All Commands

### Core Commands (Start Here!)

| Command | What It Does | Example |
|---------|-------------|---------|
| `gk ask <question>` | Ask anything about your code | `gk ask "how does auth work?"` |
| `gk scout <query>` | Find relevant files | `gk scout "api endpoints"` |
| `gk plan feature <desc>` | Create a development plan | `gk plan feature "add search"` |
| `gk git cm` | Commit with AI message | `gk git cm` |

### Fix Commands (When Things Break)

| Command | What It Does | Example |
|---------|-------------|---------|
| `gk fix fast` | Quick lint/format fixes | `gk fix fast` |
| `gk fix hard <issue>` | Debug complex issues | `gk fix hard "login broken"` |
| `gk fix types` | Fix TypeScript errors | `gk fix types` |
| `gk fix test` | Fix failing tests | `gk fix test` |

### Design Commands (For UI Work)

| Command | What It Does | Example |
|---------|-------------|---------|
| `gk design fast <desc>` | Quick UI mockup | `gk design fast "navbar"` |
| `gk design good <desc>` | Detailed UI design | `gk design good "dashboard"` |

### Power User Commands

| Command | What It Does |
|---------|-------------|
| `gk cook <task>` | Full workflow: plan → code → test → commit |
| `gk bootstrap <name>` | Generate a new project |
| `gk research deep <topic>` | Deep research with sources |

---

## 🤖 What Are Agents?

Gemini-Kit uses **15 specialized AI agents**. Think of them as team members:

| Agent | Role | Like a... |
|-------|------|-----------|
| **Planner** | Creates implementation plans | Tech Lead |
| **Scout** | Finds relevant code | Senior Dev |
| **Coder** | Writes code | Developer |
| **Tester** | Runs and fixes tests | QA Engineer |
| **Debugger** | Investigates issues | Detective |
| **Code Reviewer** | Reviews code quality | Senior Reviewer |
| **Git Manager** | Handles commits | DevOps |
| **UI Designer** | Creates designs | Designer |
| **Researcher** | Gathers information | Researcher |
| **Docs Manager** | Updates documentation | Tech Writer |

When you run `gk cook "add feature"`, multiple agents work together automatically!

---

## ❓ FAQ

### Q: Do I need to pay for this?

**A:** Gemini-Kit itself is **free and open-source**. However, you need an AI API key:
- **Google Gemini**: Free tier available ✅
- **OpenAI/Claude**: Paid only

### Q: Which AI model should I use?

**A:** For beginners, we recommend:
1. **Google Gemini 1.5 Pro** - Free, powerful, good for most tasks
2. **OpenAI GPT-4o** - Best quality, but costs money
3. **Claude 3.5 Sonnet** - Great for code, but costs money

### Q: Can I use this without programming knowledge?

**A:** Basic programming knowledge helps, but you can start with simple commands:
- `gk ask "explain this code"` - Understand code
- `gk scout "thing"` - Find files
- `gk git cm` - Commit changes

### Q: Is my code sent to the AI?

**A:** Yes, relevant code snippets are sent to the AI API you configure. Don't use this with:
- Proprietary/secret code
- Code you can't share externally

### Q: How is this different from ChatGPT?

| ChatGPT | Gemini-Kit |
|---------|------------|
| Copy-paste code back and forth | Works directly in your project |
| General purpose | Specialized for coding |
| Web browser | Command line (faster) |
| One conversation | 15 specialized agents |

### Q: What if I get an error?

See [Troubleshooting](#-troubleshooting) below!

---

## 🔧 Troubleshooting

### "No active provider configured"

**Problem:** You haven't set up your API key.

**Solution:**
```bash
# Check if config exists
cat ~/.gemini-kit/config.json

# If empty or missing, create it:
mkdir -p ~/.gemini-kit
echo '{
  "defaultProvider": "gemini",
  "providers": {
    "gemini": {
      "apiKey": "YOUR_API_KEY",
      "model": "gemini-1.5-pro"
    }
  }
}' > ~/.gemini-kit/config.json
```

### "command not found: gk"

**Problem:** Gemini-Kit isn't linked globally.

**Solution:**
```bash
cd /path/to/gemini-kit
pnpm link --global
```

Or use the full path:
```bash
node /path/to/gemini-kit/dist/index.js --help
```

### "API Error" or "Rate Limited"

**Problem:** API issues.

**Solutions:**
1. Check your API key is correct
2. Check you have API credits
3. Wait a minute and try again (rate limits)

### "Build failed"

**Problem:** Build errors.

**Solution:**
```bash
# Clean and rebuild
rm -rf node_modules dist
pnpm install
pnpm build
```

---

## ⚙️ Configuration

### Basic Config (Gemini - Free)

```json
{
  "defaultProvider": "gemini",
  "providers": {
    "gemini": {
      "apiKey": "your-key-here",
      "model": "gemini-1.5-pro"
    }
  }
}
```

### Multi-Model Config

```json
{
  "defaultProvider": "gemini",
  "providers": {
    "gemini": {
      "apiKey": "gemini-key",
      "model": "gemini-1.5-pro"
    },
    "openai": {
      "apiKey": "openai-key",
      "model": "gpt-4o"
    },
    "claude": {
      "apiKey": "claude-key",
      "model": "claude-3-5-sonnet-20241022"
    }
  }
}
```

### Using CLIProxyAPI (Free via OAuth)

```json
{
  "defaultProvider": "cliproxy",
  "providers": {
    "cliproxy": {
      "apiKey": "cliproxy",
      "model": "gemini-2.5-pro",
      "baseURL": "http://localhost:8080/v1"
    }
  }
}
```

---

## 📁 Project Structure

```
gemini-kit/
├── src/
│   ├── agents/         # 15 AI agents
│   ├── commands/       # 38+ commands
│   ├── providers/      # AI model integrations
│   └── cli/            # Command-line interface
├── tests/              # Unit tests
└── dist/               # Built files
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License - free for personal and commercial use.

---

## 🙏 Credits

- Inspired by [ClaudeKit](https://docs.claudekit.cc/)
- Supports [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)
- Built with [Google Generative AI](https://ai.google.dev/)

---

<p align="center">
  <strong>Made with ❤️ for developers who want to build faster</strong><br><br>
  <a href="https://github.com/nth5693/gemini-kit/issues">Report Bug</a> •
  <a href="https://github.com/nth5693/gemini-kit/issues">Request Feature</a>
</p>
