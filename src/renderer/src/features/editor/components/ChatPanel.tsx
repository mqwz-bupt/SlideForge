import { useState, useRef, useEffect } from 'react'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/shared/stores/appStore'
import { useProjectStore } from '@/shared/stores/projectStore'
import { useSettingsStore } from '@/shared/stores/settingsStore'
import type { ChatMessage } from '@/shared/types/project'

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
  padding: 6px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0; cursor: pointer;
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

const InputArea = styled.div`
  width: 380px; flex-shrink: 0;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; flex-direction: column;
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
  background: ${({ theme }) => theme.colors.primary}; color: #fff;
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

const TypingIndicator = styled.span`
  display: inline-block;
  width: 4px; height: 4px;
  background: ${({ theme }) => theme.colors.textMuted};
  border-radius: 50%;
  animation: blink 1s infinite;
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
`

const quickActions = ['quickSummarize', 'quickShorten', 'quickExplain', 'quickAcademic', 'quickExamples']

export function ChatPanel() {
  const { t } = useTranslation()
  const collapsed = useAppStore((s) => s.chatCollapsed)
  const toggleChat = useAppStore((s) => s.toggleChat)
  const messages = useProjectStore((s) => s.chatMessages)
  const addChatMessage = useProjectStore((s) => s.addChatMessage)
  const currentProject = useProjectStore((s) => s.currentProject)
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

    // Add user message
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
      // Build context for AI
      const outlineContext = currentProject
        ? JSON.stringify({
            title: currentProject.name,
            sections: currentProject.documentOutline.sections.map(s => ({
              title: s.title,
              points: s.points.map(p => p.content)
            }))
          })
        : 'No project loaded yet.'

      const systemPrompt = `You are an AI assistant helping the user with their presentation. You can:
- Restructure sections
- Rewrite slide content
- Add or remove points
- Adjust tone or style
- Answer questions about the content

Current presentation context:
${outlineContext}

Respond concisely using **bold** for emphasis. If the user asks to modify something that requires an outline update, include a JSON block in \`\`\`json ... \`\`\` format.`

      const chatHistory = messages.slice(-6).map(m => ({
        role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: m.content
      }))

      const aiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...chatHistory,
        { role: 'user' as const, content: text }
      ]

      // Set up stream listeners
      const removeChunkListener = window.api.ai.onStreamChunk((chunk) => {
        setStreamContent(prev => prev + chunk)
      })

      const removeDoneListener = window.api.ai.onStreamDone((fullContent) => {
        addChatMessage({
          id: `msg-${Date.now()}`,
          role: 'ai',
          content: fullContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        setStreaming(false)
        setStreamContent('')
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
    } finally {
      // Clean up listeners regardless of success/failure
      removeChunkListener()
      removeDoneListener()
      removeErrorListener()
    }
  }

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
        </HeaderBar>
        <Messages>
          {messages.map((msg) => (
            <Msg key={msg.id} role={msg.role}>
              <MsgAvatar role={msg.role}>
                {msg.role === 'ai' ? 'AI' : 'U'}
              </MsgAvatar>
              <MsgBubble role={msg.role} dangerouslySetInnerHTML={{
                __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }} />
            </Msg>
          ))}
          {streaming && streamContent && (
            <Msg role="ai">
              <MsgAvatar role="ai">AI</MsgAvatar>
              <MsgBubble role="ai" dangerouslySetInnerHTML={{
                __html: streamContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') + '<span style="display:inline-block;width:4px;height:4px;background:#999;border-radius:50%;animation:blink 1s infinite;margin-left:2px;vertical-align:middle;"></span>'
              }} />
            </Msg>
          )}
          {streaming && !streamContent && (
            <Msg role="ai">
              <MsgAvatar role="ai">AI</MsgAvatar>
              <MsgBubble role="ai">
                <TypingIndicator /> Thinking...
              </MsgBubble>
            </Msg>
          )}
          <div ref={messagesEndRef} />
        </Messages>
      </MessagesArea>
      <InputArea>
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
