# SlideForge 代码审查报告

**审查日期**: 2026-05-22
**审查范围**: 全部源代码（向导流程、编辑器、导出引擎、状态管理、AI 服务）
**审查决策**: REQUEST CHANGES — 存在 CRITICAL 级问题需修复

---

## 问题汇总

| 严重程度 | 数量 | 说明 |
|---------|------|------|
| CRITICAL | 7 | 安全漏洞或数据丢失风险，必须立即修复 |
| HIGH | 14 | 逻辑错误或功能缺陷，上线前应修复 |
| MEDIUM | 12 | 代码质量或最佳实践问题，建议修复 |
| LOW | 8 | 风格建议或微小优化，可选 |

---

## CRITICAL 问题

### C1. ChatPanel 流式监听器内存泄漏
- **文件**: `src/renderer/src/features/editor/components/ChatPanel.tsx`
- **问题**: `handleSend` 中注册的 `onStreamChunk` 监听器在组件卸载时未清理。若用户在 AI 流式输出期间切换页面，监听器仍持有闭包引用，造成内存泄漏和潜在的 state 更新崩溃。
- **修复方案**: 在 `useEffect` cleanup 中移除监听器，或使用 `AbortController` 模式中断流式请求。

### C2. ~~API Key 明文存储~~ ✅ 已修复
- **文件**: `src/renderer/src/shared/stores/settingsStore.ts`
- **问题**: AI API Key 以明文形式存储在 localStorage，无加密、无验证。
- **已修复**: 使用 Electron `safeStorage` API 加密存储 apiKey。自定义 persist storage 将 apiKey 加密后存入独立 localStorage key，其他设置仍明文存储。启动时通过 IPC 解密恢复到内存。新增 `safe-store:get/set` IPC 通道。

### C3. HTML 转义函数不完整
- **文件**: `src/main/export/html.ts` (445-447 行)
- **问题**: 当前 `esc()` 函数仅处理基本的 `<>&"` 字符，不覆盖所有 XSS 向量（如 `javascript:` 协议、事件属性注入等）。
- **修复方案**: 使用成熟的 HTML 转义库，或扩展转义覆盖更多字符和场景。

### C4. OutlinePanel 删除章节竞态条件
- **文件**: `src/renderer/src/features/editor/components/OutlinePanel.tsx` (228-235 行)
- **问题**: `deleteSection` 中 `deleteSection()`、`setActiveSlideIndex(0)`、`setActiveSectionId(null)` 三个 setState 调用非原子操作，可能导致中间状态不一致。
- **修复方案**: 将关联状态更新合并为单次 dispatch，或使用 `flushSync` 确保同步更新。

### C5. ~~超大函数 — generatePPTX（687 行）~~ ✅ 已修复
- **文件**: `src/main/export/pptx.ts`
- **问题**: 单个函数 687 行，远超 50 行上限。
- **已修复**: 拆分为 12 个独立布局函数 + `SlideContext` 接口。文件从 810→356 行。

### C6. ~~超大文件 — PreviewArea.tsx（1176 行）~~ ✅ 已修复
- **文件**: `src/renderer/src/features/editor/components/PreviewArea.tsx`
- **问题**: 文件 1176 行，包含多个大型组件和复杂样式定义。
- **已修复**: 提取 `SlideRenderer.tsx`（745 行，含所有布局样式和渲染逻辑）。PreviewArea 降至 424 行。

### C7. ~~超大函数 — doGenerate（292 行）~~ ✅ 已修复
- **文件**: `src/renderer/src/features/wizard/steps/GeneratingStep.tsx`
- **问题**: 单个函数 292 行，包含 AI 调用、JSON 修复、内容清洗等全部逻辑。
- **已修复**: 提取 `repairJSON`、`cleanText`、`cleanSlideStrings`、`extractJSON` 到 `src/renderer/src/shared/utils/slideUtils.ts`（107 行）。GeneratingStep 降至 493 行。

---

## HIGH 问题

### H1. 幻灯片合并逻辑易出差一错误
- **文件**: `GeneratingStep.tsx` (416-424 行)
- **问题**: 复杂的 section/slide 计数逻辑，容易产生 off-by-one 错误。

### H2. useEffect 依赖项缺失
- **文件**: `OutlineStep.tsx` (341-343 行)
- **问题**: `eslint-disable` 注释掩盖了真实的依赖问题，可能导致 stale closure。

