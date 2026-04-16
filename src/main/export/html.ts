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
    features?: Array<{ name: string; desc: string }>
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
  position: relative; z-index: 2;
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
  .two-column-grid, .split-grid, .feature-grid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.2s !important; }
  html { scroll-behavior: auto; }
}
`

// ── Presentation CSS with animations & decorative elements ──

const PRESENTATION_CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }

/* ── Reveal Animation System ── */
.reveal {
  opacity: 0; transform: translateY(24px);
  transition: opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.reveal-left {
  opacity: 0; transform: translateX(-30px);
  transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.reveal-scale {
  opacity: 0; transform: scale(0.85);
  transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.reveal-fade {
  opacity: 0;
  transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.slide.visible .reveal { opacity: 1; transform: translateY(0); }
.slide.visible .reveal-left { opacity: 1; transform: translateX(0); }
.slide.visible .reveal-scale { opacity: 1; transform: scale(1); }
.slide.visible .reveal-fade { opacity: 1; }
.slide.visible .reveal:nth-child(2) { transition-delay: 0.1s; }
.slide.visible .reveal:nth-child(3) { transition-delay: 0.2s; }
.slide.visible .reveal:nth-child(4) { transition-delay: 0.3s; }
.slide.visible .reveal:nth-child(5) { transition-delay: 0.4s; }
.slide.visible .reveal:nth-child(6) { transition-delay: 0.5s; }
.slide.visible .reveal-left:nth-child(2) { transition-delay: 0.1s; }
.slide.visible .reveal-left:nth-child(3) { transition-delay: 0.2s; }
.slide.visible .reveal-scale:nth-child(2) { transition-delay: 0.1s; }
.slide.visible .reveal-scale:nth-child(3) { transition-delay: 0.2s; }
.slide.visible .reveal-scale:nth-child(4) { transition-delay: 0.3s; }

/* ── Background Decorations ── */
.slide-bg-number {
  position: absolute; top: -5%; right: -3%;
  font-family: var(--display-font); font-size: clamp(8rem, 25vw, 18rem);
  font-weight: 900; line-height: 1; opacity: 0.04;
  color: var(--content-title-color); pointer-events: none; z-index: 1;
  user-select: none;
  animation: float 10s ease-in-out infinite;
}
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
.slide-accent-bar {
  position: absolute; left: 0; top: 0; bottom: 0; width: 5px;
  background: linear-gradient(180deg, var(--title-accent-bg), transparent);
  z-index: 3;
}
.slide-corner-accent {
  position: absolute; bottom: -40px; right: -40px;
  width: 200px; height: 200px; border-radius: 50%;
  background: var(--title-accent-bg); opacity: 0.06;
  pointer-events: none; z-index: 1;
  animation: pulse 6s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 0.04; transform: scale(1); } 50% { opacity: 0.08; transform: scale(1.06); } }

/* ── Progress bar ── */
.progress-container { position: fixed; top: 0; left: 0; right: 0; height: 3px; background: rgba(128,128,128,0.1); z-index: 100; }
.progress-bar { height: 100%; background: var(--dot-active); transition: width 0.3s ease; width: 0; }

/* ── Nav dots ── */
.nav-dots { display: flex; gap: 8px; justify-content: center; margin-top: auto; padding-top: 1.5rem; }
.nav-dot {
  width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer;
  background: var(--dot-inactive); transition: all 0.3s ease;
}
.nav-dot.active { background: var(--dot-active); transform: scale(1.4); }

/* ── Title slide ── */
.title-slide { background: var(--title-bg); position: relative; overflow: hidden; }
.title-slide::before {
  content: ''; position: absolute; top: -20%; right: -10%;
  width: 50vw; height: 50vw; border-radius: 50%;
  background: var(--title-accent-bg); opacity: 0.08;
}
.title-slide::after {
  content: ''; position: absolute; bottom: -30%; left: -15%;
  width: 60vw; height: 60vw; border-radius: 50%;
  background: var(--title-accent-bg); opacity: 0.05;
}
.accent-badge {
  display: inline-block; padding: 8px 24px;
  background: var(--title-accent-bg); color: var(--title-accent-color);
  border-radius: 24px; font-size: var(--small-size); font-weight: 600;
  letter-spacing: 2px; text-transform: uppercase; margin-bottom: var(--content-gap);
  font-family: var(--body-font);
}
.title-slide h1 {
  font-family: var(--display-font); color: var(--title-color);
  font-size: clamp(2rem, 6vw, 5rem); line-height: 1.1; margin-bottom: var(--element-gap);
  font-weight: 800; letter-spacing: -0.02em;
}
.title-slide .subtitle {
  font-family: var(--body-font); color: var(--title-subtitle-color);
  font-size: var(--h3-size); line-height: 1.5; max-width: 600px;
  margin: 0 auto;
}

/* ── Section divider ── */
.divider-slide { background: var(--title-bg); position: relative; overflow: hidden; }
.divider-slide::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, transparent 40%, var(--title-accent-bg) 200%);
  opacity: 0.06;
}
.section-number {
  font-family: var(--display-font); font-size: clamp(4rem, 12vw, 10rem);
  color: var(--title-accent-bg); line-height: 1; opacity: 0.2;
  font-weight: 900;
}
.divider-line { width: 80px; height: 4px; background: var(--title-accent-bg); margin: var(--content-gap) auto; border-radius: 2px; }
.divider-slide h2 {
  font-family: var(--display-font); color: var(--title-color);
  font-size: var(--title-size); margin-bottom: var(--element-gap);
  font-weight: 700;
}
.divider-slide .subtitle {
  font-family: var(--body-font); color: var(--title-subtitle-color);
  font-size: var(--h3-size);
}

/* ── Content slide ── */
.content-slide { background: var(--content-bg); position: relative; }
.slide-header {
  padding-bottom: var(--element-gap); margin-bottom: var(--content-gap);
  border-bottom: 3px solid var(--content-header-border);
}
.slide-header h2 {
  font-family: var(--display-font); color: var(--content-title-color);
  font-size: var(--h2-size); font-weight: 700;
}

/* ── Bullet list ── */
.bullet-list { list-style: none; display: flex; flex-direction: column; gap: var(--element-gap); }
.bullet-list li {
  display: flex; align-items: flex-start; gap: 14px;
  font-family: var(--body-font); font-size: var(--body-size);
  color: var(--content-bullet-color); line-height: 1.6;
}
.bullet-list .dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 0.5em;
  background: var(--content-bullet-dot);
  box-shadow: 0 0 0 3px rgba(0,0,0,0.04);
}

/* ── Two column ── */
.two-column-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--content-gap); }
.two-column-grid .card {
  background: rgba(128,128,128,0.04); border-radius: 16px;
  padding: clamp(1.25rem, 2.5vw, 2.25rem);
  border: 1px solid rgba(128,128,128,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.two-column-grid .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
.card h3 {
  font-family: var(--display-font); font-size: var(--h3-size);
  color: var(--content-title-color); margin-bottom: var(--element-gap);
  font-weight: 700;
}
.card-label {
  display: inline-block; padding: 3px 12px; border-radius: 12px;
  font-size: var(--small-size); font-weight: 600;
  background: var(--title-accent-bg); color: var(--title-accent-color);
  margin-bottom: var(--element-gap);
}

/* ── Highlight slide ── */
.highlight-slide { background: var(--content-bg); position: relative; }
.highlight-slide::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(ellipse at center, var(--title-accent-bg) 0%, transparent 70%);
  opacity: 0.04;
}
.highlight-box {
  display: inline-block; padding: clamp(1.5rem, 4vw, 3rem) clamp(2rem, 5vw, 4rem);
  border-radius: 20px; font-family: var(--display-font);
  font-size: clamp(1.5rem, 4vw, 3rem); font-weight: 800; margin-bottom: var(--content-gap);
  background: var(--title-accent-bg); color: var(--title-accent-color);
  position: relative;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
}
.highlight-box::before {
  content: ''; position: absolute; top: -3px; left: -3px; right: -3px; bottom: -3px;
  border-radius: 22px; border: 2px solid var(--title-accent-bg);
  opacity: 0.2;
}
.pill-list { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
.pill {
  padding: 10px 24px; border: 2px solid var(--content-header-border); border-radius: 28px;
  font-size: var(--body-size); font-family: var(--body-font); color: var(--content-title-color);
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.pill:hover { transform: scale(1.05); border-color: var(--title-accent-bg); }

/* ── Feature grid ── */
.feature-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: clamp(1rem, 2vw, 1.5rem);
}
.feature-card {
  background: rgba(128,128,128,0.04); border-radius: 16px;
  padding: clamp(1.25rem, 2vw, 2rem); text-align: center;
  border: 1px solid rgba(128,128,128,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
.feature-card-number {
  display: inline-flex; align-items: center; justify-content: center;
  width: clamp(28px, 3vw, 40px); height: clamp(28px, 3vw, 40px);
  border-radius: 50%; background: var(--title-accent-bg); color: var(--title-accent-color);
  font-family: var(--display-font); font-size: clamp(0.8rem, 1.5vw, 1.2rem);
  font-weight: 700; margin-bottom: var(--element-gap);
}
.feature-name {
  font-family: var(--display-font); font-size: var(--h3-size);
  color: var(--content-title-color); font-weight: 700;
  margin-bottom: 6px; display: block;
}
.feature-desc {
  font-family: var(--body-font); font-size: var(--body-size);
  color: var(--content-bullet-color); line-height: 1.4;
}

/* ── Image slide ── */
.split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--content-gap); flex: 1; align-items: center; }
.image-side img { width: 100%; max-height: 50vh; object-fit: contain; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

/* ── Quote slide ── */
.quote-slide { background: var(--title-bg); position: relative; overflow: hidden; }
.quote-slide::before {
  content: '"'; position: absolute; top: 5%; left: 8%;
  font-family: var(--display-font); font-size: clamp(8rem, 20vw, 15rem);
  color: var(--title-accent-bg); opacity: 0.1; line-height: 1;
  pointer-events: none;
}
.quote-slide blockquote {
  font-family: var(--display-font); font-size: clamp(1.4rem, 3.5vw, 2.5rem);
  font-style: italic; font-weight: 500;
  color: var(--title-color); line-height: 1.5; max-width: 800px; margin: 0 auto;
  position: relative;
}
.quote-slide blockquote::before {
  content: ''; position: absolute; left: -20px; top: 0; bottom: 0; width: 4px;
  background: var(--title-accent-bg); border-radius: 2px;
}
.attribution {
  margin-top: var(--content-gap); font-family: var(--body-font);
  font-size: var(--body-size); color: var(--title-subtitle-color);
  font-weight: 500;
}
.attribution::before { content: '— '; }

/* ── Big Number slide ── */
.big-number-slide { background: var(--content-bg); position: relative; }
.big-number { font-family: var(--display-font); font-size: clamp(48px, 12vw, 96px); color: var(--title-accent-bg); line-height: 1; font-weight: 900; }
.big-number-label { font-family: var(--body-font); font-size: clamp(14px, 2vw, 22px); color: var(--content-title-color); margin-top: 12px; font-weight: 500; }
.big-number-pills { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: clamp(16px, 3vh, 28px); }
.big-number-pill { padding: 8px 20px; border-radius: 24px; font-size: var(--small-size); font-family: var(--body-font); color: var(--content-bullet-color); background: rgba(128,128,128,0.06); border: 1px solid rgba(128,128,128,0.1); }

/* ── Timeline slide ── */
.timeline-track { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--slide-padding); position: relative; }
.timeline-line { position: absolute; top: 50%; left: 12%; right: 12%; height: 3px; background: rgba(128,128,128,0.15); transform: translateY(-50%); }
.timeline-nodes { display: flex; justify-content: space-between; width: 76%; position: relative; z-index: 1; }
.timeline-node { text-align: center; width: 18%; }
.timeline-circle { width: clamp(28px,4vw,44px); height: clamp(28px,4vw,44px); border-radius: 50%; background: var(--title-accent-bg); color: var(--title-accent-color); display: flex; align-items: center; justify-content: center; font-family: var(--display-font); font-size: clamp(12px,1.5vw,18px); font-weight: 700; margin: 0 auto clamp(8px,1.5vh,14px); }
.timeline-step-title { font-family: var(--body-font); font-size: clamp(10px,1.2vw,14px); font-weight: 700; color: var(--content-title-color); margin-bottom: 4px; }
.timeline-step-desc { font-family: var(--body-font); font-size: clamp(9px,1vw,12px); color: var(--content-bullet-color); line-height: 1.4; }

/* ── Callout slide ── */
.callout-body { flex: 1; display: flex; gap: clamp(12px,2vw,24px); padding: 0 var(--slide-padding) var(--slide-padding); }
.callout-main { flex: 7; display: flex; flex-direction: column; justify-content: center; }
.callout-sidebar { flex: 3; background: var(--title-accent-bg); border-radius: 16px; padding: clamp(14px,2vw,28px); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: var(--title-accent-color); position: relative; overflow: hidden; }
.callout-label { font-size: clamp(9px,0.8vw,11px); font-weight: 700; opacity: 0.7; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: clamp(10px,2vh,18px); font-family: var(--body-font); }
.callout-text { font-family: var(--display-font); font-size: clamp(14px,1.8vw,22px); font-weight: 700; line-height: 1.5; }

/* ── Statement slide ── */
.statement-slide { background: var(--title-bg); position: relative; overflow: hidden; }
.statement-slide::before { content: ''; position: absolute; top: -20px; right: -20px; width: clamp(100px,18vw,200px); height: clamp(100px,18vw,200px); border-radius: 50%; background: var(--title-accent-bg); opacity: 0.06; }
.statement-text { font-family: var(--display-font); font-size: clamp(20px,4vw,42px); color: var(--title-color); line-height: 1.35; font-weight: 800; max-width: 85%; }
.statement-accent { width: clamp(40px,8vw,80px); height: 3px; background: var(--title-accent-bg); margin: clamp(12px,2vh,24px) auto 0; }
.statement-attr { font-size: clamp(11px,1.2vw,15px); color: var(--title-subtitle-color); margin-top: clamp(8px,1.5vh,16px); font-family: var(--body-font); }

/* ── Keyboard hint ── */
.keyboard-hint {
  position: fixed; bottom: 12px; right: 16px;
  font-size: 11px; color: rgba(128,128,128,0.4); font-family: var(--body-font);
  pointer-events: none;
}
`

