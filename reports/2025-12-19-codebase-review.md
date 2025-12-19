# Báo cáo Review Codebase - 19/12/2025

## 📊 Tóm tắt
| Danh mục | Số lượng |
|----------|-------|
| 🔴 Nghiêm trọng (Critical) | 0 |
| 🟠 Cao (High) | 2 |
| 🟡 Trung bình (Medium) | 1 |
| 🟢 Thấp (Low) | 1 |

**Kết luận:** ⚠️ Khuyến nghị sửa chữa

---

## 🟠 MỨC ĐỘ CAO (Cần sửa)
Các vấn đề về độ tin cậy và hiệu năng có thể ảnh hưởng đến trải nghiệm người dùng trong các dự án lớn.

### Vấn đề 1: Phân tích cú pháp bằng Regex dễ lỗi
- **Tệp:** `src/tools/knowledge.ts` (Dòng ~310-360)
- **Vấn đề:** `kit_index_codebase` sử dụng Regular Expressions (biểu thức chính quy) để phân tích các định nghĩa hàm và lớp. Cách này không bền vững và có thể bỏ sót các mẫu phức tạp (ví dụ: hàm bậc cao, cú pháp TypeScript lạ).
- **Cách sửa:** Thay thế phân tích dựa trên regex bằng phương pháp dựa trên AST (ví dụ: sử dụng `typescript` compiler API hoặc `tree-sitter`) để trích xuất ký hiệu (symbol) chính xác hơn.

### Vấn đề 2: Đọc/Ghi file đồng bộ (Synchronous I/O)
- **Tệp:** `src/tools/knowledge.ts`
- **Vấn đề:** `kit_get_learnings` và một phần của `kit_index_codebase` sử dụng `fs.readFileSync` hoặc các thao tác chặn (blocking). Với các file learning lớn hoặc codebase lớn, điều này có thể làm treo event loop, khiến server không phản hồi.
- **Cách sửa:** Chuyển sang sử dụng `fs.promises.readFile` và dùng streams cho việc xử lý file lớn.

---

## 🟡 MỨC ĐỘ TRUNG BÌNH (Khuyên dùng)
Cải thiện xử lý lỗi.

### Vấn đề 1: Parse JSON không an toàn
- **Tệp:** `src/tools/knowledge.ts` (Dòng ~268)
- **Vấn đề:** `kit_apply_stored_diff` parse file diff trực tiếp bằng `JSON.parse`. Mặc dù đã được bao trong `try-catch` bên ngoài, nhưng việc thiếu xử lý lỗi cụ thể cho JSON malformed sẽ gây khó khăn khi debug.
- **Cách sửa:**
```typescript
try {
    const rawData = fs.readFileSync(diffFile, 'utf8');
    const diffData = JSON.parse(rawData); // Hoặc dùng Zod .parse() trực tiếp
} catch (e) {
    if (e instanceof SyntaxError) {
        return { content: [{ type: 'text', text: '❌ File diff bị lỗi cấu trúc (corrupted).' }] };
    }
    throw e;
}
```

---

## 🟢 MỨC ĐỘ THẤP (Tùy chọn)
Phong cách code và các cải tiến nhỏ.

### Vấn đề 1: Làm sạch dữ liệu quá mức (Aggressive Sanitization)
- **Tệp:** `src/tools/security.ts`
- **Gợi ý:** Hàm `sanitize` loại bỏ nhiều ký tự như `;`, `&`, `|` - những ký tự này có thể hợp lệ trong commit message của git. Vì đã dùng `execFileSync`, hãy cân nhắc nới lỏng quy tắc này trừ khi cần bảo vệ đặc biệt khỏi shell injection trong ngữ cảnh khác.

---

## TIÊU CHÍ CHẤT LƯỢNG (Quality Gates)

| Tiêu chí | Trạng thái | Mục tiêu |
|----------|------------|----------|
| Độ bao phủ Test | ⚠️ Một phần | 80% |
| Không có kiểu `any` | ✅ Đạt | 0 |
| Quét bảo mật | ✅ Đạt | Đạt |
| Không lỗi nghiêm trọng | ✅ Đạt | 0 |

---

## CÁC BƯỚC TIẾP THEO

```bash
# Sửa các lỗi ưu tiên cao
/fix "Replace regex parsing in knowledge.ts with AST-based parser"

# Chạy test
/test
```
