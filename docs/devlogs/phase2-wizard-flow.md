# Phase 2 开发日志：向导流程（Wizard Flow）

**日期**: 2026-04
**状态**: 已完成

## 目标

实现 6 步向导流程，从用户输入主题到 AI 生成完整演示文稿。两条路径：主题路径（6 步）和文档路径（跳过 Scope 步，5 步）。

## 完成内容

### 1. 六步向导流程

```
Step 0: TopicStep — 输入主题 或 上传文档
Step 1: ScopeStep — 选择内容范围（仅主题路径）
Step 2: OutlineStep — AI 生成大纲，用户编辑确认
Step 3: MoodStep — 选择受众感受（专业/激动/沉稳/启发）
Step 4: StyleStep — 选择视觉风格（12 种预设）
Step 5: GeneratingStep — AI 生成幻灯片内容
```

**路径路由**:
- 主题: 0 → 1 → 2 → 3 → 4 → 5
- 文档: 0 → 2 → 3 → 4 → 5（跳过 Scope）

### 2. AI 集成

- **适配器模式**: `src/main/ai/adapter.ts` 实现 OpenAI 兼容接口，支持多个提供商
- **流式输出**: 支持 `chatStream` 实时返回 AI 响应
- **中文提示词**: 所有大纲和幻灯片生成的 prompt 使用中文

### 3. 大纲编辑器 (OutlineStep)

- AI 生成大纲后用户可编辑：增删章节、增删要点、重新排序
- AI 辅助调整：通过聊天输入让 AI 修改大纲
- `updateSectionTitle` / `addSection` / `deleteSection` 同步更新 slides
- `updatePointContent` / `addPoint` / `deletePoint` 仅更新大纲（结构性数据）

### 4. 幻灯片生成 (GeneratingStep)

- **两批生成策略**: 避免 token 截断
  - Batch 1: 封面 + 章节分隔页（小批量，精确）
  - Batch 2: 每个知识点一张 slide（大批量，完整内容）
- **合并策略**: 按章节顺序将结构页和内容页组合
- **进度显示**: 两步进度条（生成内容 / 构建项目）

### 5. 设置面板

- AI 提供商预设（OpenAI / Claude / DeepSeek / Qwen / Wenxin）
- API Key 配置与测试
- 模型选择

## 关键 Bug 修复

| 问题 | 修复 |
|------|------|
| TopicStep 输入时不清除 uploadedFileName | 输入框和示例按钮点击时清除 uploadedFileName |
| OutlineStep 重新进入时状态残留 | 使用 `key` prop 强制 remount |
| GeneratingStep catch 中 completedSteps 闭包过期 | 使用 useRef 存储 |
| activeSectionId 硬编码为 's1' | 默认改为 null |
| AI 生成 JSON 中 `《》` 等字符未引号包裹 | 添加 `repairJSON()` 函数，自动修复未引号包裹的裸文本 |

## 关键文件

```
src/renderer/src/features/wizard/
├── WizardView.tsx                # 向导视图容器
├── steps/
│   ├── TopicStep.tsx             # 主题输入 + 文档上传
│   ├── ScopeStep.tsx             # 内容范围选择
│   ├── OutlineStep.tsx           # AI 大纲生成 + 编辑
│   ├── MoodStep.tsx              # 氛围选择
│   ├── StyleStep.tsx             # 风格预览选择
│   └── GeneratingStep.tsx        # 幻灯片生成
├── components/
│   └── StepIndicator.tsx         # 步骤指示器
src/main/ai/
├── adapter.ts                    # OpenAI 兼容适配器
├── prompts.ts                    # 系统提示词
├── types.ts                      # AI 类型定义
└── index.ts                      # IPC 注册
```

## 经验与决策

- **两批生成**: 单次生成所有 slide 会导致 token 溢出截断，拆为结构页 + 内容页效果好
- **大纲优先**: 让用户确认大纲再生成，避免 AI 幻觉导致的大量返工
- **repairJSON**: AI 生成的 JSON 不 100% 可靠，必须加容错处理（尾逗号、未引号包裹的字符串）