// ── Navigation JS with reveal animation trigger ──

const NAV_JS = `
class SlidePresentation {
  constructor() {
    this.slides = document.querySelectorAll('.slide');
    this.current = 0;
    this.total = this.slides.length;
    this.setupObserver();
    this.updateDots();
    // Trigger first slide visibility
    if (this.slides[0]) this.slides[0].classList.add('visible');
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
    var bar = document.querySelector('.progress-bar');
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
          // Trigger reveal animations
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.3 });
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
    items.map(item => `<li class="reveal"><span class="dot"></span><span>${esc(item)}</span></li>`).join('') +
    '</ul>'
}

// ── Slide generators ──

function generateTitleSlide(slide: SlideData, total: number): string {
  const { title, subtitle, accent } = slide.content
  return `<section class="slide title-slide">
  <div class="slide-content" style="text-align:center;justify-content:center;">
    ${accent ? `<div class="accent-badge reveal-scale">${esc(accent)}</div>` : ''}
    <h1 class="reveal">${esc(title)}</h1>
    ${subtitle ? `<p class="subtitle reveal-fade">${esc(subtitle)}</p>` : ''}
    ${generateNavDots(total)}
  </div>
</section>`
}

function generateDividerSlide(slide: SlideData, idx: number, sectionIdx: number, total: number): string {
  const { title, subtitle } = slide.content
  const num = String(sectionIdx + 1).padStart(2, '0')
  return `<section class="slide divider-slide">
  <div class="slide-content" style="text-align:center;justify-content:center;">
    <div class="section-number reveal-scale">${esc(num)}</div>
    <div class="divider-line reveal"></div>
    <h2 class="reveal">${esc(title)}</h2>
    ${subtitle ? `<p class="subtitle reveal">${esc(subtitle)}</p>` : ''}
    ${generateNavDots(total)}
  </div>
