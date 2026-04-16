import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/shared/stores/projectStore'

const Inner = styled.div`
  max-width: 720px;
  width: 100%;
`

const StepHeader = styled.div`
  margin-bottom: 32px;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
  max-width: 640px;
`

const MoodCard = styled.div<{ selected?: boolean }>`
  position: relative;
  height: 180px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  ${({ selected }) => selected && `border-color: #6750A4; box-shadow: 0 8px 40px rgba(0,0,0,0.12);`}
`

const MoodBg = styled.div<{ gradient: string }>`
  position: absolute; inset: 0;
  background: ${({ gradient }) => gradient};
  transition: all 0.3s ease;
  ${MoodCard}:hover & { filter: brightness(1.05); }
`

const MoodContent = styled.div<{ lightText?: boolean }>`
  position: relative; z-index: 1;
  height: 100%;
  display: flex; flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  color: ${({ lightText }) => lightText ? '#2C2418' : '#fff'};
  h3 { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
  p { font-size: 12px; opacity: ${({ lightText }) => lightText ? 0.7 : 0.8}; line-height: 1.5; }
`

const MoodCheck = styled.div`
  position: absolute; top: 12px; right: 12px;
  width: 26px; height: 26px;
  background: #6750A4;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: scale(0.5);
  transition: all 0.3s ease;
  ${MoodCard}:hover & { opacity: 0; }
`

const CheckVisible = styled.div`
  position: absolute; top: 12px; right: 12px;
  width: 26px; height: 26px;
  background: #6750A4;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  @keyframes popIn {
    from { transform: scale(0.5); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`

const Actions = styled.div`
  display: flex; justify-content: space-between; align-items: center;
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

const moods = [
  { key: 'confident', icon: 'verified', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)', lightText: false },
  { key: 'excited', icon: 'bolt', gradient: 'linear-gradient(135deg, #6B0848, #D4145A)', lightText: false },
  { key: 'calm', icon: 'spa', gradient: 'linear-gradient(135deg, #EDE6D8, #C4B8A0)', lightText: true },
  { key: 'inspired', icon: 'auto_awesome', gradient: 'linear-gradient(135deg, #0f0f0f, #2d1f3d)', lightText: false }
] as const

interface MoodStepProps {
  onNext: () => void
  onBack: () => void
}

export function MoodStep({ onNext, onBack }: MoodStepProps) {
  const { t } = useTranslation()
  const selectedMood = useProjectStore((s) => s.selectedMood)
  const setSelectedMood = useProjectStore((s) => s.setSelectedMood)

  return (
    <Inner>
      <StepHeader>
        <Label>{t('wizard.step2Label')}</Label>
        <Title>{t('wizard.step2Title')}</Title>
        <Desc>{t('wizard.step2Subtitle')}</Desc>
      </StepHeader>
      <Grid>
        {moods.map((mood) => (
          <MoodCard
            key={mood.key}
            selected={selectedMood === mood.key}
            onClick={() => setSelectedMood(mood.key)}
          >
            <MoodBg gradient={mood.gradient} />
            <MoodContent lightText={mood.lightText}>
              <div>
                <span className="material-icons-round" style={{ fontSize: 28, marginBottom: 4 }}>{mood.icon}</span>
                <h3>{t(`wizard.mood${mood.key.charAt(0).toUpperCase() + mood.key.slice(1)}`)}</h3>
                <p>{t(`wizard.mood${mood.key.charAt(0).toUpperCase() + mood.key.slice(1)}Desc`)}</p>
              </div>
            </MoodContent>
            {selectedMood === mood.key && (
              <CheckVisible>
                <span className="material-icons-round" style={{ fontSize: 16, color: '#fff' }}>check</span>
              </CheckVisible>
            )}
          </MoodCard>
        ))}
      </Grid>
      <Actions>
        <BackBtn onClick={onBack}>
          <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_back</span>
          {t('wizard.back')}
        </BackBtn>
        <PrimaryBtn disabled={!selectedMood} onClick={onNext}>
          {t('wizard.continue')}
          <span className="material-icons-round" style={{ fontSize: 18 }}>arrow_forward</span>
        </PrimaryBtn>
      </Actions>
    </Inner>
  )
}
