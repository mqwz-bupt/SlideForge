import { useState, useEffect, useCallback, useRef } from 'react'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/shared/stores/projectStore'
import { useAppStore } from '@/shared/stores/appStore'
import { useSettingsStore } from '@/shared/stores/settingsStore'
import type { ProjectMetadata, Slide, SlideContent } from '@/shared/types/project'

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

import { cleanSlideStrings, parseAIJSON } from '@/shared/utils/slideUtils'

type CommonsImage = {
  url: string
  title: string
  source: string
}

function compactQuery(text: string): string {
  return text
    .replace(/[|`#*[\]{}()<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

async function searchCommonsImage(query: string): Promise<CommonsImage | null> {
  const search = compactQuery(query)
  if (!search) return null

  const queries = [
    search,
    `${search} diagram`,
    `${search} technology`,
    'presentation diagram technology'
  ]

  for (const q of queries) {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      generator: 'search',
      gsrnamespace: '6',
      gsrlimit: '6',
      gsrsearch: q,
      prop: 'imageinfo',
      iiprop: 'url|mime',
      iiurlwidth: '1200'
    })

    try {
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`)
      if (!response.ok) continue
      const data = await response.json()
      const pages = Object.values(data?.query?.pages || {}) as any[]
      const page = pages.find((p) => {
        const info = p.imageinfo?.[0]
        return (info?.thumburl || info?.url) && !String(info?.mime || '').includes('svg')
      }) || pages.find((p) => p.imageinfo?.[0]?.thumburl || p.imageinfo?.[0]?.url)
      if (!page) continue

      return {
        url: page.imageinfo[0].thumburl || page.imageinfo[0].url,
        title: page.title?.replace(/^File:/, '') || 'Wikimedia Commons image',
        source: `Wikimedia Commons: ${page.title?.replace(/^File:/, '') || q}`
      }
    } catch {
      // Try the next query variant.
    }
  }

  return null
}

