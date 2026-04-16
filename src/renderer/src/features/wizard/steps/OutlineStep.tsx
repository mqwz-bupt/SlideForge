import { useState, useEffect, useCallback, useRef } from 'react'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/shared/stores/projectStore'
import { useSettingsStore } from '@/shared/stores/settingsStore'
import type { Section, Point, DocumentOutline } from '@/shared/types/project'

const Inner = styled.div`
  max-width: 720px; width: 100%;
  display: flex; flex-direction: column;
  height: 80vh; max-height: 640px;
`

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 24px; font-weight: 700; margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: center;
`

const Subtitle = styled.p`
  font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center; margin-bottom: 16px;
`

const Spinner = styled.div`
  width: 40px; height: 40px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  margin: 60px auto 16px;
  animation: spin 0.8s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`

const OutlineList = styled.div`
  flex: 1; overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px; padding: 12px;
  background: ${({ theme }) => theme.colors.surface};
`

const SectionBlock = styled.div`
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px; padding: 10px 12px;
  background: ${({ theme }) => theme.colors.background};
  transition: border-color ${({ theme }) => theme.transition};
  &:hover { border-color: ${({ theme }) => theme.colors.primaryLight}; }
`

const SectionHeader = styled.div`
  display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
`

const SectionNum = styled.div`
  width: 22px; height: 22px;
  background: ${({ theme }) => theme.colors.primary}; color: #fff;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
`

const SectionTitleInput = styled.input`
  flex: 1; border: none; background: transparent;
  font-weight: 600; font-size: 14px; color: ${({ theme }) => theme.colors.textPrimary};
  outline: none; padding: 2px 4px; border-radius: 4px;
  &:focus { background: ${({ theme }) => theme.colors.surface}; box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.primaryLight}; }
`

const SectionActions = styled.div`
  display: flex; gap: 2px;
`

const SmallBtn = styled.button<{ danger?: boolean }>`
  width: 24px; height: 24px; border: none; background: none;
  border-radius: 4px;
  color: ${({ danger, theme }) => danger ? (theme.colors.error || '#F44336') : theme.colors.textMuted};
  display: flex; align-items: center; justify-content: center;
  transition: all ${({ theme }) => theme.transition};
  &:hover { background: ${({ danger }) => danger ? 'rgba(244,67,54,0.1)' : '#EFEFF6'}; }
`

const PointRow = styled.div`
  display: flex; align-items: center; gap: 6px;
  padding: 3px 4px 3px 30px;
  border-radius: 4px;
  &:hover { background: rgba(103,80,164,0.04); }
`

const PointDot = styled.div`
  width: 4px; height: 4px;
  background: ${({ theme }) => theme.colors.primaryLight};
  border-radius: 50%; flex-shrink: 0;
`

const PointInput = styled.input`
  flex: 1; border: none; background: transparent;
  font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary};
  outline: none; padding: 1px 3px; border-radius: 3px;
  &:focus { background: ${({ theme }) => theme.colors.surface}; box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.primaryLight}; color: ${({ theme }) => theme.colors.textPrimary}; }
`

const PointDeleteBtn = styled.button`
  width: 18px; height: 18px; border: none; background: none;
  border-radius: 3px; color: ${({ theme }) => theme.colors.textMuted};
  display: none; align-items: center; justify-content: center; flex-shrink: 0;
  &:hover { background: rgba(244,67,54,0.1); color: #F44336; }
  ${PointRow}:hover & { display: flex; }
`

const AddPointBtn = styled.button`
  display: flex; align-items: center; gap: 4px;
  padding: 3px 4px 3px 30px; border: none; background: none;
  font-size: 12px; color: ${({ theme }) => theme.colors.primary};
  border-radius: 4px; width: 100%;
  &:hover { background: rgba(103,80,164,0.05); }
`

const AddSectionBtn = styled.button`
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 10px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 10px; background: transparent;
  font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary};
  transition: all ${({ theme }) => theme.transition};
  &:hover { border-color: ${({ theme }) => theme.colors.primaryLight }; color: ${({ theme }) => theme.colors.primary }; background: ${({ theme }) => theme.colors.primaryContainer }; }
