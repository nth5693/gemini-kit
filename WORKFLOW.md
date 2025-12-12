# WORKFLOW PROCESS

> **File này định nghĩa QUY TRÌNH LÀM VIỆC mà AI PHẢI theo.**
> **ĐỌC FILE NÀY ĐẦU TIÊN khi bắt đầu mỗi phiên.**

---

## 🔄 QUY TRÌNH BẮT BUỘC

### Bước 0: ĐỌC CÁC FILE SAU (TRƯỚC KHI LÀM BẤT CỨ ĐIỀU GÌ)

```
1. ĐỌC WORKFLOW.md (file này)
2. ĐỌC CLAUDEKIT_REFERENCE.md (tài liệu chính thức)
3. ĐỌC SESSION_LOG.md (biết phiên trước làm gì)
4. ĐỌC TASKS.md (biết task hiện tại)
5. ĐỌC CLAUDE.md (project rules)
```

---

## 📋 WORKFLOW THEO CLAUDEKIT

### Khi implement một feature mới:

```
┌─────────────────────────────────────────────────────────┐
│                    USER REQUEST                          │
│              "Implement [feature X]"                     │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 1: PLANNER AGENT                                   │
│  ─────────────────────                                   │
│  • Nghiên cứu best practices                             │
│  • Phân tích codebase hiện tại                          │
│  • Tạo implementation plan                               │
│  • LƯU plan vào plans/feature-name.md                   │
│  • XIN APPROVAL từ user                                  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼ (Sau khi user approve)
┌─────────────────────────────────────────────────────────┐
│  STEP 2: SCOUT AGENT                                     │
│  ───────────────────                                     │
│  • Tìm kiếm files liên quan                             │
│  • Xác định integration points                          │
│  • Liệt kê dependencies                                  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 3: IMPLEMENTATION                                  │
│  ──────────────────────                                  │
│  • Viết code theo plan                                   │
│  • Tuân thủ code standards                              │
│  • Tạo tests cùng lúc                                   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 4: TESTER AGENT                                    │
│  ───────────────────                                     │
│  • Chạy test suite                                       │
│  • Validate security                                     │
│  • Check coverage                                        │
│  • Sửa lỗi nếu có                                       │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 5: CODE-REVIEWER AGENT                             │
│  ───────────────────────────                             │
│  • Review code quality                                   │
│  • Check best practices                                  │
│  • Validate security patterns                           │
│  • Đề xuất cải thiện                                    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 6: DOCS-MANAGER AGENT                              │
│  ──────────────────────────                              │
│  • Update API documentation                              │
│  • Update README nếu cần                                │
│  • Update architecture docs                             │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 7: GIT-MANAGER AGENT                               │
│  ─────────────────────────                               │
│  • Stage all changes                                     │
│  • Create conventional commit                           │
│  • Push to remote (nếu được yêu cầu)                   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 8: CẬP NHẬT FILES                                  │
│  ──────────────────────                                  │
│  • Cập nhật TASKS.md (mark completed)                   │
│  • Cập nhật SESSION_LOG.md                              │
│  • Cập nhật context.json                                │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ RULES BẮT BUỘC

### KHÔNG ĐƯỢC:
1. ❌ Skip bất kỳ step nào
2. ❌ Implement trước khi có plan được approve
3. ❌ Quên cập nhật TASKS.md và SESSION_LOG.md
4. ❌ Tự ý thay đổi kiến trúc
5. ❌ Làm khác với ClaudeKit behavior

### PHẢI:
1. ✅ Đọc file này đầu tiên mỗi phiên
2. ✅ Theo đúng 8 steps trên
3. ✅ Xin approval trước khi implement
4. ✅ Cập nhật tất cả tracking files
5. ✅ Tham chiếu CLAUDEKIT_REFERENCE.md khi cần

---

## 📊 CURRENT STATE (Cập nhật real-time)

**Session:** 4
**Version:** 0.2.1
**Phase:** Complete + Skills Upgrade
**Current Task:** Skills Upgrade Phase 1
**Next Step:** Coder file writing capability

---

## 🔗 FILE REFERENCES

| File | Link |
|------|------|
| ClaudeKit Reference | [CLAUDEKIT_REFERENCE.md](./CLAUDEKIT_REFERENCE.md) |
| Tasks | [TASKS.md](./TASKS.md) |
| Session Log | [SESSION_LOG.md](./SESSION_LOG.md) |
| Implementation Plan | [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) |
| Project Rules | [CLAUDE.md](./CLAUDE.md) |

---

## 📝 CHECKLIST MỖI PHIÊN

```
[ ] Đã đọc WORKFLOW.md
[ ] Đã đọc CLAUDEKIT_REFERENCE.md
[ ] Đã đọc SESSION_LOG.md
[ ] Đã đọc TASKS.md
[ ] Đã xác nhận task với user
[ ] Đã cập nhật TASKS.md sau khi hoàn thành
[ ] Đã cập nhật SESSION_LOG.md cuối phiên
```
