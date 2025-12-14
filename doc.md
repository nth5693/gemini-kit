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
7. [Checkpointing](#checkpointing)
8. [Policy Engine](#policy-engine)
9. [Headless Mode](#headless-mode)
10. [Variables](#variables)

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

| Tool | Description |
|------|-------------|
| `read_file` | Read file contents |
| `write_file` | Write/create files |
| `edit` | Edit existing files |
| `run_shell_command` | Execute shell commands |
| `web_fetch` | Fetch URL content |
| `google_web_search` | Google search |
| `save_memory` | Save to memory |
| `write_todos` | Manage TODOs |

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
| Custom Commands | https://geminicli.com/docs/cli/custom-commands |
| Hooks | https://geminicli.com/docs/hooks |
| Writing Hooks | https://geminicli.com/docs/hooks/writing-hooks |
| MCP Servers | https://geminicli.com/docs/tools/mcp-server |
| Tools | https://geminicli.com/docs/tools |
| Checkpointing | https://geminicli.com/docs/cli/checkpointing |
| Policy Engine | https://geminicli.com/docs/core/policy-engine |
| Headless Mode | https://geminicli.com/docs/cli/headless |
| Sandbox | https://geminicli.com/docs/cli/sandbox |
| Configuration | https://geminicli.com/docs/get-started/configuration |
| FAQ | https://geminicli.com/docs/faq |