`

const Footer = styled.div`
  margin-top: 12px;
  display: flex; gap: 10px; align-items: flex-end;
`

const AIInputWrapper = styled.div`
  flex: 1; position: relative;
`

const AIInput = styled.input`
  width: 100%; padding: 12px 44px 12px 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px; font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface};
  outline: none;
  transition: border-color ${({ theme }) => theme.transition};
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`

const AISendBtn = styled.button`
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  width: 32px; height: 32px; border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  transition: opacity ${({ theme }) => theme.transition};
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

const ConfirmBtn = styled.button`
  padding: 12px 28px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff; border: none; border-radius: 12px;
  font-size: 14px; font-weight: 600;
  white-space: nowrap;
  transition: all ${({ theme }) => theme.transition};
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-1px);
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`

const BackBtn = styled.button`
  padding: 8px 16px; background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px; font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all ${({ theme }) => theme.transition};
  &:hover { border-color: ${({ theme }) => theme.colors.primaryLight }; color: ${({ theme }) => theme.colors.primary }; }
`

const ErrorBox = styled.div`
  padding: 12px; margin: 16px 0;
  background: rgba(244,67,54,0.08); border: 1px solid rgba(244,67,54,0.2);
  border-radius: 10px; text-align: center;
  p { font-size: 13px; color: #c00; }
`

let _nextId = 5000
function genId(prefix: string) {
  return `${prefix}-${++_nextId}`
}

/** Extract JSON from AI response */
function extractJSON(text: string): string {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/)
  if (jsonMatch) return jsonMatch[1].trim()
  const objMatch = text.match(/\{[\s\S]*\}/)
  if (objMatch) return objMatch[0]
  return text
}

/** Truncate text to roughly `maxChars` characters, keeping complete paragraphs */
function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  const truncated = text.slice(0, maxChars)
  const lastBreak = truncated.lastIndexOf('\n')
  return truncated.slice(0, lastBreak > 0 ? lastBreak : maxChars) + '\n\n[文档内容过长，已截断]'
}

interface OutlineStepProps {
  onNext: () => void
  onBack: () => void
}

