import { useState, useRef, useEffect } from 'react'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/shared/stores/appStore'
import { useProjectStore } from '@/shared/stores/projectStore'

const Panel = styled.div`
  width: ${({ theme }) => theme.layout.outlineWidth};
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; flex-direction: column;
  overflow: hidden; flex-shrink: 0;
`

const Header = styled.div`
  padding: 12px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; align-items: center; justify-content: space-between;
`

const HeaderTitle = styled.h3`
  font-size: 13px; font-weight: 600;
  display: flex; align-items: center; gap: 6px;
`

const Actions = styled.div`display: flex; gap: 2px;`

const ActionBtn = styled.button`
  width: 28px; height: 28px; border: none; background: none;
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex; align-items: center; justify-content: center;
  transition: all ${({ theme }) => theme.transition};
  &:hover { background: ${({ theme }) => theme.colors.hover}; color: ${({ theme }) => theme.colors.textPrimary}; }
`

const List = styled.div`
  flex: 1; overflow-y: auto; padding: 10px;
`

const SectionCard = styled.div<{ active?: boolean }>`
  background: ${({ active, theme }) => active ? theme.colors.primaryContainer : theme.colors.background};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 8px 10px; margin-bottom: 6px;
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  transition: all ${({ theme }) => theme.transition};
  &:hover { border-color: ${({ theme }) => theme.colors.primaryLight}; box-shadow: ${({ theme }) => theme.shadows.sm}; }
`

const SectionHeader = styled.div`
  display: flex; align-items: center; gap: 4px; margin-bottom: 4px;
`

const SectionNumber = styled.div`
  width: 20px; height: 20px;
  background: ${({ theme }) => theme.colors.primary}; color: #fff;
  border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
`

const SectionTitleInput = styled.input`
  flex: 1; border: none; background: transparent;
  font-weight: 600; font-size: 12px; color: ${({ theme }) => theme.colors.textPrimary};
  outline: none; padding: 2px 4px; border-radius: 4px;
  &:focus { background: ${({ theme }) => theme.colors.surface}; box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.primaryLight}; }
`

const SectionActions = styled.div`
  display: flex; gap: 1px; opacity: 0;
  transition: opacity ${({ theme }) => theme.transition};
  ${SectionCard}:hover & { opacity: 1; }
`

const SmallBtn = styled.button<{ danger?: boolean }>`
  width: 20px; height: 20px; border: none; background: none;
  border-radius: 4px;
  color: ${({ danger, theme }) => danger ? theme.colors.error || '#F44336' : theme.colors.textMuted};
  display: flex; align-items: center; justify-content: center;
  transition: all ${({ theme }) => theme.transition};
  &:hover { background: ${({ danger }) => danger ? 'rgba(244,67,54,0.1)' : '#EFEFF6'}; }
`

const PointItem = styled.div<{ active?: boolean }>`
  display: flex; align-items: flex-start; gap: 4px;
  padding: 3px 4px 3px 24px;
  border-radius: 4px;
  background: ${({ active, theme }) => active ? theme.colors.primaryContainer : 'transparent'};
  border-left: 2px solid ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  transition: background 0.15s ease, border-color 0.15s ease;
`

const PointDot = styled.div<{ active?: boolean }>`
  width: 4px; height: 4px;
  background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.primaryLight};
  border-radius: 50%;
  margin-top: 7px; flex-shrink: 0;
`

const PointText = styled.span<{ active?: boolean }>`
  flex: 1;
  font-size: 11.5px;
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textSecondary};
  font-weight: ${({ active }) => active ? 600 : 400};
  line-height: 1.4;
`

const PointDeleteBtn = styled.button`
  width: 16px; height: 16px; border: none; background: none;
  border-radius: 3px; color: ${({ theme }) => theme.colors.textMuted};
  display: none; align-items: center; justify-content: center; flex-shrink: 0;
  &:hover { background: rgba(244,67,54,0.1); color: #F44336; }
  ${PointItem}:hover & { display: flex; }
`

const CollapsedPoints = styled.div`
  padding: 2px 4px 2px 24px;
  font-size: 10px; color: ${({ theme }) => theme.colors.textMuted};
`

const EmptyHint = styled.div`
  text-align: center; padding: 40px 20px;
  color: ${({ theme }) => theme.colors.textMuted}; font-size: 13px;
`