### H3. completedStepsRef 反模式
- **文件**: `GeneratingStep.tsx` (234-235 行)
- **问题**: 使用 ref 跟踪完成步骤数而非 state，说明状态管理设计不合理。

### H4. syncOutlineFromSlide 索引错位
- **文件**: `PreviewArea.tsx` (1030-1051 行)
- **问题**: section 重排后，slide 与 outline 的索引映射可能错位。

### H5. PPTX opacity 值错误
- **文件**: `pptx.ts` (759 行)
- **问题**: `opacity: 8` 应为 `0.08`，已知 opacity 兼容问题的残留。

### H6. 图片 URL 未验证
- **文件**: `html.ts` (571 行)
- **问题**: 用户提供的 imageUrl 直接插入 HTML，未做合法性验证。

### H7. projectStore IPC 调用缺少错误处理
- **文件**: `projectStore.ts` (313-342 行)
- **问题**: `saveProject`、`loadProjectById`、`loadRecentProjects`、`deleteProjectById` 均缺少 try-catch。

### H8. ChatPanel 缺少 Error Boundary
- **文件**: `ChatPanel.tsx`
- **问题**: 流式输出失败时没有错误边界捕获，可能导致整个编辑器崩溃。

### H9. GeneratingStep 生成进度反馈不足
- **文件**: `GeneratingStep.tsx` (583-596 行)
- **问题**: AI 生成过程中进度指示不够明显，用户可能以为应用卡死。

### H10. OutlineStep 加载状态缺少进度提示
- **文件**: `OutlineStep.tsx` (466-468 行)
- **问题**: AI 生成大纲时只显示截断标题，无进度指示器。

### H11. Sidebar 最近项目加载无 loading 状态
- **文件**: `Sidebar.tsx` (241-242 行)
- **问题**: 加载最近项目列表时没有 loading 态，用户体验差。

### H12. 删除章节丢失用户位置
- **文件**: `OutlinePanel.tsx`
- **问题**: 删除 section 时 activeSlideIndex 强制归 0，丢失用户当前浏览位置。

### H13. repairJSON 危险字符串操作
- **文件**: `GeneratingStep.tsx` (106-142 行)
- **问题**: 正则修复 JSON 可能破坏合法内容。

### H14. 两栏布局校验逻辑复杂
- **文件**: `GeneratingStep.tsx` (434-473 行)
- **问题**: rightBody 为空时的回退逻辑复杂，注释不足，难于维护。

---

## MEDIUM 问题

### M1. 大量内联样式混用
- **文件**: `OutlinePanel.tsx` 等多处
- **问题**: styled-component 与 inline style 混用，风格不统一。

### M2. System prompt 硬编码
- **文件**: `ChatPanel.tsx` (249-300 行)
- **问题**: AI system prompt 直接写在组件中，应外置到配置文件。

### M3. CSS 常量 348 行内联
- **文件**: `html.ts` (33-381 行)
- **问题**: VIEWPORT_CSS 和 PRESENTATION_CSS 大段内联在 JS 中。

### M4. 类型安全绕过
- **文件**: `Toolbar.tsx` (154 行)
- **问题**: `(window as any).api` 绕过了 TypeScript 类型检查。

### M5. AboutDialog 未抽离
- **文件**: `Sidebar.tsx` (197-222 行)
- **问题**: AboutDialog 组件嵌在 Sidebar 中，应独立为单独文件。

### M6. 主题切换无过渡动画
- **文件**: `ThemeProvider` 相关
- **问题**: light/dark 切换生硬，没有 CSS transition。

### M7. 颜色操作函数缺少输入校验
- **文件**: `pptx.ts` (35-49 行)
- **问题**: lighten/darken 函数对非法颜色值会静默失败。

### M8. 数据库操作缺少输入清理
- **文件**: `database.ts` (33 行)
- **问题**: SQLite 插入操作未对 JSON 数据做校验。

### M9. Playwright 动态导入缺少错误处理
- **文件**: `pdf.ts` (14-15 行)
- **问题**: Playwright 动态导入可能失败但无 try-catch。

### M10. 错误重试按钮不够醒目
- **文件**: `GeneratingStep.tsx` (542-556 行)
- **问题**: 错误状态的重试按钮视觉层级不足。

