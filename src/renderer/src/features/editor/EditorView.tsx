import { Component, type ReactNode } from 'react'
import styled from '@emotion/styled'
import { OutlinePanel } from './components/OutlinePanel'
import { PreviewArea } from './components/PreviewArea'
import { ChatPanel } from './components/ChatPanel'

const TopArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
`

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const ErrorFallback = styled.div`
  padding: 12px 16px;
  background: #fff3e0;
  color: #e65100;
  font-size: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 8px;
`

interface EBProps { children: ReactNode }
interface EBState { hasError: boolean }

class ChatErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback><span className="material-icons-round" style={{ fontSize: 16 }}>warning</span> AI Chat encountered an error. Please try again.</ErrorFallback>
    }
    return this.props.children
  }
}

export function EditorView() {
  return (
    <Container>
      <TopArea>
        <OutlinePanel />
        <PreviewArea />
      </TopArea>
      <ChatErrorBoundary>
        <ChatPanel />
      </ChatErrorBoundary>
    </Container>
  )
}
