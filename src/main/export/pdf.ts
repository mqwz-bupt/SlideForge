import { generateHTML } from './html'

interface ProjectData {
  id: string
  name: string
  style: string
  slides: any[]
}

export async function generatePDF(project: ProjectData): Promise<Buffer> {
  const html = generateHTML(project)

  // Dynamic import — Playwright is heavy and not needed until PDF export
  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({
      // 16:9 viewport so 100vh = 720px per slide
      viewport: { width: 1280, height: 720 }
    })
    await page.setContent(html, { waitUntil: 'networkidle' })

    // Override CSS for PDF: disable scroll-snap, allow body to expand,
    // force page-break between slides, hide interactive elements
    await page.addStyleTag({
      content: `
        html { scroll-snap-type: none !important; scroll-behavior: auto !important; }
        html, body { height: auto !important; overflow: visible !important; }
        .slide { page-break-after: always; break-after: page; }
        .slide:last-child { page-break-after: auto; }
        .progress-container, .nav-dots, .keyboard-hint { display: none !important; }
      `
    })

    // Use screen media type so CSS custom properties and backgrounds render
    await page.emulateMedia({ media: 'screen' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' }
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
