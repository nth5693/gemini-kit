---
description: Bắt đầu phiên làm việc với gemini-kit
---

# Workflow: Bắt đầu phiên làm việc

## Bước 1: ĐỌC CÁC FILE BẮT BUỘC

Trước khi làm bất cứ điều gì, PHẢI đọc các file sau theo thứ tự:

```
1. view_file /Users/hieu/Dev/gemini-kit/WORKFLOW.md
2. view_file /Users/hieu/Dev/gemini-kit/SESSION_LOG.md (xem phần cuối - session mới nhất)
3. view_file /Users/hieu/Dev/gemini-kit/TASKS.md
4. view_file /Users/hieu/Dev/gemini-kit/CLAUDE.md
```

## Bước 2: XÁC NHẬN ĐÃ ĐỌC

Sau khi đọc xong, PHẢI báo cáo:

```
✅ Đã đọc WORKFLOW.md - Hiểu 8 steps
✅ Đã đọc SESSION_LOG.md - Session [N] là session gần nhất
✅ Đã đọc TASKS.md - Task tiếp theo là [X]
✅ Đã đọc CLAUDE.md - Hiểu project rules

📊 Current State:
- Session: [N]
- Version: [X]
- Next Task: [Y]
```

## Bước 3: HỎI USER MUỐN LÀM GÌ

```
Bạn muốn làm gì trong phiên này?
1. Tiếp tục task: [task từ TASKS.md]
2. Task mới
3. Review/Fix
```

## Bước 4: THEO WORKFLOW 8 STEPS

Với bất kỳ feature mới nào:
1. Planner → Tạo plan, XIN APPROVAL
2. Scout → Tìm files
3. Implementation → Viết code
4. Tester → Test
5. Code-Reviewer → Review
6. Docs-Manager → Update docs
7. Git-Manager → Commit
8. Update TASKS.md + SESSION_LOG.md

## ⚠️ KHÔNG ĐƯỢC:
- Skip đọc files
- Implement trước khi có approval
- Quên update tracking files
