---
description: Kiểm tra và cập nhật tracking files sau khi hoàn thành task
---

# Check Task Workflow

> Chạy workflow này sau mỗi task lớn để đảm bảo tracking files được cập nhật.

## Steps

// turbo-all

### 1. Kiểm tra WORKFLOW.md vẫn đúng
Đọc lại để đảm bảo quy trình không thay đổi:
```
view_file /Users/hieu/Dev/gemini-kit/WORKFLOW.md lines:1-50
```

### 2. Kiểm tra doc.md (Gemini CLI reference)
Đảm bảo extension vẫn theo đúng doc.md:
```
view_file /Users/hieu/Dev/gemini-kit/doc.md lines:1-50
```

### 3. Cập nhật SESSION_LOG.md
Thêm tiến độ mới nhất vào session hiện tại.

### 4. Cập nhật TASKS.md
Đánh dấu [x] các tasks đã hoàn thành.

### 5. Kiểm tra extension (nếu có thay đổi)
```bash
ls ~/.gemini/extensions/gemini-kit/commands/
```

### 6. Kiểm tra code đã commit chưa
```bash
git status
```

### 7. Run tests/build (nếu có thay đổi code)
```bash
npm run build 2>&1 | head -20
npm run test 2>&1 | head -20
```

### 8. Thông báo user
- Task nào đã xong
- Task tiếp theo là gì
- Có issue gì cần giải quyết không
