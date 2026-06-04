import { describe, it, expect } from 'vitest'
import { generateHTML } from '../../src/main/export/html'

/** Build a minimal project with the given slides */
function makeProject(slides: any[], style = 'bold-signal') {
  return {
    id: 'test-project',
    name: 'Test Presentation',
    style,
    slides: slides.map((s, i) => ({ order: i + 1, id: `s${i}`, sectionId: 'sec1', ...s }))
  }
}

describe('generateHTML — layout coverage', () => {
  it('generates valid HTML with title slide', () => {
    const project = makeProject([
      { layout: 'title', content: { title: 'Hello World', subtitle: 'Test Sub' } }
    ])
    const html = generateHTML(project)
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('Hello World')
    expect(html).toContain('Test Sub')
    expect(html).toContain('title-slide')
    expect(html).toContain('</html>')
  })

  it('generates content slide with bullets', () => {
    const project = makeProject([
      { layout: 'content', content: { title: 'Content Page', body: ['Point A', 'Point B'] } }
    ])
    const html = generateHTML(project)
    expect(html).toContain('content-slide')
    expect(html).toContain('Point A')
    expect(html).toContain('bullet-list')
  })

  it('generates two-column layout', () => {
    const project = makeProject([
      {
        layout: 'two-column',
        content: {
          title: 'Comparison',
          leftTitle: 'Side A',
          leftBody: ['a1', 'a2'],
          rightTitle: 'Side B',
          rightBody: ['b1', 'b2']
        }
      }
    ])
    const html = generateHTML(project)
    expect(html).toContain('two-column-grid')
    expect(html).toContain('Side A')
    expect(html).toContain('Side B')
  })

  it('generates feature-grid layout', () => {
    const project = makeProject([
      {
        layout: 'feature-grid',
        content: {
          title: 'Features',
          features: [
            { name: 'Feature 1', desc: 'Description 1' },
            { name: 'Feature 2', desc: 'Description 2' },
            { name: 'Feature 3', desc: 'Description 3' }
          ]
        }
      }
    ])
    const html = generateHTML(project)
    expect(html).toContain('feature-grid')
    expect(html).toContain('Feature 1')
    expect(html).toContain('feature-card')
  })

  it('generates highlight layout', () => {
    const project = makeProject([
      {
        layout: 'highlight',
        content: { title: 'Key Point', highlight: 'Important!', body: ['a', 'b'] }
      }
    ])
    const html = generateHTML(project)
    expect(html).toContain('highlight-slide')
    expect(html).toContain('Important!')
  })

  it('generates quote layout', () => {
    const project = makeProject([
      {
        layout: 'quote',
        content: { title: 'Author Name', highlight: 'To be or not to be', body: ['interp'] }
      }
    ])
    const html = generateHTML(project)
    expect(html).toContain('quote-slide')
    expect(html).toContain('To be or not to be')
  })

  it('generates big-number layout', () => {
    const project = makeProject([
      {
        layout: 'big-number',
        content: { title: 'Users', highlight: '99.7%', body: ['detail'] }
      }
    ])
    const html = generateHTML(project)
    expect(html).toContain('big-number')
    expect(html).toContain('99.7%')
  })

  it('generates timeline layout', () => {
    const project = makeProject([
      {
        layout: 'timeline',
        content: {
          title: 'Timeline',
          features: [
            { name: 'Step 1', desc: 'First' },
            { name: 'Step 2', desc: 'Second' },
            { name: 'Step 3', desc: 'Third' }
          ]
        }
      }
    ])
    const html = generateHTML(project)
    expect(html).toContain('timeline')
    expect(html).toContain('Step 1')
  })

  it('generates callout layout', () => {
    const project = makeProject([
      {
        layout: 'callout',
        content: { title: 'Note', accent: 'Key', highlight: 'Remember this', body: ['detail'] }
      }
    ])
    const html = generateHTML(project)
    expect(html).toContain('callout')
    expect(html).toContain('Remember this')
  })

  it('generates statement layout', () => {
    const project = makeProject([
      {
        layout: 'statement',
        content: { title: 'Context', highlight: 'Core statement' }
      }
    ])
    const html = generateHTML(project)
    expect(html).toContain('statement-slide')
    expect(html).toContain('Core statement')
  })

  it('generates section-divider layout', () => {
    const project = makeProject([
      { layout: 'section-divider', content: { title: 'Chapter 2', subtitle: 'Moving on' } }
    ])
    const html = generateHTML(project)
    expect(html).toContain('divider-slide')
    expect(html).toContain('Chapter 2')
  })

  it('includes viewport CSS in all outputs', () => {
    const project = makeProject([
      { layout: 'title', content: { title: 'Test' } }
    ])
    const html = generateHTML(project)
    expect(html).toContain('100vh')
    expect(html).toContain('100dvh')
    expect(html).toContain('scroll-snap')
  })

  it('includes reveal animations', () => {
    const project = makeProject([
      { layout: 'content', content: { title: 'Test', body: ['A'] } }
    ])
    const html = generateHTML(project)
    expect(html).toContain('reveal')
    expect(html).toContain('transition-delay')
  })

  it('includes navigation JS', () => {
    const project = makeProject([
      { layout: 'title', content: { title: 'Test' } },
      { layout: 'content', content: { title: 'Page 2', body: ['A'] } }
    ])
    const html = generateHTML(project)
    expect(html).toContain('SlidePresentation')
    expect(html).toContain('nav-dot')
    expect(html).toContain('progress-bar')
  })

  it('escapes HTML in content', () => {
    const project = makeProject([
      { layout: 'content', content: { title: 'A < B & C > D', body: ['<script>alert(1)</script>'] } }
    ])
    const html = generateHTML(project)
    expect(html).toContain('A &lt; B &amp; C &gt; D')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
  })
})

describe('generateHTML — theme application', () => {
  const themes = ['bold-signal', 'neon-cyber', 'terminal-green', 'paper-ink']

  for (const theme of themes) {
    it(`applies ${theme} theme correctly`, () => {
      const project = makeProject([
        { layout: 'title', content: { title: 'Theme Test' } }
      ], theme)
      const html = generateHTML(project)
      expect(html).toContain('--display-font')
      expect(html).toContain('--body-font')
      expect(html).toContain('--title-bg')
      expect(html).toContain('--title-accent-bg')
    })
  }
})
