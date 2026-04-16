import { useEffect, useCallback, useMemo, useRef } from 'react'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useAppStore } from '@/shared/stores/appStore'
import { useProjectStore } from '@/shared/stores/projectStore'
import type { StylePreset } from '@/shared/types/project'
import { getStyleConfig, stylePresets } from './stylePresets'

/** Render text with inline math ($...$) and block math ($$...$$) via KaTeX */
function renderMath(text: string): string {
  if (!text) return text
  // Block math $$...$$ first
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false })
    } catch { return tex }
  })
  // Inline math $...$
  result = result.replace(/\$([^$\n]+?)\$/g, (_, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false })
    } catch { return tex }
  })
  return result
}

/** React component: renders text with math support */
function MathText({ text, as: Tag = 'span', style }: { text: string; as?: keyof JSX.IntrinsicElements; style?: React.CSSProperties }) {
  const html = useMemo(() => renderMath(text), [text])
  return <Tag style={style} dangerouslySetInnerHTML={{ __html: html }} />
}

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

/* ========== TITLE SLIDE ========== */
const TitleSlideRoot = styled.div`
  width: 100%; height: 100%;
  background: var(--title-bg);
  padding: clamp(20px, 4vh, 48px) clamp(24px, 4vw, 56px);
  display: flex; flex-direction: column; justify-content: center;
  position: relative; overflow: hidden;
`

const TitleAccent = styled.div`
  position: absolute; top: clamp(12px, 2vh, 24px); left: clamp(12px, 2vw, 24px);
  width: clamp(50px, 6vw, 100px); height: clamp(30px, 4vw, 60px);
  background: var(--title-accent-bg); border-radius: clamp(6px, 1vw, 10px);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--display-font);
  font-size: clamp(14px, 2.5vw, 28px); font-weight: 900;
  color: var(--title-accent-color);
`

const TitleText = styled.h1`
  font-family: var(--display-font);
  font-size: clamp(18px, 3vw, 36px); font-weight: 700;
  line-height: 1.15; margin-bottom: 8px;
  color: var(--title-color);
`

const SubtitleText = styled.p`
  font-family: var(--body-font);
  font-size: clamp(10px, 1.2vw, 14px);
  color: var(--title-subtitle-color);
`

const NavDots = styled.div`display: flex; gap: 6px; position: absolute; bottom: clamp(12px,2vh,24px); right: clamp(12px,2vw,24px);`
const Dot = styled.span<{ active?: boolean }>`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${({ active }) => active ? 'var(--dot-active)' : 'var(--dot-inactive)'};
`

/* ========== SECTION DIVIDER ========== */
const DividerRoot = styled.div`
  width: 100%; height: 100%;
  background: var(--title-bg);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
`

const DividerNumber = styled.div`
  font-family: var(--display-font);
  font-size: clamp(60px, 12vw, 140px); font-weight: 900;
  color: var(--title-accent-bg); opacity: 0.15;
  position: absolute; top: clamp(-10px, -2vw, -20px); right: clamp(20px, 5vw, 80px);
  line-height: 1;
`

const DividerLine = styled.div`
  width: clamp(40px, 6vw, 80px); height: clamp(2px, 0.3vh, 3px);
  background: var(--title-accent-bg);
  margin-bottom: clamp(12px, 2vh, 24px);
  border-radius: 2px;
`

const DividerTitle = styled.h2`
  font-family: var(--display-font);
  font-size: clamp(22px, 4vw, 44px); font-weight: 700;
  color: var(--title-color);
  text-align: center;
  margin-bottom: 8px;
`

const DividerSubtitle = styled.p`
  font-family: var(--body-font);
  font-size: clamp(11px, 1.4vw, 16px);
  color: var(--title-subtitle-color);
  text-align: center;
`

/* ========== CONTENT SLIDE ========== */
const ContentRoot = styled.div`
  width: 100%; height: 100%;
  background: var(--content-bg);
  padding: clamp(16px, 3vh, 40px) clamp(20px, 3vw, 48px);
  display: flex; flex-direction: column;
  overflow: hidden;
  @media (max-height: 600px) {
    padding: clamp(8px, 2vh, 20px) clamp(12px, 2vw, 32px);
  }
`

