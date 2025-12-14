---
description: Tham khảo Gemini CLI docs (extensions, hooks, commands, MCP)
---

# Gemini CLI Documentation Reference

> Workflow này dùng để đọc tài liệu Gemini CLI trước khi làm việc với extension.

## Steps

// turbo-all

### 1. Đọc doc.md (tổng hợp docs từ geminicli.com)
```
view_file /Users/hieu/Dev/gemini-kit/doc.md
```

### 2. Kiểm tra extension hiện tại
```
ls -la ~/.gemini/extensions/gemini-kit/
```

### 3. Xem cấu trúc commands
```
ls ~/.gemini/extensions/gemini-kit/commands/
```

---

## Quick Reference

### Extension Structure
```
~/.gemini/extensions/gemini-kit/
├── gemini-extension.json   ← Config chính
├── GEMINI.md              ← Context cho AI
├── settings.json          ← Config hooks
├── commands/              ← TOML commands
├── hooks/                 ← Hook scripts
├── src/                   ← Source code
└── dist/                  ← Built files
```

### TOML Command Format
```toml
description = "Mô tả"

prompt = """
Prompt cho AI.
Task: {{args}}
"""
```

### Hook Events
- `SessionStart` - Bắt đầu phiên
- `BeforeAgent` - Trước khi AI xử lý
- `BeforeTool` - Trước khi tool chạy
- `AfterTool` - Sau khi tool chạy
- `SessionEnd` - Kết thúc phiên

### MCP Server
- Đăng ký trong `gemini-extension.json`
- Dùng `@modelcontextprotocol/sdk`
- Tools được AI tự động gọi

### Lệnh thường dùng
```bash
gemini extensions list          # List extensions
gemini extensions link $(pwd)   # Link extension
/help                           # Xem commands
```
