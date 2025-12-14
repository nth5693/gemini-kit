# Gemini CLI Documentation Summary

> Tổng hợp từ https://geminicli.com/docs/

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Extensions](#extensions)
3. [Custom Commands](#custom-commands)
4. [Hooks](#hooks)
5. [MCP Servers](#mcp-servers)
6. [Variables](#variables)

---

## Tổng Quan

Gemini CLI là một REPL (Read-Eval-Print Loop) mang capabilities của Gemini models đến terminal.

**Kiến trúc:**
- `packages/cli` - Client-side application
- `packages/core` - Local server, quản lý requests đến Gemini API

---

## Extensions

### Cài đặt Extension

```bash
# Cài từ GitHub
gemini extensions install github.com/username/extension-name

# Link local extension
gemini extensions link ~/.gemini/extensions/my-extension

# List extensions
/extensions list

# Gỡ cài đặt
gemini extensions uninstall extension-name
```

### File cấu hình: `gemini-extension.json`

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "mcpServers": {
    "my-server": {
      "command": "node my-server.js"
    }
  },
  "contextFileName": "GEMINI.md",
  "excludeTools": ["run_shell_command(rm -rf)"]
}
```

**Các trường:**
| Trường | Mô tả |
|--------|-------|
| `name` | Tên extension (lowercase, dùng dashes) |
| `version` | Phiên bản |
| `mcpServers` | Map các MCP servers |
| `contextFileName` | File context cho AI (mặc định: GEMINI.md) |
| `excludeTools` | Tools bị chặn |

### Commands trong Extension

Đặt files `.toml` trong thư mục `commands/` của extension.

---

## Custom Commands

### Vị trí files

| Loại | Đường dẫn | Ưu tiên |
|------|-----------|---------|
| User (global) | `~/.gemini/commands/` | Thấp |
| Project (local) | `<project>/.gemini/commands/` | Cao |
| Extension | `~/.gemini/extensions/<ext>/commands/` | Trung bình |

**Namespacing:**
- `commands/test.toml` → `/test`
- `commands/git/commit.toml` → `/git:commit`

### TOML Format

```toml
description = "Mô tả ngắn về command"

prompt = """
Prompt gửi cho AI model.

Task: {{args}}

Context:
!{ls -la}
"""
```

**Các trường:**
| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| `description` | ✅ | Mô tả hiển thị trong `/help` |
| `prompt` | ✅ | Nội dung prompt gửi cho AI |

### Xử lý Arguments

#### 1. `{{args}}` - Inject user input

```toml
prompt = "Please fix: {{args}}"
```

Khi chạy `/fix "Button misaligned"` → `Please fix: "Button misaligned"`

#### 2. `!{...}` - Run shell command

```toml
prompt = """
Git changes:
!{git diff --staged}
"""
```

- Shell command được chạy trước
- Output được inject vào prompt
- User được confirm trước khi chạy

**Kết hợp:**
```toml
prompt = """
Search for: {{args}}
Results:
!{grep -r {{args}} .}
"""
```

`{{args}}` trong `!{...}` được auto-escape để tránh injection.

#### 3. `@{...}` - Inject file content

```toml
prompt = """
Based on this config:
@{package.json}
"""
```

---

## Hooks

### Hook là gì?

Hooks cho phép chạy code tại các thời điểm nhất định trong lifecycle của Gemini CLI.

**Use cases:**
- Thêm context trước khi AI xử lý
- Validate và chặn actions nguy hiểm
- Enforce security policies
- Log interactions
- Điều chỉnh behavior động

### Hook Events

| Event | Khi nào | Mục đích |
|-------|---------|----------|
| `SessionStart` | Bắt đầu phiên | Khởi tạo |
| `BeforeAgent` | Trước khi AI xử lý | Inject context |
| `BeforeTool` | Trước khi tool chạy | Validate, block |
| `AfterTool` | Sau khi tool chạy | Log, auto-test |
| `SessionEnd` | Kết thúc phiên | Cleanup |

### Cấu hình Hooks: `settings.json`

```json
{
  "hooks": {
    "BeforeTool": [{
      "matcher": "WriteFile|Edit",
      "hooks": [{
        "name": "security-check",
        "type": "command",
        "command": "node hooks/before-tool.js",
        "timeout": 5000
      }]
    }]
  }
}
```

**Các trường:**
| Trường | Mô tả |
|--------|-------|
| `matcher` | Regex pattern để match events |
| `name` | Tên hook |
| `type` | `command` (chạy script) |
| `command` | Lệnh chạy |
| `timeout` | Timeout (ms) |

### Hook Script

**Input:** JSON từ stdin
**Output:** JSON đến stdout

```javascript
#!/usr/bin/env node
const input = await new Promise(resolve => {
  let data = '';
  process.stdin.on('data', chunk => data += chunk);
  process.stdin.on('end', () => resolve(data));
});

const data = JSON.parse(input);

// Process...

// Output
console.log(JSON.stringify({
  decision: 'allow',  // hoặc 'deny'
  systemMessage: 'Message cho user'
}));
```

**Exit codes:**
| Code | Ý nghĩa |
|------|---------|
| 0 | Success |
| 2 | Blocking error (chặn action) |

---

## MCP Servers

MCP (Model Context Protocol) cho phép tạo custom tools cho AI.

### Đăng ký trong extension

```json
{
  "mcpServers": {
    "my-tools": {
      "command": "node",
      "args": ["${extensionPath}${/}dist${/}server.js"],
      "cwd": "${extensionPath}"
    }
  }
}
```

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
  { arg1: z.string().describe('Arg description') },
  async ({ arg1 }) => {
    return {
      content: [{ type: 'text', text: 'Result' }]
    };
  }
);

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## Variables

Các biến có thể dùng trong extension config:

| Biến | Giá trị |
|------|---------|
| `${extensionPath}` | Đường dẫn đến thư mục extension |
| `${/}` | Path separator (cross-platform) |

**Ví dụ:**
```json
"args": ["${extensionPath}${/}dist${/}server.js"]
```

---

## Quick Reference

### File Structure

```
~/.gemini/extensions/my-extension/
├── gemini-extension.json   ← Config chính
├── GEMINI.md              ← Context cho AI
├── settings.json          ← Config hooks
├── commands/              ← TOML commands
│   ├── cmd1.toml
│   └── subfolder/
│       └── cmd2.toml     ← /subfolder:cmd2
├── hooks/                 ← Hook scripts
│   ├── session-start.js
│   └── before-tool.js
├── src/                   ← Source code
│   └── server.ts         ← MCP server
└── dist/                  ← Built files
```

### Lệnh thường dùng

```bash
# Link extension
gemini extensions link $(pwd)

# List extensions
gemini extensions list

# Xem commands
/help

# Chạy command
/command-name arguments
```

---

*Cập nhật lần cuối: 2024-12-14*