const ContentHeader = styled.div`
  margin-bottom: clamp(8px, 1.5vh, 16px);
  padding-bottom: clamp(6px, 1vh, 12px);
  border-bottom: clamp(1px, 0.15vh, 2px) solid var(--content-header-border);
`

const ContentTitle = styled.h2`
  font-family: var(--display-font);
  font-size: clamp(14px, 2vw, 24px); font-weight: 700;
  color: var(--content-title-color);
  @media (max-height: 600px) {
    font-size: clamp(12px, 1.5vw, 18px);
  }
`

const ContentBody = styled.ul`
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: clamp(4px, 0.8vh, 10px);
  flex: 1; min-height: 0;
  max-height: 100%;
  overflow: hidden;
`

const ContentBullet = styled.li`
  font-family: var(--body-font);
  font-size: clamp(10px, 1.3vw, 16px);
  color: var(--content-bullet-color); line-height: 1.5;
  display: flex; align-items: flex-start; gap: clamp(6px, 0.8vw, 12px);
  &::before {
    content: '';
    width: clamp(4px, 0.5vw, 6px); height: clamp(4px, 0.5vw, 6px);
    min-width: clamp(4px, 0.5vw, 6px);
    background: var(--content-bullet-dot); border-radius: 50%;
    margin-top: clamp(4px, 0.5vw, 8px);
  }
  @media (max-height: 600px) {
    font-size: clamp(9px, 1.1vw, 13px);
    line-height: 1.35;
  }
`

/* ========== TWO COLUMN ========== */
const TwoColRoot = styled.div`
  width: 100%; height: 100%;
  background: var(--content-bg);
  padding: clamp(16px, 3vh, 40px) clamp(20px, 3vw, 48px);
  display: flex; flex-direction: column;
  overflow: hidden;
  @media (max-height: 600px) {
    padding: clamp(8px, 2vh, 20px) clamp(12px, 2vw, 32px);
  }
`

const TwoColGrid = styled.div`
  flex: 1; display: flex; gap: clamp(12px, 2vw, 32px);
  overflow: hidden; min-height: 0;
`

const TwoColCard = styled.div`
  flex: 1;
  background: var(--card-bg, rgba(0,0,0,0.03));
  border-radius: clamp(8px, 1vw, 14px);
  padding: clamp(12px, 1.5vw, 20px);
  border: 1px solid var(--card-border, rgba(0,0,0,0.06));
  display: flex; flex-direction: column;
  overflow: hidden; min-height: 0;
`

const TwoColCardTitle = styled.h3`
  font-family: var(--display-font);
  font-size: clamp(11px, 1.4vw, 18px); font-weight: 700;
  color: var(--content-title-color);
  margin-bottom: clamp(6px, 1vh, 12px);
  padding-bottom: clamp(4px, 0.5vh, 8px);
  border-bottom: 1px solid var(--content-header-border);
`

const TwoColCardBody = styled.ul`
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: clamp(3px, 0.6vh, 8px);
  flex: 1; min-height: 0; overflow: hidden;
`

const TwoColBullet = styled.li`
  font-family: var(--body-font);
  font-size: clamp(9px, 1.1vw, 14px);
  color: var(--content-bullet-color); line-height: 1.45;
  display: flex; align-items: flex-start; gap: clamp(4px, 0.5vw, 8px);
  &::before {
    content: '';
    width: clamp(4px, 0.4vw, 5px); height: clamp(4px, 0.4vw, 5px);
    min-width: clamp(4px, 0.4vw, 5px);
    background: var(--content-bullet-dot); border-radius: 50%;
    margin-top: clamp(3px, 0.4vw, 6px);
  }
`

/* ========== HIGHLIGHT ========== */
const HighlightRoot = styled.div`
  width: 100%; height: 100%;
  background: var(--content-bg);
  padding: clamp(20px, 4vh, 48px) clamp(24px, 4vw, 56px);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  text-align: center;
  @media (max-height: 600px) {
    padding: clamp(10px, 2vh, 24px) clamp(12px, 2vw, 32px);
  }
`

