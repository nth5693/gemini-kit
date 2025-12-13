# KẾ HOẠCH OPTION C: Extension Đầy Đủ + MCP + Hooks
## Viết bằng Tiếng Việt

> **Thời gian ước tính: 5-6 giờ**

---

## 🎯 MỤC TIÊU

Tạo **Gemini-Kit Extension** cho Gemini CLI với:
- **Commands**: Các lệnh slash như `/cook`, `/plan`, `/scout`
- **MCP Server**: Server cung cấp tools tùy chỉnh cho AI
- **Hooks**: Các script tự động chạy tại các thời điểm nhất định

---

## ⚠️ LƯU Ý QUAN TRỌNG (Từ Review)

### 1. Timeout cho `/cook`
Workflow 5 bước trong 1 prompt có thể bị timeout với task lớn.
**Giải pháp:** Với feature lớn, dùng từng lệnh lẻ: `/plan → /scout → /code → /test → /review`

### 2. Đường dẫn `${extensionPath}`
Gemini CLI hỗ trợ biến này trên cả macOS, Windows, Linux.
**Syntax:** `${extensionPath}${/}dist${/}kit-server.js`

### 3. npm install cho Extension
Extension là project Node riêng. User PHẢI chạy:
```bash
cd ~/.gemini/extensions/gemini-kit && npm install && npm run build
```

### 4. Hooks chạy Synchronous
Gemini CLI đợi hook chạy xong trước khi tiếp tục (đã xác nhận từ docs).

### 5. ⚡ execSync cần timeout (MCP Server)
`execSync` sẽ làm treo server. Nếu `find` quét thư mục lớn → timeout và lỗi.
**Giải pháp:** Thêm `{ timeout: 10000 }` vào mọi `execSync`:
```javascript
execSync('find ...', { encoding: 'utf8', timeout: 10000 });
```

### 6. 🛡️ JSON.parse cần try-catch (Hooks)
Input từ stdin có thể bị chunked hoặc không hợp lệ.
**Giải pháp:** Bọc `JSON.parse` trong try-catch, trả về "allow" nếu lỗi (fail-open):
```javascript
let data;
try {
  data = JSON.parse(input);
} catch {
  console.log(JSON.stringify({ decision: 'allow' }));
  process.exit(0);
}
```

### 7. 📊 Giới hạn shell output (TOML Commands)
`!{find ...}` có thể trả về hàng nghìn dòng → tràn context.
**Giải pháp:** Luôn dùng `head -n 50` để giới hạn output:
```toml
!{find . -name "*.ts" | head -n 50}
```

### 8. 📍 Dùng đường dẫn tuyệt đối (Link Extension)
`gemini extensions link .` đôi khi không ổn định.
**Giải pháp:** Dùng absolute path:
```bash
gemini extensions link $(pwd)
```

---



## 📁 CẤU TRÚC THƯ MỤC

```
~/.gemini/extensions/gemini-kit/
│
├── gemini-extension.json    ← File cấu hình chính của extension
├── GEMINI.md               ← Hướng dẫn cho AI (context)
├── package.json            ← Quản lý dependencies Node.js
├── tsconfig.json           ← Cấu hình TypeScript
│
├── commands/               ← THƯ MỤC CHỨA CÁC LỆNH SLASH
│   ├── cook.toml          ← /cook - Chạy workflow đầy đủ
│   ├── plan.toml          ← /plan - Lập kế hoạch
│   ├── scout.toml         ← /scout - Khám phá codebase
│   ├── code.toml          ← /code - Viết code
│   ├── test.toml          ← /test - Viết và chạy tests
│   ├── review.toml        ← /review - Review code
│   ├── debug.toml         ← /debug - Debug lỗi
│   └── git.toml           ← /git - Quản lý git
│
├── src/                    ← THƯ MỤC SOURCE CODE
│   └── kit-server.ts      ← MCP Server với 6 tools tùy chỉnh
│
├── hooks/                  ← THƯ MỤC HOOKS (tự động chạy)
│   ├── session-start.js   ← Chạy khi bắt đầu phiên
│   ├── before-agent.js    ← Chạy trước khi AI xử lý
│   ├── before-tool.js     ← Chạy trước khi AI dùng tool (kiểm tra bảo mật)
│   ├── after-tool.js      ← Chạy sau khi AI dùng tool (auto-test)
│   └── session-end.js     ← Chạy khi kết thúc phiên
│
├── settings.json           ← Cấu hình hooks
└── dist/                   ← Thư mục output sau khi build
```

