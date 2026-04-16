import PptxGenJS from 'pptxgenjs'
import { getStyleConfig, extractSolidColor, type StyleConfig } from './styles'

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
  }
}

interface ProjectData {
  id: string
  name: string
  style: string
  slides: SlideData[]
}

/** Strip # from hex color for PptxGenJS */
function hexOnly(c: string): string {
  return extractSolidColor(c).replace('#', '')
}

export function generatePPTX(project: ProjectData): Buffer {
  const style = getStyleConfig(project.style)
  const pptx = new PptxGenJS()

  pptx.layout = 'LAYOUT_16x9'
  pptx.author = 'SlideForge'
  pptx.title = project.name

  const displayFont = style.displayFont.replace(/'/g, '').split(',')[0].trim()
  const bodyFont = style.bodyFont.replace(/'/g, '').split(',')[0].trim()

  const titleBgHex = hexOnly(style.titleBg)
  const titleColorHex = hexOnly(style.titleColor)
  const accentBgHex = hexOnly(style.titleAccentBg)
  const accentColorHex = hexOnly(style.titleAccentColor)
  const contentBgHex = hexOnly(style.contentBg)
  const contentTitleHex = hexOnly(style.contentTitleColor)
  const contentBulletHex = hexOnly(style.contentBulletColor)
  const contentDotHex = hexOnly(style.contentBulletDot)

  const sorted = project.slides.slice().sort((a, b) => a.order - b.order)

  for (const slide of sorted) {
    switch (slide.layout) {
      case 'title': {
        const s = pptx.addSlide()
        s.background = { color: titleBgHex }
        if (slide.content.accent) {
          s.addText(slide.content.accent, {
            x: 0, y: 1.5, w: '100%', h: 0.5,
            fontSize: 12, fontFace: bodyFont, color: accentColorHex,
            align: 'center', bold: true,
            shape: pptx.ShapeType.roundRect,
            fill: { color: accentBgHex },
            rectRadius: 0.1
          })
        }
        s.addText(slide.content.title, {
          x: 0.8, y: 2.2, w: 8.4, h: 1.8,
          fontSize: 36, fontFace: displayFont, color: titleColorHex,
          align: 'center', bold: true
        })
        if (slide.content.subtitle) {
          s.addText(slide.content.subtitle, {
            x: 0.8, y: 4.0, w: 8.4, h: 0.8,
            fontSize: 16, fontFace: bodyFont, color: titleColorHex,
            align: 'center'
          })
        }
        break
      }

      case 'section-divider': {
        const s = pptx.addSlide()
        s.background = { color: titleBgHex }
        s.addText(slide.content.title, {
          x: 0.8, y: 1.5, w: 8.4, h: 2.5,
          fontSize: 32, fontFace: displayFont, color: titleColorHex,
          align: 'center', bold: true
        })
        if (slide.content.subtitle) {
          s.addText(slide.content.subtitle, {
            x: 0.8, y: 4.0, w: 8.4, h: 0.8,
            fontSize: 14, fontFace: bodyFont, color: titleColorHex,
            align: 'center'
          })
        }
        break
      }

      case 'content': {
        const s = pptx.addSlide()
        s.background = { color: contentBgHex }
        s.addText(slide.content.title, {
          x: 0.6, y: 0.4, w: 8.8, h: 0.8,
          fontSize: 24, fontFace: displayFont, color: contentTitleHex,
          bold: true
        })
        // Accent line
        s.addShape(pptx.ShapeType.rect, {
          x: 0.6, y: 1.2, w: 8.8, h: 0.04,
          fill: { color: contentDotHex }
        })
        if (slide.content.body && slide.content.body.length > 0) {
          s.addText(
            slide.content.body.map(b => ({
              text: b,
              options: { fontSize: 14, fontFace: bodyFont, color: contentBulletHex, bullet: { type: 'bullet' as const }, breakLine: true, paraSpaceAfter: 6 }
            })),
            { x: 0.6, y: 1.5, w: 8.8, h: 4.0, valign: 'top' }
          )
        }
        break
      }

      case 'two-column': {
        const s = pptx.addSlide()
        s.background = { color: contentBgHex }
        s.addText(slide.content.title, {
          x: 0.6, y: 0.4, w: 8.8, h: 0.8,
          fontSize: 24, fontFace: displayFont, color: contentTitleHex,
          bold: true
        })
        // Left column
        if (slide.content.leftBody && slide.content.leftBody.length > 0) {
          if (slide.content.leftTitle) {
            s.addText(slide.content.leftTitle, {
              x: 0.6, y: 1.4, w: 4.0, h: 0.5,
              fontSize: 16, fontFace: displayFont, color: contentTitleHex, bold: true
            })
          }
          s.addText(
            slide.content.leftBody.map(b => ({
              text: b,
              options: { fontSize: 12, fontFace: bodyFont, color: contentBulletHex, bullet: { type: 'bullet' as const }, breakLine: true, paraSpaceAfter: 4 }
            })),
            { x: 0.6, y: 2.0, w: 4.0, h: 3.5, valign: 'top' }
          )
        }
        // Right column
        if (slide.content.rightBody && slide.content.rightBody.length > 0) {
          if (slide.content.rightTitle) {
            s.addText(slide.content.rightTitle, {
              x: 5.4, y: 1.4, w: 4.0, h: 0.5,
              fontSize: 16, fontFace: displayFont, color: contentTitleHex, bold: true
            })
          }
          s.addText(
            slide.content.rightBody.map(b => ({
              text: b,
              options: { fontSize: 12, fontFace: bodyFont, color: contentBulletHex, bullet: { type: 'bullet' as const }, breakLine: true, paraSpaceAfter: 4 }
            })),
            { x: 5.4, y: 2.0, w: 4.0, h: 3.5, valign: 'top' }
          )
        }
        break
      }

      case 'highlight': {
        const s = pptx.addSlide()
        s.background = { color: contentBgHex }
        s.addText(slide.content.title, {
          x: 0.6, y: 0.4, w: 8.8, h: 0.8,
          fontSize: 24, fontFace: displayFont, color: contentTitleHex,
          align: 'center', bold: true
        })
        if (slide.content.highlight) {
          s.addText(slide.content.highlight, {
            x: 1.0, y: 1.6, w: 8.0, h: 1.5,
            fontSize: 22, fontFace: displayFont, color: accentColorHex,
            align: 'center', bold: true, fill: { color: accentBgHex },
            shape: pptx.ShapeType.roundRect, rectRadius: 0.15
          })
        }
        if (slide.content.body && slide.content.body.length > 0) {
          s.addText(
            slide.content.body.map(b => ({
              text: b,
              options: { fontSize: 12, fontFace: bodyFont, color: contentBulletHex, bullet: { type: 'bullet' as const }, breakLine: true, paraSpaceAfter: 4 }
            })),
            { x: 1.0, y: 3.5, w: 8.0, h: 2.0, valign: 'top' }
          )
        }
        break
      }

      case 'image': {
        const s = pptx.addSlide()
        s.background = { color: contentBgHex }
        s.addText(slide.content.title, {
          x: 0.6, y: 0.4, w: 8.8, h: 0.8,
          fontSize: 24, fontFace: displayFont, color: contentTitleHex,
          bold: true
        })
        if (slide.content.body && slide.content.body.length > 0) {
          s.addText(
            slide.content.body.map(b => ({
              text: b,
              options: { fontSize: 12, fontFace: bodyFont, color: contentBulletHex, bullet: { type: 'bullet' as const }, breakLine: true, paraSpaceAfter: 4 }
            })),
            { x: 0.6, y: 1.4, w: 4.0, h: 4.0, valign: 'top' }
          )
        }
        if (slide.content.imageUrl) {
          s.addImage({
            path: slide.content.imageUrl,
            x: 5.2, y: 1.4, w: 4.2, h: 3.5,
            sizing: { type: 'contain', w: 4.2, h: 3.5 }
          })
        }
        break
      }

      case 'quote': {
        const s = pptx.addSlide()
        s.background = { color: titleBgHex }
        if (slide.content.highlight) {
          s.addText(`"${slide.content.highlight}"`, {
            x: 1.0, y: 1.5, w: 8.0, h: 2.5,
            fontSize: 22, fontFace: displayFont, color: titleColorHex,
            align: 'center', italic: true
          })
        }
        if (slide.content.title) {
          s.addText(`— ${slide.content.title}`, {
            x: 1.0, y: 4.2, w: 8.0, h: 0.6,
            fontSize: 14, fontFace: bodyFont, color: titleColorHex,
            align: 'center'
          })
        }
        break
      }

      default: {
        // Fallback: treat as content slide
        const s = pptx.addSlide()
        s.background = { color: contentBgHex }
        s.addText(slide.content.title, {
          x: 0.6, y: 0.4, w: 8.8, h: 0.8,
          fontSize: 24, fontFace: displayFont, color: contentTitleHex, bold: true
        })
        break
      }
    }
  }

  // PptxGenJS.write returns Uint8Array in Node
  const output = pptx.write({ outputType: 'nodebuffer' }) as unknown as Buffer
  return output
}
