# GEMINI-KIT TASKS
## Extension Native Integration (Option C)

> **Extension tại:** `~/.gemini/extensions/gemini-kit/`
> **Plan nâng cao:** [implementation_plan.md](../../../.gemini/antigravity/brain/61d724a8-61a6-4334-b43c-d912b8fc6234/implementation_plan.md)

---

## ✅ FOUNDATION - HOÀN THÀNH

<details>
<summary>Giai đoạn 1-6 (Click để xem)</summary>

- [x] Giai đoạn 1: Khởi tạo extension
- [x] Giai đoạn 2: GEMINI.md context
- [x] Giai đoạn 3: 16 TOML commands
- [x] Giai đoạn 4: MCP Server (6 tools)
- [x] Giai đoạn 5: 5 Hooks
- [x] Giai đoạn 6: Build thành công

</details>

---

## ✅ GIAI ĐOẠN 7: LINK & TEST - HOÀN THÀNH

- [x] Extension đã link và enabled
- [x] Test `/plan` - ✅ Hoạt động
- [x] Test `/brainstorm` - ✅ Hoạt động
- [x] Sửa 16 TOML commands (xóa !{...})
- [x] Tạo `doc.md` từ geminicli.com
- [x] Cập nhật workflows với doc.md

---

## 🚀 ADVANCED FEATURES ROADMAP

### Phase 1: LEARNINGS.md - Context Learning ✅
> Thời gian: 2h | Độ khó: Dễ | **HOÀN THÀNH**

- [x] **1.1** Thêm MCP tool `kit_save_learning` ✅
- [x] **1.2** Thêm MCP tool `kit_get_learnings` ✅
- [x] **1.3** Build MCP server thành công ✅
- [x] **1.4** Cập nhật `before-agent.js` hook để inject learnings ✅
- [x] **1.5** Cập nhật GEMINI.md hướng dẫn AI dùng learnings ✅
- [ ] **1.6** Test: AI tự lưu học và apply

---

### Phase 2: Dry Run Mode ✅
> Thời gian: 1h | Độ khó: Dễ | **HOÀN THÀNH**

- [x] **2.1** Tạo `/code-preview` command (TOML) ✅
- [x] **2.2** Thêm MCP tool `kit_store_diff` ✅
- [x] **2.3** Thêm MCP tool `kit_apply_stored_diff` ✅
- [x] **2.4** Build thành công ✅

---

### Phase 3: Auto-Rollback ✅
> Thời gian: 3h | Độ khó: Trung bình | **HOÀN THÀNH**

- [x] **3.1** Sửa `/cook` với Step 0 tạo checkpoint ✅
- [x] **3.2** Thêm rollback rules trong cook.toml ✅
- [x] **3.3** Thêm MCP tool `kit_auto_rollback` ✅
- [x] **3.4** Build thành công ✅
- [ ] **3.5** Test: Workflow tự rollback khi fail

---

### Phase 4: RAG/Vector Search ✅
> Thời gian: 1-2 ngày | Độ khó: Khó | **HOÀN THÀNH**

- [x] **4.1** Thiết kế lightweight semantic search (no vector DB) ✅
- [x] **4.2** Thêm MCP tool `kit_index_codebase` ✅
- [x] **4.3** Thêm MCP tool `kit_semantic_search` ✅
- [x] **4.4** Cập nhật `/scout` command với semantic search ✅
- [x] **4.5** Build thành công ✅
- [ ] **4.6** Test: Tìm kiếm ngữ nghĩa trong codebase

---

### Phase 5: Vector Learnings ✅
> Thời gian: 1-2h | Độ khó: Dễ | **HOÀN THÀNH**

- [x] **5.1** Sửa `kit_get_learnings` dùng semantic search ✅
- [x] **5.2** Cập nhật before-agent.js inject relevant learnings ✅
- [x] **5.3** Build thành công ✅

---

### Phase 6: GitHub Integration ✅
> Thời gian: 3-4h | Độ khó: Trung bình | **HOÀN THÀNH**

- [x] **6.1** Tạo `/pr` command (TOML) ✅
- [x] **6.2** Thêm MCP tool `kit_github_create_pr` ✅
- [x] **6.3** Thêm MCP tool `kit_github_get_pr` ✅
- [x] **6.4** Tạo `/review-pr` command ✅
- [x] **6.5** Build thành công ✅
- [ ] **6.6** Test: Tạo PR từ CLI

---

### Phase 7: Jira/Issue Integration ✅
> Thời gian: 2-3h | Độ khó: Trung bình | **HOÀN THÀNH**

- [x] **7.1** Tạo `/ticket` command ✅
- [x] **7.2** Thêm MCP tool `kit_jira_get_ticket` ✅
- [x] **7.3** Thêm MCP tool `kit_github_get_issue` ✅
- [x] **7.4** Build thành công ✅

---

## 📊 TỔNG KẾT

| Thành phần | Số lượng | Trạng thái |
|------------|----------|------------|
| Config files | 5 | ✅ |
| TOML Commands | 17 | ✅ |
| MCP Tools | 13 (+5 planned) | ✅ |
| Hooks | 5 | ✅ |
| GitHub Integration | 0 | 🔜 Phase 6 |

---

## ⏰ TIMELINE

| Session | Tasks | Status |
|---------|-------|--------|
| 1-5 | Foundation | ✅ |
| 6 | Phase 1-4 (Advanced) | ✅ |
| 6+ | Phase 5 (Vector Learnings) | 🔜 Now |
| 7 | Phase 6 (GitHub) | 🔜 |
| 8 | Phase 7 (Jira) | ⏳ Optional |

| 6 | Link & Test | ✅ |
| 7 | Phase 1: LEARNINGS.md | 🔜 Next |
| 8 | Phase 2 + 3: Dry Run + Rollback | ⏳ |
| 9-10 | Phase 4: RAG | ⏳ |