export function OutlineStep({ onNext, onBack }: OutlineStepProps) {
  const { t } = useTranslation()
  const topic = useProjectStore((s) => s.topic)
  const selectedScopes = useProjectStore((s) => s.selectedScopes)
  const uploadedFileName = useProjectStore((s) => s.uploadedFileName)
  const setDocumentOutline = useProjectStore((s) => s.setDocumentOutline)
  const getAIConfig = useSettingsStore((s) => s.getAIConfig)

  const [outline, setOutline] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [aiAdjusting, setAiAdjusting] = useState(false)
  const [error, setError] = useState('')
  const [aiInput, setAiInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const isDocumentPath = !!uploadedFileName

  const parseOutlineData = (data: any): Section[] => {
    return data.sections.map((s: any, i: number) => ({
      id: `s${i + 1}`,
      order: s.order || i + 1,
      title: typeof s.title === 'string' ? s.title.replace(/[|`#*\[\]]/g, '').trim().slice(0, 40) : `章节${i + 1}`,
      points: (s.points || []).map((p: string, j: number) => {
        // Clean and truncate each point to keep outline concise
        const cleaned = typeof p === 'string'
          ? p.replace(/[|`#*\[\]]/g, ' ').replace(/\s{2,}/g, ' ').trim()
          : String(p)
        return {
          id: `p-${i}-${j}`,
          content: cleaned.length > 30 ? cleaned.slice(0, 28) + '…' : cleaned,
          type: 'bullet' as const
        }
      })
    }))
  }

  const generateOutline = useCallback(async () => {
    setLoading(true)
    setError('')

    const config = getAIConfig()
    if (!config.apiKey) {
      setError(t('wizard.outlineNoApiKey'))
      setLoading(false)
      return
    }

    try {
      // Build scope-specific instructions
      const scopeHints: Record<string, string> = {
        'Core Concepts': '包含1-2个章节介绍基本定义、核心原理和关键术语',
        'Technical Analysis': '包含1-2个章节深入技术细节、公式推导、数据分析',
        'Comparisons': '包含1个章节做对比分析（不同方法/方案的优劣对比）',
        'Applications & Examples': '包含1个章节展示实际应用场景和具体案例'
      }
      const scopeGuidance = selectedScopes
        .map(s => scopeHints[s] || '')
        .filter(Boolean)
        .join('；')

      const messages = isDocumentPath
        ? [
            {
              role: 'system' as const,
              content: `你是一位专业的演示文稿设计师。你的任务是从用户提供的文档内容中提取关键信息，生成一份结构清晰的演示文稿大纲。

严格要求：
- 只输出合法的 JSON，不要包含任何 markdown 语法、注释或解释文字
- 所有内容使用中文
- 仔细阅读文档内容，每个 section 对应文档中的一个核心主题或章节
- 每个 point 必须是文档中实际提到的具体内容，提炼为简短陈述（不超过20字）
- 不要编造文档中没有的信息
- 目标 4-8 个 section，每个 section 2-5 个 point
- title 字段给出文档的总结性标题

输出格式（严格遵守）：
{"title":"演示文稿标题","sections":[{"order":1,"title":"章节标题","points":["要点1","要点2","要点3"]}],"estimatedMinutes":15}`
            },
            {
              role: 'user' as const,
              content: `请从以下文档内容中提取演示文稿大纲：\n\n${truncateText(topic, 8000)}`
            }
          ]
        : [
            {
              role: 'system' as const,
              content: `你是一位专业的演示文稿设计师。你的任务是根据用户给出的主题，生成一份结构清晰、内容专业的演示文稿大纲。

严格要求：
- 只输出合法的 JSON，不要包含任何 markdown 语法、注释或解释文字
- 所有内容使用中文
- 每个 section 对应主题的一个核心方面，按逻辑顺序排列
- 每个 point 必须是具体、有实质内容的知识点（不能是空泛的套话）
- 目标 4-6 个 section，每个 section 2-4 个 point
- title 字段给出演示文稿的正式标题

用户选择的内容范围：${selectedScopes.join('、')}
请确保大纲结构覆盖这些方向——${scopeGuidance}。如果只选了1-2个范围，侧重展开；如果选了3-4个，均衡分配。

输出格式（严格遵守）：
{"title":"演示文稿标题","sections":[{"order":1,"title":"章节标题","points":["要点1","要点2","要点3"]}],"estimatedMinutes":15}

示例（以"人工智能导论"为主题，范围：Core Concepts, Applications & Examples）：
{"title":"人工智能导论","sections":[{"order":1,"title":"人工智能概述","points":["AI的定义与研究范畴","图灵测试与强/弱AI","AI发展历程与关键里程碑"]},{"order":2,"title":"机器学习基础","points":["监督学习与无监督学习区别","常见算法：决策树、SVM、神经网络","模型评估：过拟合与交叉验证"]},{"order":3,"title":"AI应用场景","points":["自然语言处理：机器翻译与对话系统","计算机视觉：图像识别与自动驾驶","智能推荐与个性化系统"]},{"order":4,"title":"典型案例分析","points":["ChatGPT：大语言模型的突破","AlphaFold：蛋白质结构预测","特斯拉FSD：端到端自动驾驶架构"]}]}`
            },
            {
              role: 'user' as const,
              content: `请为以下主题生成演示文稿大纲：\n\n${topic}`
            }
          ]

      const result = await window.api.ai.chat(config, messages, { temperature: 0.7, max_tokens: 4096 })
      const data = JSON.parse(extractJSON(result.content))
      setOutline(parseOutlineData(data))
    } catch (err: any) {
      setError(err.message || t('wizard.outlineGenError'))
    } finally {
      setLoading(false)
    }
  }, [topic, selectedScopes, isDocumentPath, getAIConfig, t])

  useEffect(() => {
    generateOutline()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAIAdjust = async () => {
    if (!aiInput.trim()) return
    setAiAdjusting(true)

    const config = getAIConfig()
    if (!config.apiKey) {
      setError(t('wizard.outlineNoApiKey'))
      setAiAdjusting(false)
      return
    }

    try {
      const messages = [
        {
          role: 'system' as const,
          content: `你是一位专业的演示文稿设计师。根据用户的要求调整以下大纲。

严格要求：
- 只输出合法的 JSON，不要包含任何 markdown 语法、注释或解释文字
- 所有内容使用中文
- 尽量保留原有结构，仅做用户要求的修改
- 新增的内容必须具体、有实质内容

输出格式（严格遵守）：
{"sections":[{"order":1,"title":"章节标题","points":["要点1","要点2","要点3"]}]}`
        },
        {
          role: 'user' as const,
          content: `当前大纲：\n${JSON.stringify({ sections: outline.map(s => ({ title: s.title, points: s.points.map(p => p.content) })) }, null, 2)}\n\n修改要求：${aiInput}`
        }
      ]

      const result = await window.api.ai.chat(config, messages, { temperature: 0.7, max_tokens: 4096 })
      const data = JSON.parse(extractJSON(result.content))
      setOutline(parseOutlineData(data))
      setAiInput('')
    } catch (err: any) {
      setError(err.message || t('wizard.outlineGenError'))
    } finally {
      setAiAdjusting(false)
    }
  }

  // === Inline editing helpers ===
  const updateSectionTitle = (sectionId: string, title: string) => {
    setOutline(prev => prev.map(s => s.id === sectionId ? { ...s, title } : s))
  }

  const updatePointContent = (sectionId: string, pointId: string, content: string) => {
    setOutline(prev => prev.map(s => s.id === sectionId
      ? { ...s, points: s.points.map(p => p.id === pointId ? { ...p, content } : p) }
      : s
    ))
  }

  const addPoint = (sectionId: string) => {
    setOutline(prev => prev.map(s => s.id === sectionId
      ? { ...s, points: [...s.points, { id: genId('p'), content: '', type: 'bullet' as const }] }
      : s
    ))
  }

  const deletePoint = (sectionId: string, pointId: string) => {
    setOutline(prev => prev.map(s => s.id === sectionId
      ? { ...s, points: s.points.filter(p => p.id !== pointId) }
      : s
    ))
  }

  const addSection = () => {
    setOutline(prev => [...prev, {
      id: genId('s'),
      order: prev.length + 1,
      title: '',
      points: [{ id: genId('p'), content: '', type: 'bullet' as const }]
    }])
    // Scroll to bottom
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50)
  }

  const deleteSection = (sectionId: string) => {
    setOutline(prev => prev.filter(s => s.id !== sectionId).map((s, i) => ({ ...s, order: i + 1 })))
  }

  const moveSectionUp = (sectionId: string) => {
    setOutline(prev => {
      const idx = prev.findIndex(s => s.id === sectionId)
      if (idx <= 0) return prev
      const arr = [...prev]
      ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
      return arr.map((s, i) => ({ ...s, order: i + 1 }))
    })
  }

  const moveSectionDown = (sectionId: string) => {
    setOutline(prev => {
      const idx = prev.findIndex(s => s.id === sectionId)
      if (idx < 0 || idx >= prev.length - 1) return prev
      const arr = [...prev]
      ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
      return arr.map((s, i) => ({ ...s, order: i + 1 }))
    })
  }

  const handleConfirm = () => {
    const docOutline: DocumentOutline = {
      sections: outline,
      totalPoints: outline.reduce((sum, s) => sum + s.points.length, 0),
      estimatedMinutes: outline.length * 2
    }
    setDocumentOutline(docOutline)
    onNext()
  }

  // === Render: Loading ===
  if (loading) {
    return (
      <Inner>
        <Title>{t('wizard.outlineTitle')}</Title>
        <Subtitle>{t('wizard.outlineGenerating')}</Subtitle>
        <Spinner />
        <p style={{ textAlign: 'center', fontSize: 13, color: '#999' }}>
          {isDocumentPath ? uploadedFileName : (topic.length > 60 ? topic.slice(0, 58) + '…' : topic)}
        </p>
      </Inner>
    )
  }

  // === Render: Error ===
  if (error && outline.length === 0) {
    return (
      <Inner>
        <Title>{t('wizard.outlineTitle')}</Title>
        <ErrorBox>
          <p>{error}</p>
        </ErrorBox>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 }}>
          <BackBtn onClick={onBack}>{t('wizard.back')}</BackBtn>
          <ConfirmBtn onClick={generateOutline}>{t('wizard.outlineRetry')}</ConfirmBtn>
        </div>
      </Inner>
    )
  }

  // === Render: Editable outline ===
  return (
    <Inner>
      <Title>{t('wizard.outlineTitle')}</Title>
      <Subtitle>{t('wizard.outlineSubtitle')}</Subtitle>

      <OutlineList ref={listRef}>
        {outline.map((section, idx) => (
          <SectionBlock key={section.id}>
            <SectionHeader>
              <SectionNum>{section.order}</SectionNum>
              <SectionTitleInput
                value={section.title}
                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                placeholder={t('wizard.outlineSectionPlaceholder')}
              />
              <SectionActions>
                <SmallBtn title="Move up" onClick={() => moveSectionUp(section.id)} style={{ visibility: idx > 0 ? 'visible' : 'hidden' }}>
                  <span className="material-icons-round" style={{ fontSize: 15 }}>expand_less</span>
                </SmallBtn>
                <SmallBtn title="Move down" onClick={() => moveSectionDown(section.id)} style={{ visibility: idx < outline.length - 1 ? 'visible' : 'hidden' }}>
                  <span className="material-icons-round" style={{ fontSize: 15 }}>expand_more</span>
                </SmallBtn>
                <SmallBtn danger title="Delete" onClick={() => deleteSection(section.id)}>
                  <span className="material-icons-round" style={{ fontSize: 15 }}>close</span>
                </SmallBtn>
              </SectionActions>
            </SectionHeader>
            {section.points.map((point) => (
              <PointRow key={point.id}>
                <PointDot />
                <PointInput
                  value={point.content}
                  onChange={(e) => updatePointContent(section.id, point.id, e.target.value)}
                  placeholder={t('wizard.outlinePointPlaceholder')}
                />
                <PointDeleteBtn onClick={() => deletePoint(section.id, point.id)}>
                  <span className="material-icons-round" style={{ fontSize: 12 }}>close</span>
                </PointDeleteBtn>
              </PointRow>
            ))}
            <AddPointBtn onClick={() => addPoint(section.id)}>
              <span className="material-icons-round" style={{ fontSize: 14 }}>add</span>
              {t('wizard.outlineAddPoint')}
            </AddPointBtn>
          </SectionBlock>
        ))}
        <AddSectionBtn onClick={addSection}>
          <span className="material-icons-round" style={{ fontSize: 16 }}>add</span>
          {t('wizard.outlineAddSection')}
        </AddSectionBtn>
      </OutlineList>

      <Footer>
        <BackBtn onClick={onBack}>{t('wizard.back')}</BackBtn>
        <AIInputWrapper>
          <AIInput
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder={t('wizard.outlineAIPlaceholder')}
            onKeyDown={(e) => { if (e.key === 'Enter' && !aiAdjusting) handleAIAdjust() }}
            disabled={aiAdjusting}
          />
          <AISendBtn onClick={handleAIAdjust} disabled={aiAdjusting || !aiInput.trim()}>
            <span className="material-icons-round" style={{ fontSize: 18 }}>
              {aiAdjusting ? 'hourglass_top' : 'auto_fix_high'}
            </span>
          </AISendBtn>
        </AIInputWrapper>
        <ConfirmBtn onClick={handleConfirm} disabled={outline.length === 0}>
          {t('wizard.outlineConfirm')}
          <span className="material-icons-round" style={{ fontSize: 16, marginLeft: 4 }}>arrow_forward</span>
        </ConfirmBtn>
      </Footer>
    </Inner>
  )
}
