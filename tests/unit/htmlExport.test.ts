import { describe, it, expect } from 'vitest'
import { esc, sanitizeUrl } from '../../src/main/export/html'

describe('esc — HTML entity encoding', () => {
  it('escapes ampersands', () => {
    expect(esc('a & b')).toBe('a &amp; b')
  })

  it('escapes angle brackets', () => {
    expect(esc('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('escapes double quotes', () => {
    expect(esc('say "hello"')).toBe('say &quot;hello&quot;')
  })

  it('escapes single quotes', () => {
    expect(esc("it's")).toBe('it&#39;s')
  })

  it('escapes all special chars combined', () => {
    expect(esc('<div class="test" onclick=\'x\'>&</div>')).toBe(
      '&lt;div class=&quot;test&quot; onclick=&#39;x&#39;&gt;&amp;&lt;/div&gt;'
    )
  })

  it('leaves plain text unchanged', () => {
    expect(esc('Hello World 123')).toBe('Hello World 123')
  })

  it('handles empty string', () => {
    expect(esc('')).toBe('')
  })
})

describe('sanitizeUrl — URL protocol validation', () => {
  it('allows https URLs', () => {
    expect(sanitizeUrl('https://example.com/image.png')).toBe('https://example.com/image.png')
  })

  it('allows http URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com')
  })

  it('allows data:image URIs', () => {
    expect(sanitizeUrl('data:image/png;base64,abc123')).toBe('data:image/png;base64,abc123')
  })

  it('allows data:image/svg+xml', () => {
    expect(sanitizeUrl('data:image/svg+xml,<svg></svg>')).toBe('data:image/svg+xml,<svg></svg>')
  })

  it('blocks javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('')
  })

  it('blocks data:text/html', () => {
    expect(sanitizeUrl('data:text/html,<h1>hello</h1>')).toBe('')
  })

  it('blocks vbscript: protocol', () => {
    expect(sanitizeUrl('vbscript:msgbox')).toBe('')
  })

  it('blocks relative URLs', () => {
    expect(sanitizeUrl('/etc/passwd')).toBe('')
  })

  it('blocks empty string', () => {
    expect(sanitizeUrl('')).toBe('')
  })

  it('trims whitespace before validation', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com')
  })
})
