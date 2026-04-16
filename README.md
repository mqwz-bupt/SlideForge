# SlideForge

AI 驱动的智能演示文稿生成系统 — 上传文档或输入主题，一键生成专业级 HTML / PPTX / PDF 演示文稿。

## 功能特性

- **AI 全自动生成** — 上传 PDF/DOCX/TXT/MD 或输入主题，AI 自动解析内容、生成大纲、创建幻灯片
- **可视化大纲编辑** — 增删章节/要点、拖拽排序、AI 辅助调整
- **12 种风格预设** — 从 Bold Signal 到 Paper & Ink，Show Don't Tell 可视化选择
- **12 种布局模板** — title / content / two-column / highlight / feature-grid / quote / big-number / timeline / callout / statement / image / section-divider
- **AI 对话修改** — 用自然语言指令实时修改幻灯片内容
- **三格式导出** — HTML（零依赖单文件，含入场动画）/ PPTX / PDF
- **多 AI 模型** — 支持 DeepSeek、通义千问、GLM-4，可扩展
- **深色主题** — Light / Dark 主题切换
- **中英文界面** — 完整 i18n 支持

## 技术栈

| 层次 | 技术 |
|------|------|
| 桌面框架 | Electron + electron-vite |
| 前端 | React 18 + TypeScript + Vite |
| UI 样式 | Emotion CSS-in-JS (Material Design 3) |
| 状态管理 | Zustand (persist middleware) |
| AI 接口 | OpenAI 兼容协议适配器 |
| 本地存储 | better-sqlite3 (WAL) |
| 文档解析 | pdf-parse、mammoth.js |
| HTML 导出 | 纯字符串拼接，CSS 变量驱动 |
| PPTX 导出 | PptxGenJS |
| PDF 导出 | Playwright headless |

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/mqwz-bupt/SlideForge.git
cd SlideForge

# 安装依赖
npm install

# 启动开发模式
npm run dev

# 构建生产版本
npm run build
```

## 使用流程

```
上传文档 / 输入主题
        ↓
选择内容范围（核心概念、技术分析、对比、案例）
        ↓
AI 生成大纲 → 编辑确认
        ↓
选择受众氛围（专业自信 / 激情活力 / 沉稳专注 / 启发感动）
        ↓
选择视觉风格（12 套预设，实时预览）
        ↓
AI 生成幻灯片 → 编辑器预览 & AI 对话修改
        ↓
导出 HTML / PPTX / PDF
```

## 项目结构

```
SlideForge/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts             # 应用入口 & IPC 注册
│   │   ├── export/              # 导出模块
│   │   │   ├── html.ts          # HTML 导出（含动画系统）
│   │   │   ├── pptx.ts          # PPTX 导出
│   │   │   ├── pdf.ts           # PDF 导出
│   │   │   └── styles.ts        # 风格配置（主进程副本）
│   │   ├── storage/             # SQLite 数据库
│   │   └── ai/                  # AI 服务适配器
│   ├── renderer/                # React 渲染进程
│   │   ├── src/
│   │   │   ├── App.tsx          # 根组件
│   │   │   ├── layout/          # 布局组件（Toolbar, Sidebar）
│   │   │   ├── features/
│   │   │   │   ├── wizard/      # 向导流程（6 步）
│   │   │   │   ├── editor/      # 编辑器（预览 + 大纲 + AI 对话）
│   │   │   │   └── settings/    # 设置对话框
│   │   │   └── shared/
│   │   │       ├── stores/      # Zustand stores
│   │   │       ├── theme/       # 主题系统（Light + Dark）
│   │   │       ├── i18n/        # 国际化（zh/en）
│   │   │       └── types/       # TypeScript 类型定义
│   │   └── index.html
├── frontend-slides-main/        # 参考设计系统
├── CLAUDE.md                    # 开发指南
└── package.json
```

## 风格预览

| 暗色系 | 亮色系 | 特殊风格 |
|--------|--------|---------|
| Bold Signal | Notebook Tabs | Neon Cyber |
| Electric Studio | Pastel Geometry | Terminal Green |
| Creative Voltage | Split Pastel | Swiss Modern |
| Dark Botanical | Vintage Editorial | Paper & Ink |

## 开发团队

- **胡祖宁** — 前端架构 / AI Prompt 工程
- **马鑫** — 导出与文件处理
- **王诣博** — UI/UX 设计与测试

## 致谢

- [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides) — 风格预设定义、CSS 变量体系与视口适配规范，为本项目导出系统的设计基础

## License

MIT
