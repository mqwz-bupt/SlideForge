# Phase 3 开发日志：风格预设与编辑器视图

**日期**: 2026-04
**状态**: 已完成

## 目标

实现 12 种视觉风格预设，编辑器视图（大纲面板 + 幻灯片预览 + AI 聊天），以及实时风格切换。

## 完成内容

### 1. 12 种风格预设

| 分类 | 风格 | 特点 |
|------|------|------|
| 暗色 | Bold Signal | 黑白 + 橙色强调 |
| 暗色 | Electric Studio | 白蓝渐变 |
| 暗色 | Creative Voltage | 蓝黄对比 + 等宽字体 |
| 暗色 | Dark Botanical | 深色 + 赭石金 |
| 亮色 | Notebook Tabs | 深灰 + 薄荷绿 |
| 亮色 | Pastel Geometry | 浅蓝 + 淡紫 |
| 亮色 | Split Pastel | 桃色/薰衣草对分 |
| 亮色 | Vintage Editorial | 奶油色 + 复古棕 |
| 特殊 | Neon Cyber | 深蓝 + 霓虹绿 |
| 特殊 | Terminal Green | 终端黑 + 代码绿 |
| 特殊 | Swiss Modern | 纯白 + 瑞士红 |
| 特殊 | Paper & Ink | 米白 + 墨红 |

每个预设包含 21 个配置项：字体、标题区颜色、内容区颜色、导航点颜色。

### 2. 编辑器视图

```
[OutlinePanel] | [PreviewArea] | [ChatPanel]
```

- **OutlinePanel**: 章节导航，折叠/展开，增删改操作
- **PreviewArea**: 幻灯片实时预览，支持 7 种 layout 渲染
- **ChatPanel**: AI 聊天助手，快速操作（总结/精简/解释/学术化/加案例）

### 3. 实时预览

- CSS 自定义属性驱动动态主题切换
- `useStyleFonts` Hook 动态注入 Google Fonts
- KaTeX 数学公式渲染（LaTeX 语法）
- `clamp()` 响应式排版

### 4. Slide Layout 类型

```
title | content | two-column | highlight | image | quote | section-divider | blank | feature-grid
```

PreviewArea 为每种 layout 实现了对应的 React 渲染组件。

### 5. 氛围-风格映射

MoodStep 选择的氛围会影响 StyleStep 展示的风格：
- `confident` → Bold Signal, Electric Studio, Dark Botanical
- `excited` → Creative Voltage, Neon Cyber, Swiss Modern
- `calm` → Notebook Tabs, Pastel Geometry, Paper & Ink
- `inspired` → Split Pastel, Vintage Editorial, Terminal Green

## 关键文件

```
src/renderer/src/features/editor/
├── EditorView.tsx                    # 编辑器主视图
├── components/
│   ├── PreviewArea.tsx               # 幻灯片预览（7 种 layout）
│   ├── OutlinePanel.tsx              # 大纲面板
│   ├── ChatPanel.tsx                 # AI 聊天面板
│   └── stylePresets.ts               # 12 种风格配置
src/renderer/src/features/wizard/steps/
├── StyleStep.tsx                     # 风格选择（带预览卡片）
```

## 经验与决策

- **CSS 自定义属性而非 CSS-in-JS**: 预览区使用 `--title-bg` 等 CSS 变量，避免每个 preset 生成大量 JS 样式对象
- **Show Don't Tell**: StyleStep 使用实际的颜色和字体渲染预览卡片，而非文字描述
- **KaTeX 集成**: 通过 `react-katex` 包裹，支持行内 `$...$` 和块级 `$$...$$` 公式
