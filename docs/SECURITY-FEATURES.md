# Security Features

This document describes the built-in security features of Gemini-Kit.

## Overview

Gemini-Kit includes multiple layers of security to protect your codebase and development environment.

---

## 1. Secret Detection (30+ Patterns)

**Location**: `hooks/before-tool.js`

The `before-tool` hook automatically scans for secrets before any tool execution:

### Detected Patterns

| Type | Pattern Example |
|------|-----------------|
| AWS Access Key | `AKIA...` |
| AWS Secret | `aws_secret_access_key` |
| GitHub Token | `ghp_...`, `gho_...`, `ghu_...` |
| GitLab Token | `glpat-...` |
| OpenAI API Key | `sk-...` |
| Anthropic API Key | `sk-ant-...` |
| Google API Key | `AIza...` |
| Slack Token | `xox[baprs]-...` |
| Private Keys | `-----BEGIN RSA PRIVATE KEY-----` |
| Database URLs | `mongodb://`, `postgres://`, `mysql://` |
| JWT Secrets | `jwt_secret`, `JWT_SECRET` |
| Generic Secrets | `password=`, `api_key=`, `secret=` |

### How It Works

```javascript
// hooks/before-tool.js
const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/,           // AWS Access Key
  /ghp_[a-zA-Z0-9]{36}/,        // GitHub PAT
  /sk-[a-zA-Z0-9]{48}/,         // OpenAI Key
  // ... 30+ more patterns
];
```

---

## 2. Dangerous Command Blocking

**Location**: `hooks/before-tool.js`

Blocks potentially destructive commands:

| Blocked | Reason |
|---------|--------|
| `rm -rf /` | System destruction |
| `:(){ :\|:& };:` | Fork bomb |
| `curl \| sh` | Remote code execution |
| `wget \| bash` | Remote code execution |
| `chmod 777` | Insecure permissions |

---

## 3. Path Traversal Protection

**Location**: `src/tools/security.ts`

The `validatePath()` function prevents:

- Directory traversal (`../../../etc/passwd`)
- Access to sensitive system files
- Writing outside project directory

```typescript
// src/tools/security.ts
export function validatePath(filePath: string, basePath: string): boolean {
  const resolved = path.resolve(basePath, filePath);
  return resolved.startsWith(basePath);
}
```

---

## 4. Checkpoint System

**Location**: MCP Tools

Before making changes, create a checkpoint:

| Tool | Function |
|------|----------|
| `kit_create_checkpoint` | Save current git state |
| `kit_restore_checkpoint` | Rollback to checkpoint |

### Usage

```bash
# In Gemini CLI
> Create a checkpoint before making changes
> [AI uses kit_create_checkpoint]

# If something goes wrong
> Restore the last checkpoint
> [AI uses kit_restore_checkpoint]
```

---

## 5. Dry-Run Mode

**Command**: `/code-preview`

Preview changes before applying:

```bash
> /code-preview Add error handling to UserService
# [Shows diff without applying changes]
```

---

## 6. File Size Limits

**Location**: `src/tools/knowledge.ts`

Prevents DoS attacks via large file operations:

- Max file size for indexing: 1MB
- Max output size: Configurable limit
- Prevents memory exhaustion

---

## 7. Input Validation (Zod Schemas)

**Location**: `src/tools/*.ts`

All tool inputs are validated using Zod schemas:

```typescript
const ToolInputSchema = z.object({
  path: z.string().max(500),
  content: z.string().max(100000),
});
```

---

## 8. Test Coverage

| Component | Tests | Coverage |
|-----------|-------|----------|
| Security utilities | 32 | High |
| Path validation | 8 | 100% |
| Secret detection | 15 | High |
| **Total** | 291 | ~81% |

---

## Configuration

### Disable Specific Checks

In `.gemini/settings.json`:

```json
{
  "gemini-kit": {
    "security": {
      "secretDetection": true,
      "commandBlocking": true,
      "pathValidation": true
    }
  }
}
```

---

## Reporting Security Issues

See [SECURITY.md](../SECURITY.md) for vulnerability reporting process.
