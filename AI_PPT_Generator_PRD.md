# AI 文档生成 PPT 桌面应用 — 产品需求文档 (PRD)

**版本:** 1.0 (MVP)
**日期:** 2026-04-13
**状态:** Draft

---

## 1. 产品概述

### 1.1 产品定位

一款面向高校学生、职场人士和教师研究者的**免费桌面应用**，通过 AI 将用户上传的文档自动转换为精美、动画丰富的演示文稿。

### 1.2 核心价值

- **零设计门槛** — 用户无需设计能力，AI 自动生成专业级幻灯片
- **所见即所得** — 实时预览、风格可视化选择，"Show, Don't Tell"
- **全格式覆盖** — 输入支持 PDF/DOCX/PPTX/TXT/MD，输出支持 HTML/PPTX/PDF
- **本地优先** — 所有数据纯本地存储，无需注册账号，保护隐私

### 1.3 核心流程

```
文档上传 → AI 解析 → 内容结构化 → 风格选择 → 幻灯片生成 → 预览与AI优化 → 导出
```

---

## 2. 目标用户与场景

| 用户群 | 核心场景 | 典型需求 |
|--------|---------|---------|
| 高校学生 | 课程汇报、毕业答辩、学术展示 | 快速将论文/报告转为PPT，节省排版时间 |
| 职场人士 | 产品汇报、项目报告、内训材料 | 将Word方案文档转为专业演示文稿 |
| 教师/研究者 | 课件制作、学术报告、研讨会 | 将教案/论文转为结构化幻灯片 |

---

## 3. 设计理念（源自 frontend-slides skill）

### 3.1 四大核心原则

1. **Zero Dependencies** — HTML 输出为单文件，内联所有 CSS/JS，浏览器直接打开
2. **Show, Don't Tell** — 风格选择通过可视化预览而非文字描述，用户通过"看到"来发现偏好
3. **Distinctive Design** — 杜绝千篇一律的"AI风格"，每份演示文稿都应独特精致
4. **Viewport Fitting** — 每张幻灯片精确适配视口 (100vh)，禁止幻灯片内滚动

### 3.2 设计美学准则

- **字体**: 使用有辨识度的字体（如 Cormorant、Fraunces、Syne），禁止 Arial/Inter/Roboto 作为展示字体
- **配色**: 大胆的主色调搭配锐利的强调色，避免紫色渐变+白底的陈词滥调
- **动效**: 优先 CSS-only 动画，注重页面加载时的交错渐显（animation-delay）
- **背景**: 层叠 CSS 渐变、几何图案，营造氛围和深度，避免纯色背景
- **装饰**: 仅使用抽象 CSS 图形，不使用插图

---

## 4. 技术架构

### 4.1 技术栈

| 层级 | 技术选型 | 理由 |
|------|---------|------|
| 桌面框架 | **Electron** | Web UI 表现力强，交互体验好，美观度高 |
| 前端框架 | **React 18+** | 组件化开发，生态丰富，适合复杂UI |
| UI 组件库 | **Material Design 3 风格自定义组件** | 符合设计需求文档要求 |
| 样式方案 | **CSS-in-JS (Styled Components / Emotion)** | 动态主题切换支持 |
| 构建工具 | **Vite + Electron Builder** | 快速开发体验，可靠打包 |
| AI 接口层 | **多模型适配器模式** | 统一接口，支持 OpenAI / Claude / 国产大模型 |
| 本地存储 | **SQLite (better-sqlite3)** | 项目/历史记录持久化 |
| 文件解析 | **pdf-parse / mammoth / python-pptx** | 多格式文档解析 |
| PPTX 生成 | **PptxGenJS** | 实时渲染导出 .pptx |
| PDF 导出 | **Playwright (headless)** | 截图式高质量 PDF 输出 |

