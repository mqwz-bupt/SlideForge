import PptxGenJS from 'pptxgenjs'
import { getStyleConfig, extractSolidColor } from './styles'

interface SlideData {
  id: string
  order: number
  sectionId: string
  layout: string
  content: {
    title: string
    subtitle?: string
    body?: string[]
    accent?: string
    imageUrl?: string
    highlight?: string
    leftTitle?: string
    leftBody?: string[]
    rightTitle?: string
    rightBody?: string[]
    features?: Array<{ name: string; desc: string }>
  }
}

interface ProjectData {
  id: string
  name: string
  style: string
  slides: SlideData[]
}

// Shared context passed to all slide generators
interface SlideContext {
  pptx: PptxGenJS
  df: string
  bf: string
  C: Record<string, string>
  SLIDE_W: number
  SLIDE_H: number
  MARGIN: number
  CONTENT_W: number
}

function hex(c: string): string {
  return extractSolidColor(c).replace('#', '')
}

function lighten(hexColor: string, amount: number): string {
  const h = hexColor.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${Math.round(r + (255 - r) * amount).toString(16).padStart(2, '0')}${Math.round(g + (255 - g) * amount).toString(16).padStart(2, '0')}${Math.round(b + (255 - b) * amount).toString(16).padStart(2, '0')}`
}

function darken(hexColor: string, amount: number): string {
  const h = hexColor.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${Math.round(r * (1 - amount)).toString(16).padStart(2, '0')}${Math.round(g * (1 - amount)).toString(16).padStart(2, '0')}${Math.round(b * (1 - amount)).toString(16).padStart(2, '0')}`
}

