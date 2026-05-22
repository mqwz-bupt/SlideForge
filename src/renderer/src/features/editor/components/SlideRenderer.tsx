import { useMemo, useEffect } from 'react'
import styled from '@emotion/styled'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import type { StylePreset } from '@/shared/types/project'
import { getStyleConfig } from './stylePresets'

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
export function MathText({ text, as: Tag = 'span', style }: { text: string; as?: keyof JSX.IntrinsicElements; style?: React.CSSProperties }) {
  const html = useMemo(() => renderMath(text), [text])
  return <Tag style={style} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Inject Google Fonts stylesheet for the selected style preset */
export function useStyleFonts(preset: StylePreset) {
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

export const ContentHeader = styled.div`
  margin-bottom: clamp(8px, 1.5vh, 16px);
  padding-bottom: clamp(6px, 1vh, 12px);
  border-bottom: clamp(1px, 0.15vh, 2px) solid var(--content-header-border);
`

export const ContentTitle = styled.h2`
  font-family: var(--display-font);
  font-size: clamp(16px, 2.4vw, 28px); font-weight: 700;
  color: var(--content-title-color);
  @media (max-height: 600px) {
    font-size: clamp(14px, 1.8vw, 20px);
  }
`

const ContentBody = styled.ul`
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: clamp(4px, 0.8vh, 10px);
  flex: 1; min-height: 0;
  max-height: 100%;
  overflow: hidden;
  justify-content: center;
`

const ContentBullet = styled.li`
  font-family: var(--body-font);
  font-size: clamp(13px, 1.8vw, 22px);
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
    font-size: clamp(11px, 1.3vw, 15px);
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
  font-size: clamp(13px, 1.7vw, 20px); font-weight: 700;
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
  font-size: clamp(11px, 1.3vw, 16px);
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
  font-size: clamp(16px, 2.4vw, 28px); font-weight: 700;
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
  font-size: clamp(11px, 1.2vw, 15px);
  color: var(--content-bullet-color);
  background: var(--card-bg, rgba(0,0,0,0.03));
  border: 1px solid var(--card-border, rgba(0,0,0,0.06));
  padding: clamp(3px, 0.4vh, 6px) clamp(8px, 1vw, 14px);
  border-radius: 20px;
`

/* ========== IMAGE SLIDE ========== */
const ImageSlideRoot = styled.div`
  width: 100%; height: 100%;
  background: var(--content-bg);
  padding: clamp(16px, 3vh, 40px) clamp(20px, 3vw, 48px);
  display: flex; flex-direction: column;
  overflow: hidden;
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

/* ========== FEATURE GRID ========== */
const FeatureGridRoot = styled.div`
  width: 100%; height: 100%;
  background: var(--content-bg);
  padding: clamp(16px, 3vh, 40px) clamp(20px, 3vw, 48px);
  display: flex; flex-direction: column;
  overflow: hidden;
`

const FeatureGridContainer = styled.div`
  flex: 1; display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: clamp(8px, 1.5vw, 20px);
  align-content: center;
`

const FeatureCard = styled.div`
  background: rgba(128,128,128,0.04); border-radius: 12px;
  padding: clamp(10px, 1.5vw, 20px); text-align: center;
  border: 1px solid rgba(128,128,128,0.08);
`

const FeatureCardNumber = styled.span`
  display: inline-flex; align-items: center; justify-content: center;
  width: clamp(22px, 2.5vw, 32px); height: clamp(22px, 2.5vw, 32px);
  border-radius: 50%; background: var(--title-accent-bg); color: var(--title-accent-color);
  font-family: var(--display-font); font-size: clamp(12px, 1.4vw, 18px);
  font-weight: 700; margin-bottom: 6px;
`

const FeatureName = styled.span`
  font-family: var(--display-font); font-size: clamp(12px, 1.7vw, 19px);
  color: var(--content-title-color); font-weight: 700; display: block; margin-bottom: 4px;
`

const FeatureDesc = styled.span`
  font-family: var(--body-font); font-size: clamp(10px, 1.3vw, 16px);
  color: var(--content-bullet-color); line-height: 1.4;
`

/* ========== QUOTE ========== */
const QuoteRoot = styled.div`
  width: 100%; height: 100%;
  background: var(--title-bg);
  padding: clamp(16px, 3vh, 40px) clamp(20px, 3vw, 48px);
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  overflow: hidden; position: relative;
`

const QuoteText = styled.blockquote`
  font-family: var(--display-font);
  font-size: clamp(14px, 2.4vw, 28px); font-style: italic; font-weight: 500;
  color: var(--title-color); line-height: 1.5; max-width: 90%;
  position: relative; padding-left: 16px;
  border-left: 3px solid var(--title-accent-bg);
`

const QuoteAttribution = styled.p`
  margin-top: clamp(8px, 1.5vh, 16px);
  font-family: var(--body-font);
  font-size: clamp(11px, 1.4vw, 17px);
  color: var(--title-subtitle-color);
`

/* ========== BIG NUMBER ========== */
const BigNumberRoot = styled.div`
  width: 100%; height: 100%;
  background: var(--content-bg);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; position: relative;
  padding: clamp(16px, 3vh, 32px);
`

const BigNumberValue = styled.div`
  font-family: var(--display-font);
  font-size: clamp(48px, 10vw, 96px);
  color: var(--title-accent-bg);
  line-height: 1; font-weight: 900;
`

const BigNumberLabel = styled.div`
  font-family: var(--body-font);
  font-size: clamp(15px, 2.2vw, 24px);
  color: var(--content-title-color);
  margin-top: 8px; font-weight: 600;
`

const BigNumberPills = styled.div`
  display: flex; gap: 8px; justify-content: center;
  flex-wrap: wrap; margin-top: clamp(10px, 2vh, 20px);
`

const BigNumberPill = styled.div`
  padding: 6px 16px; border-radius: 20px;
  font-size: clamp(11px, 1.2vw, 15px); font-family: var(--body-font);
  color: var(--content-bullet-color);
  background: rgba(128,128,128,0.06);
  border: 1px solid rgba(128,128,128,0.1);
`

/* ========== TIMELINE ========== */
const TimelineRoot = styled.div`
  width: 100%; height: 100%;
  background: var(--content-bg);
  padding: clamp(16px, 3vh, 40px) clamp(20px, 3vw, 48px);
  display: flex; flex-direction: column;
  position: relative;
  overflow: hidden;
  @media (max-height: 600px) {
    padding: clamp(8px, 2vh, 20px) clamp(12px, 2vw, 32px);
  }
`

const TimelineBody = styled.div`
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: clamp(12px, 2vh, 24px) clamp(20px, 4vw, 48px);
  position: relative;
`

const TimelineLine = styled.div`
  position: absolute; top: 50%; left: 10%; right: 10%; height: 3px;
  background: rgba(128,128,128,0.15); transform: translateY(-50%);
`

const TimelineNodes = styled.div`
  display: flex; justify-content: space-between; width: 80%; position: relative; z-index: 1;
`

const TimelineNodeWrap = styled.div`
  text-align: center; width: 18%;
`

const TimelineCircle = styled.div`
  width: clamp(26px, 4vw, 42px); height: clamp(26px, 4vw, 42px);
  border-radius: 50%; background: var(--title-accent-bg); color: var(--title-accent-color);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--display-font); font-size: clamp(13px, 1.6vw, 19px);
  font-weight: 700; margin: 0 auto clamp(6px, 1.2vh, 12px);
`

const TimelineTitle = styled.div`
  font-family: var(--body-font); font-size: clamp(11px, 1.3vw, 15px);
  font-weight: 700; color: var(--content-title-color); margin-bottom: 3px;
`

const TimelineDesc = styled.div`
  font-family: var(--body-font); font-size: clamp(10px, 1.1vw, 13px);
  color: var(--content-bullet-color); line-height: 1.4;
`

/* ========== CALLOUT ========== */
const CalloutRoot = styled.div`
  width: 100%; height: 100%;
  background: var(--content-bg);
  padding: clamp(16px, 3vh, 40px) clamp(20px, 3vw, 48px);
  display: flex; flex-direction: column;
  position: relative;
  overflow: hidden;
  @media (max-height: 600px) {
    padding: clamp(8px, 2vh, 20px) clamp(12px, 2vw, 32px);
  }
`

const CalloutBody = styled.div`
  flex: 1; display: flex; gap: clamp(10px, 1.5vw, 20px);
  padding: clamp(6px, 1vh, 12px) clamp(20px, 4vw, 48px) clamp(12px, 2vh, 24px);
`

const CalloutMain = styled.div`
  flex: 7; display: flex; flex-direction: column; justify-content: center;
`

const CalloutSidebar = styled.div`
  flex: 3; background: var(--title-accent-bg); border-radius: 12px;
  padding: clamp(12px, 2vw, 24px);
  display: flex; flex-direction: column;
  justify-content: center; align-items: center; text-align: center;
  color: var(--title-accent-color);
`

const CalloutLabel = styled.div`
  font-size: clamp(10px, 1vw, 12px); font-weight: 700;
  opacity: 0.7; text-transform: uppercase;
  letter-spacing: 1.5px; margin-bottom: clamp(6px, 1vh, 12px);
  font-family: var(--body-font);
`

const CalloutText = styled.div`
  font-family: var(--display-font); font-size: clamp(14px, 2vw, 22px);
  font-weight: 700; line-height: 1.5;
`

/* ========== STATEMENT ========== */
const StatementRoot = styled.div`
  width: 100%; height: 100%;
  background: var(--title-bg);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; position: relative;
  padding: clamp(20px, 4vh, 40px);
  overflow: hidden;
`

const StatementText = styled.div`
  font-family: var(--display-font);
  font-size: clamp(20px, 3.8vw, 40px);
  color: var(--title-color); line-height: 1.35; font-weight: 800;
  max-width: 85%;
`

const StatementAccent = styled.div`
  width: clamp(30px, 8vw, 60px); height: 3px;
  background: var(--title-accent-bg);
  margin: clamp(10px, 2vh, 20px) auto 0;
`

const StatementAttr = styled.div`
  font-size: clamp(10px, 1.2vw, 14px); color: var(--title-subtitle-color);
  margin-top: clamp(6px, 1.2vh, 14px); font-family: var(--body-font);
`

/* ========== NOTES ========== */
const SlideNotes = styled.div`
  position: absolute; bottom: 8px; left: 12px; right: 12px;
  font-size: clamp(8px, 0.8vw, 11px);
  color: var(--content-notes-color); font-style: italic;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  font-family: var(--body-font);
`

/* ========== SLIDE RENDERER ========== */
export function SlideRenderer({ slide, slideIndex, totalSlides }: { slide: any; slideIndex: number; totalSlides: number }) {
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

  if (layout === 'feature-grid') {
    const features = (content as any).features || []
    return (
      <FeatureGridRoot>
        <ContentHeader>
          <ContentTitle>{content.title}</ContentTitle>
        </ContentHeader>
        <FeatureGridContainer>
          {features.map((f: { name: string; desc: string }, i: number) => (
            <FeatureCard key={i}>
              <FeatureCardNumber>{i + 1}</FeatureCardNumber>
              <FeatureName>{f.name}</FeatureName>
              <FeatureDesc>{f.desc}</FeatureDesc>
            </FeatureCard>
          ))}
        </FeatureGridContainer>
        {content.notes && <SlideNotes>{content.notes}</SlideNotes>}
      </FeatureGridRoot>
    )
  }

  if (layout === 'quote') {
    return (
      <QuoteRoot>
        <QuoteText>{content.highlight ? <MathText text={content.highlight} /> : ''}</QuoteText>
        {content.title && <QuoteAttribution>— {content.title}</QuoteAttribution>}
      </QuoteRoot>
    )
  }

  if (layout === 'big-number') {
    return (
      <BigNumberRoot>
        <BigNumberValue>{content.highlight || '100%'}</BigNumberValue>
        <BigNumberLabel>{content.title}</BigNumberLabel>
        {(content.body && content.body.length > 0) && (
          <BigNumberPills>
            {content.body.map((b: string, i: number) => <BigNumberPill key={i}>{b}</BigNumberPill>)}
          </BigNumberPills>
        )}
      </BigNumberRoot>
    )
  }

  if (layout === 'timeline') {
    const features = (content as any).features || []
    return (
      <TimelineRoot>
        <ContentHeader><ContentTitle>{content.title}</ContentTitle></ContentHeader>
        <TimelineBody>
          <TimelineLine />
          <TimelineNodes>
            {features.map((f: { name: string; desc: string }, i: number) => (
              <TimelineNodeWrap key={i}>
                <TimelineCircle>{i + 1}</TimelineCircle>
                <TimelineTitle>{f.name}</TimelineTitle>
                <TimelineDesc>{f.desc}</TimelineDesc>
              </TimelineNodeWrap>
            ))}
          </TimelineNodes>
        </TimelineBody>
      </TimelineRoot>
    )
  }

  if (layout === 'callout') {
    return (
      <CalloutRoot>
        <ContentHeader><ContentTitle>{content.title}</ContentTitle></ContentHeader>
        <CalloutBody>
          <CalloutMain>
            <ContentBody>
              {(content.body || []).map((b: string, i: number) => (
                <ContentBullet key={i}><MathText text={b} /></ContentBullet>
              ))}
            </ContentBody>
          </CalloutMain>
          <CalloutSidebar>
            <CalloutLabel>{content.accent || '核心概念'}</CalloutLabel>
            <CalloutText>{content.highlight ? <MathText text={content.highlight} /> : ''}</CalloutText>
          </CalloutSidebar>
        </CalloutBody>
      </CalloutRoot>
    )
  }

  if (layout === 'statement') {
    return (
      <StatementRoot>
        <StatementText>{content.highlight || content.title}</StatementText>
        <StatementAccent />
        {content.title && content.highlight && <StatementAttr>— {content.title}</StatementAttr>}
      </StatementRoot>
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
