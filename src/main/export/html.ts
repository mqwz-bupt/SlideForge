import { getStyleConfig, type StyleConfig } from './styles'

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
  notes?: string
}

interface ProjectData {
  id: string
  name: string
  style: string
  slides: SlideData[]
}

// ── Viewport-base CSS (from frontend-slides-main) ──

const VIEWPORT_CSS = `
html, body { height: 100%; overflow-x: hidden; }
html { scroll-snap-type: y mandatory; scroll-behavior: smooth; }
.slide {
  width: 100vw; height: 100vh; height: 100dvh;
  overflow: hidden; scroll-snap-align: start;
  display: flex; flex-direction: column; position: relative;
}
.slide-content {
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; max-height: 100%; overflow: hidden;
  padding: var(--slide-padding);
}
:root {
  --title-size: clamp(1.5rem, 5vw, 4rem);
  --h2-size: clamp(1.25rem, 3.5vw, 2.5rem);
  --h3-size: clamp(1rem, 2.5vw, 1.75rem);
  --body-size: clamp(0.75rem, 1.5vw, 1.125rem);
  --small-size: clamp(0.65rem, 1vw, 0.875rem);
  --slide-padding: clamp(1rem, 4vw, 4rem);
  --content-gap: clamp(0.5rem, 2vw, 2rem);
  --element-gap: clamp(0.25rem, 1vw, 1rem);
}
.card, .container, .content-box { max-width: min(90vw, 1000px); max-height: min(80vh, 700px); }
img, .image-container { max-width: 100%; max-height: min(50vh, 400px); object-fit: contain; }
@media (max-height: 700px) {
  :root { --slide-padding: clamp(0.75rem,3vw,2rem); --content-gap: clamp(0.4rem,1.5vw,1rem); --title-size: clamp(1.25rem,4.5vw,2.5rem); --h2-size: clamp(1rem,3vw,1.75rem); }
}
@media (max-height: 600px) {
  :root { --slide-padding: clamp(0.5rem,2.5vw,1.5rem); --content-gap: clamp(0.3rem,1vw,0.75rem); --title-size: clamp(1.1rem,4vw,2rem); --body-size: clamp(0.7rem,1.2vw,0.95rem); }
  .nav-dots, .keyboard-hint, .decorative { display: none; }
}
@media (max-height: 500px) {
  :root { --slide-padding: clamp(0.4rem,2vw,1rem); --title-size: clamp(1rem,3.5vw,1.5rem); --h2-size: clamp(0.9rem,2.5vw,1.25rem); --body-size: clamp(0.65rem,1vw,0.85rem); }
}
@media (max-width: 600px) {
  :root { --title-size: clamp(1.25rem,7vw,2.5rem); }
  .two-column-grid, .split-grid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.2s !important; }
  html { scroll-behavior: auto; }
}
`

// ── Presentation-specific CSS ──

const PRESENTATION_CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }

/* Progress bar */
.progress-container { position: fixed; top: 0; left: 0; right: 0; height: 3px; background: rgba(128,128,128,0.1); z-index: 100; }
.progress-bar { height: 100%; background: var(--dot-active); transition: width 0.3s ease; width: 0; }

/* Nav dots */
.nav-dots { display: flex; gap: 8px; justify-content: center; margin-top: auto; padding-top: 1.5rem; }
.nav-dot {
  width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer;
  background: var(--dot-inactive); transition: all 0.3s ease;
}
.nav-dot.active { background: var(--dot-active); transform: scale(1.4); }

/* Title slide */
.title-slide { background: var(--title-bg); }
.accent-badge {
  display: inline-block; padding: 6px 18px;
  background: var(--title-accent-bg); color: var(--title-accent-color);
  border-radius: 20px; font-size: var(--small-size); font-weight: 600;
  letter-spacing: 1px; text-transform: uppercase; margin-bottom: var(--content-gap);
  font-family: var(--body-font);
}
.title-slide h1 {
  font-family: var(--display-font); color: var(--title-color);
  font-size: var(--title-size); line-height: 1.15; margin-bottom: var(--element-gap);
}
.title-slide .subtitle {
  font-family: var(--body-font); color: var(--title-subtitle-color);
  font-size: var(--h3-size); line-height: 1.4;
}