function localIllustrationDataUri(title: string, topic: string): string {
  const xmlText = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
  const safeTitle = xmlText(compactQuery(title || topic || 'Presentation'))
  const safeTopic = xmlText(compactQuery(topic || 'SlideForge'))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
<defs>
<linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#172033"/><stop offset="1" stop-color="#4f46e5"/></linearGradient>
<linearGradient id="card" x1="0" x2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".92"/><stop offset="1" stop-color="#e0f2fe" stop-opacity=".86"/></linearGradient>
</defs>
<rect width="1200" height="800" rx="42" fill="url(#bg)"/>
<circle cx="1000" cy="120" r="190" fill="#22d3ee" opacity=".18"/>
<circle cx="160" cy="650" r="230" fill="#f97316" opacity=".16"/>
<g transform="translate(120 130)">
<rect x="0" y="0" width="960" height="540" rx="34" fill="url(#card)"/>
<rect x="60" y="70" width="360" height="32" rx="16" fill="#4f46e5" opacity=".85"/>
<rect x="60" y="130" width="520" height="18" rx="9" fill="#0f172a" opacity=".18"/>
<rect x="60" y="170" width="430" height="18" rx="9" fill="#0f172a" opacity=".14"/>
<rect x="60" y="210" width="480" height="18" rx="9" fill="#0f172a" opacity=".14"/>
<g transform="translate(620 105)">
<circle cx="120" cy="120" r="96" fill="#4f46e5" opacity=".9"/>
<path d="M68 126h104M120 74v104" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity=".95"/>
<circle cx="120" cy="120" r="138" fill="none" stroke="#22d3ee" stroke-width="12" opacity=".7"/>
</g>
<g transform="translate(90 335)" fill="none" stroke="#4f46e5" stroke-width="10" stroke-linecap="round">
<path d="M0 90 C90 5 170 5 260 90 S430 175 520 90"/>
<circle cx="0" cy="90" r="14" fill="#4f46e5"/><circle cx="260" cy="90" r="14" fill="#4f46e5"/><circle cx="520" cy="90" r="14" fill="#4f46e5"/>
</g>
</g>
<text x="120" y="92" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700" fill="#ffffff">${safeTopic}</text>
<text x="120" y="735" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="800" fill="#ffffff">${safeTitle}</text>
</svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

async function attachImagesToSlides(slides: any[], topic: string): Promise<any[]> {
  const candidates = slides
    .map((slide, index) => ({ slide, index }))
    .filter(({ slide }) => !['title', 'section-divider', 'quote', 'statement'].includes(slide.layout))

  const targetCount = Math.min(6, Math.max(3, Math.ceil(candidates.length * 0.35)))
  const alreadyImage = candidates.filter(({ slide }) => slide.layout === 'image')
  const convertible = candidates.filter(({ slide }) =>
    ['content', 'feature-grid', 'timeline', 'callout', 'highlight', 'two-column'].includes(slide.layout)
  )
  const selected = [...alreadyImage, ...convertible].slice(0, targetCount)

  for (const { slide } of selected) {
    const query = slide.imageQuery || `${topic} ${slide.title || ''}`
    const image = await searchCommonsImage(query)

    slide.layout = 'image'
    slide.imageUrl = image?.url || localIllustrationDataUri(slide.title || topic, topic)
    slide.subtitle = image?.source || 'Auto-generated local visual'
    slide.body = Array.isArray(slide.body) && slide.body.length > 0
      ? slide.body.slice(0, 5)
      : [
          slide.highlight || slide.title,
          ...(Array.isArray(slide.leftBody) ? slide.leftBody.slice(0, 3) : []),
          ...(Array.isArray(slide.rightBody) ? slide.rightBody.slice(0, 3) : []),
          ...(Array.isArray(slide.features) ? slide.features.slice(0, 3).map((f: any) => `${f.name}: ${f.desc}`) : [])
        ].filter(Boolean).slice(0, 5)
  }

  return slides
}

function removeGeneratedImages(slides: any[]): any[] {
  return slides.map((slide) => {
    if (slide.layout !== 'image' && !slide.imageUrl && !slide.imageQuery) return slide

    return {
      ...slide,
      layout: slide.layout === 'image' ? 'content' : slide.layout,
      imageUrl: undefined,
      imageQuery: undefined,
      subtitle: slide.layout === 'image' ? undefined : slide.subtitle,
      body: Array.isArray(slide.body) && slide.body.length > 0
        ? slide.body.slice(0, 6)
        : [
            slide.highlight,
            ...(Array.isArray(slide.leftBody) ? slide.leftBody.slice(0, 4) : []),
            ...(Array.isArray(slide.rightBody) ? slide.rightBody.slice(0, 4) : []),
            ...(Array.isArray(slide.features) ? slide.features.slice(0, 6).map((f: any) => `${f.name}: ${f.desc}`) : [])
          ].filter(Boolean).slice(0, 6)
    }
  })
}

function uniqueTexts(items: unknown[], limit: number): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const item of items) {
    const text = String(item || '').replace(/\s+/g, ' ').trim()
    if (!text || seen.has(text)) continue
    seen.add(text)
    result.push(text)
    if (result.length >= limit) break
  }

  return result
}

function densityLines(section: any, point: any, topic: string): string[] {
  const sectionTitle = section?.title || topic || '本章节'
  const pointTitle = point?.content || sectionTitle

  return [
    `先说明${pointTitle}解决的核心问题`,
    `补充它在${sectionTitle}中的位置和作用`,
    '给出实际操作步骤，避免只停留在概念层面',
    '说明常见错误、检查方法和判断标准',
    '结合具体场景解释什么时候应该使用',
    '最后总结它和前后内容的衔接关系'
  ]
}

function fillTextList(items: unknown[], target: number, section: any, point: any, topic: string): string[] {
  return uniqueTexts([...(Array.isArray(items) ? items : []), ...densityLines(section, point, topic)], target)
}

