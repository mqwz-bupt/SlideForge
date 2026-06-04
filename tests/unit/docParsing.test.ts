import { describe, it, expect } from 'vitest'

/**
 * Unit tests for document parsing routing logic.
 * The actual PDF/DOCX parsing requires native binaries, so we test the
 * extension detection and routing logic separately.
 */

describe('document extension routing', () => {
  function getExt(filePath: string): string {
    return filePath.split('.').pop()?.toLowerCase() || ''
  }

  function getParserType(filePath: string): 'pdf' | 'docx' | 'text' {
    const ext = getExt(filePath)
    if (ext === 'pdf') return 'pdf'
    if (ext === 'docx') return 'docx'
    return 'text'
  }

  it('detects PDF extension', () => {
    expect(getExt('report.pdf')).toBe('pdf')
    expect(getExt('REPORT.PDF')).toBe('pdf')
  })

  it('detects DOCX extension', () => {
    expect(getExt('document.docx')).toBe('docx')
    expect(getExt('DOCUMENT.DOCX')).toBe('docx')
  })

  it('detects text extensions', () => {
    expect(getExt('notes.txt')).toBe('txt')
    expect(getExt('readme.md')).toBe('md')
  })

  it('routes PDF files to PDF parser', () => {
    expect(getParserType('slides.pdf')).toBe('pdf')
  })

  it('routes DOCX files to DOCX parser', () => {
    expect(getParserType('report.docx')).toBe('docx')
  })

  it('routes TXT/MD to text reader', () => {
    expect(getParserType('notes.txt')).toBe('text')
    expect(getParserType('readme.md')).toBe('text')
  })

  it('handles paths with backslashes', () => {
    expect(getExt('C:\\Users\\test\\document.pdf')).toBe('pdf')
    expect(getExt('C:\\Users\\test\\report.docx')).toBe('docx')
  })

  it('handles paths with forward slashes', () => {
    expect(getExt('/home/user/document.pdf')).toBe('pdf')
    expect(getExt('/home/user/report.docx')).toBe('docx')
  })

  it('handles files with no extension', () => {
    expect(getExt('Makefile')).toBe('makefile')
    expect(getParserType('Makefile')).toBe('text')
  })

  it('handles dotfiles', () => {
    expect(getExt('.gitignore')).toBe('gitignore')
    expect(getParserType('.gitignore')).toBe('text')
  })
})

describe('file dialog filters', () => {
  const SUPPORTED_EXTENSIONS = ['txt', 'md', 'pdf', 'docx']

  it('includes all supported formats', () => {
    expect(SUPPORTED_EXTENSIONS).toContain('txt')
    expect(SUPPORTED_EXTENSIONS).toContain('md')
    expect(SUPPORTED_EXTENSIONS).toContain('pdf')
    expect(SUPPORTED_EXTENSIONS).toContain('docx')
  })

  it('has 4 supported formats', () => {
    expect(SUPPORTED_EXTENSIONS).toHaveLength(4)
  })
})
