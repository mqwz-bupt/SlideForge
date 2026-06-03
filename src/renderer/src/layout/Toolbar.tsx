import { useState, useRef, useEffect } from 'react'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/shared/stores/appStore'
import { useProjectStore } from '@/shared/stores/projectStore'
import { useSettingsStore } from '@/shared/stores/settingsStore'
import { useNavigate } from 'react-router-dom'

const ToolbarRoot = styled.div`
  height: ${({ theme }) => theme.layout.toolbarHeight};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  flex-shrink: 0;
`

const LogoButton = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radius.sm};
  transition: background ${({ theme }) => theme.transition};
  &:hover { background: ${({ theme }) => theme.colors.hover}; }
`

const LogoIcon = styled.div`
  width: 28px; height: 28px;
  background: linear-gradient(135deg, #6750A4, #9A82DB);
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 14px;
`

const LogoText = styled.span`
  font-weight: 700; font-size: 15px; color: ${({ theme }) => theme.colors.textPrimary};
`

const ProjectBadge = styled.div`
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; background: ${({ theme }) => theme.colors.primaryContainer};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 13px; font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer; transition: background ${({ theme }) => theme.transition};
  &:hover { background: ${({ theme }) => theme.colors.primaryLight}; }
`

const Spacer = styled.div`flex: 1;`

const ToolbarBtn = styled.button<{ variant?: 'ghost' | 'outline' | 'primary' }>`
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border: ${({ variant }) =>
    variant === 'outline' ? `1px solid #E8DEF8` : 'none'};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 13px; font-weight: 500;
  transition: all ${({ theme }) => theme.transition};
  background: ${({ variant, theme }) => {
    if (variant === 'primary') return theme.colors.primary
    if (variant === 'outline') return theme.colors.surface
    return 'transparent'
  }};
  color: ${({ variant, theme }) => {
    if (variant === 'primary') return '#fff'
    if (variant === 'outline') return theme.colors.primary
    return theme.colors.textSecondary
  }};
  &:hover {
    ${({ variant, theme }) => {
      if (variant === 'primary') return `background: ${theme.colors.primaryHover}; box-shadow: ${theme.shadows.md};`
      if (variant === 'outline') return `background: ${theme.colors.primaryContainer};`
      return `background: ${theme.colors.hover}; color: ${theme.colors.textPrimary};`
    }}
  }
`

const Divider = styled.div`
  width: 1px; height: 24px; background: ${({ theme }) => theme.colors.border}; margin: 0 4px;
`

const ExportWrapper = styled.div`
  position: relative;
`

const ExportMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  min-width: 180px;
  z-index: 200;
  overflow: hidden;
`

const ExportItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.hover}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

export function Toolbar() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const currentProject = useProjectStore((s) => s.currentProject)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen)
  const language = useSettingsStore((s) => s.language)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const [exportOpen, setExportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!exportOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [exportOpen])

  const handleNewProject = () => {
    setCurrentView('wizard')
    navigate('/')
  }

  const handleExport = async (format: 'html' | 'pptx' | 'pdf') => {
    if (!currentProject) return
    setExporting(true)
    setExportOpen(false)
    try {
      const api = (window as any).api
      const exporters = { html: api.export.exportHTML, pptx: api.export.exportPPTX, pdf: api.export.exportPDF }
      const result = await exporters[format](currentProject)
      if (result.success) {
        alert(t('toolbar.exportSuccess') + ': ' + result.path)
      } else if (result.error !== 'Cancelled') {
        alert(t('toolbar.exportFailed') + ': ' + result.error)
      }
    } catch (err: any) {
      alert(t('toolbar.exportFailed') + ': ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <ToolbarRoot>
      <LogoButton onClick={handleNewProject}>
        <LogoIcon>S</LogoIcon>
        <LogoText>SlideForge</LogoText>
      </LogoButton>
      {currentProject && (
        <ProjectBadge>
          <span className="material-icons-round" style={{ fontSize: 16 }}>folder_open</span>
          {currentProject.name}
          <span className="material-icons-round" style={{ fontSize: 14, marginLeft: 2 }}>expand_more</span>
        </ProjectBadge>
      )}
      <Spacer />
      <ToolbarBtn variant="ghost">
        <span className="material-icons-round" style={{ fontSize: 18 }}>upload_file</span>
        {t('toolbar.upload')}
      </ToolbarBtn>
      <Divider />
      <ToolbarBtn variant="ghost">
        <span className="material-icons-round" style={{ fontSize: 18 }}>autorenew</span>
        {t('toolbar.reanalyze')}
      </ToolbarBtn>
      <ToolbarBtn variant="outline">
        <span className="material-icons-round" style={{ fontSize: 18 }}>palette</span>
        {t('toolbar.theme')}
      </ToolbarBtn>
      <ExportWrapper ref={menuRef}>
        <ToolbarBtn variant="primary" disabled={!currentProject || exporting} onClick={() => setExportOpen(!exportOpen)}>
          <span className="material-icons-round" style={{ fontSize: 18 }}>picture_as_pdf</span>
          {t('toolbar.export')}
        </ToolbarBtn>
        {exportOpen && (
          <ExportMenu>
            <ExportItem disabled={!currentProject || exporting} onClick={() => handleExport('html')}>
              <span className="material-icons-round" style={{ fontSize: 18 }}>code</span>
              {t('toolbar.exportHTML')}
            </ExportItem>
            <ExportItem disabled={!currentProject || exporting} onClick={() => handleExport('pptx')}>
              <span className="material-icons-round" style={{ fontSize: 18 }}>slideshow</span>
              {t('toolbar.exportPPTX')}
            </ExportItem>
            <ExportItem disabled={!currentProject || exporting} onClick={() => handleExport('pdf')}>
              <span className="material-icons-round" style={{ fontSize: 18 }}>picture_as_pdf</span>
              {t('toolbar.exportPDF')}
            </ExportItem>
          </ExportMenu>
        )}
      </ExportWrapper>
      <Divider />
      <ToolbarBtn variant="ghost" onClick={() => {
        const next = language === 'zh' ? 'en' : 'zh'
        setLanguage(next)
        i18n.changeLanguage(next)
      }}>
        <span className="material-icons-round" style={{ fontSize: 18 }}>translate</span>
        {language === 'zh' ? 'EN' : '中'}
      </ToolbarBtn>
      <ToolbarBtn variant="ghost" onClick={() => setSettingsOpen(true)}>
        <span className="material-icons-round" style={{ fontSize: 18 }}>settings</span>
      </ToolbarBtn>
    </ToolbarRoot>
  )
}
