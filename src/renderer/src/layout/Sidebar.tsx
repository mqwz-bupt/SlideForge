import { useEffect } from 'react'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/shared/stores/appStore'
import { useProjectStore } from '@/shared/stores/projectStore'
import { useSettingsStore } from '@/shared/stores/settingsStore'

const SidebarRoot = styled.div<{ collapsed?: boolean }>`
  width: ${({ collapsed, theme }) => collapsed ? '0px' : theme.layout.sidebarWidth};
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  transition: width 0.3s ease, opacity 0.3s ease;
  opacity: ${({ collapsed }) => collapsed ? 0 : 1};
  pointer-events: ${({ collapsed }) => collapsed ? 'none' : 'auto'};
`

const NewButton = styled.button`
  margin: 12px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all ${({ theme }) => theme.transition};
  flex-shrink: 0;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-1px);
  }
`

const Nav = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 12px;
`

const Section = styled.div`
  padding: 0 12px;
  margin-bottom: 4px;
`

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 12px 8px 6px;
`

const SidebarItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition};
  font-size: 13px;
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textSecondary};
  position: relative;
  ${({ active, theme }) => active && `
    background: ${theme.colors.primaryContainer};
    font-weight: 500;
    &::before {
      content: '';
      position: absolute;
      left: -12px; top: 6px; bottom: 6px;
      width: 3px;
      background: ${theme.colors.primary};
      border-radius: 0 3px 3px 0;
    }
  `}
  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primaryContainer : theme.colors.hover};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`

const Badge = styled.span`
  margin-left: auto;
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 10px;
  flex-shrink: 0;
`

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ItemName = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ItemMeta = styled.div<{ active?: boolean }>`
  font-size: 10px;
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textMuted};
  margin-top: 1px;
  ${({ active }) => active && 'opacity: 0.7;'}
`

const Bottom = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 12px;
`

export function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setActiveSlideIndex = useAppStore((s) => s.setActiveSlideIndex)
  const setActiveSectionId = useAppStore((s) => s.setActiveSectionId)
  const setWizardStep = useAppStore((s) => s.setWizardStep)
  const recentProjects = useProjectStore((s) => s.recentProjects)
  const currentProject = useProjectStore((s) => s.currentProject)
  const resetWizardState = useProjectStore((s) => s.resetWizardState)
  const loadProjectById = useProjectStore((s) => s.loadProjectById)
  const loadRecentProjects = useProjectStore((s) => s.loadRecentProjects)

  // Load recent projects on mount
  useEffect(() => {
    loadRecentProjects()
  }, [])

  const handleNewProject = () => {
    resetWizardState()
    setActiveSlideIndex(0)
    setActiveSectionId(null)
    setWizardStep(0)
    setCurrentView('wizard')
    navigate('/')
  }

  const handleOpenProject = async (id: string) => {
    await loadProjectById(id)
    setCurrentView('editor')
    navigate('/editor')
  }

  return (
    <SidebarRoot collapsed={collapsed}>
      <NewButton onClick={handleNewProject}>
        <span className="material-icons-round" style={{ fontSize: 18 }}>add</span>
        {t('sidebar.newProject')}
      </NewButton>
      <Nav>
        <Section>
          <SectionTitle>{t('sidebar.recentProjects')}</SectionTitle>
          {recentProjects.length === 0 && (
            <SidebarItem>
              <span className="material-icons-round" style={{ fontSize: 18, opacity: 0.4 }}>info</span>
              <ItemInfo><ItemName style={{ opacity: 0.5 }}>No projects yet</ItemName></ItemInfo>
            </SidebarItem>
          )}
          {recentProjects.map((project) => (
            <SidebarItem
              key={project.id}
              active={currentProject?.id === project.id}
              onClick={() => handleOpenProject(project.id)}
            >
              <span className="material-icons-round" style={{ fontSize: 18, opacity: 0.7 }}>slideshow</span>
              <ItemInfo>
                <ItemName>{project.name}</ItemName>
                <ItemMeta active={currentProject?.id === project.id}>
                  {project.style} · {project.slideCount} slides · {project.updatedAt}
                </ItemMeta>
              </ItemInfo>
              <Badge>{project.slideCount}p</Badge>
            </SidebarItem>
          ))}
        </Section>
        <Section>
          <SectionTitle>{t('sidebar.documents')}</SectionTitle>
          <SidebarItem>
            <span className="material-icons-round" style={{ fontSize: 18, opacity: 0.7 }}>description</span>
            <ItemInfo>
              <ItemName>{t('sidebar.uploadedFiles')}</ItemName>
            </ItemInfo>
          </SidebarItem>
          <SidebarItem>
            <span className="material-icons-round" style={{ fontSize: 18, opacity: 0.7 }}>library_books</span>
            <ItemInfo>
              <ItemName>{t('sidebar.sourceLibrary')}</ItemName>
            </ItemInfo>
          </SidebarItem>
        </Section>
      </Nav>
      <Bottom>
        <SidebarItem onClick={() => setSettingsOpen(true)}>
          <span className="material-icons-round" style={{ fontSize: 18, opacity: 0.7 }}>settings</span>
          {t('sidebar.settings')}
        </SidebarItem>
        <SidebarItem>
          <span className="material-icons-round" style={{ fontSize: 18, opacity: 0.7 }}>info</span>
          {t('sidebar.about')}
        </SidebarItem>
      </Bottom>
    </SidebarRoot>
  )
}
