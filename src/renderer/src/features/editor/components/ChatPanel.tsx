import { useState, useRef, useEffect, Fragment } from 'react'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/shared/stores/appStore'
import { useProjectStore } from '@/shared/stores/projectStore'
import { useSettingsStore } from '@/shared/stores/settingsStore'
import type { ChatMessage, SlideContent } from '@/shared/types/project'

const Panel = styled.div<{ collapsed?: boolean }>`
  height: ${({ collapsed, theme }) => collapsed ? '44px' : theme.layout.chatExpandedHeight};
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-shrink: 0;
  transition: height 0.3s ease;
  overflow: hidden;
`

const MessagesArea = styled.div`
  flex: 1;
  display: flex; flex-direction: column;
  overflow: hidden; position: relative;
`

const HeaderBar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0; cursor: pointer;
  user-select: none;
  &:hover { background: ${({ theme }) => theme.colors.hover}; }
`

const HeaderLeft = styled.div`
  display: flex; align-items: center; gap: 8px;
`

const Avatar = styled.div`
  width: 24px; height: 24px;
  background: linear-gradient(135deg, #6750A4, #9A82DB);
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
`

const HeaderTitle = styled.h3`
  font-size: 12px; font-weight: 600;
`

const InputArea = styled.div<{ collapsed?: boolean }>`
  width: 380px; flex-shrink: 0;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  display: ${({ collapsed }) => collapsed ? 'none' : 'flex'};
  flex-direction: column;
  padding: 8px 12px; gap: 6px;
`

const QuickBtns = styled.div`
  display: flex; flex-wrap: wrap; gap: 4px;
`

const QuickBtn = styled.button`
  padding: 4px 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px; background: ${({ theme }) => theme.colors.surface};
  font-size: 11px; font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all ${({ theme }) => theme.transition};
  white-space: nowrap;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryContainer};
  }
`

const InputWrapper = styled.div`
  display: flex; align-items: center; gap: 6px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: 3px 3px 3px 10px;
  transition: border-color ${({ theme }) => theme.transition};
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`

const Input = styled.input`
  flex: 1; border: none; background: none;
  font-size: 12px; color: ${({ theme }) => theme.colors.textPrimary};
  outline: none;
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
`

const SendBtn = styled.button`
  width: 30px; height: 30px; border: none;
  background: ${({ theme }) => theme.colors.primary }; color: #fff;
  border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all ${({ theme }) => theme.transition}; flex-shrink: 0;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
  display: flex; flex-direction: column; gap: 8px;
`

const Msg = styled.div<{ role: 'user' | 'ai' }>`
  display: flex; gap: 8px;
  animation: fadeInUp 0.3s ease;
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const MsgAvatar = styled.div<{ role: 'user' | 'ai' }>`
  width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700;
  background: ${({ role }) => role === 'ai' ? 'linear-gradient(135deg, #6750A4, #9A82DB)' : '#EFEFF6'};
  color: ${({ role }) => role === 'ai' ? '#fff' : '#666680'};
`

const MsgBubble = styled.div<{ role: 'user' | 'ai' }>`
  background: ${({ role, theme }) => role === 'user' ? theme.colors.primaryContainer : theme.colors.background};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: 6px 10px; font-size: 12px; line-height: 1.5; max-width: 520px;
  color: ${({ role, theme }) => role === 'user' ? theme.colors.primary : theme.colors.textPrimary};
`

const AppliedBadge = styled.span`
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 10px; font-weight: 600;
  color: #2e7d32; background: #e8f5e9;
  padding: 2px 8px; border-radius: 8px;
  margin-left: 6px;
`

const TypingIndicator = styled.span`
  display: inline-block;
  width: 4px; height: 4px;
  background: ${({ theme }) => theme.colors.textMuted};
  border-radius: 50%;
  animation: blink 1s infinite;
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
`

const quickActions = ['quickSummarize', 'quickShorten', 'quickExplain', 'quickAcademic', 'quickExamples']

/** Parse AI response for slide-update JSON commands */
function parseSlideUpdates(text: string): Array<{ index: number; content: Partial<SlideContent>; layout?: string }> {
  const updates: Array<{ index: number; content: Partial<SlideContent>; layout?: string }> = []
  // Match ```slide-updates ... ``` blocks
  const regex = /```slide-updates\s*([\s\S]*?)```/g
  let match
  while ((match = regex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim())
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item.index === 'number' && item.content) {
            updates.push({ index: item.index, content: item.content, layout: item.layout })
          }
        }
      }
    } catch { /* ignore parse errors */ }
  }
  return updates
}

/** Remove slide-updates code blocks from display text */
function stripSlideUpdates(text: string): string {
  return text.replace(/```slide-updates\s*[\s\S]*?```/g, '').trim()
}

/** Render message text with bold + applied badge */
function renderMessageHtml(msg: ChatMessage): string {
  let html = msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  if ((msg as any).appliedSlides) {
    html += ` <span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;color:#2e7d32;background:#e8f5e9;padding:2px 8px;border-radius:8px;">✓ ${(msg as any).appliedSlides}</span>`
  }
  return html
}

