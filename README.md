# 🚀 Gemini-Kit

<div align="center">

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/nth5693/gemini-kit/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-39%20passed-brightgreen.svg)]()
[![Agents](https://img.shields.io/badge/AI%20Agents-15-purple.svg)]()

### 🎯 Code 10x Faster với Đội Ngũ AI Engineers Riêng Của Bạn

**Gemini-Kit** biến terminal của bạn thành một **engineering team hoàn chỉnh** - từ planning đến production.

[🚀 Cài Đặt Ngay](#-cài-đặt) • [📖 Hướng Dẫn](#-cách-sử-dụng) • [🤖 Agents](#-danh-sách-agents) • [📚 Docs](docs/API.md)

</div>

---

## ⚡ Tại Sao Chọn Gemini-Kit?

<table>
<tr>
<td width="50%">

### ❌ Trước khi có Gemini-Kit

```
😩 Viết code một mình
😩 Debug hàng giờ không ra
😩 Quên viết tests
😩 Commit lộ API key
😩 Mỗi task lặp lại workflow
```

</td>
<td width="50%">

### ✅ Sau khi có Gemini-Kit

```
🚀 15 AI agents hỗ trợ 24/7
🚀 Auto debug với root cause
🚀 Tests được viết tự động
🚀 Block secrets trước khi commit
🚀 /cook tự động làm hết
```

</td>
</tr>
</table>

---

## 🏆 Những Gì Bạn Sẽ Có

| Tính năng | Mô tả |
|-----------|-------|
| 🤖 **15 AI Agents Chuyên Biệt** | Planner, Coder, Tester, Reviewer... mỗi agent một chuyên môn |
| ⚡ **One-Command Workflow** | `/cook` = Plan → Scout → Code → Test → Review tự động |
| 🧠 **AI Học Từ Bạn** | Feedback được lưu lại, AI cải thiện theo thời gian |
| 🔒 **Chặn Leak Secrets** | 30+ patterns phát hiện API keys, passwords |
| 💾 **Auto Checkpoint** | Tự backup trước khi thay đổi, rollback dễ dàng |
| 📊 **Production-Ready** | 39 unit tests, TypeScript, clean architecture |

---

## 🎬 Demo Nhanh

```bash
# Chỉ một lệnh - AI làm tất cả
$ /cook Thêm chức năng login với Google OAuth

🤖 Planner: Đang tạo kế hoạch...
🔍 Scout: Phân tích codebase...
💻 Coder: Viết code...
🧪 Tester: Tạo unit tests...
👀 Reviewer: Review code...

✅ Hoàn thành! Code đã sẵn sàng để commit.
```

---

## 📖 Mục Lục

- [Cài đặt](#-cài-đặt)
- [Cách sử dụng](#-cách-sử-dụng)
- [Danh sách Agents](#-danh-sách-agents)
- [Commands](#-commands)
- [MCP Tools](#-mcp-tools)
- [Tài liệu](#-tài-liệu)

---


## 🤔 Gemini-Kit là gì?

**Gemini-Kit** là một extension cho [Gemini CLI](https://github.com/anthropics/gemini-cli) cho phép bạn:

| Tính năng | Mô tả |
|-----------|-------|
| 🤖 **15 AI Agents** | Mỗi agent có chuyên môn riêng (lập kế hoạch, viết code, test, review...) |
| 🔄 **Auto Workflow** | Tự động chọn workflow phù hợp với task của bạn |
| 📚 **Learning System** | AI học từ feedback của bạn để cải thiện theo thời gian |
| ✅ **Auto Checkpoint** | Tự động tạo backup trước khi thay đổi code |
| 🔒 **Security Hooks** | Chặn leak secrets (API keys, passwords) |

### Ví dụ sử dụng

```bash
# Bạn chỉ cần gõ một lệnh, AI sẽ tự động:
# 1. Lập kế hoạch
# 2. Khám phá codebase
# 3. Viết code
# 4. Viết tests
# 5. Review code

/cook Thêm chức năng login với Google OAuth
```

---

## 📦 Cài Đặt

### Yêu cầu

Trước khi cài đặt, bạn cần có:

- ✅ **Node.js** phiên bản 18 trở lên ([Tải tại đây](https://nodejs.org/))
- ✅ **Gemini CLI** đã cài đặt ([Hướng dẫn](https://github.com/anthropics/gemini-cli))
- ✅ **Git** để clone repo

### Bước 1: Kiểm tra yêu cầu

```bash
# Kiểm tra Node.js (cần >= 18)
node --version

# Kiểm tra Gemini CLI
gemini --version

# Kiểm tra Git
git --version
```

### Bước 2: Cài đặt Gemini-Kit

**Cách 1: Cài tự động (khuyên dùng)**

```bash
gemini extensions install nth5693/gemini-kit
```

**Cách 2: Cài thủ công**

```bash
# Clone repo vào thư mục extensions
git clone https://github.com/nth5693/gemini-kit.git ~/.gemini/extensions/gemini-kit

# Di chuyển vào thư mục
cd ~/.gemini/extensions/gemini-kit

# Cài dependencies
npm install

# Build project
npm run build

# Link extension với Gemini CLI
gemini extensions link $(pwd)
```

### Bước 3: Xác nhận cài đặt thành công

```bash
# Khởi động Gemini CLI trong project của bạn
cd /path/to/your/project
gemini

# Thử một lệnh
/plan Tạo landing page với dark mode
```

Nếu thấy AI bắt đầu lập kế hoạch → **Cài đặt thành công!** 🎉

---

## 💻 Cách Sử Dụng

### Workflow cơ bản

```bash
# 1. Mở terminal trong project của bạn
cd my-project

# 2. Khởi động Gemini
gemini

# 3. Sử dụng commands
/cook <mô tả task>    # Workflow đầy đủ
/plan <task>          # Chỉ lập kế hoạch
/scout               # Khám phá codebase
```

### Ví dụ thực tế

```bash
# Thêm feature mới
/cook Thêm chức năng upload ảnh với preview

# Fix bug
/debug Tại sao login không hoạt động trên Safari?

# Code review
/review Kiểm tra file src/auth.ts

# Tạo tests
/test Viết unit tests cho UserService
```

---

## 🤖 Danh Sách Agents

| Icon | Agent | Chức năng | Khi nào dùng |
|------|-------|-----------|--------------|
| 📋 | **Planner** | Lập kế hoạch chi tiết | Bắt đầu task phức tạp |
| 🔍 | **Scout** | Khám phá codebase | Tìm hiểu code mới |
| 💻 | **Coder** | Viết code sạch | Implement features |
| 🧪 | **Tester** | Viết tests | Đảm bảo chất lượng |
| 👀 | **Reviewer** | Review code | Trước khi merge |
| 🐛 | **Debugger** | Fix bugs | Gặp lỗi runtime |
| 🔀 | **Git Manager** | Quản lý Git | Commit, branch, merge |
| 🗄️ | **Database Admin** | Quản lý DB | Schema, queries |
| 🔬 | **Researcher** | Nghiên cứu tech | Chọn thư viện |
| 🎨 | **UI Designer** | Thiết kế UI | Giao diện, dark mode |
| 📝 | **Docs Manager** | Viết document | README, API docs |
| 💡 | **Brainstormer** | Lên ý tưởng | Brainstorm solutions |
| 🌐 | **Fullstack Dev** | Full-stack | End-to-end feature |
| 📊 | **Project Manager** | Quản lý dự án | Sprint, tracking |
| ✍️ | **Copywriter** | Marketing copy | Landing pages |

---

## ⌨️ Commands

| Command | Mô tả | Ví dụ |
|---------|-------|-------|
| `/cook` | Workflow đầy đủ | `/cook Thêm OAuth login` |
| `/plan` | Lập kế hoạch | `/plan Migrate to TypeScript` |
| `/scout` | Khám phá code | `/scout src/auth` |
| `/code` | Viết code | `/code Tạo UserService` |
| `/test` | Viết tests | `/test coverage 80%` |
| `/review` | Review code | `/review security check` |
| `/debug` | Debug lỗi | `/debug TypeError at line 42` |
| `/git` | Git operations | `/git commit với message` |

---

## 🔧 MCP Tools

### Tools chính

| Tool | Chức năng |
|------|-----------|
| `kit_create_checkpoint` | Tạo backup trước khi thay đổi |
| `kit_restore_checkpoint` | Khôi phục lại trạng thái trước |
| `kit_save_learning` | Lưu feedback để AI học |
| `kit_team_start` | Bắt đầu team session |
| `kit_smart_route` | Tự động chọn workflow |

📖 **Xem đầy đủ**: [docs/API.md](docs/API.md)

---

## � Tài Liệu

| Tài liệu | Mô tả |
|----------|-------|
| [docs/API.md](docs/API.md) | API Reference đầy đủ |
| [CHANGELOG.md](CHANGELOG.md) | Lịch sử thay đổi |
| [agents/](agents/) | Chi tiết từng agent |

---

## ❓ FAQ

### Gemini-Kit có miễn phí không?
✅ **Có**, hoàn toàn miễn phí và open source (MIT License).

### Dùng được với ngôn ngữ nào?
✅ Hỗ trợ **TypeScript, JavaScript, Python, Go, Rust** và nhiều ngôn ngữ khác.

### Có cần API key không?
Bạn cần có **Gemini CLI** đã cấu hình với API key của Google.

---

## 🤝 Đóng góp

Contributions welcome! Xem [CONTRIBUTING.md](CONTRIBUTING.md) để bắt đầu.

---

## 📄 License

MIT © 2024

---

<p align="center">
  Made with ❤️ by the Gemini-Kit Team
</p>