</section>`
}

function generateContentSlide(slide: SlideData, slideNumber: number): string {
  const { title, body } = slide.content
  return `<section class="slide content-slide">
  <div class="slide-bg-number">${slideNumber}</div>
  <div class="slide-accent-bar"></div>
  <div class="slide-content">
    <div class="slide-header reveal"><h2>${esc(title)}</h2></div>
    <div style="font-size:18px">${generateBullets(body || [])}</div>
  </div>
  <div class="slide-corner-accent"></div>
</section>`
}

function generateTwoColumnSlide(slide: SlideData, slideNumber: number): string {
  const { title, leftTitle, leftBody, rightTitle, rightBody } = slide.content
  return `<section class="slide content-slide">
  <div class="slide-bg-number">${slideNumber}</div>
  <div class="slide-accent-bar"></div>
  <div class="slide-content">
    <div class="slide-header reveal"><h2>${esc(title)}</h2></div>
    <div class="two-column-grid">
      <div class="card reveal-left">
        ${leftTitle ? `<span class="card-label">${esc(leftTitle)}</span>` : ''}
        ${generateBullets(leftBody || [])}
      </div>
      <div class="card reveal">
        ${rightTitle ? `<span class="card-label">${esc(rightTitle)}</span>` : ''}
        ${generateBullets(rightBody || [])}
      </div>
    </div>
  </div>
  <div class="slide-corner-accent"></div>