---

## 📋 6 GIAI ĐOẠN THỰC HIỆN

### 🔧 GIAI ĐOẠN 1: KHỞI TẠO (30 phút)

**Mục tiêu:** Tạo cấu trúc thư mục và các file config cơ bản

**Các file cần tạo:**

#### 1.1 `gemini-extension.json` - File cấu hình chính
```json
{
  "name": "gemini-kit",           // Tên extension
  "version": "1.0.0",             // Phiên bản
  "description": "Đội ngũ AI Agent cho phát triển phần mềm",
  "contextFileName": "GEMINI.md", // File hướng dẫn cho AI
  "mcpServers": {                 // Cấu hình MCP server
    "kit-agents": {
      "command": "node",
      "args": ["${extensionPath}${/}dist${/}kit-server.js"],
      "cwd": "${extensionPath}"
    }
  }
}
```

**Giải thích:**
- `name`: Tên duy nhất của extension, dùng để cài đặt
- `contextFileName`: AI sẽ đọc file này để hiểu cách làm việc
- `mcpServers`: Khai báo MCP server cung cấp tools tùy chỉnh

#### 1.2 `package.json` - Quản lý dependencies
```json
{
  "name": "gemini-kit",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
```

---

### 📝 GIAI ĐOẠN 2: GEMINI.MD - Hướng dẫn cho AI (30 phút)

**Mục tiêu:** Tạo file context để AI hiểu vai trò và cách làm việc

```markdown
# Gemini-Kit: Đội Ngũ Super Engineer

Bạn là thành viên của đội ngũ Gemini-Kit - nhóm AI agents chuyên biệt
phối hợp để phát triển phần mềm chất lượng cao.

## Các Thành Viên

### Planner (Người Lập Kế Hoạch)
- Tạo kế hoạch triển khai chi tiết
- Chia nhỏ các task phức tạp
- Xác định rủi ro và phụ thuộc

### Scout (Người Khám Phá)
- Khám phá cấu trúc codebase
- Tìm các file liên quan
- Xác định các điểm tích hợp

### Coder (Người Viết Code)
- Viết code sạch, hiệu quả
- Tuân theo conventions của dự án

### Tester (Người Kiểm Thử)
- Viết unit tests và integration tests
- Đảm bảo chất lượng code

### Reviewer (Người Review)
- Review code về chất lượng
- Đề xuất cải tiến

### Debugger (Người Debug)
- Phân tích lỗi và bugs
- Đưa ra khuyến nghị sửa lỗi

## Quy Trình Làm Việc
1. **Luôn lập kế hoạch trước** - Dùng /plan trước khi code
2. **Khám phá trước khi code** - Hiểu codebase
3. **Test sau khi code** - Viết tests cho mọi thay đổi
4. **Review trước khi commit** - Kiểm tra chất lượng
```

---

### 🛠️ GIAI ĐOẠN 3: TOML COMMANDS - Các lệnh slash (1 giờ)

**Mục tiêu:** Tạo 8 lệnh slash cho các agents

#### 3.1 `/cook` - Workflow đầy đủ
**File:** `commands/cook.toml`

```toml
description = "Chạy workflow phát triển đầy đủ: Lập kế hoạch → Khám phá → Code → Test → Review"

prompt = """
# 🍳 Workflow Super Engineer

Bạn là **TeamOrchestrator**. Thực hiện chu trình phát triển hoàn chỉnh cho task:

**Task:** {{args}}

## Các Bước Workflow

### Bước 1: LẬP KẾ HOẠCH
Tạo kế hoạch triển khai chi tiết:
- Chia nhỏ task thành các subtasks
- Xác định files cần tạo/sửa
- Liệt kê các thách thức
- Định nghĩa tiêu chí thành công

### Bước 2: KHÁM PHÁ
Phân tích codebase:
!{ls -la}
!{find . -type f -name "*.ts" | head -20}

### Bước 3: VIẾT CODE
Triển khai giải pháp

### Bước 4: KIỂM THỬ
Tạo tests toàn diện

### Bước 5: REVIEW
Review việc triển khai
"""
```

