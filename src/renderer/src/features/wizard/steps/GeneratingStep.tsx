import { useState, useEffect, useCallback, useRef } from 'react'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/shared/stores/projectStore'
import { useAppStore } from '@/shared/stores/appStore'
import { useSettingsStore } from '@/shared/stores/settingsStore'
import type { Slide, SlideContent } from '@/shared/types/project'

const Inner = styled.div`
  text-align: center;
`

const Spinner = styled.div`
  width: 56px; height: 56px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  margin: 0 auto 24px;
  animation: spin 0.8s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 24px; margin-bottom: 8px;
`

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary}; font-size: 14px;
`

const ErrorBox = styled.div`
  max-width: 480px; margin: 20px auto; padding: 16px;
  background: rgba(244,67,54,0.08); border: 1px solid rgba(244,67,54,0.2);
  border-radius: 12px; text-align: left;
  p { font-size: 13px; color: #c00; line-height: 1.6; }
`

const RetryBtn = styled.button`
  margin-top: 12px; padding: 10px 24px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff; border: none; border-radius: 10px;
  font-size: 14px; font-weight: 600;
  &:hover { opacity: 0.9; }
`

const Steps = styled.div`
  margin-top: 24px;
  display: flex; flex-direction: column; gap: 8px;
  text-align: left; max-width: 320px;
  margin-left: auto; margin-right: auto;
`

const Step = styled.div<{ status: 'pending' | 'active' | 'done' | 'error' }>`
  display: flex; align-items: center; gap: 10px;
  font-size: 13px;
  color: ${({ status, theme }) => {
    if (status === 'active') return theme.colors.primary
    if (status === 'error') return '#F44336'
    if (status === 'done') return theme.colors.textSecondary
    return theme.colors.textMuted
  }};
  ${({ status }) => status === 'active' && 'font-weight: 500;'}
  transition: color 0.3s ease;
`

const DoneIcon = styled.div`
  width: 64px; height: 64px;
  background: linear-gradient(135deg, #6750A4, #9A82DB);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
  animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  @keyframes popIn {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`

const DoneStats = styled.div`
  display: inline-flex; gap: 20px; margin-bottom: 28px;
`

const Stat = styled.div`
  text-align: center;
  .val { font-size: 24px; font-weight: 700; color: ${({ theme }) => theme.colors.primary}; }
  .lbl { font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px; }
`

const PrimaryBtn = styled.button`
  display: inline-flex; align-items: center; gap: 8px;
  padding: 16px 40px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff; border: none; border-radius: 12px;
  font-size: 16px; font-weight: 600;
  transition: all ${({ theme }) => theme.transition};
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-1px);
  }
`

/** Repair common AI JSON mistakes: trailing commas, unquoted strings */
function repairJSON(json: string): string {
  // Fix trailing commas before ] or }
  let s = json.replace(/,\s*([}\]])/g, '$1')

  // Fix unquoted string values after , [ or : by walking the string
  let result = ''
  let i = 0
  let inStr = false

  while (i < s.length) {
    if (s[i] === '"' && (i === 0 || s[i - 1] !== '\\')) {
      inStr = !inStr
      result += s[i]; i++; continue
    }
    if (inStr) { result += s[i]; i++; continue }

    // After , [ or : — check for unquoted string value
    if (s[i] === ',' || s[i] === '[' || s[i] === ':') {
      result += s[i]; i++
      while (i < s.length && ' \t\n\r'.includes(s[i])) { result += s[i]; i++ }
      // If next char looks like the start of an unquoted string
      if (i < s.length && !'"{[0123456789-tfnnull'.includes(s[i]) && s[i] !== ']' && s[i] !== '}') {
        let start = i
        while (i < s.length && s[i] !== ',' && s[i] !== ']' && s[i] !== '}') i++
        let val = s.substring(start, i).trim()
        // Strip trailing lone quote (AI sometimes adds " at end but not start)
        if (val.endsWith('"')) val = val.slice(0, -1).trim()
        result += '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
        continue
      }
      continue
    }

    result += s[i]; i++
  }
  return result
}

/** Extract JSON from AI response (handles markdown code blocks + repair) */
function extractJSON(text: string): string {
  let raw = ''
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/)
  if (jsonMatch) raw = jsonMatch[1].trim()
  else {
    const objMatch = text.match(/\{[\s\S]*\}/)
    if (objMatch) raw = objMatch[0]
    else raw = text
  }

  // Try as-is first
  try { JSON.parse(raw); return raw } catch {}

  // Try repair
  const repaired = repairJSON(raw)
  try { JSON.parse(repaired); return repaired } catch {}

  return raw
}

export function GeneratingStep() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setWizardStep = useAppStore((s) => s.setWizardStep)
  const setActiveSectionId = useAppStore((s) => s.setActiveSectionId)
  const topic = useProjectStore((s) => s.topic)
  const selectedStyle = useProjectStore((s) => s.selectedStyle)
  const selectedMood = useProjectStore((s) => s.selectedMood)
  const documentOutline = useProjectStore((s) => s.documentOutline)
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject)
  const saveProject = useProjectStore((s) => s.saveProject)
  const getAIConfig = useSettingsStore((s) => s.getAIConfig)
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen)

  const [phase, setPhase] = useState<'generating' | 'done' | 'error'>('generating')
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [errorStep, setErrorStep] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [resultStats, setResultStats] = useState({ slides: 0, sections: 0 })
  const completedStepsRef = useRef<number[]>([])
  completedStepsRef.current = completedSteps

  const doGenerate = useCallback(async () => {
    setPhase('generating')
    setActiveStep(0)
    setCompletedSteps([])
    completedStepsRef.current = []
    setErrorStep(null)
    setErrorMsg('')

    const config = getAIConfig()
    if (!config.apiKey) {
      setPhase('error')
      setErrorMsg('请先在设置中配置 API Key')
      return
    }

    if (!documentOutline) {
      setPhase('error')
      setErrorMsg('没有大纲数据，请返回确认大纲后再试')
      return
    }

    const sections = documentOutline.sections
    const sectionIdList = sections.map((s, i) => `- 章节${i + 1} "${s.title}" → "${s.id}"`).join('\n')
    const outlineCompact = JSON.stringify({
      title: topic,
      sections: sections.map(s => ({ id: s.id, title: s.title, points: s.points.map(p => p.content) }))
    })

    try {
      // Step 0: Generate slides in 2 batches to avoid token truncation
      setActiveStep(0)

      // === Batch 1: Title + section dividers ===
      const batch1Messages = [
        {
          role: 'system' as const,
          content: `你是一位演示文稿生成器。为大纲生成封面页和每个章节的分隔页。
只输出合法 JSON，不要其他文字。内容用中文。
sectionId 必须用以下 id：
${sectionIdList}

输出格式：
{"slides":[{"order":1,"layout":"title","title":"标题","subtitle":"副标题"},{"order":2,"layout":"section-divider","sectionId":"章节id","title":"章节名","subtitle":"章节简述"}]}`
        },
        {
          role: 'user' as const,
          content: `大纲：${outlineCompact}`
        }
      ]

      const batch1Result = await window.api.ai.chat(config, batch1Messages, { temperature: 0.7, max_tokens: 2048 })
      const batch1Data = JSON.parse(extractJSON(batch1Result.content))
      const structureSlides: any[] = batch1Data.slides || []

      console.log(`[Batch1] Title + dividers: ${structureSlides.length} slides`)

      // === Batch 2: One slide per point ===
      const totalPoints = sections.reduce((sum, s) => sum + s.points.length, 0)
      const pointList = sections.map(s =>
        `【章节 "${s.title}" sectionId:"${s.id}"】\n` +
        s.points.map((p, pi) => `${pi + 1}. ${p.content}`).join('\n')
      ).join('\n\n')

      const batch2Messages = [
        {
          role: 'system' as const,
          content: `你是一位演示文稿生成器。我会给你按章节分组的知识点列表，为每个知识点生成一张幻灯片。
只输出合法 JSON，不要其他文字。内容用中文，要具体有信息量。

每个知识点对应一张幻灯片，根据内容选最合适的 layout：
- "content"：概念/原理讲解 → title 是知识点，body 是 3-4 个展开细节（每条不超过25字）
- "two-column"：涉及对比/分类 → title + leftTitle/leftBody + rightTitle/rightBody
- "highlight"：核心公式/关键结论 → title + highlight（金句/公式）+ body（2-3个补充）

**数学公式必须用 LaTeX 语法，用 $ 包裹**。例如：
- 行内公式：$s(t) = A_m \\cos(2\\pi f_m t)$
- 块级公式：$$\\Delta\\phi = \\int_0^t \\Delta\\omega(\\tau)d\\tau$$
不要用纯文本写公式，必须用 LaTeX！

输出格式（每张幻灯片必须有 sectionId 和 title）：
{"slides":[{"order":1,"layout":"content","sectionId":"s1","title":"知识点标题","body":["展开细节1","展开细节2","展开细节3"]},{"order":2,"layout":"highlight","sectionId":"s1","title":"核心公式","highlight":"$s(t)=A_c\\cos(2\\pi f_c t)$","body":["补充1","补充2"]},{"order":3,"layout":"two-column","sectionId":"s2","title":"对比","leftTitle":"A","leftBody":["a1"],"rightTitle":"B","rightBody":["b1"]}]}`
        },
        {
          role: 'user' as const,
          content: `以下共 ${totalPoints} 个知识点，请为每个生成一张幻灯片（共 ${totalPoints} 张），一个都不能少：\n\n${pointList}`
        }
      ]

      const batch2Result = await window.api.ai.chat(config, batch2Messages, { temperature: 0.7, max_tokens: 8192 })
      const batch2Data = JSON.parse(extractJSON(batch2Result.content))
      const contentSlides: any[] = batch2Data.slides || []

      console.log(`[Batch2] Content slides: ${contentSlides.length} slides (expected ${totalPoints})`)

      // === Merge: assign content slides to sections by counting points ===
      const allRawSlides: any[] = []

      // Add title slide (order 1)
      const titleSlide = structureSlides.find((s: any) => s.layout === 'title')
      if (titleSlide) allRawSlides.push({ ...titleSlide, order: 1 })

      let orderCounter = 2
      let contentIdx = 0

      for (let si = 0; si < sections.length; si++) {
        const section = sections[si]

        // Add section divider — find by index if sectionId doesn't match
        let divider = structureSlides.find((s: any) => s.layout === 'section-divider' && s.sectionId === section.id)
        if (!divider) {
          const dividers = structureSlides.filter((s: any) => s.layout === 'section-divider')
          divider = dividers[si]
        }
        if (divider) {
          allRawSlides.push({ ...divider, order: orderCounter, sectionId: section.id })
          orderCounter++
        }

        // Add one content slide per point in this section
        const pointsInThisSection = section.points.length
        for (let j = 0; j < pointsInThisSection && contentIdx < contentSlides.length; j++) {
          const cs = contentSlides[contentIdx]
          allRawSlides.push({ ...cs, order: orderCounter, sectionId: section.id })
          contentIdx++
          orderCounter++
        }
      }

      console.log(`[Merge] Total slides: ${allRawSlides.length}`)

      setCompletedSteps([0])
      completedStepsRef.current = [0]

      // Step 1: Build final project
      setActiveStep(1)
      const slides: Slide[] = allRawSlides.map((s: any, i: number) => ({
        id: `slide-${i + 1}`,
        order: s.order || i + 1,
        sectionId: s.layout === 'title' ? '' : (s.sectionId || sections[Math.min(Math.floor(i / 3), sections.length - 1)].id),
        layout: s.layout || 'content',
        content: {
          title: s.title,
          subtitle: s.subtitle,
          body: s.body,
          highlight: s.highlight,
          leftTitle: s.leftTitle,
          leftBody: s.leftBody,
          rightTitle: s.rightTitle,
          rightBody: s.rightBody,
          notes: s.notes
        } as SlideContent
      }))

      const project = {
        id: `proj-${Date.now()}`,
        name: topic || 'Untitled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documentOutline: {
          sections,
          totalPoints: sections.reduce((sum, s) => sum + s.points.length, 0),
          estimatedMinutes: documentOutline.estimatedMinutes
        },
        style: selectedStyle || 'bold-signal',
        slides,
        sourceFiles: [],
        metadata: {
          language: 'zh' as const,
          mood: selectedMood || 'confident',
          model: config.provider
        }
      }

      setCurrentProject(project)

      // Auto-save to database
      try { await saveProject() } catch (e) { /* non-critical */ }

      setCompletedSteps([0, 1])
      completedStepsRef.current = [0, 1]
      setResultStats({ slides: slides.length, sections: sections.length })

      setTimeout(() => setPhase('done'), 600)
    } catch (err: any) {
      setErrorStep(completedStepsRef.current.length)
      setErrorMsg(err.message)
      setPhase('error')
    }
  }, [topic, selectedStyle, selectedMood, documentOutline, getAIConfig, setCurrentProject, saveProject])

  useEffect(() => {
    doGenerate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = () => {
    setCurrentView('editor')
    setWizardStep(0)
    setActiveSectionId(null)
    navigate('/editor')
  }

  if (phase === 'error') {
    return (
      <Inner>
        <Title style={{ color: '#c00' }}>生成失败</Title>
        <ErrorBox>
          <p>{errorMsg}</p>
          {errorMsg.includes('API Key') && (
            <RetryBtn onClick={() => setSettingsOpen(true)}>打开设置</RetryBtn>
          )}
        </ErrorBox>
        <br />
        <RetryBtn onClick={doGenerate}>重试</RetryBtn>
      </Inner>
    )
  }

  if (phase === 'done') {
    return (
      <Inner>
        <DoneIcon>
          <span className="material-icons-round" style={{ fontSize: 32, color: '#fff' }}>check</span>
        </DoneIcon>
        <Title>{t('wizard.doneTitle')}</Title>
        <Subtitle style={{ marginBottom: 24 }}>
          {selectedStyle || 'Bold Signal'} style, {resultStats.slides} slides
        </Subtitle>
        <DoneStats>
          <Stat><div className="val">{resultStats.slides}</div><div className="lbl">Slides</div></Stat>
          <Stat><div className="val">{resultStats.sections}</div><div className="lbl">Sections</div></Stat>
          <Stat><div className="val">AI</div><div className="lbl">Generated</div></Stat>
        </DoneStats>
        <br />
        <PrimaryBtn onClick={handleOpen}>
          <span className="material-icons-round" style={{ fontSize: 20 }}>play_arrow</span>
          {t('wizard.openPresentation')}
        </PrimaryBtn>
      </Inner>
    )
  }

  return (
    <Inner>
      <Spinner />
      <Title>{t('wizard.generating')}</Title>
      <Subtitle>{topic || 'Analog Modulation'}</Subtitle>
      <Steps>
        {[0, 1].map((i) => (
          <Step key={i} status={errorStep === i ? 'error' : completedSteps.includes(i) ? 'done' : activeStep === i ? 'active' : 'pending'}>
            <span className="material-icons-round" style={{ fontSize: 18 }}>
              {errorStep === i ? 'error' : completedSteps.includes(i) ? 'check_circle' : 'hourglass_top'}
            </span>
            {t(`wizard.genStep${i}`)}
          </Step>
        ))}
      </Steps>
    </Inner>
  )
}
