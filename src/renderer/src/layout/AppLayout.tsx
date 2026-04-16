import styled from '@emotion/styled'
import { Outlet } from 'react-router-dom'
import { Toolbar } from './Toolbar'
import { Sidebar } from './Sidebar'
import { useAppStore } from '@/shared/stores/appStore'

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`

const Main = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

export function AppLayout() {
  const currentView = useAppStore((s) => s.currentView)

  return (
    <AppContainer>
      <Toolbar />
      <Main>
        {currentView === 'editor' && <Sidebar />}
        <ContentArea>
          <Outlet />
        </ContentArea>
      </Main>
    </AppContainer>
  )
}