**Giải thích:**
- `description`: Mô tả hiển thị trong /help
- `{{args}}`: Sẽ được thay thế bằng nội dung user nhập sau /cook
- `!{...}`: Chạy lệnh shell và đưa kết quả vào prompt

#### 3.2 `/plan` - Agent lập kế hoạch
**File:** `commands/plan.toml`

```toml
description = "Tạo kế hoạch triển khai cho một task (Planner Agent)"

prompt = """
# 📋 Planner Agent

Tạo kế hoạch triển khai chi tiết cho:

**Task:** {{args}}

## Phân Tích Cần Thiết

### 1. Hiểu Yêu Cầu
- Cần làm gì chính xác?
- Tiêu chí chấp nhận là gì?

### 2. Phân Tích Codebase
!{ls -la}
!{cat package.json 2>/dev/null | head -30}

### 3. Kế Hoạch Triển Khai
Cung cấp:
1. **Tổng quan** - Mô tả ngắn gọn cách tiếp cận
2. **Files cần sửa/tạo** - Danh sách với đường dẫn
3. **Hướng dẫn từng bước** - Các bước đánh số
4. **Thách thức tiềm ẩn** - Rủi ro và cách giảm thiểu
5. **Tiêu chí thành công** - Cách xác minh hoàn thành
"""
```

#### 3.3 `/scout` - Agent khám phá
**File:** `commands/scout.toml`

```toml
description = "Phân tích codebase và tìm files liên quan (Scout Agent)"

prompt = """
# 🔍 Scout Agent

Khám phá codebase cho:

**Task:** {{args}}

## Trinh Sát

### Cấu Trúc Dự Án
!{find . -type f -name "*.ts" -o -name "*.js" | grep -v node_modules | head -30}

### Thông Tin Package
!{cat package.json 2>/dev/null | head -40}

## Phân Tích Cần Thiết

1. **Files Liên Quan** - Files liên quan đến task này
2. **Patterns** - Các coding patterns được sử dụng
3. **Dependencies** - Các phụ thuộc nội bộ và bên ngoài
4. **Điểm Tích Hợp** - Nơi code mới kết nối
"""
```

**(Tương tự cho các commands khác: code.toml, test.toml, review.toml, debug.toml, git.toml)**

---

### ⚙️ GIAI ĐOẠN 4: MCP SERVER - Server cung cấp tools (1.5 giờ)

**Mục tiêu:** Tạo MCP server với 6 tools tùy chỉnh

**File:** `src/kit-server.ts`

