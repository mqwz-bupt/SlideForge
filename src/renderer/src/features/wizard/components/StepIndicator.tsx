import styled from '@emotion/styled'
import type { WizardStep } from '@/shared/types/project'

const Dot = styled.div<{ status: 'active' | 'done' | 'pending' }>`
  width: ${({ status }) => status === 'active' ? '24px' : '8px'};
  height: 8px;
  border-radius: ${({ status }) => status === 'active' ? '4px' : '50%'};
  background: ${({ status, theme }) => {
    if (status === 'active') return theme.colors.primary
    if (status === 'done') return theme.colors.primaryLight
    return theme.colors.border
  }};
  transition: all ${({ theme }) => theme.transitionSlow};
`

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

interface StepIndicatorProps {
  currentStep: WizardStep
  totalSteps?: number
}

export function StepIndicator({ currentStep, totalSteps = 4 }: StepIndicatorProps) {
  return (
    <Container>
      {Array.from({ length: totalSteps }, (_, i) => (
        <Dot
          key={i}
          status={i === currentStep ? 'active' : i < currentStep ? 'done' : 'pending'}
        />
      ))}
    </Container>
  )
}
