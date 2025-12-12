---
description: Kết thúc phiên làm việc với gemini-kit
---

# Workflow: Kết thúc phiên làm việc

## ⚠️ BẮT BUỘC TRƯỚC KHI KẾT THÚC

### Bước 1: CẬP NHẬT TASKS.md

```
1. Mark completed tasks với [x]
2. Update build size nếu có thay đổi
3. Thêm feature mới vào danh sách nếu có
```

### Bước 2: CẬP NHẬT SESSION_LOG.md

Thêm vào cuối file (trước <!-- Thêm session mới -->):

```markdown
## Session [N] (Continued) - [DATE TIME]

### 📌 Mục tiêu
- [Mục tiêu phiên này]

### ✅ Đã hoàn thành
- [Liệt kê các task đã làm]

### 📁 Files đã tạo/sửa
- [Danh sách files]

### 📊 Stats
- Build: [X]KB
- Tests: [X/X]
- Commits: [hash1, hash2]

### 🔜 Task tiếp theo
- [Task kế tiếp]
```

### Bước 3: CẬP NHẬT CHANGELOG.md (nếu có feature mới)

```markdown
- **[Feature Name]** - [Mô tả ngắn]
  - [Chi tiết 1]
  - [Chi tiết 2]
```

### Bước 4: COMMIT VÀ PUSH

```bash
git add -A
git commit -m "docs: update tracking files for session [N]"
git push
```

### Bước 5: XÁC NHẬN HOÀN THÀNH

Báo cáo cho user:
```
✅ TASKS.md updated
✅ SESSION_LOG.md updated
✅ CHANGELOG.md updated (nếu có)
✅ Committed: [hash]
```

## ⚠️ KHÔNG ĐƯỢC KẾT THÚC MÀ KHÔNG LÀM CÁC BƯỚC TRÊN!
