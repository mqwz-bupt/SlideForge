# SlideForge

AI 驱动的文档转演示文稿桌面应用。上传 PDF/DOCX/TXT/MD 或输入主题，自动生成带有精美动画和排版的 HTML/PPTX/PDF 演示文稿。

## 功能概览

- **AI 智能生成** — 支持多种 AI 模型（OpenAI / Claude / DeepSeek / Qwen / 文心），自动解析文档结构，生成大纲和幻灯片内容
- **6 步向导流程** — 主题/文档 → 内容范围 → 大纲编辑 → 氛围选择 → 风格预览 → 一键生成
- **12 种视觉风格** — 从 Bold Signal 到 Paper & Ink，覆盖暗色/亮色/特殊三类
- **实时编辑** — 大纲面板 + 幻灯片预览 + AI 聊天助手三栏编辑器
- **多格式导出** — HTML（单文件、键盘翻页）、PPTX（PowerPoint）、PDF
- **本地持久化** — SQLite 存储，项目数据完全保留在本地
- **中英双语** — UI 支持中文/英文切换

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Electron 41 |
| 前端 | React 19 + TypeScript 6 |
| 构建 | electron-vite + Vite |
| UI | Emotion (CSS-in-JS) + Material Design 3 风格 |
| 状态管理 | Zustand |
| 国际化 | i18next |
| AI 集成 | OpenAI 兼容适配器（多模型） |
| 数学公式 | KaTeX |
| 导出 | PptxGenJS (PPTX)、Playwright (PDF)、纯字符串拼接 (HTML) |
| 存储 | better-sqlite3 (WAL 模式) |

## 项目结构

```
src/
├── main/                          # Electron 主进程
│   ├── index.ts                   # 主入口 + IPC handlers
│   ├── ai/                        # AI 适配器
│   │   ├── adapter.ts             # OpenAI 兼容接口
│   │   ├── prompts.ts             # 系统提示词
│   │   ├── types.ts               # 类型定义
│   │   └── index.ts               # IPC 注册
│   ├── export/                    # 导出模块
│   │   ├── styles.ts              # 12 种风格预设（主进程副本）
│   │   ├── html.ts                # HTML 生成
│   │   ├── pptx.ts                # PPTX 生成
│   │   └── pdf.ts                 # PDF 生成
│   └── storage/
│       └── database.ts            # SQLite CRUD
├── preload/
│   └── index.ts                   # 预加载脚本（IPC 桥接）
└── renderer/src/                  # React 渲染进程
    ├── main.tsx                   # React 入口
    ├── layout/
    │   ├── AppLayout.tsx          # 三栏布局容器
    │   ├── Toolbar.tsx            # 顶部工具栏（含导出下拉）
    │   └── Sidebar.tsx            # 侧边栏（项目列表）
    ├── features/
    │   ├── wizard/                # 创建流程
    │   │   ├── WizardView.tsx
    │   │   ├── steps/
    │   │   │   ├── TopicStep.tsx      # 步骤 0：主题/上传
    │   │   │   ├── ScopeStep.tsx      # 步骤 1：内容范围
    │   │   │   ├── OutlineStep.tsx    # 步骤 2：大纲编辑
    │   │   │   ├── MoodStep.tsx       # 步骤 3：氛围选择
    │   │   │   ├── StyleStep.tsx      # 步骤 4：风格选择
    │   │   │   └── GeneratingStep.tsx # 步骤 5：生成幻灯片
    │   │   └── components/
    │   │       └── StepIndicator.tsx
    │   ├── editor/                # 编辑器视图
    │   │   ├── EditorView.tsx
    │   │   └── components/
    │   │       ├── PreviewArea.tsx    # 幻灯片预览
    │   │       ├── OutlinePanel.tsx   # 大纲面板
    │   │       ├── ChatPanel.tsx      # AI 聊天
    │   │       └── stylePresets.ts    # 12 种风格配置
    │   └── settings/
    │       └── SettingsDialog.tsx
    └── shared/
        ├── stores/                # Zustand stores
        ├── theme/                 # 主题系统
        ├── i18n/                  # 国际化
        ├── types/                 # TypeScript 类型
        └── mocks/                 # Mock 数据
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
# 克隆仓库
git clone <repo-url>
cd program-design

# 安装依赖
npm install

# 重建原生模块（better-sqlite3 需要匹配 Electron ABI）
npx electron-rebuild

# 安装 Playwright Chromium（PDF 导出需要）
npx playwright install chromium
```

### 开发

```bash
npm run dev
```

### 构建

```bash
npm run build
npm run preview
```

## 使用流程

```
输入主题/上传文档 → 选择内容范围 → 编辑确认大纲 → 选择氛围 → 选择风格 → 生成 → 编辑/导出
```

1. **启动应用** — 首次使用需在设置中配置 AI API Key
2. **创建项目** — 输入演示主题，或上传 PDF/DOCX/TXT/MD 文档
3. **编辑大纲** — AI 生成大纲后可自由编辑，也可让 AI 辅助调整
4. **选择风格** — 根据氛围推荐 12 种预设风格，实时预览
5. **生成幻灯片** — AI 自动填充每张 slide 的内容
6. **导出** — 点击工具栏 Export 按钮，选择 HTML / PPTX / PDF

## 12 种风格预设

### 暗色
| Bold Signal | Electric Studio | Creative Voltage | Dark Botanical |
|---|---|---|---|
| 黑白 + 橙色 | 白蓝渐变 | 蓝黄对比 | 深色 + 赭石金 |

### 亮色
| Notebook Tabs | Pastel Geometry | Split Pastel | Vintage Editorial |
|---|---|---|---|
| 深灰 + 薄荷绿 | 浅蓝 + 淡紫 | 桃色/薰衣草对分 | 奶油 + 复古棕 |

### 特殊
| Neon Cyber | Terminal Green | Swiss Modern | Paper & Ink |
|---|---|---|---|
| 深蓝 + 霓虹绿 | 终端黑 + 代码绿 | 纯白 + 瑞士红 | 米白 + 墨红 |

## 导出格式

| 格式 | 说明 |
|------|------|
| **HTML** | 单文件，内联 CSS/JS，键盘翻页，零依赖，浏览器直接打开 |
| **PPTX** | PowerPoint 格式，支持字体/颜色映射，可二次编辑 |
| **PDF** | A4 横版，Playwright headless Chromium 渲染，保留背景色 |

## 数据存储

- 项目数据存储在本地 SQLite 数据库（`%APPDATA%/slideforge/slideforge.db`）
- 无云端同步，所有数据完全保留在本地
- 支持 AI API Key 加密存储在设置中

## 开发日志

| 阶段 | 内容 |
|------|------|
| [Phase 1](docs/devlogs/phase1-project-setup.md) | 项目搭建：Electron + React + Vite 脚手架，三栏布局，主题/状态/路由 |
| [Phase 2](docs/devlogs/phase2-wizard-flow.md) | 向导流程：6 步创建，AI 集成，大纲编辑，两批生成策略 |
| [Phase 3](docs/devlogs/phase3-style-presets-editor.md) | 风格预设：12 种视觉风格，编辑器三栏视图，实时预览 |
| [Phase 4](docs/devlogs/phase4-export-persistence.md) | 导出 + 持久化：HTML/PPTX/PDF 导出，SQLite 存储 |

## 许可证

MIT
