# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 4.x.x   | :white_check_mark: |
| 3.x.x   | :white_check_mark: |
| < 3.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Gemini-Kit, please report it responsibly:

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email: [Create a private security advisory](https://github.com/nth5693/gemini-kit/security/advisories/new)
3. Or contact via GitHub Discussions (private message)

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

| Action | Timeline |
|--------|----------|
| Initial response | Within 48 hours |
| Status update | Within 7 days |
| Fix release | Within 30 days (critical: 7 days) |

## Security Features

Gemini-Kit includes built-in security protections:

### 1. Secret Detection (30+ patterns)
The `before-tool` hook automatically detects and blocks:
- AWS Access Keys & Secrets
- GitHub/GitLab Tokens
- OpenAI/Anthropic API Keys
- Private Keys (RSA, SSH, PEM)
- Database Connection Strings
- JWT Secrets

### 2. Command Blocking
Dangerous commands are blocked:
- `rm -rf /`
- Fork bombs
- Pipe to shell (`curl | sh`)

### 3. Path Traversal Protection
All file operations validate paths using `validatePath()` to prevent:
- Directory traversal attacks (`../`)
- Access to sensitive system files

### 4. Checkpoint System
Before making changes:
- `kit_create_checkpoint` - Creates git checkpoint
- `kit_restore_checkpoint` - Rollback if needed

### 5. Dry-Run Mode
- `/code-preview` - Preview changes before applying

## Best Practices

### For Users

1. **Review changes** before accepting AI-generated code
2. **Use checkpoints** before large operations
3. **Don't store secrets** in your codebase
4. **Review diffs** before committing

### For Contributors

1. Run `npm test` before submitting PRs
2. Run `npm run lint` to check code quality
3. Add tests for security-sensitive features
4. Follow secure coding practices

## Acknowledgments

We thank the security researchers who help keep Gemini-Kit safe.
