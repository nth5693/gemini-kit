---
description: Interactive project setup wizard. Creates product, tech-stack, and guidelines context files.
---

# /kit:setup - Project Setup Wizard

Create context files for new projects with an interactive wizard.

> **Why setup?** Context files help AI understand your project better, providing more accurate responses.

## When To Use

- When starting a new project
- When onboarding a new team member
- When you want to standardize project context

---

## Workflow

### Step 1: Product Context

Collect information:
- Product description
- Target users
- Goals
- Key features

**Output:** `.gemini-kit/product.md`

### Step 2: Tech Stack

Collect information:
- Language (TypeScript, Python, etc.)
- Framework (Next.js, FastAPI, etc.)
- Database (PostgreSQL, MongoDB, etc.)
- Other tools (Redis, S3, etc.)

**Output:** `.gemini-kit/tech-stack.md`

### Step 3: Guidelines

Collect information:
- Code style (formatting, naming)
- Commit conventions (conventional commits?)
- Testing requirements
- Documentation standards

**Output:** `.gemini-kit/guidelines.md`

---

## Generated Files

```
.gemini-kit/
├── product.md           # Product context
├── tech-stack.md        # Technical choices
└── guidelines.md        # Team conventions
```

---

## Example Output

### product.md
```markdown
# Product: Gemini-Kit

## Description
Multi-agent AI development toolkit for Gemini CLI.

## Target Users
- Developers using Gemini CLI
- Teams wanting structured AI workflows

## Goals
- Accelerate development with AI
- Maintain code quality with specialized agents

## Key Features
- 15 specialized agents
- 32+ workflows
- Knowledge compounding system
```

---

## Handoff

After setup complete:
```
✓ Setup complete!

Files created:
- .gemini-kit/product.md
- .gemini-kit/tech-stack.md
- .gemini-kit/guidelines.md

Next steps:
1. Review and edit the generated files
2. Start working with /plan or /work
```