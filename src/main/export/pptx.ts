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

/** Map Google Fonts to safe system fonts for PPTX */
function safeFont(googleFont: string): string {
  const raw = googleFont.replace(/'/g, '').split(',')[0].trim().toLowerCase()
  const map: Record<string, string> = {
    'archivo black': 'Arial Black',
    'archivo': 'Arial',
    'space grotesk': 'Segoe UI',
    'space mono': 'Consolas',
    'manrope': 'Segoe UI',
    'syne': 'Trebuchet MS',
    'cormorant': 'Georgia',
    'cormorant garamond': 'Georgia',
    'ibm plex sans': 'Segoe UI',
    'bodoni moda': 'Georgia',
    'dm sans': 'Segoe UI',
    'plus jakarta sans': 'Segoe UI',
    'outfit': 'Segoe UI',
    'fraunces': 'Georgia',
    'work sans': 'Segoe UI',
    'jetbrains mono': 'Consolas',
    'nunito': 'Segoe UI',
    'source serif 4': 'Georgia',
  }
  return map[raw] || 'Segoe UI'
}

export async function generatePPTX(project: ProjectData): Promise<Buffer> {
  const style = getStyleConfig(project.style)
  const pptx = new PptxGenJS()

  pptx.layout = 'LAYOUT_16x9'
  pptx.author = 'SlideForge'
  pptx.title = project.name

  // Use system-safe fonts
  const df = safeFont(style.displayFont)
  const bf = safeFont(style.bodyFont)

  const C = {
    titleBg: hex(style.titleBg),
    titleColor: hex(style.titleColor),
    accentBg: hex(style.titleAccentBg),
    accentColor: hex(style.titleAccentColor),
    contentBg: hex(style.contentBg),
    contentTitle: hex(style.contentTitleColor),
    contentBullet: hex(style.contentBulletColor),
    contentDot: hex(style.contentBulletDot),
    headerBorder: hex(style.contentHeaderBorder),
    subtitleColor: hex(style.titleSubtitleColor),
    accentLight: lighten(hex(style.titleAccentBg), 0.85),
    accentLighter: lighten(hex(style.titleAccentBg), 0.93),
    accentDark: darken(hex(style.titleAccentBg), 0.2),
  }

  // Slide dimensions: 10" x 5.63"
  const SLIDE_W = 10
  const SLIDE_H = 5.63
  const MARGIN = 0.6
  const CONTENT_W = SLIDE_W - MARGIN * 2

  const sorted = project.slides.slice().sort((a, b) => a.order - b.order)
  let sectionIdx = 0

  for (const slide of sorted) {
    switch (slide.layout) {

      // ──────────── TITLE SLIDE ────────────
      case 'title': {
        const s = pptx.addSlide()
        s.background = { color: C.titleBg }

        // Accent block on right third
        s.addShape(pptx.ShapeType.rect, {
          x: 6.5, y: 0, w: 3.5, h: SLIDE_H,
          fill: { color: C.accentDark }
        })
        s.addShape(pptx.ShapeType.rect, {
          x: 6.0, y: 0, w: 0.7, h: SLIDE_H,
          fill: { color: C.accentBg }
        })

        if (slide.content.accent) {
          s.addText(slide.content.accent, {
            x: 0.8, y: 1.2, w: 2.8, h: 0.35,
            fontSize: 10, fontFace: bf, color: C.accentColor,
            align: 'center', bold: true,
            shape: pptx.ShapeType.roundRect,
            fill: { color: C.accentBg },
            rectRadius: 0.1
          })
        }

        // Title — vertically centered in left portion
        s.addText(slide.content.title, {
          x: 0.8, y: 1.8, w: 4.5, h: 2.2,
          fontSize: 30, fontFace: df, color: C.titleColor,
          bold: true, valign: 'middle', lineSpacingMultiple: 1.1
        })

        if (slide.content.subtitle) {
          s.addText(slide.content.subtitle, {
            x: 0.8, y: 4.2, w: 4.5, h: 0.5,
            fontSize: 14, fontFace: bf, color: C.subtitleColor
          })
        }
        break
      }

      // ──────────── SECTION DIVIDER ────────────
      case 'section-divider': {
        const s = pptx.addSlide()
        s.background = { color: C.contentBg }

        // Wide left accent band
        s.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.45, h: SLIDE_H,
          fill: { color: C.accentBg }
        })

        // Section number — light watermark
        const num = String(++sectionIdx).padStart(2, '0')
        s.addText(num, {
          x: 6.0, y: 0.3, w: 3.5, h: 2.5,
          fontSize: 80, fontFace: df, color: C.accentLighter,
          align: 'right', bold: true
        })

        // Accent line
        s.addShape(pptx.ShapeType.rect, {
          x: 1.0, y: 2.4, w: 1.8, h: 0.05,
          fill: { color: C.accentBg }
        })

        // Title — centered vertically
        s.addText(slide.content.title, {
          x: 1.0, y: 2.7, w: 8.0, h: 1.0,
          fontSize: 28, fontFace: df, color: C.contentTitle,
          bold: true
        })

        if (slide.content.subtitle) {
          s.addText(slide.content.subtitle, {
            x: 1.0, y: 3.8, w: 8.0, h: 0.5,
            fontSize: 13, fontFace: bf, color: C.contentBullet
          })
        }
        break
      }

      // ──────────── CONTENT SLIDE ────────────
      case 'content': {
        const s = pptx.addSlide()
        s.background = { color: C.contentBg }

        // Left accent bar
        s.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.06, h: SLIDE_H,
          fill: { color: C.accentBg }
        })

        // Title
        s.addText(slide.content.title, {
          x: MARGIN, y: 0.35, w: CONTENT_W, h: 0.6,
          fontSize: 22, fontFace: df, color: C.contentTitle, bold: true
        })

        // Underline
        s.addShape(pptx.ShapeType.rect, {
          x: MARGIN, y: 1.0, w: 1.5, h: 0.04,
          fill: { color: C.headerBorder }
        })

        // Body — use valign middle to center content vertically
        if (slide.content.body && slide.content.body.length > 0) {
          const bodyCount = slide.content.body.length
          // Calculate reasonable box height: ~0.4" per line, min 1.5"
          const bodyH = Math.max(1.5, Math.min(bodyCount * 0.55, 3.5))
          const bodyY = 1.0 + (SLIDE_H - 1.0 - bodyH) / 2  // vertically center in remaining space

          s.addText(
            slide.content.body.map(b => ({
              text: b,
              options: {
                fontSize: 17, fontFace: bf, color: C.contentBullet,
                bullet: { type: 'bullet' as const, style: '●', indent: 18 },
                breakLine: true, paraSpaceAfter: 14
              }
            })),
            { x: MARGIN + 0.2, y: bodyY, w: CONTENT_W - 0.4, h: bodyH, valign: 'middle' }
          )
        }

        // Bottom accent line
        s.addShape(pptx.ShapeType.rect, {
          x: MARGIN, y: SLIDE_H - 0.15, w: CONTENT_W, h: 0.03,
          fill: { color: C.accentLighter }
        })
        break
      }

      // ──────────── TWO-COLUMN ────────────
      case 'two-column': {
        const s = pptx.addSlide()
        s.background = { color: C.contentBg }

        // Left accent bar
        s.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.06, h: SLIDE_H,
          fill: { color: C.accentBg }
        })

        // Title
        s.addText(slide.content.title, {
          x: MARGIN, y: 0.3, w: CONTENT_W, h: 0.5,
          fontSize: 20, fontFace: df, color: C.contentTitle, bold: true
        })

        // Accent underline
        s.addShape(pptx.ShapeType.rect, {
          x: MARGIN, y: 0.85, w: 1.2, h: 0.04,
          fill: { color: C.headerBorder }
        })

        // Card dimensions
        const cardY = 1.1
        const cardH = SLIDE_H - cardY - 0.2  // ~4.33
        const cardW = (CONTENT_W - 0.3) / 2  // ~4.25 each
        const gap = 0.3

        // ── Left card ──
        s.addShape(pptx.ShapeType.roundRect, {
          x: MARGIN, y: cardY, w: cardW, h: cardH,
          fill: { color: C.accentLighter },
          rectRadius: 0.1
        })
        // Top accent strip
        s.addShape(pptx.ShapeType.rect, {
          x: MARGIN, y: cardY, w: cardW, h: 0.05,
          fill: { color: C.accentBg }
        })

        const leftInnerX = MARGIN + 0.25
        const leftInnerW = cardW - 0.5

        if (slide.content.leftTitle) {
          s.addText(slide.content.leftTitle, {
            x: leftInnerX, y: cardY + 0.2, w: leftInnerW, h: 0.35,
            fontSize: 14, fontFace: df, color: C.contentTitle, bold: true
          })
        }

        if (slide.content.leftBody && slide.content.leftBody.length > 0) {
          const lbCount = slide.content.leftBody.length
          const lbH = Math.max(1.0, Math.min(lbCount * 0.5, cardH - 0.8))
          const lbY = cardY + 0.65 + (cardH - 0.65 - lbH) / 2  // center in card

          s.addText(
            slide.content.leftBody.map(b => ({
              text: b,
              options: {
                fontSize: 13, fontFace: bf, color: C.contentBullet,
                bullet: { type: 'bullet' as const, style: '●', indent: 14 },
                breakLine: true, paraSpaceAfter: 8
              }
            })),
            { x: leftInnerX, y: lbY, w: leftInnerW, h: lbH, valign: 'middle' }
          )
        }

        // ── Right card ──
        const rightX = MARGIN + cardW + gap

        s.addShape(pptx.ShapeType.roundRect, {
          x: rightX, y: cardY, w: cardW, h: cardH,
          fill: { color: C.accentLighter },
          rectRadius: 0.1
        })
        s.addShape(pptx.ShapeType.rect, {
          x: rightX, y: cardY, w: cardW, h: 0.05,
          fill: { color: C.accentBg }
        })

        const rightInnerX = rightX + 0.25

        if (slide.content.rightTitle) {
          s.addText(slide.content.rightTitle, {
            x: rightInnerX, y: cardY + 0.2, w: leftInnerW, h: 0.35,
            fontSize: 14, fontFace: df, color: C.contentTitle, bold: true
          })
        }

        if (slide.content.rightBody && slide.content.rightBody.length > 0) {
          const rbCount = slide.content.rightBody.length
          const rbH = Math.max(1.0, Math.min(rbCount * 0.5, cardH - 0.8))
          const rbY = cardY + 0.65 + (cardH - 0.65 - rbH) / 2

          s.addText(
            slide.content.rightBody.map(b => ({
              text: b,
              options: {
                fontSize: 13, fontFace: bf, color: C.contentBullet,
                bullet: { type: 'bullet' as const, style: '●', indent: 14 },
                breakLine: true, paraSpaceAfter: 8
              }
            })),
            { x: rightInnerX, y: rbY, w: leftInnerW, h: rbH, valign: 'middle' }
          )
        }
        break
      }

      // ──────────── HIGHLIGHT SLIDE ────────────
      case 'highlight': {
        const s = pptx.addSlide()
        s.background = { color: C.contentBg }

        // Title — top
        s.addText(slide.content.title, {
          x: 0.8, y: 0.4, w: 8.4, h: 0.5,
          fontSize: 20, fontFace: df, color: C.contentTitle,
          align: 'center', bold: true
        })

        // Highlight box — vertically centered
        if (slide.content.highlight) {
          // Outer ring
          s.addShape(pptx.ShapeType.roundRect, {
            x: 1.5, y: 1.5, w: 7.0, h: 1.8,
            fill: { color: C.accentLighter },
            rectRadius: 0.15,
            line: { color: C.accentBg, width: 1.5 }
          })
          // Inner box with text
          s.addText(slide.content.highlight, {
            x: 1.8, y: 1.7, w: 6.4, h: 1.4,
            fontSize: 22, fontFace: df, color: C.accentColor,
            align: 'center', bold: true, valign: 'middle',
            shape: pptx.ShapeType.roundRect,
            fill: { color: C.accentBg },
            rectRadius: 0.12
          })
        }

        // Body pills — below highlight
        if (slide.content.body && slide.content.body.length > 0) {
          const pillW = Math.min(7.0 / slide.content.body.length, 2.8)
          const startX = (SLIDE_W - slide.content.body.length * pillW) / 2
          slide.content.body.forEach((b, i) => {
            s.addText(b, {
              x: startX + i * pillW + 0.06, y: 3.8, w: pillW - 0.12, h: 0.4,
              fontSize: 11, fontFace: bf, color: C.contentBullet,
              align: 'center', valign: 'middle',
              shape: pptx.ShapeType.roundRect,
              fill: { color: C.accentLighter },
              rectRadius: 0.2,
              line: { color: C.accentLight, width: 0.5 }
            })
          })
        }
        break
      }

      // ──────────── IMAGE SLIDE ────────────
      case 'image': {
        const s = pptx.addSlide()
        s.background = { color: C.contentBg }

        s.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.06, h: SLIDE_H,
          fill: { color: C.accentBg }
        })

        s.addText(slide.content.title, {
          x: MARGIN, y: 0.35, w: CONTENT_W, h: 0.5,
          fontSize: 20, fontFace: df, color: C.contentTitle, bold: true
        })
        s.addShape(pptx.ShapeType.rect, {
          x: MARGIN, y: 0.9, w: 1.2, h: 0.04,
          fill: { color: C.headerBorder }
        })

        // Left: text
        if (slide.content.body && slide.content.body.length > 0) {
          const bodyCount = slide.content.body.length
          const bodyH = Math.max(1.0, Math.min(bodyCount * 0.5, 3.5))
          const bodyY = 1.2 + (SLIDE_H - 1.2 - bodyH) / 2

          s.addText(
            slide.content.body.map(b => ({
              text: b,
              options: {
                fontSize: 13, fontFace: bf, color: C.contentBullet,
                bullet: { type: 'bullet' as const, style: '●', indent: 14 },
                breakLine: true, paraSpaceAfter: 8
              }
            })),
            { x: MARGIN + 0.1, y: bodyY, w: 4.0, h: bodyH, valign: 'middle' }
          )
        }

        // Right: image
        if (slide.content.imageUrl) {
          s.addImage({
            path: slide.content.imageUrl,
            x: 5.2, y: 1.2, w: 4.2, h: 3.5,
            sizing: { type: 'contain', w: 4.2, h: 3.5 },
            rounding: true
          })
        }
        break
      }

      // ──────────── FEATURE GRID ────────────
      case 'feature-grid': {
        const s = pptx.addSlide()
        s.background = { color: C.contentBg }

        s.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.06, h: SLIDE_H,
          fill: { color: C.accentBg }
        })

        s.addText(slide.content.title, {
          x: MARGIN, y: 0.3, w: CONTENT_W, h: 0.5,
          fontSize: 20, fontFace: df, color: C.contentTitle,
          align: 'center', bold: true
        })
        s.addShape(pptx.ShapeType.rect, {
          x: 4.0, y: 0.85, w: 2.0, h: 0.04,
          fill: { color: C.headerBorder }
        })

        const features = slide.content.features || []
        const cols = Math.min(features.length, 3)
        const rows = Math.ceil(features.length / cols)
        const totalGridH = SLIDE_H - 1.1 - 0.2  // available height
        const rowGap = 0.15
        const rowH = Math.min((totalGridH - (rows - 1) * rowGap) / rows, 2.2)
        const colW = CONTENT_W / cols

        features.forEach((f, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          const x = MARGIN + col * colW + 0.06
          const y = 1.1 + row * (rowH + rowGap)

          // Card background
          s.addShape(pptx.ShapeType.roundRect, {
            x, y, w: colW - 0.12, h: rowH,
            fill: { color: C.accentLighter },
            rectRadius: 0.08
          })

          // Number circle
          s.addText(String(i + 1), {
            x: x + (colW - 0.12) / 2 - 0.2, y: y + 0.12, w: 0.4, h: 0.4,
            fontSize: 13, fontFace: df, color: C.accentColor,
            align: 'center', valign: 'middle', bold: true,
            shape: pptx.ShapeType.ellipse,
            fill: { color: C.accentBg }
          })

          // Feature name
          s.addText(f.name, {
            x: x + 0.1, y: y + 0.6, w: colW - 0.32, h: 0.3,
            fontSize: 12, fontFace: df, color: C.contentTitle,
            align: 'center', bold: true
          })

          // Feature desc
          s.addText(f.desc, {
            x: x + 0.1, y: y + 0.95, w: colW - 0.32, h: rowH - 1.1,
            fontSize: 10, fontFace: bf, color: C.contentBullet,
            align: 'center', valign: 'middle', lineSpacingMultiple: 1.2
          })
        })
        break
      }

      // ──────────── QUOTE SLIDE ────────────
      case 'quote': {
        const s = pptx.addSlide()
        s.background = { color: C.titleBg }

        // Vertical accent bar
        s.addShape(pptx.ShapeType.rect, {
          x: 1.0, y: 1.0, w: 0.06, h: 3.5,
          fill: { color: C.accentBg }
        })

        // Quote text — vertically centered
        if (slide.content.highlight) {
          s.addText(`"${slide.content.highlight}"`, {
            x: 1.4, y: 1.3, w: 7.6, h: 2.2,
            fontSize: 22, fontFace: df, color: C.titleColor,
            italic: true, valign: 'middle', lineSpacingMultiple: 1.2
          })
        }

        if (slide.content.title) {
          s.addText(`\u2014 ${slide.content.title}`, {
            x: 1.4, y: 3.7, w: 7.6, h: 0.4,
            fontSize: 14, fontFace: bf, color: C.subtitleColor
          })
        }

        if (slide.content.body && slide.content.body.length > 0) {
          s.addText(
            slide.content.body.map(b => ({
              text: b,
              options: {
                fontSize: 12, fontFace: bf, color: C.subtitleColor,
                bullet: { type: 'bullet' as const, style: '●', indent: 12 },
                breakLine: true, paraSpaceAfter: 4
              }
            })),
            { x: 1.4, y: 4.3, w: 7.6, h: 0.9, valign: 'middle' }
          )
        }
        break
      }

      // ──────────── BIG-NUMBER ────────────
      case 'big-number': {
        const s = pptx.addSlide()
        s.background = { color: C.contentBg }

        s.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.06, h: SLIDE_H,
          fill: { color: C.accentBg }
        })

        // Big number
        if (slide.content.highlight) {
          s.addText(slide.content.highlight, {
            x: 1.0, y: 0.8, w: 8.0, h: 2.5,
            fontSize: 72, fontFace: df, color: C.accentBg,
            align: 'center', bold: true, valign: 'middle'
          })
        }

        // Label
        s.addText(slide.content.title, {
          x: 1.5, y: 3.3, w: 7.0, h: 0.6,
          fontSize: 18, fontFace: bf, color: C.contentTitle,
          align: 'center', bold: true
        })

        // Supporting data pills
        if (slide.content.body && slide.content.body.length > 0) {
          const pillW = Math.min(6.0 / slide.content.body.length, 2.5)
          const startX = (SLIDE_W - slide.content.body.length * pillW) / 2
          slide.content.body.forEach((b, i) => {
            s.addText(b, {
              x: startX + i * pillW + 0.06, y: 4.2, w: pillW - 0.12, h: 0.45,
              fontSize: 12, fontFace: bf, color: C.contentBullet,
              align: 'center', valign: 'middle',
              shape: pptx.ShapeType.roundRect,
              fill: { color: C.accentLighter },
              rectRadius: 0.18,
              line: { color: C.accentLight, width: 0.5 }
            })
          })
        }

        // Bottom accent line
        s.addShape(pptx.ShapeType.rect, {
          x: 3.0, y: SLIDE_H - 0.5, w: 4.0, h: 0.04,
          fill: { color: C.accentBg }
        })
        break
      }

      // ──────────── TIMELINE ────────────
      case 'timeline': {
        const s = pptx.addSlide()
        s.background = { color: C.contentBg }

        s.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.06, h: SLIDE_H,
          fill: { color: C.accentBg }
        })

        // Title
        s.addText(slide.content.title, {
          x: MARGIN, y: 0.3, w: CONTENT_W, h: 0.5,
          fontSize: 20, fontFace: df, color: C.contentTitle, bold: true
        })
        s.addShape(pptx.ShapeType.rect, {
          x: MARGIN, y: 0.85, w: 1.2, h: 0.04,
          fill: { color: C.headerBorder }
        })

        const features = slide.content.features || []
        const nodeCount = Math.min(features.length, 5)
        const nodeW = CONTENT_W / nodeCount

        // Connecting line
        s.addShape(pptx.ShapeType.rect, {
          x: MARGIN + nodeW * 0.5, y: 2.5, w: (nodeCount - 1) * nodeW, h: 0.04,
          fill: { color: C.accentLight }
        })

        // Nodes
        features.slice(0, 5).forEach((f, i) => {
          const nx = MARGIN + i * nodeW
          const circleX = nx + nodeW / 2 - 0.22

          // Circle
          s.addText(String(i + 1), {
            x: circleX, y: 2.2, w: 0.44, h: 0.44,
            fontSize: 13, fontFace: df, color: C.accentColor,
            align: 'center', valign: 'middle', bold: true,
            shape: pptx.ShapeType.ellipse,
            fill: { color: C.accentBg }
          })

          // Step title
          s.addText(f.name, {
            x: nx + 0.1, y: 2.85, w: nodeW - 0.2, h: 0.35,
            fontSize: 12, fontFace: df, color: C.contentTitle,
            align: 'center', bold: true
          })

          // Step desc
          s.addText(f.desc, {
            x: nx + 0.1, y: 3.25, w: nodeW - 0.2, h: 1.8,
            fontSize: 10, fontFace: bf, color: C.contentBullet,
            align: 'center', valign: 'top', lineSpacingMultiple: 1.2
          })
        })
        break
      }

      // ──────────── CALLOUT ────────────
      case 'callout': {
        const s = pptx.addSlide()
        s.background = { color: C.contentBg }

        s.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.06, h: SLIDE_H,
          fill: { color: C.accentBg }
        })

        // Title
        s.addText(slide.content.title, {
          x: MARGIN, y: 0.35, w: CONTENT_W, h: 0.55,
          fontSize: 20, fontFace: df, color: C.contentTitle, bold: true
        })
        s.addShape(pptx.ShapeType.rect, {
          x: MARGIN, y: 0.95, w: 1.2, h: 0.04,
          fill: { color: C.headerBorder }
        })

        // Left: body bullets
        if (slide.content.body && slide.content.body.length > 0) {
          const bodyCount = slide.content.body.length
          const bodyH = Math.max(1.5, Math.min(bodyCount * 0.6, 3.5))
          const bodyY = 1.2 + (SLIDE_H - 1.2 - bodyH) / 2

          s.addText(
            slide.content.body.map(b => ({
              text: b,
              options: {
                fontSize: 15, fontFace: bf, color: C.contentBullet,
                bullet: { type: 'bullet' as const, style: '●', indent: 16 },
                breakLine: true, paraSpaceAfter: 10
              }
            })),
            { x: MARGIN + 0.1, y: bodyY, w: 5.3, h: bodyH, valign: 'middle' }
          )
        }

        // Right: callout sidebar
        s.addShape(pptx.ShapeType.roundRect, {
          x: 6.5, y: 1.2, w: 2.8, h: 3.8,
          fill: { color: C.accentBg },
          rectRadius: 0.12
        })

        // Callout label
        if (slide.content.accent) {
          s.addText(slide.content.accent, {
            x: 6.7, y: 1.6, w: 2.4, h: 0.3,
            fontSize: 9, fontFace: bf, color: C.accentColor,
            align: 'center', bold: true
          })
        }

        // Callout text
        if (slide.content.highlight) {
          s.addText(slide.content.highlight, {
            x: 6.7, y: 2.1, w: 2.4, h: 2.5,
            fontSize: 16, fontFace: df, color: C.accentColor,
            align: 'center', valign: 'middle', bold: true
          })
        }
        break
      }

      // ──────────── STATEMENT ────────────
      case 'statement': {
        const s = pptx.addSlide()
        s.background = { color: C.titleBg }

        // Decorative circle
        s.addShape(pptx.ShapeType.ellipse, {
          x: 7.5, y: -0.5, w: 3.0, h: 3.0,
          fill: { color: C.accentBg }, opacity: 8
        })

        // Statement text — vertically centered
        s.addText(slide.content.highlight || slide.content.title, {
          x: 1.0, y: 1.2, w: 8.0, h: 3.0,
          fontSize: 30, fontFace: df, color: C.titleColor,
          align: 'center', valign: 'middle', bold: true, lineSpacingMultiple: 1.2
        })

        // Accent line
        s.addShape(pptx.ShapeType.rect, {
          x: 4.0, y: 4.4, w: 2.0, h: 0.05,
          fill: { color: C.accentBg }
        })

        // Attribution
        if (slide.content.title && slide.content.highlight) {
          s.addText(`\u2014 ${slide.content.title}`, {
            x: 1.5, y: 4.6, w: 7.0, h: 0.4,
            fontSize: 13, fontFace: bf, color: C.subtitleColor,
            align: 'center'
          })
        }
        break
      }

      // ──────────── DEFAULT ────────────
      default: {
        const s = pptx.addSlide()
        s.background = { color: C.contentBg }

        s.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.06, h: SLIDE_H,
          fill: { color: C.accentBg }
        })
        s.addText(slide.content.title, {
          x: MARGIN, y: 0.35, w: CONTENT_W, h: 0.6,
          fontSize: 22, fontFace: df, color: C.contentTitle, bold: true
        })
        s.addShape(pptx.ShapeType.rect, {
          x: MARGIN, y: 1.0, w: 1.5, h: 0.04,
          fill: { color: C.headerBorder }
        })
        break
      }
    }
  }

  const output = await pptx.write({ outputType: 'nodebuffer' })
  return output as Buffer
}
