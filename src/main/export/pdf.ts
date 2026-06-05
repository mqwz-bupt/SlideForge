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
        .slide {
          height: 100vh !important; width: 100vw !important;
          page-break-after: always; break-after: page;
          overflow: hidden !important;
        }
        .slide:last-child { page-break-after: auto; }
        .progress-container, .nav-dots, .keyboard-hint { display: none !important; }
        .reveal, .reveal-left, .reveal-scale, .reveal-fade, .reveal-blur, .reveal-glow {
          opacity: 1 !important; transform: none !important; filter: none !important;
          transition: none !important;
        }
        .slide-bg-number, .slide-corner-accent, .slide-accent-bar { display: block; }
      `
    })

    // Use screen media type so CSS custom properties and backgrounds render
    await page.emulateMedia({ media: 'screen' })

    // Force all slides to visible state so JS-dependent elements render
    await page.evaluate(() => {
      document.querySelectorAll('.slide').forEach(s => s.classList.add('visible'))
    })

    // Wait for fonts and images to finish loading
    await page.waitForTimeout(500)

    const pdfBuffer = await page.pdf({
      // Use custom dimensions matching the viewport so each slide fills exactly one page
      width: '1280px',
      height: '720px',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' }
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