/* Section divider */
.divider-slide { background: var(--title-bg); }
.section-number {
  font-family: var(--display-font); font-size: clamp(3rem,10vw,8rem);
  color: var(--title-accent-bg); line-height: 1; opacity: 0.3;
}
.divider-line { width: 60px; height: 3px; background: var(--title-accent-bg); margin: var(--element-gap) auto; }
.divider-slide h2 {
  font-family: var(--display-font); color: var(--title-color);
  font-size: var(--h2-size); margin-bottom: var(--element-gap);
}
.divider-slide .subtitle {
  font-family: var(--body-font); color: var(--title-subtitle-color);
  font-size: var(--body-size);
}

/* Content slide */
.slide-header {
  padding-bottom: var(--element-gap); margin-bottom: var(--content-gap);
  border-bottom: 3px solid var(--content-header-border);
}
.slide-header h2 {
  font-family: var(--display-font); color: var(--content-title-color);
  font-size: var(--h2-size);
}

/* Bullet list */
.bullet-list { list-style: none; display: flex; flex-direction: column; gap: var(--element-gap); }
.bullet-list li {
  display: flex; align-items: flex-start; gap: 12px;
  font-family: var(--body-font); font-size: var(--body-size);
  color: var(--content-bullet-color); line-height: 1.5;
}
.bullet-list .dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 0.4em;
  background: var(--content-bullet-dot);
}

/* Two column */
.two-column-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--content-gap); }
.two-column-grid .card {
  background: rgba(128,128,128,0.05); border-radius: 12px;
  padding: clamp(1rem,2vw,2rem); border: 1px solid rgba(128,128,128,0.1);
}
.card h3 { font-family: var(--display-font); font-size: var(--h3-size); color: var(--content-title-color); margin-bottom: var(--element-gap); }

/* Highlight slide */
.highlight-slide { background: var(--content-bg); }
.highlight-box {
  display: inline-block; padding: clamp(1rem,3vw,2rem) clamp(2rem,4vw,3rem);
  border-radius: 16px; font-family: var(--display-font);
  font-size: var(--h2-size); font-weight: 700; margin-bottom: var(--content-gap);
  background: var(--title-accent-bg); color: var(--title-accent-color);
}
.pill-list { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
.pill {
  padding: 8px 20px; border: 2px solid var(--content-header-border); border-radius: 25px;
  font-size: var(--body-size); font-family: var(--body-font); color: var(--content-title-color);
}

/* Image slide */
.split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--content-gap); flex: 1; align-items: center; }
.image-side img { width: 100%; max-height: 50vh; object-fit: contain; border-radius: 12px; }

/* Quote slide */
.quote-slide { background: var(--title-bg); }
.quote-slide blockquote {
  font-family: var(--display-font); font-size: var(--h2-size); font-style: italic;
  color: var(--title-color); line-height: 1.4; max-width: 800px; margin: 0 auto;
}
.attribution {
  margin-top: var(--content-gap); font-family: var(--body-font);
  font-size: var(--body-size); color: var(--title-subtitle-color);
}