### M11. 全屏模式缺少键盘事件处理
- **文件**: `PreviewArea.tsx`
- **问题**: 全屏预览的 overlay 点击不处理键盘事件。

### M12. PDF 导出 CSS 变量兼容性
- **文件**: `pdf.ts` (43 行)
- **问题**: `media: 'screen'` 仿真可能不支持所有 CSS 自定义属性。

---

## LOW 问题

| # | 文件 | 问题 |
|---|------|------|
| L1 | OutlinePanel | 缺少 cursor: pointer 样式 |
| L2 | OutlineStep | 魔法延迟 50ms 用于滚动 |
| L3 | TopicStep | Enter 键行为可能让用户困惑 |
| L4 | GeneratingStep | 主题截断长度不一致（586 vs 566 行）|
| L5 | Sidebar | AboutDialog 不响应 Escape 键 |
| L6 | Toolbar | 语言切换没有即时持久化 |
| L7 | html.ts | clamp() 使用在不同布局中不一致 |
| L8 | 全局 | 缺少 JSDoc 注释 |

---

## 修复优先级

### P0 — 立即修复（影响正确性/安全性）

| 编号 | 问题 | 预估工作量 |
|------|------|-----------|
| C1 | ChatPanel 内存泄漏 | 小 |
| C5 | PPTX opacity 值错误 (H5) | 小 |
| C3 | HTML 转义加固 | 小 |
| C4 | OutlinePanel 竞态条件 | 中 |

### P1 — 短期重构（提升可维护性）

| 编号 | 问题 | 预估工作量 |
|------|------|-----------|
| C5 | 拆分 pptx.ts | 大 |
| C6 | 拆分 PreviewArea.tsx | 大 |
| C7 | 拆分 GeneratingStep.tsx | 大 |
| H7 | projectStore IPC 错误处理 | 中 |
| H8 | ChatPanel Error Boundary | 中 |

### P2 — 功能增强（体验提升）

| 编号 | 问题 | 预估工作量 |
|------|------|-----------|
| H9-H12 | 进度反馈/加载状态优化 | 中 |
| M6 | 主题切换过渡动画 | 小 |
| M5 | AboutDialog 抽离 | 小 |
| M2 | System prompt 外置 | 小 |

---

## 审查文件清单

| 文件 | 行数 | 状态 |
|------|------|------|
| `src/renderer/src/features/wizard/steps/TopicStep.tsx` | 173 | reviewed |
| `src/renderer/src/features/wizard/steps/ScopeStep.tsx` | 166 | reviewed |
| `src/renderer/src/features/wizard/steps/OutlineStep.tsx` | 565 | reviewed |
| `src/renderer/src/features/wizard/steps/MoodStep.tsx` | 181 | reviewed |
| `src/renderer/src/features/wizard/steps/StyleStep.tsx` | 240 | reviewed |
| `src/renderer/src/features/wizard/steps/GeneratingStep.tsx` | 599 | reviewed |
| `src/renderer/src/features/editor/components/OutlinePanel.tsx` | 270 | reviewed |
| `src/renderer/src/features/editor/components/PreviewArea.tsx` | 1176 | reviewed |
| `src/renderer/src/features/editor/components/ChatPanel.tsx` | 480 | reviewed |
| `src/renderer/src/layout/Toolbar.tsx` | 232 | reviewed |
| `src/renderer/src/layout/Sidebar.tsx` | 322 | reviewed |
| `src/renderer/src/layout/AppLayout.tsx` | 45 | reviewed |
| `src/renderer/src/shared/stores/appStore.ts` | ~50 | reviewed |
| `src/renderer/src/shared/stores/projectStore.ts` | ~350 | reviewed |
| `src/renderer/src/shared/stores/settingsStore.ts` | ~80 | reviewed |
| `src/main/export/html.ts` | ~674 | reviewed |
| `src/main/export/pptx.ts` | ~805 | reviewed |
| `src/main/export/pdf.ts` | ~60 | reviewed |
| `src/main/export/styles.ts` | ~280 | reviewed |
| `src/main/storage/database.ts` | ~70 | reviewed |
| `src/main/ai/service.ts` | ~100 | reviewed |

---

*报告由 Claude Code 自动生成，2026-05-22*
