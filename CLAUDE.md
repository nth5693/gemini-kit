# GEMINI-KIT PROJECT INSTRUCTIONS

> ⚠️ **BẮT BUỘC ĐỌC FILE NÀY ĐẦU TIÊN MỖI PHIÊN LÀM VIỆC**
> AI assistant PHẢI tuân theo quy trình trong file này.

---

## 🚨 NGAY LẬP TỨC KHI BẮT ĐẦU PHIÊN

**TRƯỚC KHI LÀM BẤT CỨ ĐIỀU GÌ, PHẢI:**

```
1. ĐỌC SESSION_LOG.md (xem phần cuối - session mới nhất)
2. ĐỌC TASKS.md (biết task hiện tại và tiếp theo)
3. ĐỌC WORKFLOW.md (nếu cần nhắc lại 8 steps)
4. XÁC NHẬN với user về task tiếp theo
```

**SAU ĐÓ BÁO CÁO:**
```
✅ Đã đọc SESSION_LOG.md - Session [N] là mới nhất
✅ Đã đọc TASKS.md - Task tiếp theo là [X]
📊 Version: [X], Build: [X]KB
```

---

## 🚨 TRƯỚC KHI KẾT THÚC PHIÊN

**BẮT BUỘC PHẢI:**

```
1. CẬP NHẬT TASKS.md (mark completed, update build size)
2. CẬP NHẬT SESSION_LOG.md (thêm session mới)
3. CẬP NHẬT CHANGELOG.md (nếu có feature mới)
4. COMMIT với message rõ ràng
5. BÁO CÁO: "✅ Tracking files updated"
```

---

## 📋 Project Overview

**Dự án:** Gemini-Kit - ClaudeKit-style AI Development Assistant
**Tech Stack:** TypeScript, Node.js, Commander.js
**AI Models:** Gemini (primary), Claude, OpenAI
**Version:** 0.2.1 | **Build:** 141KB | **Agents:** 15 | **Commands:** 43+

---

## 🏗️ Architecture

```
gemini-kit/
├── src/agents/        # 15 agents (all with team context)
├── src/commands/      # 43+ commands
├── src/providers/     # Gemini, Claude, OpenAI, CLIProxyAPI
├── src/context/       # TeamContext, SessionManager
└── src/cli/index.ts
```

---

## 📁 Key Files

| File | Khi nào đọc |
|------|-------------|
| `SESSION_LOG.md` | **ĐẦU TIÊN** - biết phiên trước làm gì |
| `TASKS.md` | **THỨ HAI** - biết task hiện tại |
| `WORKFLOW.md` | Khi cần nhắc 8-step workflow |
| `CLAUDEKIT_REFERENCE.md` | Khi cần tham chiếu ClaudeKit |
| `CHANGELOG.md` | Khi thêm feature mới |

---

## 🔄 8-Step Workflow (Khi implement feature)

```
1. PLANNER - Tạo plan, XIN APPROVAL
2. SCOUT - Tìm files liên quan
3. IMPLEMENTATION - Viết code
4. TESTER - Chạy tests
5. CODE-REVIEWER - Review
6. DOCS-MANAGER - Update docs
7. GIT-MANAGER - Commit
8. UPDATE TRACKING FILES - TASKS.md, SESSION_LOG.md
```

---

## ⚠️ QUY TẮC BẮT BUỘC

### KHÔNG ĐƯỢC:
1. ❌ Bắt đầu làm việc mà không đọc SESSION_LOG.md và TASKS.md
2. ❌ Implement trước khi có plan được approve
3. ❌ Kết thúc phiên mà không update tracking files
4. ❌ Quên commit sau khi update

### PHẢI:
1. ✅ Đọc tracking files đầu tiên mỗi phiên
2. ✅ Update tracking files cuối mỗi phiên
3. ✅ Xin approval trước khi implement
4. ✅ Commit sau mỗi feature hoàn thành

---

## 📊 Current State

**Session:** 4
**Version:** 0.2.1
**Build:** 141KB
**Next Task:** Skills Upgrade Phase 1

---

## 🔗 Slash Commands

- `/start-session` - Bắt đầu phiên làm việc
- `/end-session` - Kết thúc phiên làm việc