export function ChatPanel() {
  const { t } = useTranslation()
  const collapsed = useAppStore((s) => s.chatCollapsed)
  const toggleChat = useAppStore((s) => s.toggleChat)
  const messages = useProjectStore((s) => s.chatMessages)
  const addChatMessage = useProjectStore((s) => s.addChatMessage)
  const currentProject = useProjectStore((s) => s.currentProject)
  const updateSlideContent = useProjectStore((s) => s.updateSlideContent)
  const setSelectedStyle = useProjectStore((s) => s.setSelectedStyle)
  const getAIConfig = useSettingsStore((s) => s.getAIConfig)
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen)

  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamContent])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || streaming) return

    const config = getAIConfig()
    if (!config.apiKey) {
      setSettingsOpen(true)
      return
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    addChatMessage(userMsg)
    setInput('')
    setStreaming(true)
    setStreamContent('')

    try {
      // Build slide context with index numbers so AI can reference them
      const slidesContext = currentProject
        ? currentProject.slides.map((sl, i) => ({
            index: i,
            layout: sl.layout,
            title: sl.content.title,
            body: sl.content.body,
            highlight: sl.content.highlight,
            leftTitle: sl.content.leftTitle,
            leftBody: sl.content.leftBody,
            rightTitle: sl.content.rightTitle,
            rightBody: sl.content.rightBody,
            features: sl.content.features,
            sectionId: sl.sectionId
          }))
        : []

      const systemPrompt = `你是 SlideForge 演示文稿助手。你可以直接修改用户的幻灯片内容。

## 当前幻灯片列表：
${JSON.stringify(slidesContext, null, 0)}

## 你的能力：
1. 修改任何幻灯片标题、正文、高亮文本等
2. 修改幻灯片布局（layout）
3. 同时修改多张幻灯片

## 内容格式要求（极其重要）：
- body 数组中每条必须简短（不超过25个汉字），像 PPT 上的要点，不是段落
- 绝对禁止使用 Markdown 格式（不要 **加粗**、不要 ## 标题、不要 - 列表符号）
- highlight 字段放核心结论或公式，1-2句话，不要分段
- title 字段简短明确（≤12字）
- 如果内容较长，拆分成多条 body 或拆到多个字段
- 错误示范：body: ["**存储器**：存储程序和数据，分为RAM（易失）和ROM（非易失）。"]
- 正确示范：body: ["存储程序和数据", "RAM：易失性，临时存储", "ROM：非易失，持久保存"]

## 规则：
- 当用户要求修改幻灯片时，你必须：
  (a) 用中文简短说明你做了什么修改
  (b) 在回复末尾附带一个 \`\`\`slide-updates 代码块，包含 JSON 数组
- 如果用户没有要求修改，只是提问，正常回答即可

## slide-updates 格式：
\`\`\`slide-updates
[
  {
    "index": 幻灯片索引（从0开始）,
    "layout": "可选，新布局（content/two-column/highlight/quote/feature-grid/big-number/timeline/callout/statement）",
    "content": {
      "title": "新标题",
      "body": ["要点1", "要点2"],
      "highlight": "核心文本",
      "leftTitle": "左栏标题",
      "leftBody": ["左栏要点"],
      "rightTitle": "右栏标题",
      "rightBody": ["右栏要点"],
      "features": [{"name": "名称", "desc": "描述"}]
    }
  }
]
\`\`\`

## 常见操作示例：
- "把第3页标题改成xxx" → 修改 index=2 的 title
- "精简第2页内容" → 减少 index=1 的 body 条目
- "把第4页改成双栏对比" → layout 改 "two-column"，填入 leftTitle/leftBody/rightTitle/rightBody
- "让整体更简洁" → 遍历所有幻灯片，精简 body 为2-3条短要点

注意：content 中只需要包含你要修改的字段，不需要包含所有字段。index 从0开始。`

      const chatHistory = messages.slice(-6).map(m => ({
        role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: m.content
      }))

      const aiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...chatHistory,
        { role: 'user' as const, content: text }
      ]

      const removeChunkListener = window.api.ai.onStreamChunk((chunk) => {
        setStreamContent(prev => prev + chunk)
      })

      const removeDoneListener = window.api.ai.onStreamDone((fullContent) => {
        // Parse and apply slide updates
        const updates = parseSlideUpdates(fullContent)
        let appliedCount = 0
        if (updates.length > 0 && currentProject) {
          for (const upd of updates) {
            if (upd.index >= 0 && upd.index < currentProject.slides.length) {
              // Strip markdown from all string fields
              const clean: Record<string, any> = {}
              for (const [k, v] of Object.entries(upd.content)) {
                if (typeof v === 'string') {
                  clean[k] = v.replace(/\*\*/g, '').replace(/^#+\s*/gm, '').replace(/^[-*]\s*/gm, '').trim()
                } else if (Array.isArray(v)) {
                  clean[k] = v.map(item => {
                    if (typeof item === 'string') return item.replace(/\*\*/g, '').replace(/^[-*]\s*/gm, '').trim()
                    if (item && typeof item === 'object') {
                      const ci: Record<string, any> = {}
                      for (const [ik, iv] of Object.entries(item)) {
                        ci[ik] = typeof iv === 'string' ? iv.replace(/\*\*/g, '').trim() : iv
                      }
                      return ci
                    }
                    return item
                  })
                } else {
                  clean[k] = v
                }
              }
              updateSlideContent(upd.index, clean as Partial<SlideContent>)
              appliedCount++
            }
          }
        }

        // Add AI message (strip JSON blocks for display)
        const displayContent = stripSlideUpdates(fullContent)
        const aiMsg: ChatMessage & { appliedSlides?: string } = {
          id: `msg-${Date.now()}`,
          role: 'ai',
          content: displayContent || fullContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        if (appliedCount > 0) {
          aiMsg.appliedSlides = `已修改 ${appliedCount} 张幻灯片`
        }
        addChatMessage(aiMsg)
        setStreaming(false)
        setStreamContent('')
        removeChunkListener()
        removeDoneListener()
        removeErrorListener()
      })

      const removeErrorListener = window.api.ai.onStreamError((error) => {
        addChatMessage({
          id: `msg-${Date.now()}`,
          role: 'ai',
          content: `Error: ${error}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        setStreaming(false)
        setStreamContent('')
        removeChunkListener()
        removeDoneListener()
        removeErrorListener()
      })

      await window.api.ai.chatStream(config, aiMessages)
    } catch (err: any) {
      addChatMessage({
        id: `msg-${Date.now()}`,
        role: 'ai',
        content: `Error: ${err.message}. Please check your API key in Settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      setStreaming(false)
      setStreamContent('')
    }
  }

  // Render streaming content (strip slide-updates blocks)
  const displayStream = streaming ? stripSlideUpdates(streamContent) : ''

  return (
    <Panel collapsed={collapsed}>
      <MessagesArea>
        <HeaderBar onClick={toggleChat}>
          <HeaderLeft>
            <Avatar>
              <span className="material-icons-round" style={{ fontSize: 14 }}>auto_awesome</span>
            </Avatar>
            <HeaderTitle>{t('editor.aiAssistant')}</HeaderTitle>
          </HeaderLeft>
          <span className="material-icons-round" style={{ fontSize: 18, color: '#999', transition: 'transform 0.3s', transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            expand_less
          </span>
        </HeaderBar>
        <Messages>
          {messages.length === 0 && (
            <Msg role="ai">
              <MsgAvatar role="ai">AI</MsgAvatar>
              <MsgBubble role="ai">
                {t('chat.welcome').split('\n').map((line, i) => (
                  <Fragment key={i}>{i > 0 && <br />}{line}</Fragment>
                ))}
              </MsgBubble>
            </Msg>
          )}
          {messages.map((msg) => (
            <Msg key={msg.id} role={msg.role}>
              <MsgAvatar role={msg.role}>
                {msg.role === 'ai' ? 'AI' : 'U'}
              </MsgAvatar>
              <MsgBubble role={msg.role} dangerouslySetInnerHTML={{
                __html: renderMessageHtml(msg)
              }} />
            </Msg>
          ))}
          {streaming && displayStream && (
            <Msg role="ai">
              <MsgAvatar role="ai">AI</MsgAvatar>
              <MsgBubble role="ai" dangerouslySetInnerHTML={{
                __html: displayStream.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') + '<span style="display:inline-block;width:4px;height:4px;background:#999;border-radius:50%;animation:blink 1s infinite;margin-left:2px;vertical-align:middle;"></span>'
              }} />
            </Msg>
          )}
          {streaming && !displayStream && (
            <Msg role="ai">
              <MsgAvatar role="ai">AI</MsgAvatar>
              <MsgBubble role="ai">
                <TypingIndicator /> {t('chat.thinking')}
              </MsgBubble>
            </Msg>
          )}
          <div ref={messagesEndRef} />
        </Messages>
      </MessagesArea>
      <InputArea collapsed={collapsed}>
        <QuickBtns>
          {quickActions.map((key) => (
            <QuickBtn key={key} onClick={() => setInput(t(`editor.${key}`))} disabled={streaming}>
              {t(`editor.${key}`)}
            </QuickBtn>
          ))}
        </QuickBtns>
        <InputWrapper>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('editor.chatPlaceholder')}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
            disabled={streaming}
          />
          <SendBtn onClick={handleSend} disabled={streaming || !input.trim()}>
            <span className="material-icons-round" style={{ fontSize: 16 }}>
              {streaming ? 'hourglass_top' : 'send'}
            </span>
          </SendBtn>
        </InputWrapper>
      </InputArea>
    </Panel>
  )
}