### 4.2 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Main Process                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ File I/O │  │ SQLite   │  │ Export    │              │
│  │ Service  │  │ Storage  │  │ Engine    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────────────────────┐             │
│  │ Document │  │    AI Adapter Layer       │             │
│  │ Parser   │  │  ┌─────┐┌─────┐┌──────┐ │             │
│  │          │  │  │OpenAI││Claude││国产LM│  │             │
│  └──────────┘  │  └─────┘└─────┘└──────┘ │             │
│                └──────────────────────────┘             │
├─────────────────────────────────────────────────────────┤
│                   Renderer Process (React)               │
│  ┌────────┐  ┌──────────────┐  ┌───────────┐           │
│  │Sidebar │  │  Workspace   │  │ AI Chat   │           │
│  │        │  │  ┌────────┐  │  │  Panel    │           │
│  │        │  │  │Structure│  │  │           │           │
│  │        │  │  │Editor   │  │  │           │           │
│  │        │  │  ├────────┤  │  │           │           │
│  │        │  │  │ Slide   │  │  │           │           │
│  │        │  │  │ Preview │  │  │           │           │
│  │        │  │  └────────┘  │  │           │           │
│  └────────┘  └──────────────┘  └───────────┘           │
│  ┌─────────────────────────────────────────┐            │
│  │            Top Toolbar                  │            │
│  └─────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### 4.3 AI 多模型适配器

```typescript
// 统一接口设计
interface AIProvider {
  name: string;
  chat(messages: Message[], options?: ChatOptions): Promise<Response>;
  stream(messages: Message[], options?: ChatOptions): AsyncIterable<Response>;
}

// 支持的 Provider
type SupportedProvider = 'openai' | 'claude' | 'deepseek' | 'qwen' | 'wenxin';
```

用户可在设置中配置：
- 默认 AI 模型
- 各 Provider 的 API Key
- 自定义 API Endpoint（兼容 OpenAI 格式的第三方服务）

---

## 5. 功能模块详细设计

### 5.1 顶部工具栏 (Toolbar)

**功能:** 全局操作入口

| 按钮 | 功能 | 快捷键 |
|------|------|--------|
| Logo | 点击返回首页 | — |
| Upload Document | 上传文档触发解析 | Ctrl+U |
| Re-analyze | 重新解析当前文档 | Ctrl+R |
| Generate PPT | 生成/重新生成幻灯片 | Ctrl+G |
| Export | 导出为 HTML / PPTX / PDF | Ctrl+E |
| Settings | 打开设置面板 | Ctrl+, |
| Language | 中/英切换 | Ctrl+L |

**设计规范:**
- 高度: 48-56px
- 扁平按钮，图标 + 文字
- Primary 色强调主要操作（Generate PPT）
- 背景半透明毛玻璃效果

### 5.2 左侧导航栏 (Sidebar)

**宽度:** 220-240px（可折叠至 60px icon-only 模式）

**结构:**

```
┌─────────────────────┐
│  🎯 App Logo        │
├─────────────────────┤
│  [+ New Project]    │  ← 主要 CTA 按钮
├─────────────────────┤
│  Recent Projects    │
│   ├ Project A       │  ← 圆角卡片列表
│   ├ Project B       │
│   └ Project C       │
├─────────────────────┤
│  Documents          │
│   ├ Uploaded Files  │
│   └ Source Library  │
├─────────────────────┤
│  Account            │
│   ├ Settings        │
│   └ About           │
└─────────────────────┘
```

**交互:**
- Hover 高亮背景
- 选中项显示 Primary 色左侧指示条
- 项目列表按最近使用排序
- 支持右键菜单（重命名、删除、复制）

### 5.3 中间工作区 (Workspace)

Workspace 是应用核心区域，分为上下两部分（或可切换的标签页）：

#### 5.3.1 文档结构编辑器 (Structure Editor)

AI 解析文档后生成结构化大纲，用户可编辑：

**大纲结构:**

```
📌 演示标题
├── Section 1: 引言
│   ├── 要点 A
│   └── 要点 B
├── Section 2: 核心内容
│   ├── 要点 A
│   ├── 要点 B
│   └── 要点 C
└── Section 3: 总结
    └── 要点 A
```

**用户操作:**
- 拖拽排序（Section 和 Point 级别）
- 双击编辑文字
- 右键菜单：添加/删除/合并章节
- 折叠/展开章节
- 每个节点旁显示预估幻灯片数量

