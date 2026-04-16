import { useState } from 'react'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useSettingsStore, PROVIDER_PRESETS } from '@/shared/stores/settingsStore'

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`

const Dialog = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  width: 520px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.25s ease;
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`

const DialogHeader = styled.div`
  padding: 20px 24px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; align-items: center; justify-content: space-between;
  h2 { font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
`

const CloseBtn = styled.button`
  width: 32px; height: 32px; border: none; background: none;
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex; align-items: center; justify-content: center;
  &:hover { background: ${({ theme }) => theme.colors.hover}; }
`

const Body = styled.div`
  padding: 20px 24px;
`

const Section = styled.div`
  margin-bottom: 24px;
  &:last-child { margin-bottom: 0; }
`

const SectionTitle = styled.h3`
  font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;
`

const FieldGroup = styled.div`
  margin-bottom: 14px;
`

const Label = styled.label`
  display: block; font-size: 13px; font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 6px;
`

const Select = styled.select`
  width: 100%; padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 14px; color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`

const Input = styled.input`
  width: 100%; padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 14px; color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.background};
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px rgba(103,80,164,0.1); }
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
`

const Row = styled.div`
  display: flex; gap: 12px;
  & > * { flex: 1; }
`

const TestBtn = styled.button<{ testing?: boolean; status?: 'ok' | 'fail' }>`
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 16px; width: 100%;
  border: 1px solid ${({ status, theme }) => {
    if (status === 'ok') return theme.colors.success || '#4CAF50'
    if (status === 'fail') return theme.colors.error || '#F44336'
    return theme.colors.primary
  }};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ status, theme }) => {
    if (status === 'ok') return 'rgba(76,175,80,0.1)'
    if (status === 'fail') return 'rgba(244,67,54,0.1)'
    return theme.colors.surface
  }};
  color: ${({ status, theme }) => {
    if (status === 'ok') return theme.colors.success || '#4CAF50'
    if (status === 'fail') return theme.colors.error || '#F44336'
    return theme.colors.primary
  }};
  font-size: 13px; font-weight: 500;
  transition: all ${({ theme }) => theme.transition};
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const HelpText = styled.p`
  font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 6px; line-height: 1.5;
`

const DialogFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; justify-content: flex-end; gap: 8px;
`

const PrimaryBtn = styled.button`
  padding: 10px 24px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff; border: none;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 14px; font-weight: 600;
  transition: all ${({ theme }) => theme.transition};
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`

export function SettingsDialog() {
  const { t } = useTranslation()
  const settingsOpen = useSettingsStore((s) => s.settingsOpen)
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen)
  const aiConfig = useSettingsStore((s) => s.aiConfig)
  const setAIConfig = useSettingsStore((s) => s.setAIConfig)
  const language = useSettingsStore((s) => s.language)
  const setLanguage = useSettingsStore((s) => s.setLanguage)

  const [testing, setTesting] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [testError, setTestError] = useState('')

  if (!settingsOpen) return null

  const handleProviderChange = (provider: string) => {
    const preset = PROVIDER_PRESETS[provider]
    if (preset) {
      setAIConfig({
        provider: provider as any,
        model: preset.model,
        baseURL: preset.baseURL
      })
      setTestStatus('idle')
    }
  }

  const handleTest = async () => {
    if (!aiConfig.apiKey.trim()) return
    setTesting(true)
    setTestStatus('idle')
    setTestError('')

    try {
      const result = await window.api.ai.testKey(aiConfig)
      setTestStatus(result.ok ? 'ok' : 'fail')
      if (!result.ok) setTestError(result.error || 'Connection failed')
    } catch (err: any) {
      setTestStatus('fail')
      setTestError(err.message)
    } finally {
      setTesting(false)
    }
  }

  const handleClose = () => setSettingsOpen(false)

  return (
    <Overlay onClick={handleClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <h2>
            <span className="material-icons-round" style={{ fontSize: 22, color: '#6750A4' }}>settings</span>
            设置
          </h2>
          <CloseBtn onClick={handleClose}>
            <span className="material-icons-round" style={{ fontSize: 20 }}>close</span>
          </CloseBtn>
        </DialogHeader>

        <Body>
          <Section>
            <SectionTitle>AI 模型配置</SectionTitle>
            <FieldGroup>
              <Label>模型提供商</Label>
              <Select value={aiConfig.provider} onChange={(e) => handleProviderChange(e.target.value)}>
                {Object.entries(PROVIDER_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.label}</option>
                ))}
              </Select>
            </FieldGroup>

            <FieldGroup>
              <Label>API Key</Label>
              <Input
                type="password"
                value={aiConfig.apiKey}
                onChange={(e) => { setAIConfig({ apiKey: e.target.value }); setTestStatus('idle') }}
                placeholder="sk-xxxxxxxxxxxxxxxx"
              />
              <HelpText>
                {aiConfig.provider === 'deepseek' && '前往 platform.deepseek.com 注册并获取 API Key'}
                {aiConfig.provider === 'qwen' && '前往 dashscope.console.aliyun.com 开通并获取 API Key'}
                {aiConfig.provider === 'glm' && '前往 open.bigmodel.cn 注册并获取 API Key'}
              </HelpText>
            </FieldGroup>

            <Row>
              <FieldGroup>
                <Label>模型</Label>
                <Input
                  value={aiConfig.model}
                  onChange={(e) => setAIConfig({ model: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup>
                <Label>API 地址</Label>
                <Input
                  value={aiConfig.baseURL}
                  onChange={(e) => setAIConfig({ baseURL: e.target.value })}
                />
              </FieldGroup>
            </Row>

            <FieldGroup>
              <TestBtn onClick={handleTest} disabled={testing || !aiConfig.apiKey.trim()} testing={testing} status={testStatus !== 'idle' ? testStatus : undefined}>
                <span className="material-icons-round" style={{ fontSize: 16 }}>
                  {testing ? 'hourglass_top' : testStatus === 'ok' ? 'check_circle' : testStatus === 'fail' ? 'error' : 'wifi_tethering'}
                </span>
                {testing ? '测试中...' : testStatus === 'ok' ? '连接成功！' : testStatus === 'fail' ? '连接失败' : '测试连接'}
              </TestBtn>
              {testError && <HelpText style={{ color: '#F44336', marginTop: 4 }}>{testError}</HelpText>}
            </FieldGroup>
          </Section>

          <Section>
            <SectionTitle>界面设置</SectionTitle>
            <FieldGroup>
              <Label>语言 / Language</Label>
              <Select value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}>
                <option value="zh">中文</option>
                <option value="en">English</option>
              </Select>
            </FieldGroup>
          </Section>
        </Body>

        <DialogFooter>
          <PrimaryBtn onClick={handleClose}>完成</PrimaryBtn>
        </DialogFooter>
      </Dialog>
    </Overlay>
  )
}
