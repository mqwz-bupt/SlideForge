import { useState, useEffect, useCallback, useRef } from 'react'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/shared/stores/appStore'
import { useProjectStore } from '@/shared/stores/projectStore'
import type { StylePreset } from '@/shared/types/project'
import { getStyleConfig, stylePresets } from './stylePresets'
import { SlideRenderer, useStyleFonts } from './SlideRenderer'

const Area = styled.div`
  flex: 1;
  display: flex; flex-direction: column;
  overflow: hidden; background: #E8E8EE;
`

const PreviewToolbar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}; flex-shrink: 0;
`

const ToolbarLeft = styled.div`
  display: flex; align-items: center; gap: 12px;
`

const ToolbarTitle = styled.h3`
  font-size: 13px; font-weight: 600;
  display: flex; align-items: center; gap: 6px;
`

const SlideCounter = styled.span`
  font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.background};
  padding: 3px 10px; border-radius: 10px;
`

const Controls = styled.div`display: flex; gap: 6px;`

const Select = styled.select`
  padding: 5px 28px 5px 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 12px; color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.surface};
  appearance: none; cursor: pointer;
  &:hover { border-color: ${({ theme }) => theme.colors.primaryLight}; }
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary }; }
`

const GhostBtn = styled.button`
  padding: 5px 8px; border: none; background: none;
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex; align-items: center; justify-content: center;
  &:hover { background: ${({ theme }) => theme.colors.hover }; }
