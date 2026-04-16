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
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 8px;
`

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
`

const Desc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 32px;
`

const Card = styled.div<{ selected?: boolean }>`
  padding: 18px 20px;
  background: ${({ selected, theme }) => selected ? theme.colors.primaryContainer : theme.colors.surface};
  border: 2px solid ${({ selected, theme }) => selected ? theme.colors.primary : theme.colors.border};
  border-radius: 14px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition};
  display: flex;
  align-items: flex-start;
  gap: 14px;
  &:hover { border-color: ${({ theme }) => theme.colors.primaryLight}; }
`

const Check = styled.div<{ selected?: boolean }>`
  width: 22px; height: 22px;
  border: 2px solid ${({ selected, theme }) => selected ? theme.colors.primary : theme.colors.border};
  background: ${({ selected, theme }) => selected ? theme.colors.primary : 'transparent'};
  border-radius: 6px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.transition};
  margin-top: 1px;
`

const CardText = styled.div`
  h3 { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
  p { font-size: 12px; color: ${({ theme }) => theme.colors.textSecondary}; line-height: 1.5; }
`

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all ${({ theme }) => theme.transition};
  &:hover { background: ${({ theme }) => theme.colors.surface}; border-color: ${({ theme }) => theme.colors.primaryLight}; }
`

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 36px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  transition: all ${({ theme }) => theme.transition};
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-1px);
  }
`

const scopes = [
  { key: 'scopeCore', titleKey: 'wizard.scopeCore', descKey: 'wizard.scopeCoreDesc' },
  { key: 'scopeTech', titleKey: 'wizard.scopeTech', descKey: 'wizard.scopeTechDesc' },
  { key: 'scopeCompare', titleKey: 'wizard.scopeCompare', descKey: 'wizard.scopeCompareDesc' },
  { key: 'scopeExamples', titleKey: 'wizard.scopeExamples', descKey: 'wizard.scopeExamplesDesc' }
] as const

const scopeNames = ['Core Concepts', 'Technical Analysis', 'Comparisons', 'Applications & Examples']

interface ScopeStepProps {
  onNext: () => void
  onBack: () => void
}

export function ScopeStep({ onNext, onBack }: ScopeStepProps) {
  const { t } = useTranslation()
  const selectedScopes = useProjectStore((s) => s.selectedScopes)
  const toggleScope = useProjectStore((s) => s.toggleScope)

  return (
    <Inner>
      <StepHeader>
        <Label>{t('wizard.step1Label')}</Label>
        <Title>{t('wizard.step1Title')}</Title>
        <Desc>{t('wizard.step1Subtitle')}</Desc>
      </StepHeader>
      <Grid>
        {scopes.map((scope, i) => {
          const isSelected = selectedScopes.includes(scopeNames[i])
          return (
            <Card key={scope.key} selected={isSelected} onClick={() => toggleScope(scopeNames[i])}>
              <Check selected={isSelected}>
                {isSelected && <span className="material-icons-round" style={{ fontSize: 16, color: '#fff' }}>check</span>}
              </Check>
              <CardText>
                <h3>{t(scope.titleKey)}</h3>
                <p>{t(scope.descKey)}</p>
              </CardText>
            </Card>
          )
        })}
      </Grid>
      <Actions>
        <BackBtn onClick={onBack}>
          <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_back</span>
          {t('wizard.back')}
        </BackBtn>
        <PrimaryBtn onClick={onNext}>
          {t('wizard.continue')}
          <span className="material-icons-round" style={{ fontSize: 18 }}>arrow_forward</span>
        </PrimaryBtn>
      </Actions>
    </Inner>
  )
}