const HighlightBox = styled.div`
  background: var(--title-accent-bg);
  color: var(--title-accent-color);
  font-family: var(--display-font);
  font-size: clamp(14px, 2vw, 24px); font-weight: 700;
  padding: clamp(12px, 2vh, 24px) clamp(16px, 3vw, 40px);
  border-radius: clamp(8px, 1vw, 16px);
  margin-bottom: clamp(12px, 2vh, 24px);
  line-height: 1.4;
  max-width: 80%;
`

const HighlightBody = styled.ul`
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-wrap: wrap; justify-content: center; gap: clamp(4px, 0.6vw, 8px);
  max-height: 40%; overflow: hidden;
`

const HighlightPill = styled.li`
  font-family: var(--body-font);
  font-size: clamp(9px, 1vw, 13px);
  color: var(--content-bullet-color);
  background: var(--card-bg, rgba(0,0,0,0.03));
  border: 1px solid var(--card-border, rgba(0,0,0,0.06));
  padding: clamp(3px, 0.4vh, 6px) clamp(8px, 1vw, 14px);
  border-radius: 20px;
`

/* ========== IMAGE SLIDE (left text + right image) ========== */
const ImageSlideRoot = styled.div`
  width: 100%; height: 100%;
  background: var(--content-bg);
  padding: clamp(16px, 3vh, 40px) clamp(20px, 3vw, 48px);
  display: flex; flex-direction: column;
  overflow: hidden;
`

const ImageTitle = styled.h2`
  font-family: var(--display-font);
  font-size: clamp(14px, 2vw, 24px); font-weight: 700;
  color: var(--content-title-color);
  margin-bottom: clamp(8px, 1.5vh, 16px);
  padding-bottom: clamp(6px, 1vh, 12px);
  border-bottom: clamp(1px, 0.15vh, 2px) solid var(--content-header-border);
`

const ImageSplitGrid = styled.div`
  flex: 1; display: flex; gap: clamp(12px, 2vw, 32px);
  overflow: hidden; min-height: 0;
`

const ImageLeftCol = styled.div`
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; min-height: 0;
`

const ImageRightCol = styled.div`
  flex: 1; display: flex; align-items: center; justify-content: center;
  overflow: hidden; min-height: 0;

  img {
    max-height: 100%; max-width: 100%;
    object-fit: contain;
    border-radius: clamp(6px, 0.8vw, 12px);
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  }
`

const ImageCaption = styled.p`
  font-family: var(--body-font);
  font-size: clamp(9px, 1vw, 13px);
  color: var(--content-bullet-color);
  margin-top: clamp(6px, 1vh, 12px);
  text-align: center;
`

/* ========== NOTES ========== */
const SlideNotes = styled.div`
  position: absolute; bottom: 8px; left: 12px; right: 12px;
  font-size: clamp(8px, 0.8vw, 11px);
  color: var(--content-notes-color); font-style: italic;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  font-family: var(--body-font);
`

/* ========== THUMBNAILS ========== */
const ThumbStrip = styled.div`
  height: 80px; background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; align-items: center; padding: 0 12px; gap: 8px;
  overflow-x: auto; flex-shrink: 0;
`

const ThumbItem = styled.div<{ active?: boolean }>`
  width: 96px; flex-shrink: 0; cursor: pointer;
  transition: all ${({ theme }) => theme.transition};
  border: 2px solid ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  border-radius: 6px; overflow: hidden;
  background: #fff; box-shadow: ${({ active, theme }) => active ? theme.shadows.md : theme.shadows.sm};
  position: relative;
  &:hover { border-color: ${({ theme }) => theme.colors.primaryLight}; }
`