```typescript
#!/usr/bin/env node
/**
 * Gemini-Kit MCP Server
 * Cung cấp tools tùy chỉnh cho orchestration agents
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Khởi tạo server
const server = new McpServer({
  name: 'gemini-kit-agents',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════
// TOOL 1: TẠO CHECKPOINT
// Mục đích: Lưu trạng thái dự án trước khi thay đổi
// ═══════════════════════════════════════════════════════════════
server.tool(
  'kit_create_checkpoint',
  {
    description: 'Tạo checkpoint git trước khi thay đổi. Trả về checkpoint ID.',
    inputSchema: z.object({
      name: z.string().describe('Tên/mô tả checkpoint'),
    }).shape,
  },
  async ({ name }) => {
    try {
      // Tạo ID checkpoint với timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const checkpointId = `kit-${timestamp}`;
      
      // Stage tất cả files và commit
      execSync('git add -A', { encoding: 'utf8' });
      execSync(`git commit -m "checkpoint: ${name}" --allow-empty`, { encoding: 'utf8' });
      execSync(`git tag ${checkpointId}`, { encoding: 'utf8' });
      
      return {
        content: [{
          type: 'text',
          text: `✅ Đã tạo checkpoint: ${checkpointId}`,
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Lỗi tạo checkpoint: ${error}`,
        }],
      };
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// TOOL 2: KHÔI PHỤC CHECKPOINT
// Mục đích: Quay lại trạng thái trước đó
// ═══════════════════════════════════════════════════════════════
server.tool(
  'kit_restore_checkpoint',
  {
    description: 'Khôi phục về checkpoint trước đó',
    inputSchema: z.object({
      checkpointId: z.string().describe('ID checkpoint cần khôi phục'),
    }).shape,
  },
  async ({ checkpointId }) => {
    try {
      execSync(`git checkout ${checkpointId}`, { encoding: 'utf8' });
      return {
        content: [{
          type: 'text',
          text: `✅ Đã khôi phục về: ${checkpointId}`,
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Lỗi khôi phục: ${error}`,
        }],
      };
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// TOOL 3: LẤY CONTEXT DỰ ÁN
// Mục đích: Thu thập thông tin về dự án
// ═══════════════════════════════════════════════════════════════
server.tool(
  'kit_get_project_context',
  {
    description: 'Thu thập context dự án: cấu trúc, dependencies, thay đổi gần đây',
    inputSchema: z.object({
      depth: z.number().optional().default(2).describe('Độ sâu quét thư mục'),
    }).shape,
  },
  async ({ depth }) => {
    // Lấy cấu trúc files
    const structure = execSync(
      `find . -maxdepth ${depth} -type f | grep -v node_modules | head -50`,
      { encoding: 'utf8' }
    );
    
    // Lấy thông tin package.json
    let packageInfo = null;
    if (fs.existsSync('package.json')) {
      packageInfo = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    }
    
    // Lấy git log gần đây
    let gitLog = '';
    try {
      gitLog = execSync('git log --oneline -5', { encoding: 'utf8' });
    } catch {}
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          structure: structure.split('\n').filter(Boolean),
          package: packageInfo,
          recentCommits: gitLog.split('\n').filter(Boolean),
        }, null, 2),
      }],
    };
  }
);

// ═══════════════════════════════════════════════════════════════
// TOOL 4: CHUYỂN GIAO GIỮA CÁC AGENT
// Mục đích: Chuyển context từ agent này sang agent khác
// ═══════════════════════════════════════════════════════════════
server.tool(
  'kit_handoff_agent',
  {
    description: 'Chuyển giao context cho agent khác trong workflow',
    inputSchema: z.object({
      fromAgent: z.string().describe('Tên agent hiện tại'),
      toAgent: z.string().describe('Tên agent đích'),
      context: z.string().describe('Context cần chuyển'),
    }).shape,
  },
  async ({ fromAgent, toAgent, context }) => {
    // Lưu handoff vào file
    const handoffDir = '.gemini-kit/handoffs';
    fs.mkdirSync(handoffDir, { recursive: true });
    
    const handoff = {
      timestamp: new Date().toISOString(),
      from: fromAgent,
      to: toAgent,
      context,
    };
    
    fs.writeFileSync(
      `${handoffDir}/${Date.now()}.json`,
      JSON.stringify(handoff, null, 2)
    );
    
    return {
      content: [{
        type: 'text',
        text: `✅ Đã chuyển giao từ ${fromAgent} → ${toAgent}`,
      }],
    };
  }
);

// ═══════════════════════════════════════════════════════════════
// TOOL 5: LƯU ARTIFACT
// Mục đích: Lưu kết quả công việc của agent
// ═══════════════════════════════════════════════════════════════
server.tool(
  'kit_save_artifact',
  {
    description: 'Lưu artifact (plan, report, log) từ công việc của agent',
    inputSchema: z.object({
      name: z.string().describe('Tên artifact'),
      type: z.enum(['plan', 'report', 'log']).describe('Loại artifact'),
      content: z.string().describe('Nội dung artifact'),
    }).shape,
  },
  async ({ name, type, content }) => {
    const dir = `.gemini-kit/artifacts/${type}`;
    fs.mkdirSync(dir, { recursive: true });
    
    const fileName = `${name}-${Date.now()}.md`;
    fs.writeFileSync(`${dir}/${fileName}`, content);
    
    return {
      content: [{
        type: 'text',
        text: `✅ Đã lưu artifact: ${dir}/${fileName}`,
      }],
    };
  }
);

// ═══════════════════════════════════════════════════════════════
// TOOL 6: LIỆT KÊ CHECKPOINTS
// Mục đích: Xem danh sách các checkpoint có sẵn
// ═══════════════════════════════════════════════════════════════
server.tool(
  'kit_list_checkpoints',
  {
    description: 'Liệt kê các checkpoint có sẵn',
    inputSchema: z.object({}).shape,
  },
  async () => {
    try {
      const tags = execSync('git tag -l "kit-*" --sort=-creatordate | head -10', 
        { encoding: 'utf8' });
      return {
        content: [{
          type: 'text',
          text: `Các checkpoint có sẵn:\n${tags || 'Chưa có checkpoint'}`,
        }],
      };
    } catch {
      return {
        content: [{
          type: 'text',
          text: 'Lỗi liệt kê checkpoints',
        }],
      };
    }
  }
);

// Khởi động server
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

### 🪝 GIAI ĐOẠN 5: HOOKS - Scripts tự động (1.5 giờ)

**Mục tiêu:** Tạo 5 hook scripts để tự động hóa các tác vụ

#### Hook là gì?
Hook là các scripts chạy TỰ ĐỘNG tại các thời điểm nhất định:
- **SessionStart**: Khi bắt đầu phiên Gemini CLI
- **BeforeAgent**: Trước khi AI xử lý yêu cầu của bạn
- **BeforeTool**: Trước khi AI sử dụng một tool (ví dụ: ghi file)
- **AfterTool**: Sau khi AI sử dụng một tool
- **SessionEnd**: Khi kết thúc phiên

#### 5.1 `session-start.js` - Khởi tạo khi bắt đầu phiên
```javascript
#!/usr/bin/env node
/**
 * Chạy khi BẮT ĐẦU phiên Gemini CLI
 * Mục đích: Khởi tạo thư mục, đếm số phiên
 */

import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const projectDir = process.env.GEMINI_PROJECT_DIR;
  const kitDir = path.join(projectDir, '.gemini-kit');
  
  // Tạo các thư mục cần thiết
  const dirs = ['artifacts', 'handoffs', 'memory', 'logs'];
  for (const dir of dirs) {
    fs.mkdirSync(path.join(kitDir, dir), { recursive: true });
  }
  
  // Đếm số phiên
  const statsFile = path.join(kitDir, 'stats.json');
  let stats = { sessions: 0 };
  
  if (fs.existsSync(statsFile)) {
    stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
  }
  
  stats.sessions++;
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
  
  // Thông báo cho user
  console.log(JSON.stringify({
    systemMessage: `🛠️ Gemini-Kit sẵn sàng | Phiên #${stats.sessions}`,
  }));
}

// Đọc input từ stdin (bắt buộc)
const input = await new Promise(resolve => {
  let data = '';
  process.stdin.on('data', chunk => data += chunk);
  process.stdin.on('end', () => resolve(data));
});

main().catch(console.error);
```

#### 5.2 `before-tool.js` - Kiểm tra bảo mật
```javascript
#!/usr/bin/env node
/**
 * Chạy TRƯỚC KHI AI sử dụng tool ghi file
 * Mục đích: Chặn nếu phát hiện secrets/API keys
 */

// Các patterns để phát hiện secrets
const SECRET_PATTERNS = [
  /api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/i,  // API keys
  /password\s*[:=]\s*['"]?[^\s'"]{8,}['"]?/i,            // Passwords
  /ghp_[a-zA-Z0-9]{36}/,                                  // GitHub tokens
  /sk-[a-zA-Z0-9]{48}/,                                   // OpenAI keys
];

async function main(input) {
  const data = JSON.parse(input);
  const { tool_input } = data;
  
  const content = tool_input?.content || tool_input?.new_string || '';
  
  // Kiểm tra từng pattern
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      // CHẶN! Không cho phép ghi
      console.log(JSON.stringify({
        decision: 'deny',
        reason: '🚨 Phát hiện secret/API key. Xóa dữ liệu nhạy cảm trước khi tiếp tục.',
      }));
      process.exit(2);  // Exit code 2 = blocking error
    }
  }
  
  // OK, cho phép tiếp tục
  console.log(JSON.stringify({ decision: 'allow' }));
}

const input = await new Promise(resolve => {
  let data = '';
  process.stdin.on('data', chunk => data += chunk);
  process.stdin.on('end', () => resolve(data));
});

main(input).catch(console.error);
```

#### 5.3 `after-tool.js` - Auto-test sau khi thay đổi code
```javascript
#!/usr/bin/env node
/**
 * Chạy SAU KHI AI ghi/sửa file code
 * Mục đích: Tự động chạy tests
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function main(input) {
  const data = JSON.parse(input);
  const { tool_name, tool_input } = data;
  
  // Chỉ xử lý khi ghi/sửa file
  if (!['WriteFile', 'Edit'].includes(tool_name)) {
    console.log(JSON.stringify({}));
    return;
  }
  
  const filePath = tool_input?.file_path;
  
  // Chỉ test files TypeScript/JavaScript
  if (!filePath?.match(/\.(ts|tsx|js|jsx)$/)) {
    console.log(JSON.stringify({}));
    return;
  }
  
  // Tìm file test tương ứng
  const ext = path.extname(filePath);
  const base = filePath.slice(0, -ext.length);
  const testFile = `${base}.test${ext}`;
  
  if (!fs.existsSync(testFile)) {
    console.log(JSON.stringify({
      systemMessage: `⚠️ Không tìm thấy file test cho ${path.basename(filePath)}`,
    }));
    return;
  }
  
  // Chạy tests
  try {
    execSync(`npm test -- ${testFile} --silent`, {
      encoding: 'utf8',
      timeout: 30000,
    });
    
    console.log(JSON.stringify({
      systemMessage: `✅ Tests passed cho ${path.basename(filePath)}`,
    }));
  } catch (error) {
    console.log(JSON.stringify({
      systemMessage: `❌ Tests FAILED cho ${path.basename(filePath)}!`,
    }));
  }
}

const input = await new Promise(resolve => {
  let data = '';
  process.stdin.on('data', chunk => data += chunk);
  process.stdin.on('end', () => resolve(data));
});

main(input).catch(console.error);
```

#### 5.4 `settings.json` - Cấu hình hooks
```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "startup",
      "hooks": [{
        "name": "kit-init",
        "type": "command",
        "command": "node ${extensionPath}/hooks/session-start.js",
        "description": "Khởi tạo Gemini-Kit"
      }]
    }],
    "BeforeTool": [{
      "matcher": "WriteFile|Edit",
      "hooks": [{
        "name": "kit-security",
        "type": "command",
        "command": "node ${extensionPath}/hooks/before-tool.js",
        "description": "Kiểm tra bảo mật (chặn secrets)"
      }]
    }],
    "AfterTool": [{
      "matcher": "WriteFile|Edit",
      "hooks": [{
        "name": "kit-autotest",
        "type": "command",
        "command": "node ${extensionPath}/hooks/after-tool.js",
        "description": "Tự động chạy tests"
      }]
    }]
  }
}
```

---

### 🔨 GIAI ĐOẠN 6: BUILD VÀ TEST (30 phút)

#### 6.1 Cài đặt dependencies
```bash
cd ~/.gemini/extensions/gemini-kit
npm install
```

#### 6.2 Build TypeScript
```bash
npm run build
```

#### 6.3 Làm hooks executable
```bash
chmod +x hooks/*.js
```

#### 6.4 Link extension
```bash
gemini extensions link ~/.gemini/extensions/gemini-kit
```

#### 6.5 Test
```bash
# Khởi động lại Gemini CLI
gemini

# Test các commands
/cook "Tạo function hello world"
/plan "Thêm xác thực JWT"
/scout "Tìm các API endpoints"
```

---

## ✅ TIÊU CHÍ HOÀN THÀNH

- [ ] Extension load không lỗi
- [ ] 8 lệnh TOML hoạt động (/cook, /plan, /scout, /code, /test, /review, /debug, /git)
- [ ] 6 MCP tools có thể gọi được
- [ ] Hooks trigger đúng thời điểm
- [ ] Security hook chặn secrets
- [ ] Auto-test chạy sau khi sửa code
- [ ] Checkpoints có thể tạo/khôi phục

---

## 📊 TỔNG KẾT

| Giai đoạn | Files | Thời gian |
|-----------|-------|-----------|
| 1. Khởi tạo | 4 files config | 30 phút |
| 2. GEMINI.md | 1 file context | 30 phút |
| 3. Commands | 8 files TOML | 60 phút |
| 4. MCP Server | 1 file TypeScript + tools | 90 phút |
| 5. Hooks | 5 files JavaScript + config | 90 phút |
| 6. Build/Test | - | 30 phút |
| **TỔNG** | **20+ files** | **~5.5 giờ** |
