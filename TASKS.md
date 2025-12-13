# GEMINI-KIT TASKS
## Extension Native Integration (Option C)

> **Thời gian ước tính:** 5-6 giờ
> **Plan chi tiết:** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
> **Extension tại:** `~/.gemini/extensions/gemini-kit/`

---

## ✅ GIAI ĐOẠN 1: KHỞI TẠO - HOÀN THÀNH

- [x] Tạo thư mục `~/.gemini/extensions/gemini-kit/`
- [x] Tạo các thư mục con: `commands/`, `src/`, `hooks/`, `dist/`
- [x] Tạo `gemini-extension.json` (file config chính)
- [x] Tạo `package.json` (dependencies + devDependencies)
- [x] Tạo `tsconfig.json` (TypeScript config)
- [x] Tạo `README.md` (hướng dẫn cài đặt extension)

---

## ✅ GIAI ĐOẠN 2: GEMINI.MD - HOÀN THÀNH

- [x] Tạo `GEMINI.md` với hướng dẫn cho AI về các agents

---

## ✅ GIAI ĐOẠN 3: TOML COMMANDS - HOÀN THÀNH (16 commands)

**Core Commands:**
- [x] cook.toml - Workflow đầy đủ
- [x] plan.toml - Agent lập kế hoạch
- [x] scout.toml - Agent khám phá
- [x] code.toml - Agent viết code
- [x] test.toml - Agent test
- [x] review.toml - Agent review
- [x] debug.toml - Agent debug
- [x] git.toml - Agent git

**Extended Commands (migrated from gemini-kit-old):**
- [x] brainstorm.toml - Brainstormer Agent
- [x] copywrite.toml - Copywriter Agent
- [x] design.toml - UI/UX Designer Agent
- [x] research.toml - Researcher Agent
- [x] journal.toml - Journal Writer Agent
- [x] docs.toml - Docs Manager Agent
- [x] project.toml - Project Manager Agent
- [x] db.toml - Database Admin Agent

---

## ✅ GIAI ĐOẠN 4: MCP SERVER - HOÀN THÀNH

- [x] Tạo `src/kit-server.ts` với 6 tools:
  - [x] `kit_create_checkpoint` - Tạo checkpoint (git tag)
  - [x] `kit_restore_checkpoint` - Khôi phục checkpoint
  - [x] `kit_get_project_context` - Lấy context dự án
  - [x] `kit_handoff_agent` - Chuyển giao giữa agents
  - [x] `kit_save_artifact` - Lưu artifact
  - [x] `kit_list_checkpoints` - Liệt kê checkpoints

---

## ✅ GIAI ĐOẠN 5: HOOKS - HOÀN THÀNH

- [x] Tạo `hooks/session-start.js` - Khởi tạo thư mục, đếm phiên
- [x] Tạo `hooks/before-agent.js` - Inject context từ handoffs
- [x] Tạo `hooks/before-tool.js` - Kiểm tra bảo mật (chặn secrets)
- [x] Tạo `hooks/after-tool.js` - Auto-test sau khi sửa code
- [x] Tạo `hooks/session-end.js` - Cleanup, lưu logs
- [x] Tạo `settings.json` - Cấu hình hooks

---

## ✅ GIAI ĐOẠN 6: BUILD - HOÀN THÀNH

- [x] Chạy `npm install` (90 packages)
- [x] Chạy `npm run build`
- [x] Kiểm tra `dist/kit-server.js` được tạo (9.7KB)

---

## 🔜 GIAI ĐOẠN 7: LINK & TEST (Phiên tiếp theo)

- [ ] Link extension: `gemini extensions link $(pwd)`
- [ ] Restart Gemini CLI
- [ ] Test commands: `/cook`, `/plan`, `/scout`, `/brainstorm`
- [ ] Test MCP tools: yêu cầu AI dùng `kit_create_checkpoint`
- [ ] Test hooks: kiểm tra log trong `.gemini-kit/logs/`

---

## 📊 TỔNG KẾT

| Thành phần | Số lượng | Trạng thái |
|------------|----------|------------|
| Config files | 5 | ✅ |
| TOML Commands | 16 | ✅ |
| MCP Server | 1 (6 tools) | ✅ |
| Hooks | 5 | ✅ |
| Build | 9.7KB | ✅ |
| **TỔNG** | **29 files** | **✅** |