const ThumbInner = styled.div<{ isTitle?: boolean; isDivider?: boolean; isHighlight?: boolean }>`
  width: 100%; aspect-ratio: 16/9; overflow: hidden;
  padding: 4px 5px;
  background: ${({ isTitle, isDivider, isHighlight }) =>
    isTitle || isDivider ? 'linear-gradient(135deg,#1a1a1a,#2d2d2d)' :
    isHighlight ? '#f0f0f0' : '#fff'};
`

const ThumbTitle = styled.div`
  font-size: 5px; font-weight: 700; color: #fff;
  line-height: 1.3; overflow: hidden;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
`

const ThumbContentTitle = styled.div`
  font-size: 4px; font-weight: 600; color: #1A1A2E; margin-bottom: 2px;
  border-bottom: 1px solid #E6E6F0; padding-bottom: 1px;
`

const ThumbBullet = styled.div`
  height: 2px; background: #E6E6F0; border-radius: 1px; margin-bottom: 1.5px;
`

const ThumbNum = styled.span`
  position: absolute; bottom: 2px; left: 3px;
  font-size: 7px; font-weight: 600; color: #fff;
  background: rgba(0,0,0,0.5); padding: 0.5px 3px; border-radius: 2px;
`

const EmptyPreview = styled.div`
  flex: 1; display: flex; align-items: center; justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted}; font-size: 14px;
`

function useStyleFonts(preset: StylePreset) {
  const config = getStyleConfig(preset)
  useEffect(() => {
    const id = `slideforge-fonts-${preset}`
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = config.fontsUrl
    document.head.appendChild(link)
  }, [preset, config.fontsUrl])
}

