---
description: Bắt đầu phiên làm việc với gemini-kit
---

# Workflow: Bắt đầu phiên làm việc

## 📁 DANH SÁCH FILES QUAN TRỌNG

| File | Mục đích | Khi nào đọc |
|------|----------|-------------|
| `SESSION_LOG.md` | Lịch sử các phiên | **ĐẦU TIÊN** - biết phiên trước làm gì |
| `TASKS.md` | Danh sách tasks | **THỨ HAI** - biết task hiện tại |
| `IMPLEMENTATION_PLAN.md` | Kế hoạch tổng thể | Khi cần hiểu kiến trúc |
| `WORKFLOW.md` | Quy trình 8 bước | Khi implement feature mới |
| `CLAUDE.md` | Project rules | Khi cần nhắc lại rules |
| `CHANGELOG.md` | Lịch sử thay đổi | Khi thêm feature mới |
| `CLAUDEKIT_REFERENCE.md` | Tham chiếu ClaudeKit | Khi cần so sánh |

---

## Bước 1: ĐỌC CÁC FILE BẮT BUỘC

// turbo
```
1. view_file /Users/hieu/Dev/gemini-kit/SESSION_LOG.md (xem phần cuối - session mới nhất)
2. view_file /Users/hieu/Dev/gemini-kit/TASKS.md
3. view_file /Users/hieu/Dev/gemini-kit/IMPLEMENTATION_PLAN.md
4. view_file /Users/hieu/Dev/gemini-kit/WORKFLOW.md
5. view_file /Users/hieu/Dev/gemini-kit/CLAUDE.md
```

## Bước 2: XÁC NHẬN ĐÃ ĐỌC

```
✅ Đã đọc SESSION_LOG.md - Session [N] là session gần nhất
✅ Đã đọc TASKS.md - Task tiếp theo là [X]
✅ Đã đọc IMPLEMENTATION_PLAN.md - Migration status: [X]
✅ Đã đọc WORKFLOW.md - Hiểu 8 steps
✅ Đã đọc CLAUDE.md - Hiểu project rules

📊 Current State:
- Session: [N]
- Version: [X.X.X]
- Next Task: [Y]
```

## Bước 3: HỎI USER MUỐN LÀM GÌ

```
Bạn muốn làm gì trong phiên này?
1. Tiếp tục task: [task từ TASKS.md]
2. Task mới
3. Review/Fix
```

## ⚠️ KHÔNG ĐƯỢC:
- Skip đọc files
- Implement trước khi có approval
- Quên update tracking files