/* Keyboard hint */
.keyboard-hint {
  position: fixed; bottom: 12px; right: 16px;
  font-size: 11px; color: rgba(128,128,128,0.4); font-family: var(--body-font);
  pointer-events: none;
}
`

// ── Navigation JS ──

const NAV_JS = `
class SlidePresentation {
  constructor() {
    this.slides = document.querySelectorAll('.slide');
    this.current = 0;
    this.total = this.slides.length;
    this.setupObserver();
    this.updateDots();
  }
  goTo(i) {
    if (i >= 0 && i < this.total) {
      this.slides[i].scrollIntoView({ behavior: 'smooth' });
      this.current = i;
      this.updateProgress();
      this.updateDots();
    }
  }
  next() { this.goTo(this.current + 1); }
  prev() { this.goTo(this.current - 1); }
  updateProgress() {
    const bar = document.querySelector('.progress-bar');
    if (bar) bar.style.width = ((this.current + 1) / this.total * 100) + '%';
  }
  updateDots() {
    document.querySelectorAll('.nav-dot').forEach(function(d, i) {
      d.classList.toggle('active', i === this.current);
    }.bind(this));
  }
  setupObserver() {
    var self = this;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var idx = Array.from(self.slides).indexOf(entry.target);
          self.current = idx;
          self.updateProgress();
          self.updateDots();
        }
      });
    }, { threshold: 0.5 });
    this.slides.forEach(function(s) { observer.observe(s); });
  }
}

var presentation = new SlidePresentation();

document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); presentation.next(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); presentation.prev(); }
  if (e.key === 'Home') { e.preventDefault(); presentation.goTo(0); }
  if (e.key === 'End') { e.preventDefault(); presentation.goTo(presentation.total - 1); }
});
`

// ── Helpers ──

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function generateNavDots(total: number): string {
  return '<div class="nav-dots">' +
    Array.from({ length: total }, (_, i) =>
      `<button class="nav-dot${i === 0 ? ' active' : ''}" onclick="presentation.goTo(${i})" aria-label="Slide ${i + 1}"></button>`
    ).join('') +
    '</div>'
}

function generateBullets(items: string[]): string {
  if (!items || items.length === 0) return ''
  return '<ul class="bullet-list">' +
    items.map(item => `<li><span class="dot"></span><span>${esc(item)}</span></li>`).join('') +
    '</ul>'
}

// ── Slide generators ──

function generateTitleSlide(slide: SlideData, total: number): string {
  const { title, subtitle, accent } = slide.content
  return `<section class="slide title-slide">
  <div class="slide-content" style="text-align:center;justify-content:center;">
    ${accent ? `<div class="accent-badge">${esc(accent)}</div>` : ''}
    <h1>${esc(title)}</h1>
    ${subtitle ? `<p class="subtitle">${esc(subtitle)}</p>` : ''}
    ${generateNavDots(total)}
  </div>
</section>`
}

function generateDividerSlide(slide: SlideData, idx: number, total: number): string {
  const { title, subtitle, accent } = slide.content
  const num = accent || String(idx + 1).padStart(2, '0')
  return `<section class="slide divider-slide">
  <div class="slide-content" style="text-align:center;justify-content:center;">
    <div class="section-number">${esc(num)}</div>
    <div class="divider-line"></div>
    <h2>${esc(title)}</h2>
    ${subtitle ? `<p class="subtitle">${esc(subtitle)}</p>` : ''}
    ${generateNavDots(total)}
  </div>
</section>`
}

function generateContentSlide(slide: SlideData): string {
  const { title, body } = slide.content
  return `<section class="slide" style="background:var(--content-bg);">
  <div class="slide-content">
    <div class="slide-header"><h2>${esc(title)}</h2></div>
    ${generateBullets(body || [])}
  </div>
</section>`
}

function generateTwoColumnSlide(slide: SlideData): string {
  const { title, leftTitle, leftBody, rightTitle, rightBody } = slide.content
  return `<section class="slide" style="background:var(--content-bg);">
  <div class="slide-content">
    <div class="slide-header"><h2>${esc(title)}</h2></div>
    <div class="two-column-grid">
      <div class="card">
        ${leftTitle ? `<h3>${esc(leftTitle)}</h3>` : ''}
        ${generateBullets(leftBody || [])}
      </div>
      <div class="card">
        ${rightTitle ? `<h3>${esc(rightTitle)}</h3>` : ''}
        ${generateBullets(rightBody || [])}
      </div>
    </div>
  </div>
