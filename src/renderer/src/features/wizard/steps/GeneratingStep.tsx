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

/** Strip any markdown formatting artifacts from a string */
function cleanText(s: string): string {
  if (typeof s !== 'string') return s
  return s
    // Remove markdown table rows: |---|---| or |------|
    .replace(/^\|?[-:\s|]+\|?$/gm, '')
    // Remove table cell pipes but keep content: | text | → text
    .replace(/\|\s*/g, ' ')
    .replace(/\s*\|/g, ' ')
    // Remove code block markers
    .replace(/```[\s\S]*?```/g, '')
    .replace(/```/g, '')
    // Remove bold/italic markers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // Remove inline code backticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove excess whitespace
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** Clean all string fields in a slide object */
function cleanSlideStrings(slide: any): any {
  const truncate = (s: string, max: number) => {
    const c = cleanText(s)
    return c.length > max ? c.slice(0, max - 1) + '…' : c
  }
  const result: any = {}
  for (const [k, v] of Object.entries(slide)) {
    if (k === 'body' || k === 'leftBody' || k === 'rightBody') {
      result[k] = Array.isArray(v) ? v.map((item: any) => typeof item === 'string' ? truncate(item, 40) : item) : v
    } else if (k === 'features' && Array.isArray(v)) {
      result[k] = v.map((f: any) => ({
        ...f,
        name: typeof f.name === 'string' ? truncate(f.name, 20) : f.name,
        desc: typeof f.desc === 'string' ? truncate(f.desc, 30) : f.desc
      }))
    } else if (typeof v === 'string') {
      result[k] = k === 'title' || k === 'subtitle' ? truncate(v, 50) : truncate(v, 60)
    } else {
      result[k] = v
    }
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
      setErrorMsg(t('wizard.noApiKey'))
      return
    }

    if (!documentOutline) {
      setPhase('error')
      setErrorMsg(t('wizard.noOutline'))
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
只输出合法 JSON，不要其他文字。内容用中文。所有文本必须是纯文字，不含markdown格式标记。
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
      const structureSlides: any[] = (batch1Data.slides || []).map(cleanSlideStrings)

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
          content: `你是一位专业演示文稿设计师。我会给你按章节分组的知识点列表，为每个知识点生成一张幻灯片。
只输出合法 JSON，不要其他文字。内容用中文，要具体有信息量。

## 绝对禁止：
1. 不要在输出中包含 markdown 表格语法（|、---等）、代码块（\`\`\`）、HTML标签
2. 不要原样复制输入内容，必须用自己的话提炼为简洁要点
3. 所有 title、body、highlight 等文本字段必须是纯文本，不含任何格式标记
4. body 中每条文字不超过25个字，要精炼有力，不是完整长句

每个知识点对应一张幻灯片。你必须为每张幻灯片选择一种 layout，且严格遵循布局多样性规则。

## 可选 layout（每种必须被使用至少一次）：

### "two-column" — 对比/分类（≥20%）
- 适用场景：任何可拆分为两面的内容（对比、分类、因果、优缺点、前后、AB两种方案）
- 字段：title + leftTitle + leftBody（2-3条）+ rightTitle + rightBody（2-3条）
- 判断技巧：如果知识点可以用"从A和B两个角度看"来描述，就用这个

### "highlight" — 核心结论/公式（≥15%）
- 适用场景：核心定理、关键公式、重要结论、总结性陈述
- 字段：title + highlight（公式用LaTeX，结论用精炼一句话）+ body（2条补充）
- 判断技巧：如果知识点有一个"核心结论"可以提炼出来，就用这个

### "big-number" — 关键数据/指标（≥10%）
- 适用场景：涉及具体数字、百分比、统计数据、性能指标、年份等量化信息
- 字段：title（数据含义）+ highlight（大数字，如"99.7%"、"1.5亿"、"200+"）+ body（2-3条补充说明）+ accent（数据来源或单位标注）
- 判断技巧：如果知识点包含醒目的数字或可以量化，就用这个

### "timeline" — 流程/时间线（≥10%）
- 适用场景：包含3-5个阶段的发展历程、工作流程、技术演进、项目进度
- 字段：title + features 数组（每项 name=阶段名/步骤名，desc=简述）+ body（1条总结）
- 判断技巧：如果知识点描述了"先A再B最后C"的顺序过程，就用这个

### "callout" — 重要提示/注意事项（≥5%）
- 适用场景：常见误区、重要警告、关键区别、必须记住的要点
- 字段：title + accent（标签文字，如"注意"、"误区"、"关键"）+ highlight（核心提示语）+ body（2-3条详细说明）
- 判断技巧：如果知识点是"容易出错的地方"或"必须注意的事项"，就用这个

### "statement" — 核心观点/金句（≥5%）
- 适用场景：可以用一句话概括的深刻观点、核心主张、设计哲学
- 字段：highlight（核心观点一句话，要精炼有力）+ title（出处或上下文）+ accent（可选补充）
- 判断技巧：如果知识点可以浓缩为一句震撼的话，就用这个

### "quote" — 名言/观点/人物（≥5%）
- 适用场景：涉及学者观点、经典论述、历史名言、重要定义的原文
- 字段：title（出处/作者）+ highlight（引文/定义原文）+ body（1-2条解读）

### "feature-grid" — 并列要点/特征列表（≥10%）
- 适用场景：3-6个并列的方法、特性、步骤、要素
- 字段：title + features 数组（每项有 name 和 desc）+ body（1条总结）

### "content" — 常规讲解（最多占总数 ≤15%）
- 适用场景：只有无法适配其他 layout 时才使用
- 字段：title + body（3-4条展开细节，每条不超过25字）

## 强制规则：
1. 每个章节的幻灯片中，"content" layout 最多只出现 1 次
2. 连续两张幻灯片不能使用相同 layout
3. 优先将知识点重新组织为 two-column、big-number、highlight 或 timeline 格式，不要默认使用 content
4. 如果知识点没有明显的对比或公式，尝试将其组织为 feature-grid 或 timeline

## 数学公式必须用 LaTeX：
- 行内：$s(t) = A_m \\cos(2\\pi f_m t)$
- 块级：$$\\Delta\\phi = \\int_0^t \\Delta\\omega(\\tau)d\\tau$$

## 输出格式：
{"slides":[{"order":1,"layout":"two-column","sectionId":"s1","title":"标题","leftTitle":"A面","leftBody":["a1","a2"],"rightTitle":"B面","rightBody":["b1","b2"]},{"order":2,"layout":"highlight","sectionId":"s1","title":"核心结论","highlight":"$$E=mc^2$$","body":["补充1","补充2"]},{"order":3,"layout":"content","sectionId":"s1","title":"概念","body":["细节1","细节2","细节3"]},{"order":4,"layout":"quote","sectionId":"s2","title":"作者名","highlight":"引用内容","body":["解读"]},{"order":5,"layout":"feature-grid","sectionId":"s2","title":"并列特性","features":[{"name":"特性1","desc":"描述1"},{"name":"特性2","desc":"描述2"},{"name":"特性3","desc":"描述3"}],"body":["总结"]},{"order":6,"layout":"big-number","sectionId":"s1","title":"数据含义","highlight":"99.7%","accent":"准确率","body":["补充1","补充2"]},{"order":7,"layout":"timeline","sectionId":"s1","title":"发展历程","features":[{"name":"阶段1","desc":"描述"},{"name":"阶段2","desc":"描述"},{"name":"阶段3","desc":"描述"}],"body":["总结"]},{"order":8,"layout":"callout","sectionId":"s1","title":"注意事项","accent":"关键","highlight":"核心提示","body":["说明1","说明2"]},{"order":9,"layout":"statement","sectionId":"s1","highlight":"一句话核心观点","title":"上下文","accent":"补充"}]}`
        },
        {
          role: 'user' as const,
          content: `以下共 ${totalPoints} 个知识点，请为每个生成一张幻灯片（共 ${totalPoints} 张），一个都不能少。

重要提醒：
- content 布局最多用 ${Math.max(1, Math.floor(totalPoints * 0.25))} 次
- two-column 至少用 ${Math.max(1, Math.floor(totalPoints * 0.3))} 次
- highlight 至少用 ${Math.max(1, Math.floor(totalPoints * 0.25))} 次
- 相邻幻灯片布局不能相同

知识点列表：
${pointList}`
        }
      ]

      const batch2Result = await window.api.ai.chat(config, batch2Messages, { temperature: 0.7, max_tokens: 8192 })
      const batch2Data = JSON.parse(extractJSON(batch2Result.content))
      const contentSlides: any[] = (batch2Data.slides || []).map(cleanSlideStrings)

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
      const slides: Slide[] = allRawSlides.map((s: any, i: number) => {
        // Validate two-column slides: ensure both sides have body content
        if (s.layout === 'two-column') {
          const leftBody = Array.isArray(s.leftBody) && s.leftBody.length > 0 ? s.leftBody : ['（详见左侧）']
          const rightBody = Array.isArray(s.rightBody) && s.rightBody.length > 0 ? s.rightBody : ['（详见右侧）']
          // If one side is empty but the other has content, split the richer side
          if ((!Array.isArray(s.rightBody) || s.rightBody.length === 0) && Array.isArray(s.leftBody) && s.leftBody.length >= 2) {
            const mid = Math.ceil(s.leftBody.length / 2)
            return {
              id: `slide-${i + 1}`,
              order: s.order || i + 1,
              sectionId: s.layout === 'title' ? '' : (s.sectionId || sections[Math.min(Math.floor(i / 3), sections.length - 1)].id),
              layout: s.layout || 'content',
              content: {
                title: s.title,
                leftTitle: s.leftTitle,
                leftBody: s.leftBody.slice(0, mid),
                rightTitle: s.rightTitle,
                rightBody: s.leftBody.slice(mid),
              } as SlideContent
            }
          }
          if ((!Array.isArray(s.leftBody) || s.leftBody.length === 0) && Array.isArray(s.rightBody) && s.rightBody.length >= 2) {
            const mid = Math.ceil(s.rightBody.length / 2)
            return {
              id: `slide-${i + 1}`,
              order: s.order || i + 1,
              sectionId: s.layout === 'title' ? '' : (s.sectionId || sections[Math.min(Math.floor(i / 3), sections.length - 1)].id),
              layout: s.layout || 'content',
              content: {
                title: s.title,
                leftTitle: s.leftTitle,
                leftBody: s.rightBody.slice(0, mid),
                rightTitle: s.rightTitle,
                rightBody: s.rightBody.slice(mid),
              } as SlideContent
            }
          }
          s.leftBody = leftBody
          s.rightBody = rightBody
        }
        return {
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
            features: s.features,
            notes: s.notes
          } as SlideContent
        }
      })

      const project = {
        id: `proj-${Date.now()}`,
        name: topic ? (topic.length > 30 ? topic.slice(0, 28) + '…' : topic) : 'Untitled',
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
  }, [topic, selectedStyle, selectedMood, documentOutline, getAIConfig, setCurrentProject, saveProject, t])

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
        <Title style={{ color: '#c00' }}>{t('wizard.genError')}</Title>
        <ErrorBox>
          <p>{errorMsg}</p>
          {errorMsg.includes('API Key') && (
            <RetryBtn onClick={() => setSettingsOpen(true)}>{t('wizard.openSettings')}</RetryBtn>
          )}
        </ErrorBox>
        <br />
        <RetryBtn onClick={doGenerate}>{t('wizard.retry')}</RetryBtn>
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
          {t('wizard.doneStats', { style: selectedStyle || 'Bold Signal', count: resultStats.slides })}
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
      <Subtitle>{topic ? (topic.length > 60 ? topic.slice(0, 58) + '…' : topic) : 'Generating...'}</Subtitle>
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