function safeFont(googleFont: string): string {
  const raw = googleFont.replace(/'/g, '').split(',')[0].trim().toLowerCase()
  const map: Record<string, string> = {
    'archivo black': 'Arial Black', 'archivo': 'Arial',
    'space grotesk': 'Segoe UI', 'space mono': 'Consolas',
    'manrope': 'Segoe UI', 'syne': 'Trebuchet MS',
    'cormorant': 'Georgia', 'cormorant garamond': 'Georgia',
    'ibm plex sans': 'Segoe UI', 'bodoni moda': 'Georgia',
    'dm sans': 'Segoe UI', 'plus jakarta sans': 'Segoe UI',
    'outfit': 'Segoe UI', 'fraunces': 'Georgia',
    'work sans': 'Segoe UI', 'jetbrains mono': 'Consolas',
    'nunito': 'Segoe UI', 'source serif 4': 'Georgia',
  }
  return map[raw] || 'Segoe UI'
}

function bulletTexts(items: string[], opts: { fontSize: number; fontFace: string; color: string; bulletSize?: number }) {
  return items.map(b => ({
    text: b,
    options: {
      fontSize: opts.fontSize, fontFace: opts.fontFace, color: opts.color,
      bullet: { type: 'bullet' as const, style: '●', indent: opts.bulletSize || 16 },
      breakLine: true, paraSpaceAfter: 10
    }
  }))
}

async function imageUrlToDataUri(url: string): Promise<string | null> {
  if (url.startsWith('data:image/')) return url
  if (!/^https?:\/\//i.test(url)) return null

  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) return null
    const buffer = Buffer.from(await response.arrayBuffer())
    return `data:${contentType};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

// ── Layout generators ──

function addTitleSlide(ctx: SlideContext, slide: SlideData) {
  const { pptx, df, bf, C, SLIDE_H } = ctx
  const s = pptx.addSlide()
  s.background = { color: C.titleBg }
  s.addShape(pptx.ShapeType.rect, { x: 6.5, y: 0, w: 3.5, h: SLIDE_H, fill: { color: C.accentDark } })
  s.addShape(pptx.ShapeType.rect, { x: 6.0, y: 0, w: 0.7, h: SLIDE_H, fill: { color: C.accentBg } })
  if (slide.content.accent) {
    s.addText(slide.content.accent, { x: 0.8, y: 1.2, w: 2.8, h: 0.35, fontSize: 10, fontFace: bf, color: C.accentColor, align: 'center', bold: true, shape: pptx.ShapeType.roundRect, fill: { color: C.accentBg }, rectRadius: 0.1 })
  }
  s.addText(slide.content.title, { x: 0.8, y: 1.8, w: 4.5, h: 2.2, fontSize: 30, fontFace: df, color: C.titleColor, bold: true, valign: 'middle', lineSpacingMultiple: 1.1 })
  if (slide.content.subtitle) {
    s.addText(slide.content.subtitle, { x: 0.8, y: 4.2, w: 4.5, h: 0.5, fontSize: 14, fontFace: bf, color: C.subtitleColor })
  }
}

function addDividerSlide(ctx: SlideContext, slide: SlideData, sectionIdx: number) {
  const { pptx, df, bf, C, SLIDE_H } = ctx
  const s = pptx.addSlide()
  s.background = { color: C.contentBg }
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.45, h: SLIDE_H, fill: { color: C.accentBg } })
  const num = String(sectionIdx).padStart(2, '0')
  s.addText(num, { x: 6.0, y: 0.3, w: 3.5, h: 2.5, fontSize: 80, fontFace: df, color: C.accentLighter, align: 'right', bold: true })
  s.addShape(pptx.ShapeType.rect, { x: 1.0, y: 2.4, w: 1.8, h: 0.05, fill: { color: C.accentBg } })
  s.addText(slide.content.title, { x: 1.0, y: 2.7, w: 8.0, h: 1.0, fontSize: 28, fontFace: df, color: C.contentTitle, bold: true })
  if (slide.content.subtitle) {
    s.addText(slide.content.subtitle, { x: 1.0, y: 3.8, w: 8.0, h: 0.5, fontSize: 13, fontFace: bf, color: C.contentBullet })
  }
}

function addContentSlide(ctx: SlideContext, slide: SlideData) {
  const { pptx, df, bf, C, SLIDE_H, MARGIN, CONTENT_W } = ctx
  const s = pptx.addSlide()
  s.background = { color: C.contentBg }
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: SLIDE_H, fill: { color: C.accentBg } })
  s.addText(slide.content.title, { x: MARGIN, y: 0.35, w: CONTENT_W, h: 0.6, fontSize: 22, fontFace: df, color: C.contentTitle, bold: true })
  s.addShape(pptx.ShapeType.rect, { x: MARGIN, y: 1.0, w: 1.5, h: 0.04, fill: { color: C.headerBorder } })
  if (slide.content.body && slide.content.body.length > 0) {
    const bodyH = Math.max(1.8, Math.min(slide.content.body.length * 0.65, 4.0))
    const bodyY = 1.0 + (SLIDE_H - 1.0 - bodyH) / 2
    s.addText(bulletTexts(slide.content.body, { fontSize: 20, fontFace: bf, color: C.contentBullet, bulletSize: 20 }), { x: MARGIN + 0.2, y: bodyY, w: CONTENT_W - 0.4, h: bodyH, valign: 'middle' })
  }
  s.addShape(pptx.ShapeType.rect, { x: MARGIN, y: SLIDE_H - 0.15, w: CONTENT_W, h: 0.03, fill: { color: C.accentLighter } })
}

function addTwoColumnSlide(ctx: SlideContext, slide: SlideData) {
  const { pptx, df, bf, C, SLIDE_H, MARGIN, CONTENT_W } = ctx
  const s = pptx.addSlide()
  s.background = { color: C.contentBg }
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: SLIDE_H, fill: { color: C.accentBg } })
  s.addText(slide.content.title, { x: MARGIN, y: 0.3, w: CONTENT_W, h: 0.5, fontSize: 20, fontFace: df, color: C.contentTitle, bold: true })
  s.addShape(pptx.ShapeType.rect, { x: MARGIN, y: 0.85, w: 1.2, h: 0.04, fill: { color: C.headerBorder } })

  const cardY = 1.1, cardH = SLIDE_H - cardY - 0.2, cardW = (CONTENT_W - 0.3) / 2, gap = 0.3

  // Left card
  s.addShape(pptx.ShapeType.roundRect, { x: MARGIN, y: cardY, w: cardW, h: cardH, fill: { color: C.accentLighter }, rectRadius: 0.1 })
  s.addShape(pptx.ShapeType.rect, { x: MARGIN, y: cardY, w: cardW, h: 0.05, fill: { color: C.accentBg } })
  const liX = MARGIN + 0.25, liW = cardW - 0.5
  if (slide.content.leftTitle) s.addText(slide.content.leftTitle, { x: liX, y: cardY + 0.2, w: liW, h: 0.35, fontSize: 15, fontFace: df, color: C.contentTitle, bold: true })
  if (slide.content.leftBody && slide.content.leftBody.length > 0) {
    const lbH = Math.max(1.2, Math.min(slide.content.leftBody.length * 0.58, cardH - 0.8))
    s.addText(bulletTexts(slide.content.leftBody, { fontSize: 15, fontFace: bf, color: C.contentBullet, bulletSize: 16 }), { x: liX, y: cardY + 0.65 + (cardH - 0.65 - lbH) / 2, w: liW, h: lbH, valign: 'middle' })
  }

  // Right card
  const rightX = MARGIN + cardW + gap
  s.addShape(pptx.ShapeType.roundRect, { x: rightX, y: cardY, w: cardW, h: cardH, fill: { color: C.accentLighter }, rectRadius: 0.1 })
  s.addShape(pptx.ShapeType.rect, { x: rightX, y: cardY, w: cardW, h: 0.05, fill: { color: C.accentBg } })
  const riX = rightX + 0.25
  if (slide.content.rightTitle) s.addText(slide.content.rightTitle, { x: riX, y: cardY + 0.2, w: liW, h: 0.35, fontSize: 15, fontFace: df, color: C.contentTitle, bold: true })
  if (slide.content.rightBody && slide.content.rightBody.length > 0) {
    const rbH = Math.max(1.2, Math.min(slide.content.rightBody.length * 0.58, cardH - 0.8))
    s.addText(bulletTexts(slide.content.rightBody, { fontSize: 15, fontFace: bf, color: C.contentBullet, bulletSize: 16 }), { x: riX, y: cardY + 0.65 + (cardH - 0.65 - rbH) / 2, w: liW, h: rbH, valign: 'middle' })
  }
}

function addHighlightSlide(ctx: SlideContext, slide: SlideData) {
  const { pptx, df, bf, C, SLIDE_W } = ctx
  const s = pptx.addSlide()
  s.background = { color: C.contentBg }
  s.addText(slide.content.title, { x: 0.8, y: 0.4, w: 8.4, h: 0.5, fontSize: 20, fontFace: df, color: C.contentTitle, align: 'center', bold: true })
  if (slide.content.highlight) {
    s.addShape(pptx.ShapeType.roundRect, { x: 1.5, y: 1.5, w: 7.0, h: 1.8, fill: { color: C.accentLighter }, rectRadius: 0.15, line: { color: C.accentBg, width: 1.5 } })
    s.addText(slide.content.highlight, { x: 1.8, y: 1.7, w: 6.4, h: 1.4, fontSize: 22, fontFace: df, color: C.accentColor, align: 'center', bold: true, valign: 'middle', shape: pptx.ShapeType.roundRect, fill: { color: C.accentBg }, rectRadius: 0.12 })
  }
  if (slide.content.body && slide.content.body.length > 0) {
    const pillW = Math.min(7.0 / slide.content.body.length, 2.8)
    const startX = (SLIDE_W - slide.content.body.length * pillW) / 2
    slide.content.body.forEach((b, i) => {
      s.addText(b, { x: startX + i * pillW + 0.06, y: 3.8, w: pillW - 0.12, h: 0.45, fontSize: 13, fontFace: bf, color: C.contentBullet, align: 'center', valign: 'middle', shape: pptx.ShapeType.roundRect, fill: { color: C.accentLighter }, rectRadius: 0.2, line: { color: C.accentLight, width: 0.5 } })
    })
  }
}

async function addImageSlide(ctx: SlideContext, slide: SlideData) {
  const { pptx, df, bf, C, SLIDE_H, MARGIN, CONTENT_W } = ctx
  const s = pptx.addSlide()
  s.background = { color: C.contentBg }
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: SLIDE_H, fill: { color: C.accentBg } })
  s.addText(slide.content.title, { x: MARGIN, y: 0.35, w: CONTENT_W, h: 0.5, fontSize: 20, fontFace: df, color: C.contentTitle, bold: true })
  s.addShape(pptx.ShapeType.rect, { x: MARGIN, y: 0.9, w: 1.2, h: 0.04, fill: { color: C.headerBorder } })
  if (slide.content.body && slide.content.body.length > 0) {
    const bodyH = Math.max(1.2, Math.min(slide.content.body.length * 0.58, 3.7))
    s.addText(bulletTexts(slide.content.body, { fontSize: 15, fontFace: bf, color: C.contentBullet, bulletSize: 16 }), { x: MARGIN + 0.1, y: 1.2 + (SLIDE_H - 1.2 - bodyH) / 2, w: 4.0, h: bodyH, valign: 'middle' })
  }
  if (slide.content.imageUrl) {
    const data = await imageUrlToDataUri(slide.content.imageUrl)
    if (data) {
      s.addImage({ data, x: 5.2, y: 1.2, w: 4.2, h: 3.5, sizing: { type: 'contain', w: 4.2, h: 3.5 }, rounding: true })
    }
  }
}

function addFeatureGridSlide(ctx: SlideContext, slide: SlideData) {
  const { pptx, df, bf, C, SLIDE_H, MARGIN, CONTENT_W } = ctx
  const s = pptx.addSlide()
  s.background = { color: C.contentBg }
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: SLIDE_H, fill: { color: C.accentBg } })
  s.addText(slide.content.title, { x: MARGIN, y: 0.3, w: CONTENT_W, h: 0.5, fontSize: 20, fontFace: df, color: C.contentTitle, align: 'center', bold: true })
  s.addShape(pptx.ShapeType.rect, { x: 4.0, y: 0.85, w: 2.0, h: 0.04, fill: { color: C.headerBorder } })

  const features = slide.content.features || []
  const cols = Math.min(features.length, 3)
  const rows = Math.ceil(features.length / cols)
  const rowH = Math.min((SLIDE_H - 1.1 - 0.2 - (rows - 1) * 0.15) / rows, 2.2)
  const colW = CONTENT_W / cols

  features.forEach((f, i) => {
    const col = i % cols, row = Math.floor(i / cols)
    const x = MARGIN + col * colW + 0.06, y = 1.1 + row * (rowH + 0.15)
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: colW - 0.12, h: rowH, fill: { color: C.accentLighter }, rectRadius: 0.08 })
    s.addText(String(i + 1), { x: x + (colW - 0.12) / 2 - 0.2, y: y + 0.12, w: 0.4, h: 0.4, fontSize: 13, fontFace: df, color: C.accentColor, align: 'center', valign: 'middle', bold: true, shape: pptx.ShapeType.ellipse, fill: { color: C.accentBg } })
    s.addText(f.name, { x: x + 0.1, y: y + 0.6, w: colW - 0.32, h: 0.35, fontSize: 13, fontFace: df, color: C.contentTitle, align: 'center', bold: true })
    s.addText(f.desc, { x: x + 0.1, y: y + 1.0, w: colW - 0.32, h: rowH - 1.1, fontSize: 12, fontFace: bf, color: C.contentBullet, align: 'center', valign: 'middle', lineSpacingMultiple: 1.15 })
  })
}

function addQuoteSlide(ctx: SlideContext, slide: SlideData) {
  const { pptx, df, bf, C, SLIDE_H } = ctx
  const s = pptx.addSlide()
  s.background = { color: C.titleBg }
  s.addShape(pptx.ShapeType.rect, { x: 1.0, y: 1.0, w: 0.06, h: 3.5, fill: { color: C.accentBg } })
  if (slide.content.highlight) {
    s.addText(`"${slide.content.highlight}"`, { x: 1.4, y: 1.3, w: 7.6, h: 2.2, fontSize: 22, fontFace: df, color: C.titleColor, italic: true, valign: 'middle', lineSpacingMultiple: 1.2 })
  }
  if (slide.content.title) {
    s.addText(`\u2014 ${slide.content.title}`, { x: 1.4, y: 3.7, w: 7.6, h: 0.4, fontSize: 14, fontFace: bf, color: C.subtitleColor })
  }
  if (slide.content.body && slide.content.body.length > 0) {
    s.addText(bulletTexts(slide.content.body, { fontSize: 14, fontFace: bf, color: C.subtitleColor, bulletSize: 14 }), { x: 1.4, y: 4.25, w: 7.6, h: 1.0, valign: 'middle' })
  }
}

function addBigNumberSlide(ctx: SlideContext, slide: SlideData) {
  const { pptx, df, bf, C, SLIDE_W, SLIDE_H } = ctx
  const s = pptx.addSlide()
  s.background = { color: C.contentBg }
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: SLIDE_H, fill: { color: C.accentBg } })
  if (slide.content.highlight) {
    s.addText(slide.content.highlight, { x: 1.0, y: 0.8, w: 8.0, h: 2.5, fontSize: 72, fontFace: df, color: C.accentBg, align: 'center', bold: true, valign: 'middle' })
  }
  s.addText(slide.content.title, { x: 1.5, y: 3.3, w: 7.0, h: 0.6, fontSize: 18, fontFace: bf, color: C.contentTitle, align: 'center', bold: true })
  if (slide.content.body && slide.content.body.length > 0) {
    const pillW = Math.min(6.0 / slide.content.body.length, 2.5)
    const startX = (SLIDE_W - slide.content.body.length * pillW) / 2
    slide.content.body.forEach((b, i) => {
      s.addText(b, { x: startX + i * pillW + 0.06, y: 4.2, w: pillW - 0.12, h: 0.48, fontSize: 14, fontFace: bf, color: C.contentBullet, align: 'center', valign: 'middle', shape: pptx.ShapeType.roundRect, fill: { color: C.accentLighter }, rectRadius: 0.18, line: { color: C.accentLight, width: 0.5 } })
    })
  }
  s.addShape(pptx.ShapeType.rect, { x: 3.0, y: SLIDE_H - 0.5, w: 4.0, h: 0.04, fill: { color: C.accentBg } })
}

function addTimelineSlide(ctx: SlideContext, slide: SlideData) {
  const { pptx, df, bf, C, MARGIN, CONTENT_W } = ctx
  const s = pptx.addSlide()
  s.background = { color: C.contentBg }
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: ctx.SLIDE_H, fill: { color: C.accentBg } })
  s.addText(slide.content.title, { x: MARGIN, y: 0.3, w: CONTENT_W, h: 0.5, fontSize: 20, fontFace: df, color: C.contentTitle, bold: true })
  s.addShape(pptx.ShapeType.rect, { x: MARGIN, y: 0.85, w: 1.2, h: 0.04, fill: { color: C.headerBorder } })

  const features = slide.content.features || []
  const nodeCount = Math.min(features.length, 5), nodeW = CONTENT_W / nodeCount
  s.addShape(pptx.ShapeType.rect, { x: MARGIN + nodeW * 0.5, y: 2.5, w: (nodeCount - 1) * nodeW, h: 0.04, fill: { color: C.accentLight } })
  features.slice(0, 5).forEach((f, i) => {
    const nx = MARGIN + i * nodeW
    s.addText(String(i + 1), { x: nx + nodeW / 2 - 0.22, y: 2.2, w: 0.44, h: 0.44, fontSize: 13, fontFace: df, color: C.accentColor, align: 'center', valign: 'middle', bold: true, shape: pptx.ShapeType.ellipse, fill: { color: C.accentBg } })
    s.addText(f.name, { x: nx + 0.1, y: 2.85, w: nodeW - 0.2, h: 0.4, fontSize: 13, fontFace: df, color: C.contentTitle, align: 'center', bold: true })
    s.addText(f.desc, { x: nx + 0.1, y: 3.3, w: nodeW - 0.2, h: 1.8, fontSize: 12, fontFace: bf, color: C.contentBullet, align: 'center', valign: 'top', lineSpacingMultiple: 1.15 })
  })
}

function addCalloutSlide(ctx: SlideContext, slide: SlideData) {
  const { pptx, df, bf, C, SLIDE_H, MARGIN, CONTENT_W } = ctx
  const s = pptx.addSlide()
  s.background = { color: C.contentBg }
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: SLIDE_H, fill: { color: C.accentBg } })
  s.addText(slide.content.title, { x: MARGIN, y: 0.35, w: CONTENT_W, h: 0.55, fontSize: 20, fontFace: df, color: C.contentTitle, bold: true })
  s.addShape(pptx.ShapeType.rect, { x: MARGIN, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.headerBorder } })
  if (slide.content.body && slide.content.body.length > 0) {
    const bodyH = Math.max(1.8, Math.min(slide.content.body.length * 0.68, 3.7))
    s.addText(bulletTexts(slide.content.body, { fontSize: 17, fontFace: bf, color: C.contentBullet, bulletSize: 18 }), { x: MARGIN + 0.1, y: 1.2 + (SLIDE_H - 1.2 - bodyH) / 2, w: 5.3, h: bodyH, valign: 'middle' })
  }
  s.addShape(pptx.ShapeType.roundRect, { x: 6.5, y: 1.2, w: 2.8, h: 3.8, fill: { color: C.accentBg }, rectRadius: 0.12 })
  if (slide.content.accent) s.addText(slide.content.accent, { x: 6.7, y: 1.6, w: 2.4, h: 0.3, fontSize: 11, fontFace: bf, color: C.accentColor, align: 'center', bold: true })
  if (slide.content.highlight) s.addText(slide.content.highlight, { x: 6.7, y: 2.05, w: 2.4, h: 2.6, fontSize: 18, fontFace: df, color: C.accentColor, align: 'center', valign: 'middle', bold: true })
}

function addStatementSlide(ctx: SlideContext, slide: SlideData) {
  const { pptx, df, bf, C } = ctx
  const s = pptx.addSlide()
  s.background = { color: C.titleBg }
  s.addShape(pptx.ShapeType.ellipse, { x: 7.5, y: -0.5, w: 3.0, h: 3.0, fill: { color: C.accentBg } })
  s.addText(slide.content.highlight || slide.content.title, { x: 1.0, y: 1.2, w: 8.0, h: 3.0, fontSize: 30, fontFace: df, color: C.titleColor, align: 'center', valign: 'middle', bold: true, lineSpacingMultiple: 1.2 })
  s.addShape(pptx.ShapeType.rect, { x: 4.0, y: 4.4, w: 2.0, h: 0.05, fill: { color: C.accentBg } })
  if (slide.content.title && slide.content.highlight) {
    s.addText(`\u2014 ${slide.content.title}`, { x: 1.5, y: 4.6, w: 7.0, h: 0.4, fontSize: 13, fontFace: bf, color: C.subtitleColor, align: 'center' })
  }
}

// ── Main export ──

export async function generatePPTX(project: ProjectData): Promise<Buffer> {
  const style = getStyleConfig(project.style)
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_16x9'
  pptx.author = 'SlideForge'
  pptx.title = project.name

  const SLIDE_W = 10, SLIDE_H = 5.63, MARGIN = 0.6, CONTENT_W = SLIDE_W - MARGIN * 2
  const ctx: SlideContext = {
    pptx, df: safeFont(style.displayFont), bf: safeFont(style.bodyFont),
    C: {
      titleBg: hex(style.titleBg), titleColor: hex(style.titleColor),
      accentBg: hex(style.titleAccentBg), accentColor: hex(style.titleAccentColor),
      contentBg: hex(style.contentBg), contentTitle: hex(style.contentTitleColor),
      contentBullet: hex(style.contentBulletColor), contentDot: hex(style.contentBulletDot),
      headerBorder: hex(style.contentHeaderBorder), subtitleColor: hex(style.titleSubtitleColor),
      accentLight: lighten(hex(style.titleAccentBg), 0.85),
      accentLighter: lighten(hex(style.titleAccentBg), 0.93),
      accentDark: darken(hex(style.titleAccentBg), 0.2),
    },
    SLIDE_W, SLIDE_H, MARGIN, CONTENT_W,
  }

  const sorted = project.slides.slice().sort((a, b) => a.order - b.order)
  let sectionIdx = 0

  for (const slide of sorted) {
    switch (slide.layout) {
      case 'title': addTitleSlide(ctx, slide); break
      case 'section-divider': addDividerSlide(ctx, slide, ++sectionIdx); break
      case 'content': addContentSlide(ctx, slide); break
      case 'two-column': addTwoColumnSlide(ctx, slide); break
      case 'highlight': addHighlightSlide(ctx, slide); break
      case 'image': await addImageSlide(ctx, slide); break
      case 'feature-grid': addFeatureGridSlide(ctx, slide); break
      case 'quote': addQuoteSlide(ctx, slide); break
      case 'big-number': addBigNumberSlide(ctx, slide); break
      case 'timeline': addTimelineSlide(ctx, slide); break
      case 'callout': addCalloutSlide(ctx, slide); break
      case 'statement': addStatementSlide(ctx, slide); break
      default: addContentSlide(ctx, slide); break
    }
  }

  const output = await pptx.write({ outputType: 'nodebuffer' })
  return output as Buffer
}