</section>`
}

function generateHighlightSlide(slide: SlideData, total: number): string {
  const { title, highlight, body } = slide.content
  return `<section class="slide highlight-slide">
  <div class="slide-content" style="text-align:center;justify-content:center;">
    <h2 style="font-family:var(--display-font);color:var(--content-title-color);margin-bottom:var(--content-gap);">${esc(title)}</h2>
    ${highlight ? `<div class="highlight-box">${esc(highlight)}</div>` : ''}
    ${body && body.length > 0 ? `<div class="pill-list">${body.map(b => `<span class="pill">${esc(b)}</span>`).join('')}</div>` : ''}
    ${generateNavDots(total)}
  </div>
</section>`
}

function generateImageSlide(slide: SlideData): string {
  const { title, body, imageUrl } = slide.content
  return `<section class="slide" style="background:var(--content-bg);">
  <div class="slide-content">
    <div class="slide-header"><h2>${esc(title)}</h2></div>
    <div class="split-grid">
      <div class="text-side">${generateBullets(body || [])}</div>
      <div class="image-side">
        ${imageUrl ? `<img src="${imageUrl}" alt="${esc(title)}" loading="lazy" />` : ''}
      </div>
    </div>
  </div>
</section>`
}

function generateQuoteSlide(slide: SlideData, total: number): string {
  const { title, highlight } = slide.content
  return `<section class="slide quote-slide">
  <div class="slide-content" style="text-align:center;justify-content:center;">
    <blockquote>${highlight ? esc(highlight) : ''}</blockquote>
    ${title ? `<p class="attribution">— ${esc(title)}</p>` : ''}
    ${generateNavDots(total)}
  </div>
</section>`
}

function generateSlide(slide: SlideData, index: number, total: number): string {
  switch (slide.layout) {
    case 'title': return generateTitleSlide(slide, total)
    case 'section-divider': return generateDividerSlide(slide, index, total)
    case 'two-column': return generateTwoColumnSlide(slide)
    case 'highlight': return generateHighlightSlide(slide, total)
    case 'image': return generateImageSlide(slide)
    case 'quote': return generateQuoteSlide(slide, total)
    case 'content':
    default: return generateContentSlide(slide)
  }
}

// ── Main export ──

export function generateHTML(project: ProjectData): string {
  const styleConfig = getStyleConfig(project.style)
  const total = project.slides.length

  const slidesHtml = project.slides
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((slide, i) => generateSlide(slide, i, total))
    .join('\n')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(project.name)}</title>
  <link rel="stylesheet" href="${styleConfig.fontsUrl}" />
  <style>
${VIEWPORT_CSS}
${PRESENTATION_CSS}
:root {
  --display-font: ${styleConfig.displayFont};
  --body-font: ${styleConfig.bodyFont};
  --title-bg: ${styleConfig.titleBg};
  --title-color: ${styleConfig.titleColor};
  --title-accent-bg: ${styleConfig.titleAccentBg};
  --title-accent-color: ${styleConfig.titleAccentColor};
  --title-subtitle-color: ${styleConfig.titleSubtitleColor};
  --content-bg: ${styleConfig.contentBg};
  --content-header-border: ${styleConfig.contentHeaderBorder};
  --content-title-color: ${styleConfig.contentTitleColor};
  --content-bullet-color: ${styleConfig.contentBulletColor};
  --content-bullet-dot: ${styleConfig.contentBulletDot};
  --content-notes-color: ${styleConfig.contentNotesColor};
  --dot-active: ${styleConfig.dotActive};
  --dot-inactive: ${styleConfig.dotInactive};
}
  </style>
</head>
<body>
  <div class="progress-container"><div class="progress-bar"></div></div>
${slidesHtml}
  <div class="keyboard-hint">← → Space</div>
  <script>${NAV_JS}</script>
</body>
</html>`
}