</section>`
}

function generateHighlightSlide(slide: SlideData, total: number): string {
  const { title, highlight, body } = slide.content
  return `<section class="slide highlight-slide">
  <div class="slide-content" style="text-align:center;justify-content:center;">
    <h2 class="reveal" style="font-family:var(--display-font);color:var(--content-title-color);margin-bottom:var(--content-gap);font-weight:700;">${esc(title)}</h2>
    ${highlight ? `<div class="highlight-box reveal-scale">${esc(highlight)}</div>` : ''}
    ${body && body.length > 0 ? `<div class="pill-list reveal">${body.map(b => `<span class="pill">${esc(b)}</span>`).join('')}</div>` : ''}
    ${generateNavDots(total)}
  </div>
</section>`
}

function generateFeatureGridSlide(slide: SlideData, slideNumber: number): string {
  const { title, features, body } = slide.content
  const featuresHtml = (features || []).map((f, i) =>
    `<div class="feature-card reveal-scale" style="transition-delay:${i * 0.08}s;">
      <span class="feature-card-number">${i + 1}</span>
      <span class="feature-name">${esc(f.name)}</span>
      <span class="feature-desc">${esc(f.desc)}</span>
    </div>`
  ).join('')

  return `<section class="slide content-slide">
  <div class="slide-bg-number">${slideNumber}</div>
  <div class="slide-accent-bar"></div>
  <div class="slide-content">
    <div class="slide-header reveal"><h2>${esc(title)}</h2></div>
    <div class="feature-grid">${featuresHtml}</div>
    ${body && body.length > 0 ? `<div class="reveal" style="margin-top:var(--content-gap);text-align:center;font-family:var(--body-font);font-size:var(--body-size);color:var(--content-bullet-color);">${esc(body[0])}</div>` : ''}
  </div>
  <div class="slide-corner-accent"></div>