export function OutlinePanel() {
  const { t } = useTranslation()
  const activeSectionId = useAppStore((s) => s.activeSectionId)
  const activePointIndex = useAppStore((s) => s.activePointIndex)
  const setActiveSectionId = useAppStore((s) => s.setActiveSectionId)
  const setActiveSlideIndex = useAppStore((s) => s.setActiveSlideIndex)
  const setActivePointIndex = useAppStore((s) => s.setActivePointIndex)
  const project = useProjectStore((s) => s.currentProject)
  const updateSectionTitle = useProjectStore((s) => s.updateSectionTitle)
  const addSection = useProjectStore((s) => s.addSection)
  const deleteSection = useProjectStore((s) => s.deleteSection)
  const deletePoint = useProjectStore((s) => s.deletePoint)
  const moveSectionUp = useProjectStore((s) => s.moveSectionUp)
  const moveSectionDown = useProjectStore((s) => s.moveSectionDown)
  const toggleSectionCollapse = useProjectStore((s) => s.toggleSectionCollapse)

  const listRef = useRef<HTMLDivElement>(null)
  const activeCardRef = useRef<HTMLDivElement>(null)

  // Auto-scroll outline to active section
  useEffect(() => {
    if (activeCardRef.current && listRef.current) {
      activeCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeSectionId, activePointIndex])

  if (!project) {
    return (
      <Panel>
        <Header>
          <HeaderTitle>
            <span className="material-icons-round" style={{ fontSize: 16, color: '#6750A4' }}>account_tree</span>
            {t('editor.outline')}
          </HeaderTitle>
        </Header>
        <EmptyHint>No outline yet.<br />Generate a presentation first.</EmptyHint>
      </Panel>
    )
  }

  const sections = project.documentOutline.sections

  // When clicking a section, jump preview to first slide of that section
  const handleSectionClick = (sectionId: string) => {
    setActiveSectionId(sectionId)
    setActivePointIndex(null)
    const slideIdx = project.slides.findIndex((sl) => sl.sectionId === sectionId)
    if (slideIdx >= 0) setActiveSlideIndex(slideIdx)
  }

  // When clicking a point, jump to the corresponding content slide
  const handlePointClick = (sectionId: string, pointIdx: number) => {
    setActiveSectionId(sectionId)
    setActivePointIndex(pointIdx)
    // Find content slides for this section (exclude divider AND title)
    const contentSlides = project.slides.filter(
      sl => sl.sectionId === sectionId && sl.layout !== 'section-divider' && sl.layout !== 'title'
    )
    if (contentSlides[pointIdx]) {
      const globalIdx = project.slides.findIndex(sl => sl.id === contentSlides[pointIdx].id)
      if (globalIdx >= 0) setActiveSlideIndex(globalIdx)
    }
  }

  return (
    <Panel>
      <Header>
        <HeaderTitle>
          <span className="material-icons-round" style={{ fontSize: 16, color: '#6750A4' }}>account_tree</span>
          {t('editor.outline')}
        </HeaderTitle>
        <Actions>
          <ActionBtn title="Add Section" onClick={addSection}>
            <span className="material-icons-round" style={{ fontSize: 16 }}>add</span>
          </ActionBtn>
        </Actions>
      </Header>
      <List ref={listRef}>
        {sections.map((section, idx) => (
          <SectionCard
            key={section.id}
            ref={(el) => { if (activeSectionId === section.id) activeCardRef.current = el }}
            active={activeSectionId === section.id}
            onClick={() => handleSectionClick(section.id)}
          >
            <SectionHeader onClick={(e) => e.stopPropagation()}>
              <SectionNumber>{section.order}</SectionNumber>
              <SectionTitleInput
                value={section.title}
                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                onClick={(e) => { e.stopPropagation(); handleSectionClick(section.id) }}
              />
              <SectionActions>
                <SmallBtn title="Move up" onClick={() => moveSectionUp(section.id)} style={{ visibility: idx > 0 ? 'visible' : 'hidden' }}>
                  <span className="material-icons-round" style={{ fontSize: 13 }}>expand_less</span>
                </SmallBtn>
                <SmallBtn title="Move down" onClick={() => moveSectionDown(section.id)} style={{ visibility: idx < sections.length - 1 ? 'visible' : 'hidden' }}>
                  <span className="material-icons-round" style={{ fontSize: 13 }}>expand_more</span>
                </SmallBtn>
                <SmallBtn title="Collapse" onClick={() => toggleSectionCollapse(section.id)}>
                  <span className="material-icons-round" style={{ fontSize: 13 }}>{section.isCollapsed ? 'unfold_more' : 'unfold_less'}</span>
                </SmallBtn>
                <SmallBtn danger title="Delete section" onClick={() => {
                  deleteSection(section.id)
                  setActiveSlideIndex(0)
                  if (activeSectionId === section.id) setActiveSectionId(null)
                }}>
                  <span className="material-icons-round" style={{ fontSize: 13 }}>close</span>
                </SmallBtn>
              </SectionActions>
            </SectionHeader>

            {section.isCollapsed ? (
              <CollapsedPoints>{section.points.length} points</CollapsedPoints>
            ) : (
              <>
                {section.points.map((point, pi) => {
                  const isActive = activeSectionId === section.id && activePointIndex === pi
                  return (
                    <PointItem
                      key={point.id}
                      active={isActive}
                      onClick={(e) => { e.stopPropagation(); handlePointClick(section.id, pi) }}
                      style={{ cursor: 'pointer' }}
                    >
                      <PointDot active={isActive} />
                      <PointText active={isActive}>{point.content}</PointText>
                      <PointDeleteBtn title="Delete point" onClick={(e) => {
                        e.stopPropagation()
                        deletePoint(section.id, point.id)
                        if (isActive) setActivePointIndex(null)
                      }}>
                        <span className="material-icons-round" style={{ fontSize: 11 }}>close</span>
                      </PointDeleteBtn>
                    </PointItem>
                  )
                })}
              </>
            )}
          </SectionCard>
        ))}
      </List>
    </Panel>
  )
}
