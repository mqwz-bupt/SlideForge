# Phase 4 开发日志：导出与持久化

**日期**: 2026-04
**状态**: 已完成

## 目标

实现 HTML / PPTX / PDF 三种格式导出，以及基于 SQLite 的项目持久化，让生成的演示文稿可以交付使用，项目数据可以跨会话保留。

## 完成内容

### 1. HTML 导出

**文件**: `src/main/export/html.ts`

- 纯字符串拼接，零外部依赖，生成符合 `frontend-slides-main/SKILL.md` 规范的单文件 HTML
- 内联 `viewport-base.css`（来自 frontend-slides-main），确保 100vh 视口适配
- CSS 自定义属性从 StyleConfig 映射（12 种预设复刻到 `src/main/export/styles.ts`）
- 7 种 slide layout → HTML 结构映射
- 内联 `SlidePresentation` JS 类（键盘导航 ← → Space / 进度条 / nav dots / IntersectionObserver 滚动监听）
- Google Fonts `<link>` 标签

**Layout → HTML 映射**:

| Layout | HTML 结构 |
|--------|-----------|
| `title` | `.slide.title-slide` — accent badge + h1 + subtitle + nav dots |
| `section-divider` | `.slide.divider-slide` — 大号序号 + 分隔线 + h2 |
| `content` | `.slide` — 标题头 + bullet list |
| `two-column` | `.slide` — 两栏卡片 grid |
| `highlight` | `.slide.highlight-slide` — 高亮框 + pill 列表 |
| `image` | `.slide` — 标题 + 左右分栏（文字 + 图片） |
| `quote` | `.slide.quote-slide` — blockquote + 署名 |

### 2. PPTX 导出

**文件**: `src/main/export/pptx.ts`

- 使用 PptxGenJS 生成 .pptx 文件
- 每个 slide layout 映射为 PptxGenJS 的 slide 元素（addText / addShape / addImage）
- 字体从 `styleConfig.displayFont` / `bodyFont` 取
- 颜色使用 `extractSolidColor()` 从可能的渐变字符串中提取 6 位 hex

### 3. PDF 导出

**文件**: `src/main/export/pdf.ts`

- 使用 Playwright headless Chromium
- 依赖 HTML 导出的 `generateHTML()` 生成 HTML 字符串
- `page.setContent()` 加载 → 注入 PDF 专用 CSS 覆盖 → `page.pdf()` 输出

**PDF 专用 CSS 覆盖**:
```css
html { scroll-snap-type: none !important; }
html, body { height: auto !important; overflow: visible !important; }
.slide { page-break-after: always; break-after: page; }
.progress-container, .nav-dots, .keyboard-hint { display: none !important; }
```

### 4. SQLite 持久化

**文件**: `src/main/storage/database.ts`

- 使用 better-sqlite3，WAL 模式
- 数据库路径: `%APPDATA%/slideforge/slideforge.db`
- 表结构:
  ```sql
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    data TEXT NOT NULL,       -- JSON 序列化的完整 Project
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  ```
- CRUD: `saveProject` (upsert) / `loadProject` / `listProjects` / `deleteProject`

### 5. IPC 与 API 桥接

**新增 IPC 通道**:

| 通道 | 方向 | 功能 |
|------|------|------|
| `export:html` | Renderer → Main | 保存对话框 → 生成 HTML → 写文件 |
| `export:pptx` | Renderer → Main | 保存对话框 → 生成 PPTX → 写文件 |
| `export:pdf` | Renderer → Main | 保存对话框 → 生成 PDF → 写文件 |
| `project:save` | Renderer → Main | upsert 项目到 SQLite |
| `project:load` | Renderer → Main | 按 ID 加载项目 |
| `project:list` | Renderer → Main | 列出最近项目（按 updatedAt DESC） |
| `project:delete` | Renderer → Main | 删除项目 |

**Preload 暴露 API**:
```typescript
window.api.export.exportHTML(project)
window.api.export.exportPPTX(project)
window.api.export.exportPDF(project)
window.api.project.save(project)
window.api.project.load(id)
window.api.project.list()
window.api.project.delete(id)
```