function SlideRenderer({ slide, slideIndex, totalSlides }: { slide: any; slideIndex: number; totalSlides: number }) {
  const layout = slide.layout || 'content'
  const content = slide.content

  if (layout === 'title') {
    return (
      <TitleSlideRoot>
        <TitleAccent>{String(slide.order || slideIndex + 1).padStart(2, '0')}</TitleAccent>
        <TitleText>{content.title}</TitleText>
        {content.subtitle && <SubtitleText>{content.subtitle}</SubtitleText>}
        <NavDots>
          {Array.from({ length: Math.min(totalSlides, 8) }, (_, i) => <Dot key={i} active={i === slideIndex} />)}
        </NavDots>
      </TitleSlideRoot>
    )
  }

  if (layout === 'section-divider') {
    return (
      <DividerRoot>
        <DividerNumber>{String(slide.order || slideIndex + 1).padStart(2, '0')}</DividerNumber>
        <DividerLine />
        <DividerTitle>{content.title}</DividerTitle>
        {content.subtitle && <DividerSubtitle>{content.subtitle}</DividerSubtitle>}
      </DividerRoot>
    )
  }

  if (layout === 'two-column') {
    return (
      <TwoColRoot>
        <ContentHeader>
          <ContentTitle>{content.title}</ContentTitle>
        </ContentHeader>
        <TwoColGrid>
          <TwoColCard>
            <TwoColCardTitle>{content.leftTitle || 'Left'}</TwoColCardTitle>
            <TwoColCardBody>
              {(content.leftBody || []).map((b: string, i: number) => <TwoColBullet key={i}><MathText text={b} /></TwoColBullet>)}
            </TwoColCardBody>
          </TwoColCard>
          <TwoColCard>
            <TwoColCardTitle>{content.rightTitle || 'Right'}</TwoColCardTitle>
            <TwoColCardBody>
              {(content.rightBody || []).map((b: string, i: number) => <TwoColBullet key={i}><MathText text={b} /></TwoColBullet>)}
            </TwoColCardBody>
          </TwoColCard>
        </TwoColGrid>
        {content.notes && <SlideNotes>{content.notes}</SlideNotes>}
      </TwoColRoot>
    )
  }

  if (layout === 'highlight') {
    return (
      <HighlightRoot>
        {content.highlight && <HighlightBox><MathText text={content.highlight} /></HighlightBox>}
        <HighlightBody>
          {(content.body || []).map((b: string, i: number) => <HighlightPill key={i}><MathText text={b} /></HighlightPill>)}
        </HighlightBody>
        {content.notes && <SlideNotes>{content.notes}</SlideNotes>}
      </HighlightRoot>
    )
  }

  if (layout === 'image') {
    return (
      <ImageSlideRoot>
        <ContentHeader>
          <ContentTitle>{content.title}</ContentTitle>
        </ContentHeader>
        <ImageSplitGrid>
          {(content.body && content.body.length > 0) && (
            <ImageLeftCol>
              <ContentBody>
                {content.body.map((bullet: string, i: number) => (
                  <ContentBullet key={i}><MathText text={bullet} /></ContentBullet>
                ))}
              </ContentBody>
            </ImageLeftCol>
          )}
          <ImageRightCol>
            {content.imageUrl && <img src={content.imageUrl} alt={content.title} />}
            {content.subtitle && <ImageCaption>{content.subtitle}</ImageCaption>}
          </ImageRightCol>
        </ImageSplitGrid>
      </ImageSlideRoot>
    )
  }

  // Default: content
  return (
    <ContentRoot>
      <ContentHeader>
        <ContentTitle>{content.title}</ContentTitle>
      </ContentHeader>
      <ContentBody>
        {(content.body || []).map((bullet: string, i: number) => (
          <ContentBullet key={i}><MathText text={bullet} /></ContentBullet>
        ))}
      </ContentBody>
      {content.notes && <SlideNotes>{content.notes}</SlideNotes>}
    </ContentRoot>
  )
}

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
  const slideDirection = activeSlideIndex >= prevSlideRef.current ? 1 : -1
  useEffect(() => { prevSlideRef.current = activeSlideIndex }, [activeSlideIndex])

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

  const syncOutlineFromSlide = useCallback((idx: number) => {
    setActiveSlideIndex(idx)
    const slide = slides[idx]
    if (!slide) return

    if (slide.sectionId) setActiveSectionId(slide.sectionId)

    // Compute which point in the section this slide corresponds to
    const section = project?.documentOutline.sections.find(s => s.id === slide.sectionId)
    if (section && slide.layout !== 'section-divider' && slide.layout !== 'title') {
      // Count content slides before this one in the same section (exclude divider AND title)
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

  const getThumbVariant = (slide: any) => {
    const l = slide.layout
    if (l === 'title') return { isTitle: true, isDivider: false, isHighlight: false }
    if (l === 'section-divider') return { isTitle: false, isDivider: true, isHighlight: false }
    if (l === 'highlight') return { isTitle: false, isDivider: false, isHighlight: true }
    return { isTitle: false, isDivider: false, isHighlight: false }
  }

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
          <GhostBtn>
            <span className="material-icons-round" style={{ fontSize: 16 }}>fullscreen</span>
          </GhostBtn>
        </Controls>
      </PreviewToolbar>

      <SlideMain onWheel={handleWheel}>
        <SlideCanvas style={cssVars}>
          <SlideTransition key={activeSlideIndex} direction={slideDirection}>
            <SlideRenderer slide={currentSlide} slideIndex={activeSlideIndex} totalSlides={totalSlides} />
          </SlideTransition>
        </SlideCanvas>
      </SlideMain>

      <ThumbStrip>
        {slides.map((slide, i) => {
          const v = getThumbVariant(slide)
          return (
            <ThumbItem key={slide.id} active={activeSlideIndex === i} onClick={() => handleThumbClick(i)}>
              <ThumbInner {...v}>
                {v.isTitle || v.isDivider ? (
                  <ThumbTitle>{slide.content.title}</ThumbTitle>
                ) : (
                  <>
                    <ThumbContentTitle>{slide.content.title}</ThumbContentTitle>
                    {(slide.content.body || []).slice(0, 4).map((_, j) => (
                      <ThumbBullet key={j} style={{ width: `${60 + Math.random() * 30}%` }} />
                    ))}
                  </>
                )}
              </ThumbInner>
              <ThumbNum style={v.isTitle || v.isDivider ? {} : { color: '#666', background: '#f0f0f0' }}>{i + 1}</ThumbNum>
            </ThumbItem>
          )
        })}
      </ThumbStrip>
    </Area>
  )
}