</section>`
}

function generateImageSlide(slide: SlideData, slideNumber: number): string {
  const { title, body, imageUrl } = slide.content
  return `<section class="slide content-slide">
  <div class="slide-bg-number">${slideNumber}</div>
  <div class="slide-accent-bar"></div>
  <div class="slide-content">
    <div class="slide-header reveal"><h2>${esc(title)}</h2></div>
    <div class="split-grid">
      <div class="text-side reveal">${generateBullets(body || [])}</div>
      <div class="image-side reveal">
        ${imageUrl ? `<img src="${imageUrl}" alt="${esc(title)}" loading="lazy" />` : ''}
      </div>
    </div>
  </div>
  <div class="slide-corner-accent"></div>
</section>`
}

function generateQuoteSlide(slide: SlideData, total: number): string {
  const { title, highlight, body } = slide.content
  return `<section class="slide quote-slide">
  <div class="slide-content" style="text-align:center;justify-content:center;">
    <blockquote class="reveal-fade">${highlight ? esc(highlight) : ''}</blockquote>
    ${title ? `<p class="attribution reveal">${esc(title)}</p>` : ''}
    ${body && body.length > 0 ? `<div class="reveal" style="margin-top:var(--content-gap);max-width:600px;margin-left:auto;margin-right:auto;">
      ${generateBullets(body)}
    </div>` : ''}
    ${generateNavDots(total)}
  </div>
