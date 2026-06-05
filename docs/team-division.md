# SlideForge 团队分工说明

## 项目概述

SlideForge 是一个基于 Electron + React 的 AI 演示文稿生成桌面应用，支持文档解析、智能大纲生成、16 套风格模板、实时预览与 AI 对话式修改，可导出 HTML / PPTX / PDF 三种格式。项目代码约 **8,500 行**，涵盖主进程（AI 适配、导出引擎、存储）与渲染进程（向导流程、编辑器、预览）两大模块。

---

## 成员分工

### 胡祖宁 — 前端架构 & AI Prompt 工程

**核心职责**：整体架构设计、状态管理、AI 集成与 Prompt 工程

| 模块 | 具体工作 | 关键文件 |
|------|---------|---------|
| **架构设计** | Electron + React 18 + Vite 技术选型；主进程/渲染进程/预加载三层架构划分；IPC 通信接口设计 | `src/main/index.ts`, `src/preload/index.ts` |
| **状态管理** | 基于 Zustand 设计全局状态架构；实现 ProjectStore（项目/幻灯片/大纲状态）、AppStore（视图/导航状态）、SettingsStore（AI 配置/密钥加密存储） | `src/shared/stores/*.ts` |
| **AI 集成** | 设计多模型适配器模式（OpenAI / Claude / DeepSeek / 通义千问）；实现流式输出（SSE）IPC 桥接；AI 回复中的 slide-updates JSON 解析与自动应用 | `src/main/ai/adapter.ts`, `src/main/ai/types.ts`, `src/main/ai/index.ts` |
| **Prompt 工程** | 设计 System Prompt 结构（幻灯片上下文注入 + 布局约束 + 输出格式规范）；实现 content 清洗管道（Markdown 剥离、字段校验）；布局映射容错机制 | `src/main/ai/prompts.ts`, `src/renderer/src/features/editor/components/ChatPanel.tsx` |
| **向导流程** | 设计六步创建流程（主题→范围→情绪→风格→生成→编辑）的页面路由与状态传递 | `src/renderer/src/features/wizard/WizardView.tsx`, `src/renderer/src/features/wizard/steps/GeneratingStep.tsx` |

**工作量占比**：约 **35%**

---

### 马鑫 — 导出引擎 & 文件处理

**核心职责**：三格式导出、样式系统、文档解析、数据持久化

| 模块 | 具体工作 | 关键文件 |
|------|---------|---------|
| **HTML 导出** | 实现 16 套主题的内联 CSS 生成；12 种幻灯片布局的 HTML 渲染（标题页、内容页、双栏、高亮、引用、大数字、时间轴等）；Google Fonts 按需加载；零依赖单文件输出 | `src/main/export/html.ts` |
| **样式引擎** | 设计 StyleConfig 双轨系统（主进程 StyleConfig + 渲染进程 DesignTokens）；实现颜色工具函数（hex 解析、lighten/darken、accentTint）；主题 CSS 变量动态注入 | `src/main/export/styles.ts`, `src/renderer/src/features/editor/components/stylePresets.ts` |
| **PPTX 导出** | 基于 PptxGenJS 实现 .pptx 输出；布局到 PPTX 原生元素的映射；中文字体与排版适配 | `src/main/export/pptx.ts` |
| **PDF 导出** | 基于 Playwright headless 的 HTML→PDF 渲染管道 | `src/main/export/pdf.ts` |
| **数据持久化** | 基于 better-sqlite3 的本地项目数据库；CRUD 操作封装；localStorage 降级方案 | `src/main/storage/database.ts` |

**工作量占比**：约 **33%**

---

### 王诣博 — UI/UX 设计 & 测试

**核心职责**：视觉设计系统、幻灯片渲染器、交互设计与质量保障