`

const SlideMain = styled.div`
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
`

/* ========== SLIDE TRANSITION WRAPPER ========== */
const SlideTransition = styled.div<{ direction: number }>`
  width: 100%; height: 100%;
  animation: slideIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(${({ direction }) => direction >= 0 ? '20px' : '-20px'});
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  /* Staggered child reveals */
  & > * > * {
    opacity: 0;
    transform: translateY(12px);
    animation: revealUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  & > * > *:nth-child(1) { animation-delay: 0.05s; }
  & > * > *:nth-child(2) { animation-delay: 0.12s; }
  & > * > *:nth-child(3) { animation-delay: 0.18s; }
  & > * > *:nth-child(4) { animation-delay: 0.24s; }
  & > * > *:nth-child(5) { animation-delay: 0.30s; }
  & > * > *:nth-child(6) { animation-delay: 0.36s; }
  & > * > *:nth-child(7) { animation-delay: 0.42s; }
  & > * > *:nth-child(8) { animation-delay: 0.48s; }

  @keyframes revealUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const SlideCanvas = styled.div`
  width: 100%; height: 100%;
  max-width: 960px; max-height: calc(100% - 10px);
  aspect-ratio: 16/9;
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden; position: relative;
  background: #fff;
  font-family: var(--body-font);
  @media (prefers-reduced-motion: reduce) {
    & * { animation: none !important; transition-duration: 0s !important; }
  }
`

const EmptyPreview = styled.div`
  text-align: center; padding: 40px 20px;
  color: ${({ theme }) => theme.colors.textMuted}; font-size: 13px;
`

/* ========== FULLSCREEN OVERLAY ========== */
const FullscreenOverlay = styled.div`
  position: fixed; inset: 0; z-index: 9999;
  background: #111;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  animation: fadeIn 0.25s ease;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`

const FullscreenWrapper = styled.div`
  overflow: hidden;
`

const FullscreenCanvas = styled.div`
  width: 960px; height: 540px;
  overflow: hidden; position: relative;
  font-family: var(--body-font);
  transform-origin: top left;
`

const FullscreenControls = styled.div`
  position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 12px;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
  padding: 8px 20px; border-radius: 28px;
  opacity: 0; transition: opacity 0.3s;
  &:hover { opacity: 1; }
`

const FullscreenCounter = styled.span`
  color: #fff; font-size: 13px; font-weight: 500; min-width: 60px; text-align: center;
`

const FullscreenBtn = styled.button`
  width: 36px; height: 36px; border: none; background: rgba(255,255,255,0.1);
  border-radius: 50%; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.2); }
`

/* ========== THUMBNAILS ========== */
const ThumbStrip = styled.div`
  height: 80px; background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; align-items: center; padding: 0 12px; gap: 8px;
  overflow-x: auto; flex-shrink: 0;
`

const ThumbItem = styled.div<{ active?: boolean }>`
  width: 96px; height: 54px; flex-shrink: 0; cursor: pointer;
  transition: all ${({ theme }) => theme.transition};
  border: 2px solid ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  border-radius: 6px; overflow: hidden;
  background: #fff; box-shadow: ${({ active, theme }) => active ? theme.shadows.md : theme.shadows.sm};
  position: relative;
  &:hover { border-color: ${({ theme }) => theme.colors.primaryLight}; }
`

const ThumbInner = styled.div`
  width: 960px; height: 540px; overflow: hidden;
  transform: scale(0.1); transform-origin: top left;
  pointer-events: none;
`

const ThumbNum = styled.span`
  position: absolute; bottom: 2px; left: 3px;
  font-size: 7px; font-weight: 600; color: #fff;
  background: rgba(0,0,0,0.5); padding: 0.5px 3px; border-radius: 2px;
`

export function PreviewArea() {
  const { t } = useTranslation()
  const activeSlideIndex = useAppStore((s) => s.activeSlideIndex)
  const setActiveSlideIndex = useAppStore((s) => s.setActiveSlideIndex)
  const setActiveSectionId = useAppStore((s) => s.setActiveSectionId)
  const setActivePointIndex = useAppStore((s) => s.setActivePointIndex)
  const project = useProjectStore((s) => s.currentProject)
  const selectedStyle = useProjectStore((s) => s.selectedStyle)
  const setSelectedStyle = useProjectStore((s) => s.setSelectedStyle)
  const addSlide = useProjectStore((s) => s.addSlide)
  const prevSlideRef = useRef(activeSlideIndex)
  const thumbStripRef = useRef<HTMLDivElement>(null)
  const activeThumbRef = useRef<HTMLDivElement>(null)
  const slideDirection = activeSlideIndex >= prevSlideRef.current ? 1 : -1
  useEffect(() => { prevSlideRef.current = activeSlideIndex }, [activeSlideIndex])

  // Auto-scroll thumbnail strip to active slide
  useEffect(() => {
    if (activeThumbRef.current && thumbStripRef.current) {
      activeThumbRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [activeSlideIndex])

  const [fullscreen, setFullscreen] = useState(false)
  const [fsScale, setFsScale] = useState(1)
  const fullscreenRef = useRef(false)

  fullscreenRef.current = fullscreen

  useEffect(() => {
    const calcScale = () => {
      const scaleX = window.innerWidth / 960
      const scaleY = window.innerHeight / 540
      setFsScale(Math.min(scaleX, scaleY))
    }
    if (fullscreen) {
      calcScale()
      window.addEventListener('resize', calcScale)
      return () => window.removeEventListener('resize', calcScale)
    }
  }, [fullscreen])

  const style = selectedStyle || 'bold-signal'
  const styleConfig = getStyleConfig(style)
  useStyleFonts(style)

  const cssVars = {
    '--display-font': styleConfig.displayFont,
    '--body-font': styleConfig.bodyFont,
    '--title-bg': styleConfig.titleBg,
    '--title-color': styleConfig.titleColor,
    '--title-accent-bg': styleConfig.titleAccentBg,
    '--title-accent-color': styleConfig.titleAccentColor,
    '--title-subtitle-color': styleConfig.titleSubtitleColor,
    '--content-bg': styleConfig.contentBg,
    '--content-header-border': styleConfig.contentHeaderBorder,
    '--content-title-color': styleConfig.contentTitleColor,
    '--content-bullet-color': styleConfig.contentBulletColor,
    '--content-bullet-dot': styleConfig.contentBulletDot,
    '--content-notes-color': styleConfig.contentNotesColor,
    '--dot-active': styleConfig.dotActive,
    '--dot-inactive': styleConfig.dotInactive,
    '--card-bg': styleConfig.titleAccentBg + '15',
    '--card-border': styleConfig.titleAccentBg + '30'
  } as React.CSSProperties

  if (!project || project.slides.length === 0) {
    return (
      <Area>
        <PreviewToolbar>
          <ToolbarLeft>
            <ToolbarTitle>
              <span className="material-icons-round" style={{ fontSize: 16, color: '#6750A4' }}>visibility</span>
              {t('editor.preview')}
            </ToolbarTitle>
          </ToolbarLeft>
        </PreviewToolbar>
        <EmptyPreview>No slides yet.</EmptyPreview>
      </Area>
    )
  }

  const slides = project.slides
  const currentSlide = slides[activeSlideIndex] || slides[0]
  const totalSlides = slides.length
  const getSectionNumber = (sectionId: string) => {
    const section = project.documentOutline.sections.find((s) => s.id === sectionId)
    return section?.order
  }

  const syncOutlineFromSlide = useCallback((idx: number) => {
    setActiveSlideIndex(idx)
    const slide = slides[idx]
    if (!slide) return

    if (slide.sectionId) setActiveSectionId(slide.sectionId)

    const section = project?.documentOutline.sections.find(s => s.id === slide.sectionId)
    if (section && slide.layout !== 'section-divider' && slide.layout !== 'title') {
      const contentSlidesBefore = slides.filter(
        s => s.sectionId === slide.sectionId
          && s.layout !== 'section-divider'
          && s.layout !== 'title'
          && s.order < slide.order
      )
      const pointIdx = contentSlidesBefore.length
      setActivePointIndex(pointIdx < section.points.length ? pointIdx : null)
    } else {
      setActivePointIndex(null)
    }
  }, [slides, project, setActiveSlideIndex, setActiveSectionId, setActivePointIndex])

  const handleThumbClick = (idx: number) => {
    syncOutlineFromSlide(idx)
  }

  // ESC / arrow keys in fullscreen
  useEffect(() => {
    if (!fullscreen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false)
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const next = activeSlideIndex + 1
        if (next < totalSlides) syncOutlineFromSlide(next)
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = activeSlideIndex - 1
        if (prev >= 0) syncOutlineFromSlide(prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [fullscreen, activeSlideIndex, totalSlides, syncOutlineFromSlide])

  const handleInsertImage = async () => {
    const result = await window.api.file.openImage()
    if (!result) return
    const newSlide: import('@/shared/types/project').Slide = {
      id: `slide-${Date.now()}`,
      order: 0,
      sectionId: currentSlide.sectionId,
      layout: 'image',
      content: {
        title: currentSlide.content.title,
        body: currentSlide.content.body || [],
        imageUrl: result.dataUrl,
        subtitle: result.name
      }
    }
    addSlide(activeSlideIndex, newSlide)
    syncOutlineFromSlide(activeSlideIndex + 1)
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY > 0 && activeSlideIndex < totalSlides - 1) {
      syncOutlineFromSlide(activeSlideIndex + 1)
    } else if (e.deltaY < 0 && activeSlideIndex > 0) {
      syncOutlineFromSlide(activeSlideIndex - 1)
    }
  }, [activeSlideIndex, totalSlides, syncOutlineFromSlide])

  return (
    <Area>
      <PreviewToolbar>
        <ToolbarLeft>
          <ToolbarTitle>
            <span className="material-icons-round" style={{ fontSize: 16, color: '#6750A4' }}>visibility</span>
            {t('editor.preview')}
          </ToolbarTitle>
          <SlideCounter>{activeSlideIndex + 1} / {totalSlides}</SlideCounter>
        </ToolbarLeft>
        <Controls>
          <Select value={style} onChange={(e) => setSelectedStyle(e.target.value as StylePreset)}>
            {stylePresets.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
          <GhostBtn title={t('editor.insertImage')} disabled>
            <span className="material-icons-round" style={{ fontSize: 16, opacity: 0.35 }}>add_photo_alternate</span>
          </GhostBtn>
          <GhostBtn onClick={() => setFullscreen(true)}>
            <span className="material-icons-round" style={{ fontSize: 16 }}>fullscreen</span>
          </GhostBtn>
        </Controls>
      </PreviewToolbar>

      <SlideMain onWheel={handleWheel}>
        <SlideCanvas style={cssVars}>
          <SlideTransition key={activeSlideIndex} direction={slideDirection}>
            <SlideRenderer
              slide={currentSlide}
              slideIndex={activeSlideIndex}
              totalSlides={totalSlides}
              sectionNumber={getSectionNumber(currentSlide.sectionId)}
            />
          </SlideTransition>
        </SlideCanvas>
      </SlideMain>

      <ThumbStrip ref={thumbStripRef}>
        {slides.map((slide, i) => (
          <ThumbItem key={slide.id} ref={(el) => { if (i === activeSlideIndex) activeThumbRef.current = el }} active={activeSlideIndex === i} onClick={() => handleThumbClick(i)}>
            <ThumbInner style={cssVars}>
              <SlideRenderer
                slide={slide}
                slideIndex={i}
                totalSlides={totalSlides}
                sectionNumber={getSectionNumber(slide.sectionId)}
              />
            </ThumbInner>
            <ThumbNum>{i + 1}</ThumbNum>
          </ThumbItem>
        ))}
      </ThumbStrip>

      {fullscreen && (
        <FullscreenOverlay onClick={() => setFullscreen(false)} onWheel={(e) => {
          e.stopPropagation()
          if (e.deltaY > 0 && activeSlideIndex < totalSlides - 1) syncOutlineFromSlide(activeSlideIndex + 1)
          else if (e.deltaY < 0 && activeSlideIndex > 0) syncOutlineFromSlide(activeSlideIndex - 1)
        }}>
          <FullscreenWrapper style={{ width: 960 * fsScale, height: 540 * fsScale }} onClick={(e) => e.stopPropagation()}>
            <FullscreenCanvas style={{ ...cssVars, transform: `scale(${fsScale})` }}>
              <SlideTransition key={activeSlideIndex} direction={slideDirection}>
                <SlideRenderer
                  slide={currentSlide}
                  slideIndex={activeSlideIndex}
                  totalSlides={totalSlides}
                  sectionNumber={getSectionNumber(currentSlide.sectionId)}
                />
              </SlideTransition>
            </FullscreenCanvas>
          </FullscreenWrapper>
          <FullscreenControls onClick={(e) => e.stopPropagation()}>
            <FullscreenBtn onClick={() => syncOutlineFromSlide(activeSlideIndex - 1)} disabled={activeSlideIndex === 0}>
              <span className="material-icons-round" style={{ fontSize: 20 }}>chevron_left</span>
            </FullscreenBtn>
            <FullscreenCounter>{activeSlideIndex + 1} / {totalSlides}</FullscreenCounter>
            <FullscreenBtn onClick={() => syncOutlineFromSlide(activeSlideIndex + 1)} disabled={activeSlideIndex === totalSlides - 1}>
              <span className="material-icons-round" style={{ fontSize: 20 }}>chevron_right</span>
            </FullscreenBtn>
            <FullscreenBtn onClick={() => setFullscreen(false)}>
              <span className="material-icons-round" style={{ fontSize: 20 }}>close</span>
            </FullscreenBtn>
          </FullscreenControls>
        </FullscreenOverlay>
      )}
    </Area>
  )
}
