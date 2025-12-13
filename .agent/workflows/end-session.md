---
description: Kết thúc phiên làm việc với gemini-kit
---

# End Session Workflow

> **BẮT BUỘC** chạy workflow này trước khi kết thúc phiên làm việc.

## Steps

// turbo-all

### 1. Cập nhật SESSION_LOG.md
Thêm entry mới vào SESSION_LOG.md với format:

```markdown
## Session [N] - [YYYY-MM-DD]

### Mục tiêu
- [Mục tiêu chính của phiên]

### Đã hoàn thành
- [x] Task 1
- [x] Task 2

### Files đã tạo/sửa
- `path/to/file1.ts`
- `path/to/file2.ts`

### Vấn đề còn lại
- [ ] Issue 1

### Next steps
- [ ] Task tiếp theo
```

### 2. Cập nhật CHANGELOG.md (nếu có thay đổi lớn)
Thêm version mới hoặc update version hiện tại.

### 3. Git commit (nếu cần)
```bash
git add -A
git commit -m "Session [N]: [Tóm tắt ngắn]"
```

### 4. Thông báo user
- Tóm tắt những gì đã làm
- Next steps cho phiên sau
