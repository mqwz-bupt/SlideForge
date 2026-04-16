import { useState, useRef } from 'react'
import styled from '@emotion/styled'
import { useAppStore } from '@/shared/stores/appStore'
import { StepIndicator } from './components/StepIndicator'
import { TopicStep } from './steps/TopicStep'
import { ScopeStep } from './steps/ScopeStep'
import { OutlineStep } from './steps/OutlineStep'
import { MoodStep } from './steps/MoodStep'
import { StyleStep } from './steps/StyleStep'
import { GeneratingStep } from './steps/GeneratingStep'
import type { WizardStep } from '@/shared/types/project'

const Stage = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`

const StepContainer = styled.div<{ active: boolean }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  opacity: ${({ active }) => active ? 1 : 0};
  transform: translateY(${({ active }) => active ? '0' : '30px'});
  pointer-events: ${({ active }) => active ? 'auto' : 'none'};
  transition: opacity 0.5s ease, transform 0.5s ease;
`

export function WizardView() {
  const currentStep = useAppStore((s) => s.currentWizardStep)
  const setWizardStep = useAppStore((s) => s.setWizardStep)

  const [hasDocument, setHasDocument] = useState(false)
  const outlineKey = useRef(0)

  const goTo = (step: WizardStep) => setWizardStep(step)

  return (
    <Stage>
      <StepContainer active={currentStep === 0}>
        <TopicStep onNext={(doc) => {
          setHasDocument(doc)
          outlineKey.current++
          goTo(doc ? 2 : 1)
        }} />
      </StepContainer>
      <StepContainer active={currentStep === 1}>
        <ScopeStep onNext={() => { outlineKey.current++; goTo(2) }} onBack={() => goTo(0)} />
      </StepContainer>
      <StepContainer active={currentStep === 2}>
        <OutlineStep key={outlineKey.current} onNext={() => goTo(3)} onBack={() => goTo(hasDocument ? 0 : 1)} />
      </StepContainer>
      <StepContainer active={currentStep === 3}>
        <MoodStep onNext={() => goTo(4)} onBack={() => goTo(2)} />
      </StepContainer>
      <StepContainer active={currentStep === 4}>
        <StyleStep onNext={() => goTo(5)} onBack={() => goTo(3)} />
      </StepContainer>
      <StepContainer active={currentStep === 5}>
        {currentStep === 5 && <GeneratingStep />}
      </StepContainer>
    </Stage>
  )
}
