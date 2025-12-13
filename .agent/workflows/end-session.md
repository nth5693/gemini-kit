---
description: Kết thúc phiên làm việc với gemini-kit
---

# Workflow: Kết thúc phiên làm việc

## 📁 FILES PHẢI CẬP NHẬT

| File | Bắt buộc | Khi nào |
|------|----------|---------|
| `SESSION_LOG.md` | ✅ LUÔN | Mọi session |
| `TASKS.md` | ✅ LUÔN | Mọi session |
| `CHANGELOG.md` | ⚠️ Có thể | Khi có version mới |
| `IMPLEMENTATION_PLAN.md` | ⚠️ Có thể | Khi có thay đổi lớn |
| `WORKFLOW.md` | ⚠️ Có thể | Khi cập nhật Current State |

---

## Bước 1: CẬP NHẬT SESSION_LOG.md (BẮT BUỘC)

Thêm vào cuối file (trước `<!-- Thêm session mới -->`):

```markdown
## Session [N] - [DATE TIME]

### 📌 Mục tiêu phiên
- [Mục tiêu]

### ✅ Đã hoàn thành
- [Task 1]
- [Task 2]

### 📁 Files đã tạo/sửa
- [file1.ts]
- [file2.ts]

### 📊 Stats
- **Version**: x.x.x
- **Build**: xxxKB
- **Tests**: x/x ✅

### 🔜 Task tiếp theo
- [Next task]
```

## Bước 2: CẬP NHẬT TASKS.md (BẮT BUỘC)

```
- Mark completed tasks với [x]
- Update version và build size
- Thêm tasks mới nếu có
```

## Bước 3: CẬP NHẬT CHANGELOG.md (NẾU CÓ VERSION MỚI)

```markdown
## [x.x.x] - YYYY-MM-DD

### Added
- [Feature mới]

### Changed
- [Thay đổi]

### Fixed
- [Bug fix]
```

## Bước 4: COMMIT

```bash
git add -A
git commit -m "docs: update session [N]"
```

## Bước 5: XÁC NHẬN

```
✅ SESSION_LOG.md - Session [N]
✅ TASKS.md - v[X.X.X]
✅ CHANGELOG.md - v[X.X.X] (nếu có)
✅ Committed: [hash]
```

## ⚠️ KHÔNG ĐƯỢC KẾT THÚC MÀ KHÔNG UPDATE FILES!
