import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  /* size & transform set via inline style to fit viewport */
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

  // Keep ref in sync for resize listener
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
            <SlideRenderer slide={currentSlide} slideIndex={activeSlideIndex} totalSlides={totalSlides} />
          </SlideTransition>
        </SlideCanvas>
      </SlideMain>

      <ThumbStrip ref={thumbStripRef}>
        {slides.map((slide, i) => (
          <ThumbItem key={slide.id} ref={(el) => { if (i === activeSlideIndex) activeThumbRef.current = el }} active={activeSlideIndex === i} onClick={() => handleThumbClick(i)}>
            <ThumbInner style={cssVars}>
              <SlideRenderer slide={slide} slideIndex={i} totalSlides={totalSlides} />
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
                <SlideRenderer slide={currentSlide} slideIndex={activeSlideIndex} totalSlides={totalSlides} />
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
