import { useState } from 'react'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/shared/stores/projectStore'

const Inner = styled.div`
  max-width: 640px; width: 100%; text-align: center;
`

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 36px; font-weight: 700; margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
`

const Subtitle = styled.p`
  font-size: 15px; color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 36px; line-height: 1.6;
`

const TextareaWrapper = styled.div`
  position: relative; margin-bottom: 12px;
`

const Textarea = styled.textarea`
  width: 100%; height: 120px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px; padding: 18px 20px;
  font-size: 16px; color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface};
  resize: none; outline: none;
  transition: border-color ${({ theme }) => theme.transition}, box-shadow ${({ theme }) => theme.transition};
  line-height: 1.6;
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(103,80,164,0.1);
  }
`

const UploadRow = styled.div`
  display: flex; gap: 8px; margin-bottom: 24px; justify-content: center;
`

const UploadBtn = styled.button`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 10px; font-size: 13px; font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all ${({ theme }) => theme.transition};
  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryContainer};
  }
`

const FileName = styled.span`
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primaryContainer};
  padding: 4px 10px; border-radius: 6px;
`

const PrimaryBtn = styled.button`
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 36px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff; border: none; border-radius: 12px;
  font-size: 15px; font-weight: 600;
  transition: all ${({ theme }) => theme.transition};
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-1px);
  }
`

const Examples = styled.div`
  margin-top: 28px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
`

const Chip = styled.button`
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px; font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all ${({ theme }) => theme.transition};
  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryContainer};
  }
`

interface TopicStepProps {
  onNext: (hasDocument: boolean) => void
}

export function TopicStep({ onNext }: TopicStepProps) {
  const { t } = useTranslation()
  const topic = useProjectStore((s) => s.topic)
  const setTopic = useProjectStore((s) => s.setTopic)
  const setUploadedFileName = useProjectStore((s) => s.setUploadedFileName)
  const [fileName, setFileName] = useState('')

  const examples = [
    { label: 'Analog Modulation', value: '通信原理中的模拟调制技术' },
    { label: 'Deep Learning & NLP', value: '深度学习在自然语言处理中的应用' },
    { label: 'Product Roadmap', value: '2026年Q1产品路线图汇报' },
    { label: 'Renaissance Art', value: '文艺复兴时期的艺术与人文' }
  ]

  const handleUpload = async () => {
    const result = await window.api.file.openText()
    if (result) {
      setTopic(result.content)
      setFileName(result.name)
      setUploadedFileName(result.name)
    }
  }

  const handleContinue = () => {
    onNext(!!fileName)
  }

  return (
    <Inner>
      <Title>{t('wizard.step0Title')}</Title>
      <Subtitle>{t('wizard.step0Subtitle')}</Subtitle>
      <TextareaWrapper>
        <Textarea
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value)
            if (fileName) {
              setFileName('')
              setUploadedFileName('')
            }
          }}
          placeholder={t('wizard.step0Placeholder')}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleContinue() } }}
        />
      </TextareaWrapper>
      <UploadRow>
        <UploadBtn onClick={handleUpload}>
          <span className="material-icons-round" style={{ fontSize: 16 }}>upload_file</span>
          Upload TXT / MD
        </UploadBtn>
        {fileName && <FileName>
          <span className="material-icons-round" style={{ fontSize: 13 }}>description</span>
          {fileName}
        </FileName>}
      </UploadRow>
      <PrimaryBtn onClick={handleContinue}>
        {t('wizard.continue')}
        <span className="material-icons-round" style={{ fontSize: 18 }}>arrow_forward</span>
      </PrimaryBtn>
      <Examples>
        {examples.map((ex) => (
          <Chip key={ex.label} onClick={() => {
            setTopic(ex.value)
            setFileName('')
            setUploadedFileName('')
          }}>{ex.label}</Chip>
        ))}
      </Examples>
    </Inner>
  )
}
