# Phase 1 开发日志：项目搭建与基础架构

**日期**: 2026-04
**状态**: 已完成

## 目标

搭建 SlideForge 桌面应用的基础架构：Electron + React + Vite 工程脚手架，三栏布局，主题系统，状态管理，路由。

## 完成内容

### 1. 工程脚手架

- **Electron + Vite**: 使用 `electron-vite` 创建项目，主进程 / 预加载 / 渲染进程分离构建
- **React 19 + TypeScript**: 渲染进程使用 React 19 + TypeScript 6
- **依赖选型**: Emotion（CSS-in-JS）、Zustand（状态管理）、react-router-dom（路由）、i18next（国际化）

### 2. 三栏布局

```
[Sidebar 220px] | [Workspace: 拖拽式内容区] | [AI Chat 320-360px]
```

- `AppLayout.tsx`: 顶层布局容器，包含 Toolbar + Sidebar + Content
- `Toolbar.tsx`: 顶部工具栏（项目名、上传、重分析、主题、导出、设置）
- `Sidebar.tsx`: 左侧导航栏（新建项目、最近项目、文档、设置）

### 3. 主题系统

- Material Design 3 风格的设计 token：colors / shadows / radius / layout
- ThemeProvider 通过 Emotion `ThemeProvider` 注入
- 支持明暗主题切换的基础设施

### 4. 状态管理

| Store | 职责 |
|-------|------|
| `appStore` | 视图模式（wizard/editor）、向导步骤、侧边栏折叠、活跃 slide/section |
| `settingsStore` | 语言、主题、AI 配置（provider/apiKey/model/baseURL），持久化到 localStorage |
| `projectStore` | 当前项目、最近项目、向导状态（topic/mood/style/scopes/outline） |

### 5. 路由

- `/` → WizardView（创建流程）
- `/editor` → EditorView（编辑视图）
- 视图切换通过 `appStore.currentView` 控制

### 6. 国际化

- 中文 (`zh.json`) + 英文 (`en.json`)
- 使用 i18next + react-i18next
- `t()` 函数贯穿所有 UI 文本

## 关键文件

```
src/
├── main/index.ts              # Electron 主进程入口
├── preload/index.ts           # 预加载脚本（IPC 桥接）
└── renderer/src/
    ├── main.tsx               # React 入口
    ├── layout/
    │   ├── AppLayout.tsx      # 三栏布局
    │   ├── Toolbar.tsx        # 工具栏
    │   └── Sidebar.tsx        # 侧边栏
    └── shared/
        ├── stores/            # Zustand stores
        ├── theme/             # 主题系统
        ├── i18n/              # 国际化
        ├── types/             # TypeScript 类型定义
        └── mocks/             # Mock 数据
```

## 经验与决策

- **选择 Emotion 而非 styled-components**: Emotion 的 `@emotion/babel-plugin` 与 Vite 兼容性更好
- **Zustand 而非 Redux**: 项目规模不需要 Redux 的复杂度，Zustand 的 API 更简洁
- **electron-vite 而非 electron-forge**: electron-vite 对 Vite + React 的集成更成熟
