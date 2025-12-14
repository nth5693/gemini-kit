# Gemini CLI Documentation Summary

> Tổng hợp từ https://geminicli.com/docs/
> Cập nhật: 2024-12-14

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Extensions](#extensions)
3. [Custom Commands](#custom-commands)
4. [Hooks](#hooks)
5. [MCP Servers](#mcp-servers)
6. [Built-in Tools](#built-in-tools)
7. [CLI Commands](#cli-commands)
8. [Checkpointing](#checkpointing)
9. [Policy Engine](#policy-engine)
10. [Headless Mode](#headless-mode)
11. [Sandbox](#sandbox)
12. [Settings Reference](#settings-reference)
13. [Themes](#themes)
14. [Keyboard Shortcuts](#keyboard-shortcuts)
15. [Authentication](#authentication)
16. [IDE Integration](#ide-integration)
17. [Memory Import](#memory-import)
18. [Trusted Folders](#trusted-folders)
19. [Token Caching](#token-caching)
20. [Environment Variables](#environment-variables)
21. [Command-Line Arguments](#command-line-arguments)
22. [Hooks Best Practices](#hooks-best-practices)
23. [Variables](#variables)
24. [Quick Reference Links](#quick-reference-links)

---

## Tổng Quan

Gemini CLI là một REPL (Read-Eval-Print Loop) mang capabilities của Gemini models đến terminal.

**Kiến trúc:**
- `packages/cli` - Client-side application
- `packages/core` - Local server, quản lý requests đến Gemini API

**Documentation Links:**
- [Architecture](https://geminicli.com/docs/architecture)
- [Get Started](https://geminicli.com/docs/get-started)
- [Configuration](https://geminicli.com/docs/get-started/configuration)
- [FAQ](https://geminicli.com/docs/faq)
- [Troubleshooting](https://geminicli.com/docs/troubleshooting)

---

## Extensions

### Extension Management

```bash
# Cài từ GitHub
gemini extensions install github.com/username/extension-name

# Link local extension
gemini extensions link ~/.gemini/extensions/my-extension

# List extensions
gemini extensions list

# Gỡ cài đặt
gemini extensions uninstall extension-name

# Tạo extension mới
gemini extensions create my-extension

# Enable/Disable
gemini extensions enable extension-name
gemini extensions disable extension-name

# Cập nhật
gemini extensions update extension-name

# Xem settings
gemini extensions settings list extension-name
gemini extensions settings set extension-name setting-name --scope user
```

### File cấu hình: `gemini-extension.json`

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["${extensionPath}${/}dist${/}server.js"],
      "cwd": "${extensionPath}"
    }
  },
  "contextFileName": "GEMINI.md",
  "excludeTools": ["run_shell_command(rm -rf)"],
  "settings": [
    {
      "name": "API Key",
      "description": "Your API key",
      "envVar": "MY_API_KEY",
      "sensitive": true
    }
  ]
}
```

**Các trường:**
| Trường | Mô tả |
|--------|-------|
| `name` | Tên extension (lowercase, dashes) |
| `version` | Phiên bản |
| `mcpServers` | MCP servers configuration |
| `contextFileName` | File context (default: GEMINI.md) |
| `excludeTools` | Tools bị block |
| `settings` | User settings (API keys, etc.) |

### Extension Directory Structure

```
~/.gemini/extensions/my-extension/
├── gemini-extension.json    # Config file
├── commands/                # TOML commands
│   ├── deploy.toml
│   └── gcs/
│       └── sync.toml        # → /gcs:sync
├── hooks/                   # Hook scripts
├── src/                     # TypeScript source
├── dist/                    # Compiled output
└── GEMINI.md               # Context file
```

### Conflict Resolution

Extension commands có precedence thấp nhất:
1. Project commands (highest)
2. User commands
3. Extension commands (lowest)

Nếu conflict: `/deploy` → user command, `/gcp.deploy` → extension command

### Extension Releasing

#### Option 1: Git Repository (Simple)

```bash
# Users install via:
gemini extensions install github.com/username/my-extension

# Install specific branch/tag:
gemini extensions install github.com/username/my-extension --ref=stable
gemini extensions install github.com/username/my-extension --ref=v1.0.0
```

**Release Channels:**
- `main` branch → stable
- `preview` branch → preview releases
- `dev` branch → development

#### Option 2: GitHub Releases (Pro)

Faster installation via pre-built archives.

**Steps:**
1. Build extension
2. Create archive
3. Tag version
4. Create GitHub Release with archive attached

**Archive Naming Convention:**

```
{platform}.{arch}.{name}.{extension}
```

| Platform | Values |
|----------|--------|
| `darwin` | macOS |
| `linux` | Linux |
| `win32` | Windows |
| `x64`, `arm64` | Architecture |

**Examples:**
- `darwin.arm64.my-tool.tar.gz` (Apple Silicon)
- `linux.x64.my-tool.tar.gz`
- `win32.my-tool.zip`

**Archive Structure:**
```
my-extension.tar.gz
├── gemini-extension.json    # REQUIRED at root
├── commands/
├── dist/
├── hooks/
└── ...
```

#### GitHub Actions Workflow Example

```yaml
name: Release Extension
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Create archive
        run: |
          tar --exclude='node_modules' --exclude='.git' \
              -czvf release/gemini-kit.tar.gz .
      - uses: softprops/action-gh-release@v1
        with:
          files: release/gemini-kit.tar.gz
```

#### Install from Release

```bash
# Latest release
gemini extensions install github.com/username/my-extension

# Specific release
gemini extensions install github.com/username/my-extension --ref=v1.0.0

# Pre-release
gemini extensions install github.com/username/my-extension --pre-release
```

---

## Custom Commands

### File Locations

```
~/.gemini/commands/          # User commands (global)
<project>/.gemini/commands/  # Project commands (local, higher priority)
```

### Naming

- `test.toml` → `/test`
- `git/commit.toml` → `/git:commit`

### TOML Format

```toml
# Description hiển thị trong /help
description = "Generates a commit message"

# Prompt gửi đến AI (REQUIRED)
prompt = """
You are a helpful assistant.
Please do: {{args}}
"""
```

### Xử lý Arguments

#### 1. `{{args}}` - Inject user input
```toml
prompt = "Please fix: {{args}}"
```
`/fix "Button bug"` → `Please fix: "Button bug"`

#### 2. `!{...}` - Run shell command
```toml
prompt = """
Git changes:
!{git diff --staged}
"""
```
- Shell command chạy trước
- Output inject vào prompt
- User confirm trước khi chạy
- `{{args}}` inside `!{...}` được auto-escaped

#### 3. `@{...}` - Inject file content
```toml
prompt = """
Based on config:
@{package.json}

Directory:
@{src/}
"""
```
- File path → file content
- Directory path → recursive listing
- Supports images, PDFs
- Respects `.gitignore`

### Example Command

```toml
# git/commit.toml
description = "Generates a Git commit message"
prompt = """
Generate a Conventional Commit message:

```diff
!{git diff --staged}
```
"""
```

---

## Hooks

### Hook Events

| Event | Khi nào | Mục đích |
|-------|---------|----------|
| `SessionStart` | Bắt đầu phiên | Khởi tạo (matcher: startup, resume, clear) |
| `SessionEnd` | Kết thúc phiên | Cleanup (matcher: exit, clear, logout) |
| `BeforeAgent` | Trước khi AI xử lý | Inject context |
| `AfterAgent` | Sau khi AI xử lý | Post-processing |
| `BeforeModel` | Trước model call | Modify request |
| `AfterModel` | Sau model call | Process response |
| `BeforeToolSelection` | Trước chọn tool | Filter tools |
| `BeforeTool` | Trước khi tool chạy | Validate, block |
| `AfterTool` | Sau khi tool chạy | Log, auto-test |
| `PreCompress` | Trước compress context | Cleanup |
| `Notification` | System notifications | Alert handling |

### Cấu hình Hooks: `settings.json`

```json
{
  "hooks": {
    "BeforeTool": [{
      "matcher": "WriteFile|Edit",
      "hooks": [{
        "name": "security-check",
        "type": "command",
        "command": "$GEMINI_PROJECT_DIR/.gemini/hooks/before-tool.js",
        "timeout": 5000,
        "description": "Check for secrets"
      }]
    }],
    "AfterTool": [{
      "matcher": "*",
      "hooks": [{
        "name": "auto-test",
        "type": "command",
        "command": "$GEMINI_PROJECT_DIR/.gemini/hooks/auto-test.sh"
      }]
    }]
  }
}
```

### Matchers

- Exact: `"ReadFile"` → only ReadFile
- Regex: `"Write.*|Edit"` → WriteFile, WriteBinary, Edit
- Wildcard: `"*"` or `""` → all tools

### Hook Script Example

```bash
#!/usr/bin/env bash
# .gemini/hooks/block-secrets.sh

input=$(cat)  # Read JSON from stdin

# Extract content
content=$(echo "$input" | jq -r '.tool_input.content // ""')

# Check for secrets
if echo "$content" | grep -qE 'api[_-]?key|password|secret'; then
    echo '{"decision":"deny","reason":"Potential secret detected"}' >&2
    exit 2  # Block action
fi

exit 0  # Allow
```

### Hook Input/Output

**Input (JSON via stdin):**
```json
{
  "tool_name": "WriteFile",
  "tool_input": { "file_path": "...", "content": "..." },
  "session_id": "...",
  "turn_number": 5
}
```

**Output:**
```json
{
  "decision": "allow",  // or "deny"
  "systemMessage": "Message to show user"
}
```

**Exit codes:**
| Code | Ý nghĩa |
|------|---------|
| 0 | Success (allow) |
| 2 | Blocking error (deny) |

---

## MCP Servers

MCP (Model Context Protocol) cho phép tạo custom tools cho AI.

### Đăng ký trong settings.json

```json
{
  "mcpServers": {
    "my-tools": {
      "command": "node",
      "args": ["${extensionPath}${/}dist${/}server.js"],
      "cwd": "${extensionPath}",
      "env": {
        "API_KEY": "$MY_API_KEY"
      },
      "timeout": 30000,
      "trust": false,
      "includeTools": ["tool1", "tool2"],
      "excludeTools": ["dangerous_tool"]
    }
  },
  "mcp": {
    "allowed": ["trusted-server"],
    "excluded": ["experimental-server"]
  }
}
```

### Configuration Properties

**Required (one of):**
| Property | Description |
|----------|-------------|
| `command` | Executable path (Stdio) |
| `url` | SSE endpoint URL |
| `httpUrl` | HTTP streaming endpoint |

**Optional:**
| Property | Description |
|----------|-------------|
| `args` | Command-line arguments |
| `env` | Environment variables ($VAR_NAME syntax) |
| `cwd` | Working directory |
| `timeout` | Request timeout (default: 600000ms) |
| `trust` | Bypass confirmations (default: false) |
| `includeTools` | Allowlist of tools |
| `excludeTools` | Blocklist of tools |
| `headers` | HTTP headers for url/httpUrl |

### Tạo MCP Server (TypeScript)

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'my-server',
  version: '1.0.0',
});

// Đăng ký tool
server.tool(
  'tool_name',
  'Tool description',
  { 
    arg1: z.string().describe('Arg description'),
    arg2: z.number().optional()
  },
  async ({ arg1, arg2 }) => {
    // Tool logic here
    return {
      content: [{ type: 'text', text: 'Result' }]
    };
  }
);

// Return rich content (text + image)
server.tool('screenshot_tool', 'Capture screenshot', {}, async () => {
  return {
    content: [
      { type: 'text', text: 'Here is the screenshot:' },
      { type: 'image', data: base64ImageData, mimeType: 'image/png' }
    ]
  };
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### MCP Commands

```bash
# List MCP servers
gemini mcp list

# Add MCP server
gemini mcp add my-server --command "node server.js"

# Remove
gemini mcp remove my-server

# View in CLI
/mcp
```

---

## Built-in Tools

| Tool | Display Name | Description |
|------|--------------|-------------|
| `list_directory` | ReadFolder | List files in directory |
| `read_file` | ReadFile | Read file contents (text, images, PDF) |
| `write_file` | WriteFile | Write/create files |
| `replace` | Edit | Replace text in files |
| `glob` | FindFiles | Find files by pattern |
| `search_file_content` | SearchText | Search text in files |
| `run_shell_command` | Shell | Execute shell commands |
| `web_fetch` | WebFetch | Fetch URL content |
| `google_web_search` | WebSearch | Google search |
| `save_memory` | Memory | Save facts to GEMINI.md |

### Tool Parameters

**read_file:**
- `path` (required): Absolute file path
- `offset`, `limit` (optional): Line range for text files

**write_file:**
- `file_path` (required): Absolute file path
- `content` (required): Content to write

**replace (Edit):**
- `file_path` (required): Absolute file path
- `old_string` (required): Text to replace (include 3+ lines context)
- `new_string` (required): Replacement text
- `expected_replacements` (optional): Number of occurrences

**run_shell_command:**
- `command` (required): Shell command
- `description` (optional): Purpose description
- `directory` (optional): Working directory

---

## CLI Commands

### Slash Commands (`/`)

| Command | Description |
|---------|-------------|
| `/help` | Show help |
| `/model` | Select AI model |
| `/settings` | Configure settings |
| `/theme` | Change theme |
| `/stats` | Show token usage |
| `/clear` | Clear conversation |
| `/restore` | Restore checkpoint |
| `/mcp` | View MCP servers |
| `/extensions` | Manage extensions |
| `/quit` | Exit CLI |

### At Commands (`@`)

```bash
# Include file content in prompt
@path/to/file.txt Explain this

# Include directory
@src/ Summarize the code

# Git-aware filtering (ignores node_modules, etc.)
```

### Shell Mode (`!`)

```bash
# Execute shell command
!ls -la
!git status

# Toggle shell mode
!
```

---

## Themes

### Available Themes

**Dark:** ANSI, Atom One, Ayu, Default, Dracula, GitHub

**Light:** ANSI Light, Ayu Light, Default Light, GitHub Light, Google Code, Xcode

### Change Theme

```bash
/theme        # Show theme selector
/theme GitHub # Set specific theme
```

### Custom Theme in settings.json

```json
{
  "ui": {
    "theme": "GitHub"
  }
}
```

---

## Authentication

### Methods

| Method | Best For |
|--------|----------|
| **Login with Google** | Local machine (recommended) |
| **Gemini API Key** | Scripts, automation |
| **Vertex AI** | Enterprise, GCP projects |

### Login with Google

```bash
gemini
# Select "Login with Google"
```

### Gemini API Key

```bash
# Get key from https://aistudio.google.com/app/apikey
export GEMINI_API_KEY="YOUR_KEY"
gemini
# Select "Use Gemini API key"
```

### Vertex AI

```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
gcloud auth application-default login
gemini
```

---

## IDE Integration

### Features

- **Workspace context**: 10 most recent files, cursor position, selected text
- **Native diffing**: View changes in IDE's diff viewer
- **VS Code commands**: `Cmd+Shift+P` → "Gemini CLI: Run"

### Installation

1. **Automatic**: CLI prompts to install on first run
2. **Manual CLI**: `gemini extensions install gemini-cli-ide`
3. **Marketplace**: Search "Gemini CLI" in VS Code

### Enable

```json
{
  "ide": {
    "enabled": true
  }
}
```

---

## Memory Import

Import external files into GEMINI.md:

### Syntax

```markdown
# Main GEMINI.md
@./components/instructions.md
@./shared/configuration.md
```

### Supported Paths

- Relative: `@./path/to/file.md`
- Absolute: `@/absolute/path/file.md`

### Safety

- Circular import detection
- File access security
- Maximum import depth

---

## Trusted Folders

Security feature to control CLI behavior per workspace.

### Enable

```json
{
  "security": {
    "folderTrust": {
      "enabled": true
    }
  }
}
```

### Trust Options

- **Trust folder**: Current folder only
- **Trust parent**: Parent + all subdirectories
- **Don't trust**: Run in restricted mode

### Untrusted Restrictions

- Workspace settings ignored
- .env files not loaded
- MCP servers don't connect
- Custom commands not loaded
- Extensions can't be managed

---

## Token Caching

Automatic cost optimization for API key users.

### Availability

| Auth Method | Token Caching |
|-------------|---------------|
| Gemini API Key | ✅ Yes |
| Vertex AI | ✅ Yes |
| OAuth (Google Account) | ❌ No |

### View Stats

```bash
/stats
```

---

## Checkpointing

Auto-save project state before file modifications.

### Enable in settings.json

```json
{
  "general": {
    "checkpointing": {
      "enabled": true
    }
  }
}
```

### How it works

1. **Git snapshot** in `~/.gemini/history/<project_hash>`
2. **Conversation history** saved
3. **Tool call** stored

### Commands

```bash
/restore           # List checkpoints
/restore <index>   # Restore specific checkpoint
```

---

## Policy Engine

Fine-grained control over tool execution.

### Rule Format (TOML)

```toml
[[rule]]
toolName = "run_shell_command"
commandPrefix = "git "
decision = "ask_user"
priority = 100
```

### Decisions

| Decision | Effect |
|----------|--------|
| `allow` | Auto-approve |
| `deny` | Block |
| `ask_user` | Prompt for confirmation |

---

## Headless Mode

Run Gemini CLI programmatically.

### Basic Usage

```bash
# Direct prompt
gemini --prompt "What is machine learning?"

# Stdin
echo "Explain this" | gemini

# With file
cat README.md | gemini --prompt "Summarize this"

# JSON output
gemini --prompt "List 3 colors" --output-format json

# Streaming JSON
gemini --prompt "..." --output-format streaming-json
```

---

## Sandbox

Isolate tool execution in secure environment.

### Methods

| Method | Platform | Description |
|--------|----------|-------------|
| `seatbelt` | macOS | Built-in, lightweight via `sandbox-exec` |
| `docker` | All | Container-based, full isolation |
| `podman` | All | Container-based alternative |

### Enable Sandbox

```bash
# Command flag
gemini -s -p "analyze code"

# Environment variable
export GEMINI_SANDBOX=true

# settings.json
{
  "tools": {
    "sandbox": "docker"
  }
}
```

---

## Settings Reference

Use `/settings` command to configure:

### Categories

| Category | Key Settings |
|----------|--------------|
| **General** | `vimMode`, `previewFeatures`, `sessionRetention` |
| **UI** | `theme`, `hideBanner`, `hideTips`, `showLineNumbers` |
| **Model** | `maxSessionTurns`, `compressionThreshold` |
| **Context** | `respectGitIgnore`, `respectGeminiIgnore` |
| **Tools** | `autoAccept`, `useRipgrep`, `sandbox` |
| **Security** | `disableYoloMode`, `blockGitExtensions` |

### Example settings.json

```json
{
  "general": {
    "vimMode": true,
    "sessionRetention": { "enabled": true, "maxAge": "30d" }
  },
  "ui": {
    "theme": "GitHub",
    "hideBanner": true
  },
  "tools": {
    "sandbox": "docker"
  },
  "model": {
    "name": "gemini-1.5-pro-latest"
  }
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Submit input |
| `Esc` | Cancel |
| `Ctrl+C` | Stop current operation |
| `Ctrl+D` | Exit CLI |
| `Ctrl+L` | Clear screen |
| `Ctrl+A` / `Home` | Move to start |
| `Ctrl+E` / `End` | Move to end |
| `Ctrl+K` | Delete to end of line |
| `Ctrl+U` | Delete to start of line |
| `Ctrl+R` | Search history |
| `Up/Down` | Navigate history |
| `Shift+Up/Down` | Scroll output |
| `Ctrl+X` | Open in external editor |
| `Ctrl+V` | Paste from clipboard |
| `Shift+Enter` | New line (multi-line input) |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | API key for Gemini |
| `GEMINI_MODEL` | Default model (e.g., `gemini-2.5-flash`) |
| `GOOGLE_CLOUD_PROJECT` | GCP Project ID |
| `GOOGLE_API_KEY` | Google Cloud API key |
| `GEMINI_SANDBOX` | Enable sandbox (`true`/`false`) |
| `GEMINI_TELEMETRY_ENABLED` | Enable telemetry |

### .env File Loading Order

1. `.env` in current directory
2. Parent directories (up to git root)
3. `~/.env` (home directory)

---

## Command-Line Arguments

| Argument | Description |
|----------|-------------|
| `-p, --prompt` | Non-interactive mode |
| `-i, --prompt-interactive` | Start interactive with prompt |
| `-m, --model` | Specify model |
| `-s, --sandbox` | Enable sandbox |
| `-d, --debug` | Debug mode |
| `--yolo` | Auto-approve all tools |
| `--approval-mode` | `default`, `auto_edit`, `yolo` |
| `--output-format` | `text`, `json`, `stream-json` |
| `--allowed-tools` | Tools to bypass confirmation |
| `-e, --extensions` | Specify extensions |

---

## Hooks Best Practices

### Security

1. **Validate inputs** - Never trust JSON without validation
2. **Use timeouts** - Fast: 1-5s, Network: 10-30s, Heavy: 30-60s
3. **Limit permissions** - Don't run as root
4. **Scan for secrets** - Check for API keys, passwords
5. **Sandbox untrusted hooks** - Run in Docker

### Performance

1. **Keep hooks fast** - Use parallel operations
2. **Cache expensive operations** - Store results
3. **Use appropriate events** - AfterAgent vs AfterModel
4. **Filter with matchers** - Avoid `"*"` when possible

---

## Variables

Các biến có thể dùng trong extension config:

| Variable | Description |
|----------|-------------|
| `${extensionPath}` | Path to extension directory |
| `${/}` | Platform-specific path separator |
| `$GEMINI_PROJECT_DIR` | Current project directory |
| `$VAR_NAME` | Environment variable |

---

## Quick Reference Links

| Topic | URL |
|-------|-----|
| Extensions | https://geminicli.com/docs/extensions |
| Extension Releasing | https://geminicli.com/docs/extensions/extension-releasing |
| Custom Commands | https://geminicli.com/docs/cli/custom-commands |
| Hooks | https://geminicli.com/docs/hooks |
| Writing Hooks | https://geminicli.com/docs/hooks/writing-hooks |
| Hooks Best Practices | https://geminicli.com/docs/hooks/best-practices |
| MCP Servers | https://geminicli.com/docs/tools/mcp-server |
| Tools | https://geminicli.com/docs/tools |
| File System Tools | https://geminicli.com/docs/tools/file-system |
| Shell Tool | https://geminicli.com/docs/tools/shell |
| Memory Tool | https://geminicli.com/docs/tools/memory |
| Checkpointing | https://geminicli.com/docs/cli/checkpointing |
| Policy Engine | https://geminicli.com/docs/core/policy-engine |
| Headless Mode | https://geminicli.com/docs/cli/headless |
| Sandbox | https://geminicli.com/docs/cli/sandbox |
| Settings | https://geminicli.com/docs/cli/settings |
| Keyboard Shortcuts | https://geminicli.com/docs/cli/keyboard-shortcuts |
| Model Selection | https://geminicli.com/docs/cli/model |
| Configuration | https://geminicli.com/docs/get-started/configuration |
| Authentication | https://geminicli.com/docs/get-started/authentication |
| FAQ | https://geminicli.com/docs/faq |
