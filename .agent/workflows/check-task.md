---
description: Kiểm tra và cập nhật tracking files sau khi hoàn thành task
---

# Workflow: Check Task - Cập nhật Tracking Files

## 📁 DANH SÁCH FILES QUAN TRỌNG

### Files BẮT BUỘC đọc mỗi phiên:
| File | Đường dẫn |
|------|-----------|
| Session Log | `/Users/hieu/Dev/gemini-kit/SESSION_LOG.md` |
| Tasks | `/Users/hieu/Dev/gemini-kit/TASKS.md` |
| Implementation Plan | `/Users/hieu/Dev/gemini-kit/IMPLEMENTATION_PLAN.md` |
| Workflow | `/Users/hieu/Dev/gemini-kit/WORKFLOW.md` |
| Project Rules | `/Users/hieu/Dev/gemini-kit/CLAUDE.md` |
| Changelog | `/Users/hieu/Dev/gemini-kit/CHANGELOG.md` |
| ClaudeKit Reference | `/Users/hieu/Dev/gemini-kit/CLAUDEKIT_REFERENCE.md` |

### Files phụ trợ:
| File | Đường dẫn |
|------|-----------|
| README | `/Users/hieu/Dev/gemini-kit/README.md` |
| Contributing | `/Users/hieu/Dev/gemini-kit/CONTRIBUTING.md` |
| Code Standards | `/Users/hieu/Dev/gemini-kit/docs/code-standards.md` |

---

## Bước 1: TÓM TẮT NHỮNG GÌ ĐÃ LÀM

```
📋 Session Summary:
- Files đã tạo/sửa: [list]
- Features: [list]
- Tests: [X/X]
- Version: [X.X.X]
```

## Bước 2: CHECKLIST CẬP NHẬT

```
[ ] SESSION_LOG.md - Thêm session entry
[ ] TASKS.md - Mark [x] completed, update version
[ ] CHANGELOG.md - Thêm entry nếu version mới
[ ] IMPLEMENTATION_PLAN.md - Update nếu có thay đổi lớn
[ ] WORKFLOW.md - Update Current State nếu cần
```

## Bước 3: CẬP NHẬT FILES

// turbo
```bash
# Xem session hiện tại
tail -30 /Users/hieu/Dev/gemini-kit/SESSION_LOG.md
```

### SESSION_LOG.md:
```markdown
## Session [N] - [DATE TIME]
### 📌 Mục tiêu phiên
### ✅ Đã hoàn thành
### 📁 Files đã tạo/sửa
### 📊 Stats
### 🔜 Task tiếp theo
```

### TASKS.md:
- Update status table (version, build)
- Mark completed [x]
- Add new tasks [ ]

### CHANGELOG.md (nếu version mới):
```markdown
## [x.x.x] - YYYY-MM-DD
### Added / Changed / Fixed / Removed
```

## Bước 4: XÁC NHẬN VỚI USER

```
✅ Đã cập nhật tracking files:
- [ ] SESSION_LOG.md - Session [N]
- [ ] TASKS.md - v[X.X.X]
- [ ] CHANGELOG.md - v[X.X.X]

Bạn muốn commit những thay đổi này không?
```

## ⚠️ QUAN TRỌNG:
- KHÔNG kết thúc session mà chưa update files
- KHÔNG commit mà chưa update CHANGELOG (nếu có version mới)
- LUÔN hỏi user trước khi commit
