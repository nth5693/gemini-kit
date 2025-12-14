---
description: Bắt đầu phiên làm việc với gemini-kit
---

# Start Session Workflow

> **BẮT BUỘC** chạy workflow này khi bắt đầu mỗi phiên làm việc mới.

## Steps

// turbo-all

### 1. Đọc WORKFLOW.md (quy trình làm việc)
```
view_file /Users/hieu/Dev/gemini-kit/WORKFLOW.md
```

### 2. Đọc SESSION_LOG.md (biết phiên trước làm gì)
```
view_file /Users/hieu/Dev/gemini-kit/SESSION_LOG.md
```

### 3. Đọc doc.md (Gemini CLI docs reference)
```
view_file /Users/hieu/Dev/gemini-kit/doc.md
```

### 4. Đọc GEMINI.md từ gemini-cli-source (coding rules)
```
view_file /Users/hieu/Dev/gemini-kit/gemini-cli-source/GEMINI.md
```

### 5. Kiểm tra cấu trúc dự án
```
ls -la /Users/hieu/Dev/gemini-kit/
```

### 6. Kiểm tra extension
```
ls ~/.gemini/extensions/gemini-kit/
```

### 7. Thông báo sẵn sàng
Sau khi đọc xong, thông báo cho user:
- Tóm tắt phiên trước làm gì
- Task tiếp theo là gì
- Hỏi user muốn tiếp tục hay làm gì mới