</section>`
}

function generateBigNumberSlide(slide: SlideData): string {
  const { title, highlight, body } = slide.content
  const pillsHtml = (body || []).map(b => `<span class="big-number-pill reveal">${esc(b)}</span>`).join('')
  return `<section class="slide big-number-slide">
  <div class="slide-accent-bar"></div>
  <div class="slide-content" style="text-align:center;justify-content:center;">
    ${highlight ? `<div class="big-number reveal-scale">${esc(highlight)}</div>` : ''}
    <div class="big-number-label reveal">${esc(title)}</div>
    ${pillsHtml ? `<div class="big-number-pills reveal">${pillsHtml}</div>` : ''}
  </div>
</section>`
}

function generateTimelineSlide(slide: SlideData): string {
  const { title, features } = slide.content
  const nodesHtml = (features || []).map((f, i) =>
    `<div class="timeline-node reveal-scale" style="transition-delay:${i * 0.1}s;">
      <div class="timeline-circle">${i + 1}</div>
      <div class="timeline-step-title">${esc(f.name)}</div>
      <div class="timeline-step-desc">${esc(f.desc)}</div>
    </div>`
  ).join('')
  return `<section class="slide content-slide">
  <div class="slide-bg-number">${title ? '' : ''}</div>
  <div class="slide-accent-bar"></div>
  <div class="slide-content">
    <div class="slide-header reveal"><h2>${esc(title)}</h2></div>
    <div class="timeline-track">
      <div class="timeline-line"></div>
      <div class="timeline-nodes">${nodesHtml}</div>
    </div>
  </div>
</section>`
}

function generateCalloutSlide(slide: SlideData): string {
  const { title, body, highlight, accent } = slide.content
  const bulletsHtml = generateBullets(body || [])
  return `<section class="slide content-slide">
  <div class="slide-accent-bar"></div>
  <div class="slide-content">
    <div class="slide-header reveal"><h2>${esc(title)}</h2></div>
    <div class="callout-body">
      <div class="callout-main reveal-left">${bulletsHtml}</div>
      <div class="callout-sidebar reveal-scale">
        <div class="callout-label">${esc(accent || '核心概念')}</div>
        <div class="callout-text">${highlight ? esc(highlight) : ''}</div>
      </div>
    </div>
  </div>
</section>`
}

function generateStatementSlide(slide: SlideData): string {
  const { title, highlight } = slide.content
  return `<section class="slide statement-slide">
  <div class="slide-content" style="text-align:center;justify-content:center;">
    <div class="statement-text reveal-scale">${esc(highlight || title)}</div>
    <div class="statement-accent"></div>
    ${title && highlight ? `<div class="statement-attr reveal">\u2014 ${esc(title)}</div>` : ''}
  </div>
</section>`
}

function generateSlide(slide: SlideData, index: number, total: number, sectionIdx: number): string {
  const slideNumber = index + 1
  switch (slide.layout) {
    case 'title': return generateTitleSlide(slide, total)
    case 'section-divider': return generateDividerSlide(slide, index, sectionIdx, total)
    case 'two-column': return generateTwoColumnSlide(slide, slideNumber)
    case 'highlight': return generateHighlightSlide(slide, total)
    case 'feature-grid': return generateFeatureGridSlide(slide, slideNumber)
    case 'image': return generateImageSlide(slide, slideNumber)
    case 'quote': return generateQuoteSlide(slide, total)
    case 'big-number': return generateBigNumberSlide(slide)
    case 'timeline': return generateTimelineSlide(slide)
    case 'callout': return generateCalloutSlide(slide)
    case 'statement': return generateStatementSlide(slide)
    case 'content':
    default: return generateContentSlide(slide, slideNumber)
  }
}

// ── Main export ──

export function generateHTML(project: ProjectData): string {
  const styleConfig = getStyleConfig(project.style)
  const total = project.slides.length

  // Track section index for divider numbering
  const sectionCounter = { value: 0 }

  const slidesHtml = project.slides
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((slide, i) => {
      if (slide.layout === 'section-divider') {
        const idx = sectionCounter.value
        sectionCounter.value++
        return generateSlide(slide, i, total, idx)
      }
      return generateSlide(slide, i, total, 0)
    })
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
