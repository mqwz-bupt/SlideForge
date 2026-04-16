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

export function EditorView() {
  return (
    <Container>
      <TopArea>
        <OutlinePanel />
        <PreviewArea />
      </TopArea>
      <ChatPanel />
    </Container>
  )
}