**设计规范:**
- 卡片式节点，圆角 12px
- 拖拽时有阴影提升效果
- 编辑状态有明显的输入框高亮
- 节点层级通过缩进 + 连线 + 图标区分

#### 5.3.2 幻灯片预览 (Slide Preview)

实时展示生成的幻灯片：

**布局模式:**
- **缩略图模式** — 左侧幻灯片列表 + 右侧当前幻灯片放大预览
- **全屏预览** — 模拟真实演示效果（动画完整播放）
- **对照模式** — 左侧结构编辑 + 右侧实时预览联动

**控制栏:**

| 操作 | 说明 |
|------|------|
| Theme | 切换 12 种预设主题，实时预览 |
| Layout | 切换幻灯片布局（标题、内容、双栏、图片等） |
| Regenerate | 重新生成当前/全部幻灯片 |
| Export | 导出当前项目 |

**设计规范:**
- 幻灯片缩略图比例 16:9
- 选中幻灯片有 Primary 色边框
- 缩略图悬浮显示操作按钮
- 预览区背景为淡灰色 (#F0F0F5)

### 5.4 AI 聊天面板 (AI Chat Panel)

**宽度:** 320-360px（可折叠）

**功能定位:**
- 解释文档结构
- 修改/优化生成内容
- 调整演示表达风格
- 按指令生成新幻灯片

**界面结构:**

```
┌─────────────────────┐
│  🤖 AI Assistant    │  ← 标题栏 + 模型选择下拉
├─────────────────────┤
│                     │
│  Chat History       │
│                     │
│  AI: I extracted 4  │
│  sections from your │
│  document.          │
│                     │
│  User: Make it      │
│  suitable for a     │
│  10-min presentation│
│                     │
│  AI: Done! I've     │
│  shortened the      │
│  content to fit     │
│  10 minutes.        │
│                     │
├─────────────────────┤
│  Quick Actions:     │
│  [Summarize]        │
│  [Shorten]          │
│  [Explain]          │
│  [Make Academic]    │
│  [Add Examples]     │
├─────────────────────┤
│  [Ask AI...      ▶] │  ← 输入框
└─────────────────────┘
```

**快捷操作按钮:**

| 操作 | 效果 |
|------|------|
| Summarize | 压缩当前章节内容 |
| Shorten | 缩短演示时长 |
| Explain | 为专业术语添加解释 |
| Make Academic | 转为学术风格表达 |
| Add Examples | 为要点添加案例 |

**交互规范:**
- AI 回复支持 Markdown 渲染
- 支持代码块、列表、粗体等格式
- 操作反馈：修改后自动更新结构编辑器和预览
- 流式输出（SSE），实时显示生成内容
- 聊天历史按项目维度保存

### 5.5 设置面板 (Settings)

**分类:**

| 分类 | 设置项 |
|------|--------|
| AI 配置 | 默认模型选择、API Key 管理、自定义 Endpoint |
| 导出设置 | 默认导出格式、PDF 质量、PPTX 模板 |
| 外观 | 界面语言（中/英）、主题（亮色/暗色）、侧边栏宽度 |
| 快捷键 | 自定义快捷键绑定 |
| 数据 | 项目存储路径、缓存清理、数据导出 |

---

## 6. 风格主题系统

### 6.1 12 个预设主题

源自 frontend-slides skill 的 STYLE_PRESETS.md，MVP 阶段全部内置：

| # | 名称 | 类型 | 风格 | 场景推荐 |
|---|------|------|------|---------|
| 1 | **Bold Signal** | 深色 | 自信、大胆、高冲击 | 商业路演、产品发布 |
| 2 | **Electric Studio** | 深色 | 干净、专业、高对比 | 企业报告、品牌展示 |
| 3 | **Creative Voltage** | 深色 | 创意、活力、复古现代 | 创意行业、设计分享 |
| 4 | **Dark Botanical** | 深色 | 优雅、精致、艺术 | 艺术展示、高端场合 |
| 5 | **Notebook Tabs** | 浅色 | 编辑、有序、触感 | 教程、教学内容 |
| 6 | **Pastel Geometry** | 浅色 | 友好、现代、亲切 | 学生汇报、轻松场合 |
| 7 | **Split Pastel** | 浅色 | 活泼、现代、创意 | 团队分享、头脑风暴 |
| 8 | **Vintage Editorial** | 浅色 | 机智、自信、有个性 | 文学、人文、社论 |
| 9 | **Neon Cyber** | 特殊 | 未来感、科技感 | 技术、黑客、开发者 |
| 10 | **Terminal Green** | 特殊 | 开发者、黑客美学 | 编程教学、技术演讲 |
| 11 | **Swiss Modern** | 特殊 | 干净、精确、包豪斯 | 建筑、工程、极简主义 |
| 12 | **Paper & Ink** | 特殊 | 编辑、文学、深思 | 学术报告、论文答辩 |

### 6.2 风格选择交互

遵循 "Show, Don't Tell" 原则：

1. 用户选择期望的**情绪感受**（自信/兴奋/平静/感动，可多选最多2个）
2. 系统根据情绪推荐 3 个匹配主题，生成**单页实时预览**
3. 用户在 3 个预览中选择或混合搭配
4. 也可直接从 12 个预设列表中选择

### 6.3 扩展性设计（后续迭代）

- 预留主题 JSON Schema，支持用户自定义颜色/字体/布局
- 主题文件支持导入/导出
- 社区主题分享（未来）

---

## 7. 文档解析能力

### 7.1 支持的输入格式

| 格式 | 解析方式 | 提取内容 |
|------|---------|---------|
| **PDF** | pdf-parse | 文本段落、标题层级、表格 |
| **DOCX** | mammoth.js | 标题层级、段落、列表、图片 |
| **PPT/PPTX** | python-pptx | 幻灯片标题、内容、图片、备注 |
| **TXT** | 纯文本解析 | 段落、通过空行/缩进推断结构 |
| **MD** | Markdown 解析器 | 标题层级、列表、代码块、图片引用 |

### 7.2 AI 解析流程

```
原始文档
  ↓ 文件解析器
结构化文本内容
  ↓ AI 大模型（首次调用）
文档结构大纲（标题、章节、要点）
  ↓ 用户确认/编辑
确认后的大纲
  ↓ AI 大模型（二次调用）+ 主题 + 布局选择
幻灯片内容生成
```

**AI 提示词策略:**
- **第一次调用**: 分析文档结构，提取章节和要点，输出 JSON 格式的大纲
- **第二次调用**: 根据确认的大纲 + 选定主题 + 内容密度限制，生成每张幻灯片的具体内容

### 7.3 内容密度限制（严格遵守）

每张幻灯片的内容上限：

| 幻灯片类型 | 最大内容 |
|-----------|---------|
| 标题页 | 1 标题 + 1 副标题 + 可选标语 |
| 内容页 | 1 标题 + 4-6 个要点 或 1 标题 + 2 段落 |
| 功能网格 | 1 标题 + 最多 6 张卡片 (2×3 或 3×2) |
| 引用页 | 1 段引用（最多 3 行）+ 出处 |
| 图片页 | 1 标题 + 1 图片 |

**超出限制自动拆分为多张幻灯片，绝不压缩或滚动。**

---

## 8. 导出能力

### 8.1 HTML 演示文稿（主输出格式）

**特点:**
- 单文件，内联所有 CSS/JS，零依赖
- 完整保留动画效果（淡入、滑动、3D 特效等）
- 浏览器直接打开，支持键盘/鼠标/触摸导航
- 响应式设计，适配投影仪/笔记本/手机
- 支持 `prefers-reduced-motion` 无障碍

**技术实现:**
- 内联 `viewport-base.css` 全部内容
- 字体使用 Google Fonts CDN 加载
- 动画使用 CSS-only 优先方案
- 视口适配: 所有尺寸使用 `clamp()` 函数
- 每张幻灯片: `height: 100vh; overflow: hidden;`

### 8.2 PPTX 导出

**实现方式:** 实时渲染导出（PptxGenJS）

**特点:**
- 兼容 Microsoft Office / WPS
- 尽可能还原 HTML 版的视觉效果（颜色、字体、布局）
- 动画转换为 Office 原生动画（有限支持）
- 图片内嵌到 PPTX 文件

### 8.3 PDF 导出

**实现方式:** Playwright 无头浏览器截图

**特点:**
- 1920×1080 分辨率，高清输出
- 动画以最终视觉状态呈现（静态快照）
- 支持大文件自动压缩选项（1280×720，体积减半）

---

## 9. 用户操作流程

### 9.1 主流程

```
Step 1: 新建项目
    │  点击 [New Project] 或拖入文档
    ▼
Step 2: 上传文档
    │  支持 PDF / DOCX / PPTX / TXT / MD
    │  支持拖拽上传
    ▼
Step 3: AI 解析
    │  自动解析文档结构
    │  显示进度指示器
    ▼
Step 4: 审阅大纲
    │  在 Structure Editor 中展示结构化大纲
    │  用户可拖拽排序、编辑、删除、合并
    ▼
Step 5: 选择风格
    │  选择期望情绪 → 预览 3 个推荐主题 → 选择
    │  或直接从 12 个预设中选择
    ▼
Step 6: 生成幻灯片
    │  AI 根据大纲 + 主题生成完整幻灯片
    │  在 Slide Preview 中实时预览
    ▼
Step 7: AI 优化（可选）
    │  通过 AI Chat 面板对话式修改
    │  快捷操作：Summarize / Shorten / Explain 等
    │  修改后自动刷新预览
    ▼
Step 8: 导出
    │  选择格式：HTML / PPTX / PDF
    │  选择保存路径
    └─→ 完成
```

### 9.2 PPT 转换流程（Mode B）

```
上传 .pptx 文件
    → 提取内容（标题、文本、图片、备注）
    → 展示提取结果供确认
    → 选择新风格主题
    → 生成全新的 HTML 演示文稿
```

---

## 10. 数据模型

### 10.1 项目数据

```typescript
interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  sourceFiles: SourceFile[];      // 原始上传文件
  outline: DocumentOutline;       // 文档结构大纲
  selectedTheme: ThemePreset;     // 选中的主题
  slides: Slide[];                // 生成的幻灯片数据
  chatHistory: ChatMessage[];     // AI 对话历史
  exportHistory: ExportRecord[];  // 导出记录
}
```

### 10.2 文档结构大纲

```typescript
interface DocumentOutline {
  title: string;
  subtitle?: string;
  sections: Section[];
}

interface Section {
  id: string;
  title: string;
  points: Point[];
  order: number;
}

interface Point {
  id: string;
  content: string;
  level: number;    // 层级深度
  order: number;
}
```

### 10.3 幻灯片数据

```typescript
interface Slide {
  id: string;
  type: 'title' | 'content' | 'grid' | 'quote' | 'image' | 'section';
  layout: LayoutType;
  heading?: string;
  body?: string[];
  imageUrl?: string;
  notes?: string;    // 演讲者备注
  order: number;
}
```

---

## 11. UI 设计规范

### 11.1 整体布局

- **三栏式布局 + 顶部工具栏**
- 左侧导航栏: 220-240px（可折叠至 60px）
- 中间工作区: 自适应 (flex)
- 右侧 AI 面板: 320-360px（可折叠）

### 11.2 设计风格

参考 Material Design 3:

| 元素 | 规范 |
|------|------|
| 圆角按钮 | 8-10px |
| 圆角卡片 | 12-14px |
| 圆角容器 | 16px |
| 阴影 | 轻量阴影 (elevation 1-3) |
| 图标 | Material Symbols (Rounded) |
| 信息层级 | 清晰的标题/正文/辅助文字区分 |

### 11.3 配色方案

**应用界面配色:**

| 用途 | 色值 |
|------|------|
| Primary | #6750A4 |
| Background | #F8F7FB |
| Card | #FFFFFF |
| Border | #E6E6F0 |
| Hover | #EFEFF6 |
| Text Primary | #1A1A2E |
| Text Secondary | #666680 |

### 11.4 字体

- **应用界面:** Inter / Roboto（清晰实用）
- **幻灯片内容:** 按主题预设使用不同字体（见 STYLE_PRESETS.md）
- **中文字体:** 系统默认中文字体回退

### 11.5 国际化

- 界面语言: 中文 / English 双语切换
- AI 内容: 支持中英文内容生成
- 文档: 中文编码正确处理（UTF-8）

---

## 12. MVP 范围与迭代路线

### 12.1 MVP（v1.0）— 当前目标

**包含:**
- [x] Electron + React 项目搭建
- [x] 三栏式 UI 布局（Sidebar + Workspace + AI Chat）
- [x] 文档上传与解析（PDF、DOCX、TXT、MD）
- [x] AI 文档结构分析（单模型先实现）
- [x] 结构化大纲编辑器（拖拽排序、编辑文字、增删节点）
- [x] 12 个预设主题 + "Show, Don't Tell" 风格选择
- [x] 幻灯片生成与预览
- [x] AI 聊天优化面板
- [x] HTML 导出（完整动画）
- [x] PPTX 导出
- [x] PDF 导出
- [x] 项目管理与历史记录
- [x] 中英双语界面
- [x] 多模型 API Key 配置

**不包含（后续迭代）:**
- [ ] PPT/PPTX 导入转换
- [ ] 自定义主题编辑器
- [ ] 幻灯片内可视化拖拽编辑
- [ ] 团队协作功能
- [ ] 云同步
- [ ] 插件/扩展系统

### 12.2 迭代路线

| 版本 | 重点 |
|------|------|
| **v1.0 (MVP)** | 核心流程打通: 上传 → 解析 → 生成 → 导出 |
| **v1.1** | PPT/PPTX 导入转换、多模型切换优化 |
| **v1.2** | 自定义主题编辑器、主题导入导出 |
| **v2.0** | 可视化幻灯片编辑器（拖拽式） |
| **v2.1** | 插件系统、第三方集成 |

---

## 13. 非功能性需求

### 13.1 性能

| 指标 | 目标 |
|------|------|
| 应用启动时间 | < 3 秒 |
| 文档解析（50页以内） | < 10 秒 |
| 幻灯片生成（20页以内） | < 30 秒 |
| 主题切换预览 | < 1 秒 |
| 导出 HTML | < 5 秒 |
| 导出 PPTX | < 15 秒 |
| 导出 PDF | < 30 秒 |

### 13.2 兼容性

- **操作系统:** Windows 10/11（MVP）
- **显示器:** 1280×720 最低，推荐 1920×1080
- **导出 HTML 兼容:** Chrome / Edge / Firefox 最新版
- **导出 PPTX 兼容:** Office 2016+ / WPS 2019+

### 13.3 安全

- API Key 本地加密存储（electron-store + 加密）
- 文档内容不外传至第三方（除 AI API 调用外）
- 无用户行为追踪
- 无网络要求的离线基础功能（结构编辑、预览）

### 13.4 可靠性

- AI 请求失败时显示明确错误信息，支持重试
- 大文档解析超时提醒，支持分段处理
- 自动保存项目状态（每 30 秒）
- 导出失败不丢失项目数据

---

## 14. 附录

### 14.1 参考产品

| 产品 | 参考点 |
|------|--------|
| NotebookLM | 三栏布局、AI辅助交互 |
| Gamma.app | AI PPT 生成交互模式 |
| Notion AI | 对话式内容编辑 |
| Tome.app | 风格选择与预览 |
| Canva | 编辑器交互参考（后续版本） |

### 14.2 术语表

| 术语 | 定义 |
|------|------|
| Skill | frontend-slides 的设计规范体系 |
| Viewport Fitting | 幻灯片内容严格适配视口，无滚动 |
| Show, Don't Tell | 通过可视化预览让用户发现偏好，而非文字描述 |
| AI Adapter | 多模型统一接口的适配层 |
| Structure Editor | 文档结构化大纲编辑器 |
| Quick Action | AI 聊天面板的快捷操作按钮 |