function denseFeatures(items: any[], target: number, section: any, point: any, topic: string) {
  const pointTitle = point?.content || section?.title || topic
  const existing = Array.isArray(items) ? items : []
  const fallback = [
    { name: '目的', desc: `明确${pointTitle}要解决的问题` },
    { name: '步骤', desc: '拆成可执行动作，便于照着操作' },
    { name: '配置', desc: '说明关键参数和推荐选择' },
    { name: '验证', desc: '给出是否成功的检查依据' },
    { name: '误区', desc: '指出容易忽略或出错的地方' },
    { name: '延伸', desc: '连接后续应用和进阶场景' }
  ]
  const merged = [...existing, ...fallback]
  const seen = new Set<string>()

  return merged.filter((feature) => {
    const name = String(feature?.name || '').trim()
    const desc = String(feature?.desc || '').trim()
    const key = `${name}:${desc}`
    if (!name || !desc || seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, target)
}

function enrichSlideContent(slide: any, section: any, pointIndex: number, topic: string): any {
  if (['title', 'section-divider'].includes(slide.layout)) return slide

  const point = section?.points?.[pointIndex]
  const layout = slide.layout || 'content'
  const enriched = { ...slide }

  if (layout === 'two-column') {
    enriched.leftBody = fillTextList(enriched.leftBody, 4, section, point, topic)
    enriched.rightBody = fillTextList(enriched.rightBody, 4, section, point, topic).slice().reverse()
    enriched.leftTitle = enriched.leftTitle || '核心理解'
    enriched.rightTitle = enriched.rightTitle || '实际应用'
    return enriched
  }

  if (layout === 'feature-grid') {
    enriched.features = denseFeatures(enriched.features, 6, section, point, topic)
    enriched.body = fillTextList(enriched.body, 2, section, point, topic)
    return enriched
  }

  if (layout === 'timeline') {
    enriched.features = denseFeatures(enriched.features, 5, section, point, topic)
    enriched.body = fillTextList(enriched.body, 2, section, point, topic)
    return enriched
  }

  if (layout === 'highlight' || layout === 'big-number') {
    enriched.body = fillTextList(enriched.body, 4, section, point, topic)
    enriched.highlight = enriched.highlight || point?.content || enriched.title
    return enriched
  }

  if (layout === 'callout') {
    enriched.body = fillTextList(enriched.body, 5, section, point, topic)
    enriched.accent = enriched.accent || '重点'
    enriched.highlight = enriched.highlight || `讲清${point?.content || enriched.title}的使用条件`
    return enriched
  }

  if (layout === 'quote') {
    enriched.body = fillTextList(enriched.body, 3, section, point, topic)
    return enriched
  }

  enriched.body = fillTextList(enriched.body, 6, section, point, topic)
  return enriched
}

function fallbackSlidesForSection(section: any, sectionIndex: number, topic: string): any[] {
  const layouts = ['two-column', 'feature-grid', 'highlight', 'timeline', 'callout', 'content']
  return section.points.map((point: any, pointIndex: number) => {
    const layout = layouts[(sectionIndex + pointIndex) % layouts.length]
    const title = point.content || `${section.title} ${pointIndex + 1}`
    const body = [
      `${title}是本节的核心讨论点`,
      `需要结合${section.title}理解其作用`,
      '先讲清它解决什么问题，再说明具体做法',
      '补充适用条件，避免只给出空泛结论',
      '给出检查方法，帮助判断是否真正掌握',
      '结合实际场景说明它的应用价值'
    ]

    if (layout === 'two-column') {
      return {
        layout,
        sectionId: section.id,
        title,
        leftTitle: '核心含义',
        leftBody: body.slice(0, 4),
        rightTitle: '应用价值',
        rightBody: ['帮助解释实际问题', '便于和其他概念比较', '可引出后续案例', '适合落到操作步骤讲解']
      }
    }

    if (layout === 'feature-grid') {
      return {
        layout,
        sectionId: section.id,
        title,
        features: [
          { name: '定义', desc: '明确概念边界' },
          { name: '机制', desc: '说明运行逻辑' },
          { name: '特点', desc: '提炼关键差异' },
          { name: '应用', desc: '连接真实场景' },
          { name: '检查', desc: '说明判断是否成功的方法' },
          { name: '误区', desc: '提示容易忽略的问题' }
        ],
        body: ['多个角度构成完整讲解框架', '适合继续展开为案例或操作演示']
      }
    }

    if (layout === 'timeline') {
      return {
        layout,
        sectionId: section.id,
        title,
        features: [
          { name: '提出问题', desc: '说明背景和动机' },
          { name: '拆解概念', desc: '给出关键组成' },
          { name: '分析机制', desc: '解释内在逻辑' },
          { name: '落到应用', desc: '连接案例和价值' },
          { name: '验证效果', desc: '说明检查结果的方法' }
        ],
        body: ['按认知顺序降低理解难度', '每一步都可以继续展开举例']
      }
    }

    if (layout === 'highlight') {
      return {
        layout,
        sectionId: section.id,
        title,
        highlight: `${title}决定了这一部分的理解主线`,
        body: body.slice(1, 5)
      }
    }

    if (layout === 'callout') {
      return {
        layout,
        sectionId: section.id,
        title,
        accent: '关键',
        highlight: '不要只记结论，要理解条件和适用范围',
        body: body.slice(0, 5)
      }
    }

    return {
      layout: 'content',
      sectionId: section.id,
      title,
      body
    }
  })
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

      const batch1Result = await window.api!.ai.chat(config, batch1Messages, { temperature: 0.7, max_tokens: 2048 })
      const batch1Data = parseAIJSON(batch1Result.content, 'Slide structure result')
      const structureSlides: any[] = (batch1Data.slides || []).map(cleanSlideStrings)

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
4. body 中每条文字控制在28-48个字，要说明目的、步骤、条件、误区或应用
5. 每张内容页至少提供5条有效信息；two-column 每侧至少4条；feature-grid 至少5项；timeline 至少5个阶段

每个知识点对应一张幻灯片。你必须为每张幻灯片选择一种 layout，且严格遵循布局多样性规则。

## 可选 layout（每种必须被使用至少一次）：

### "two-column" — 对比/分类（≥20%）
- 适用场景：任何可拆分为两面的内容（对比、分类、因果、优缺点、前后、AB两种方案）
- 字段：title + leftTitle + leftBody（4条）+ rightTitle + rightBody（4条）
- 判断技巧：如果知识点可以用"从A和B两个角度看"来描述，就用这个

### "highlight" — 核心结论/公式（≥15%）
- 适用场景：核心定理、关键公式、重要结论、总结性陈述
- 字段：title + highlight（公式用LaTeX，结论用精炼一句话）+ body（4条补充）
- 判断技巧：如果知识点有一个"核心结论"可以提炼出来，就用这个

### "big-number" — 关键数据/指标（≥10%）
- 适用场景：涉及具体数字、百分比、统计数据、性能指标、年份等量化信息
- 字段：title（数据含义）+ highlight（大数字，如"99.7%"、"1.5亿"、"200+"）+ body（4条补充说明）+ accent（数据来源或单位标注）
- 判断技巧：如果知识点包含醒目的数字或可以量化，就用这个

### "timeline" — 流程/时间线（≥10%）
- 适用场景：包含5个阶段的发展历程、工作流程、技术演进、项目进度
- 字段：title + features 数组（每项 name=阶段名/步骤名，desc=具体说明）+ body（2条总结）
- 判断技巧：如果知识点描述了"先A再B最后C"的顺序过程，就用这个

### "callout" — 重要提示/注意事项（≥5%）
- 适用场景：常见误区、重要警告、关键区别、必须记住的要点
- 字段：title + accent（标签文字，如"注意"、"误区"、"关键"）+ highlight（核心提示语）+ body（5条详细说明）
- 判断技巧：如果知识点是"容易出错的地方"或"必须注意的事项"，就用这个

### "statement" — 核心观点/金句（≥5%）
- 适用场景：可以用一句话概括的深刻观点、核心主张、设计哲学
- 字段：highlight（核心观点一句话，要精炼有力）+ title（出处或上下文）+ accent（可选补充）
- 判断技巧：如果知识点可以浓缩为一句震撼的话，就用这个

### "quote" — 名言/观点/人物（≥5%）
- 适用场景：涉及学者观点、经典论述、历史名言、重要定义的原文
- 字段：title（出处/作者）+ highlight（引文/定义原文）+ body（3条解读）

### "feature-grid" — 并列要点/特征列表（≥10%）
- 适用场景：5-6个并列的方法、特性、步骤、要素
- 字段：title + features 数组（每项有 name 和 desc）+ body（2条总结）

### "content" — 常规讲解（最多占总数 ≤15%）
- 适用场景：只有无法适配其他 layout 时才使用
- 字段：title + body（5-6条展开细节，每条控制在28-48字）

## 强制规则：
1. 每个章节的幻灯片中，"content" layout 最多只出现 1 次
2. 连续两张幻灯片不能使用相同 layout
3. 优先将知识点重新组织为 two-column、big-number、highlight 或 timeline 格式，不要默认使用 content
4. 如果知识点没有明显的对比或公式，尝试将其组织为 feature-grid 或 timeline
5. 不要使用 image layout，不要提供 imageQuery 或 imageUrl
6. 不要只写名词短语，每条都要包含可讲解的信息

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
- 不要使用 image 布局，不要填写 imageQuery 或 imageUrl
- 相邻幻灯片布局不能相同

知识点列表：
${pointList}`
        }
      ]

      let contentSlides: any[] = []
      try {
        const batch2Result = await window.api!.ai.chat(config, batch2Messages, { temperature: 0.7, max_tokens: 8192 })
        const batch2Data = parseAIJSON(batch2Result.content, 'Slide content result')
        contentSlides = (batch2Data.slides || []).map(cleanSlideStrings)
      } catch (err) {
        console.warn('[Batch2] Full-deck generation failed, retrying section by section:', err)
        const layoutCycle = ['two-column', 'highlight', 'feature-grid', 'timeline', 'callout', 'content']

        for (let si = 0; si < sections.length; si++) {
          const section = sections[si]
          const sectionPointList = section.points.map((p, pi) => `${pi + 1}. ${p.content}`).join('\n')
          const preferredLayout = layoutCycle[si % layoutCycle.length]
          const sectionMessages = [
            {
              role: 'system' as const,
              content: `You are a professional Chinese presentation designer. Return valid JSON only.
Generate exactly one slide for each point in the current section.
Use Chinese. Do not use markdown, code fences, tables, or HTML.
Each slide must be dense: body 5-6 items; two-column 4 items per side; feature-grid 5-6 items; timeline 5 stages.
Every item should explain a purpose, step, condition, mistake, verification method, or application case.
Use varied layouts from: two-column, highlight, feature-grid, timeline, callout, big-number, content.
Do not use image layout. Do not include imageUrl or imageQuery.
Prefer ${preferredLayout} when it fits. Avoid consecutive same layouts.
Return shape:
{"slides":[
{"layout":"two-column","sectionId":"${section.id}","title":"标题","leftTitle":"理解重点","leftBody":["目的","步骤","条件","验证"],"rightTitle":"使用建议","rightBody":["做法","误区","检查","延伸"]},
{"layout":"highlight","sectionId":"${section.id}","title":"标题","highlight":"核心结论","body":["补充1","补充2","补充3","补充4"]},
{"layout":"feature-grid","sectionId":"${section.id}","title":"标题","features":[{"name":"要素1","desc":"具体说明"},{"name":"要素2","desc":"具体说明"},{"name":"要素3","desc":"具体说明"},{"name":"要素4","desc":"具体说明"},{"name":"要素5","desc":"具体说明"}],"body":["总结","应用"]},
{"layout":"timeline","sectionId":"${section.id}","title":"标题","features":[{"name":"步骤1","desc":"具体说明"},{"name":"步骤2","desc":"具体说明"},{"name":"步骤3","desc":"具体说明"},{"name":"步骤4","desc":"具体说明"},{"name":"步骤5","desc":"具体说明"}],"body":["总结","检查"]},
{"layout":"callout","sectionId":"${section.id}","title":"标题","accent":"关键","highlight":"核心提示","body":["说明1","说明2","说明3","说明4","说明5"]}
]}`
            },
            {
              role: 'user' as const,
              content: `Topic: ${topic}
Section: ${section.title}
SectionId: ${section.id}
Points:
${sectionPointList}`
            }
          ]

          try {
            const sectionResult = await window.api!.ai.chat(config, sectionMessages, { temperature: 0.65, max_tokens: 4096 })
            const sectionData = parseAIJSON(sectionResult.content, `Slide content result for ${section.title}`)
            const slidesForSection = Array.isArray(sectionData.slides) ? sectionData.slides : []
            if (slidesForSection.length === 0) throw new Error('AI returned no slides')
            contentSlides.push(...slidesForSection.map((slide: any) => cleanSlideStrings({ ...slide, sectionId: section.id })))
          } catch (sectionErr) {
            console.warn(`[Batch2] Section generation failed, using local fallback for ${section.title}:`, sectionErr)
            contentSlides.push(...fallbackSlidesForSection(section, si, topic).map(cleanSlideStrings))
          }
        }
      }


      // === Merge: assign content slides to sections by counting points ===
      let allRawSlides: any[] = []

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
          const cs = enrichSlideContent(contentSlides[contentIdx], section, j, topic)
          allRawSlides.push({ ...cs, order: orderCounter, sectionId: section.id })
          contentIdx++
          orderCounter++
        }
      }

      allRawSlides = removeGeneratedImages(allRawSlides)

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
            accent: s.accent,
            imageUrl: s.imageUrl,
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
          mood: (selectedMood || 'confident') as ProjectMetadata['mood'],
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