| 模块 | 具体工作 | 关键文件 |
|------|---------|---------|
| **设计系统** | 设计 16 套视觉风格预设（4 暗色 + 4 亮色 + 4 专业 + 4 艺术风格）；定义 DesignTokens 体系（颜色、字体、间距、圆角、组件样式、装饰风格）；中文字体配对策略（Noto Serif SC / Noto Sans SC） | `src/renderer/src/features/editor/components/stylePresets.ts`, `src/renderer/src/shared/types/designTokens.ts` |
| **幻灯片渲染器** | 实现 12 种布局的 React 渲染组件（title / content / two-column / highlight / quote / feature-grid / big-number / timeline / callout / statement / image / section-divider）；KaTeX 数学公式渲染；CSS clamp() 响应式尺寸系统 | `src/renderer/src/features/editor/components/SlideRenderer.tsx` |
| **预览与交互** | 三栏编辑器布局（大纲 + 预览 + AI 聊天）；幻灯片切换动画与手势滚动；缩略图导航条；全屏演示模式；大纲与预览的联动同步 | `src/renderer/src/features/editor/components/PreviewArea.tsx`, `src/renderer/src/features/editor/components/OutlinePanel.tsx` |
| **主题与国际化** | Material Design 3 风格自定义主题系统（亮/暗模式）；Emotion CSS-in-JS 主题注入；中英双语 i18n 支持 | `src/renderer/src/shared/theme/*.ts`, `src/renderer/src/shared/i18n/index.ts` |
| **质量保障** | 编写 104 个单元测试（样式引擎、HTML 布局、AI 类型、文档解析、工具函数）；测试覆盖 16 套主题配置校验、颜色工具函数、导出布局正确性 | `tests/unit/*.test.ts` |

**工作量占比**：约 **32%**

---

## 协作模式

### 接口契约

三位成员通过 **TypeScript 类型定义** 建立模块间契约：

```
胡祖宁（架构/AI）          马鑫（导出/存储）         王诣博（UI/测试）
     |                          |                        |
     |  <-- Project 类型 -->    |                        |
     |  <-- SlideContent -->    |  <-- StyleConfig -->   |
     |                          |  <-- DesignTokens -->  |
     |  <-- IPC 通道定义 -->    |                        |
     |                          |                        |
  projectStore.ts          export/*.ts            SlideRenderer.tsx
  ChatPanel.tsx            styles.ts              stylePresets.ts
  ai/*.ts                  database.ts            PreviewArea.tsx
```

- **胡祖宁** 定义 `Project`、`Slide`、`SlideContent` 核心数据模型 --> **马鑫** 基于这些类型实现导出引擎 --> **王诣博** 基于这些类型实现渲染器
- **马鑫** 定义 `StyleConfig` 导出样式接口 --> **王诣博** 基于该接口在渲染端实现 `DesignTokens` 设计系统，保证导出与预览视觉一致
- **胡祖宁** 设计 `ipcMain/ipcRenderer` 通信通道 --> **马鑫** 实现存储层 IPC handler --> **王诣博** 在 UI 层调用

### 协作流程

1. **设计阶段**（第 1-2 周）：三人共同参与 PRD 编写，胡祖宁主导架构设计，王诣博主导 UI 原型，马鑫调研导出技术方案
2. **开发阶段**（第 3-6 周）：各负责模块并行开发，通过 TypeScript 接口契约解耦，每周同步接口变更
3. **集成阶段**（第 7-8 周）：胡祖宁负责模块集成与 IPC 联调，马鑫负责导出链路端到端测试，王诣博负责视觉回归测试与 Bug 修复
4. **验收阶段**（第 9 周）：三人交叉 Code Review，王诣博编写并运行全部单元测试

---

## 工作量量化

| 成员 | 负责文件数 | 代码行数（约） | 测试用例 |
|------|----------|-------------|---------|
| 胡祖宁 | 15 | 2,900 | aiTypes, slideUtils |
| 马鑫 | 7 | 2,500 | htmlExport, htmlLayouts, styles, docParsing |
| 王诣博 | 12 | 3,100 | styles, htmlLayouts, docParsing, slideUtils |

> 总计：约 8,500 行源码 + 104 个单元测试用例

---

## Git 提交统计

> 建议在答辩前运行 `git shortlog -sn` 查看实际提交分布，作为工作量佐证。