### 6. UI 集成

- **Toolbar 导出下拉**: Export 按钮 → 下拉菜单（HTML / PPTX / PDF），点击外部自动关闭
- **GeneratingStep 自动保存**: 幻灯片生成完成后自动调用 `saveProject()`
- **Sidebar 真实数据**: 组件挂载时从 SQLite 加载 `recentProjects`，点击项目直接加载到编辑器
- **i18n**: 新增导出相关字符串（exportHTML / exportPPTX / exportPDF / exportSuccess / exportFailed）

## Bug 修复记录

| 问题 | 根因 | 修复 |
|------|------|------|
| Playwright `chromium-bidi` 模块找不到 | 静态 `import { chromium } from 'playwright'` 在 electron-vite 构建时无法解析 | 改为动态 `await import('playwright')`，仅 PDF 导出时加载 |
| `better-sqlite3` NODE_MODULE_VERSION 不匹配 | 原生模块编译给了 Node.js 而非 Electron | 运行 `npx electron-rebuild` 重新编译 |
| PptxGenJS 警告 `"444" is not valid` | 3 位 hex 缩写（`#444`）不被接受 | `extractSolidColor()` 优先匹配 6 位 hex，自动展开 3 位 → 6 位 |
| PDF 只渲染第一张 slide | `body { height: 100% }` + `scroll-snap` 限制了一屏 | 注入 CSS 覆盖：`height: auto`、`scroll-snap: none`、`page-break-after: always` |
| PDF slide 过小 | Playwright 默认 viewport 800×600，100vh = 600px | 设置 viewport 为 1280×720（16:9） |
| AI 生成 JSON 中 `《》` 未引号包裹 | AI 偶尔遗漏引号，如 `["文本", 《书名》内容]` | `repairJSON()` 状态机遍历，自动为裸文本加引号 |

## 关键文件

```
src/main/export/
├── styles.ts           # StyleConfig 接口 + 12 种预设 + extractSolidColor()
├── html.ts             # HTML 生成（viewport CSS + 布局 CSS + 导航 JS）
├── pptx.ts             # PPTX 生成（PptxGenJS）
├── pdf.ts              # PDF 生成（Playwright headless）
src/main/storage/
├── database.ts         # SQLite CRUD
src/main/index.ts       # 新增 7 个 IPC handler
src/preload/index.ts    # 新增 export.* / project.* API
src/renderer/src/
├── layout/Toolbar.tsx  # 导出下拉菜单
├── layout/Sidebar.tsx  # 真实项目列表
├── shared/stores/projectStore.ts  # save/load/list/delete 异步 action
├── features/wizard/steps/GeneratingStep.tsx  # 自动保存 + repairJSON
```

## 新增依赖

```json
{
  "dependencies": {
    "pptxgenjs": "^4.0.1",
    "better-sqlite3": "^12.9.0",
    "playwright": "^1.59.1"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.13"
  }
}
```

Playwright Chromium 浏览器通过 `npx playwright install chromium` 安装。

## 经验与决策

- **主进程 StyleConfig 副本**: electron-vite 将主进程和渲染进程分别打包，无法跨进程共享模块。在 `src/main/export/styles.ts` 中维护了一份与渲染进程 `stylePresets.ts` 相同的数据。如果未来预设频繁变更，应考虑共享数据源。
- **动态 import Playwright**: Playwright 体积大、包含原生模块，使用 `await import('playwright')` 延迟加载，避免影响应用启动速度。
- **PDF 使用 CSS 覆盖而非生成专用 HTML**: 复用 HTML 导出的 `generateHTML()`，通过 `page.addStyleTag()` 注入 PDF 专用样式。减少了代码重复，同时保证 HTML 和 PDF 的视觉一致性。
- **repairJSON 状态机**: 遍历 JSON 字符串，在 `,` `[` `:` 后检测裸文本并自动加引号。比正则表达式更可靠，能处理嵌套结构。
