import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import type { StylePreset } from '@/shared/types/project'
import { useProjectStore } from '@/shared/stores/projectStore'
import { getStyleConfig } from '@/features/editor/components/stylePresets'

const Inner = styled.div`
  max-width: 880px; width: 100%;
`

const StepHeader = styled.div`
  margin-bottom: 32px; text-align: center;
`

const Label = styled.p`
  font-size: 12px; font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 8px;
`

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 28px; font-weight: 700;
  margin-bottom: 6px;
`

const Desc = styled.p`
  font-size: 14px; color: ${({ theme }) => theme.colors.textSecondary};
`

const MoodBadge = styled.div`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; margin-bottom: 16px;
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 20px; font-size: 12px; font-weight: 600;
`

const StyleGrid = styled.div`
  display: flex; gap: 20px; margin-bottom: 32px;
  width: 100%; max-width: 900px;
`

const StyleCard = styled.div<{ selected?: boolean }>`
  flex: 1; border-radius: 16px; overflow: hidden;
  cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid transparent;
  position: relative;
  &:hover { transform: translateY(-4px); box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
  ${({ selected, theme }) => selected && `border-color: ${theme.colors.primary};`}
`

const Preview = styled.div<{ bg: string }>`
  height: 280px;
  display: flex; flex-direction: column;
  justify-content: center;
  padding: 28px 24px;
  position: relative; overflow: hidden;
  background: ${({ bg }) => bg};
`

const PreviewAccent = styled.div<{ color: string }>`
  width: 40px; height: 3px;
  background: ${({ color }) => color};
  border-radius: 2px; margin-bottom: 12px;
`

const PreviewTitle = styled.div<{ color?: string; fontFamily?: string }>`
  font-family: ${({ fontFamily }) => fontFamily || "'Inter', sans-serif"};
  font-size: 22px; font-weight: 700;
  color: ${({ color }) => color || '#1A1A1A'};
  line-height: 1.15; margin-bottom: 6px;
`

const PreviewSub = styled.div<{ color?: string }>`
  font-size: 11px; color: ${({ color }) => color || '#6B6B6B'};
  line-height: 1.6;
`

const StyleTag = styled.span`
  position: absolute; top: 12px; right: 12px;
  background: rgba(0,0,0,0.5); color: #fff;
  padding: 3px 10px; border-radius: 10px;
  font-size: 10px; font-weight: 600;
`

const SelectBadge = styled.div`
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%) scale(1);
  width: 48px; height: 48px;
  background: #6750A4;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 2;
  @keyframes popIn {
    from { transform: translate(-50%, -50%) scale(0); }
    to { transform: translate(-50%, -50%) scale(1); }
  }
`

const CardName = styled.div`
  padding: 12px 16px;
  background: #fff;
  display: flex; align-items: center;
  justify-content: space-between;
  h4 { font-size: 13px; font-weight: 600; }
  span { font-size: 11px; color: #9999AA; }
`

const Actions = styled.div`
  display: flex; justify-content: center; gap: 12px;
`

const BackBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  padding: 10px 20px; background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px; font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all ${({ theme }) => theme.transition};
  &:hover { background: ${({ theme }) => theme.colors.surface}; border-color: ${({ theme }) => theme.colors.primaryLight}; }
`

const PrimaryBtn = styled.button<{ disabled?: boolean }>`
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 36px;
  background: ${({ theme, disabled }) => disabled ? theme.colors.border : theme.colors.primary};
  color: #fff; border: none; border-radius: 12px;
  font-size: 15px; font-weight: 600;
  transition: all ${({ theme }) => theme.transition};
  pointer-events: ${({ disabled }) => disabled ? 'none' : 'auto'};
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-1px);
  }
`

/** Mood → 3 suggested presets (from SKILL.md Phase 2.2) */
const moodPresetMap: Record<string, StylePreset[]> = {
  confident: ['bold-signal', 'electric-studio', 'dark-botanical'],
  excited: ['creative-voltage', 'neon-cyber', 'split-pastel'],
  calm: ['notebook-tabs', 'paper-ink', 'swiss-modern'],
  inspired: ['dark-botanical', 'vintage-editorial', 'pastel-geometry']
}

const moodLabels: Record<string, string> = {
  confident: 'Impressed / Confident',
  excited: 'Excited / Energized',
  calm: 'Calm / Focused',
  inspired: 'Inspired / Moved'
}

interface StyleStepProps {
  onNext: () => void
  onBack: () => void
}

export function StyleStep({ onNext, onBack }: StyleStepProps) {
  const { t } = useTranslation()
  const selectedStyle = useProjectStore((s) => s.selectedStyle)
  const setSelectedStyle = useProjectStore((s) => s.setSelectedStyle)
  const selectedMood = useProjectStore((s) => s.selectedMood)
  const topic = useProjectStore((s) => s.topic)

  const mood = selectedMood || 'confident'
  const presets = moodPresetMap[mood] || moodPresetMap.confident
  const displayTitle = topic || 'Analog Modulation'

  // Clear selection if it's not in the current mood's presets
  const handleSelect = (id: StylePreset) => {
    setSelectedStyle(id)
  }

  return (
    <Inner>
      <StepHeader>
        <Label>{t('wizard.step3Label')}</Label>
        <Title>{t('wizard.step3Title')}</Title>
        <Desc>{t('wizard.step3Subtitle')}</Desc>
      </StepHeader>

      <div style={{ textAlign: 'center' }}>
        <MoodBadge>
          <span className="material-icons-round" style={{ fontSize: 14 }}>palette</span>
          {moodLabels[mood]}
        </MoodBadge>
      </div>

      <StyleGrid>
        {presets.map((presetId, idx) => {
          const config = getStyleConfig(presetId)
          return (
            <StyleCard
              key={presetId}
              selected={selectedStyle === presetId}
              onClick={() => handleSelect(presetId)}
            >
              <Preview bg={config.titleBg}>
                <PreviewAccent color={config.titleAccentBg} />
                <PreviewTitle
                  color={config.titleColor}
                  fontFamily={config.displayFont}
                >
                  {displayTitle}
                </PreviewTitle>
                <PreviewSub color={config.titleSubtitleColor}>
                  {t('wizard.step3PreviewSub')}
                </PreviewSub>
                {idx === 0 && <StyleTag>Recommended</StyleTag>}
              </Preview>
              {selectedStyle === presetId && (
                <SelectBadge>
                  <span className="material-icons-round" style={{ fontSize: 24, color: '#fff' }}>check</span>
                </SelectBadge>
              )}
              <CardName>
                <h4>{config.label}</h4>
                <span>Style {String.fromCharCode(65 + idx)}</span>
              </CardName>
            </StyleCard>
          )
        })}
      </StyleGrid>

      <Actions>
        <BackBtn onClick={onBack}>
          <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_back</span>
          {t('wizard.back')}
        </BackBtn>
        <PrimaryBtn disabled={!selectedStyle} onClick={onNext}>
          <span className="material-icons-round" style={{ fontSize: 18 }}>auto_awesome</span>
          {t('wizard.generate')}
        </PrimaryBtn>
      </Actions>
    </Inner>
  )
}
