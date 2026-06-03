import { describe, it, expect } from 'vitest'
import { repairJSON, cleanText, cleanSlideStrings, extractJSON } from '../../src/renderer/src/shared/utils/slideUtils'

describe('repairJSON', () => {
  it('fixes trailing commas before ] or }', () => {
    expect(repairJSON('[1, 2, 3,]')).toBe('[1, 2, 3]')
    expect(repairJSON('{"a": 1,}')).toBe('{"a": 1}')
    expect(repairJSON('{"a": [1, 2,], "b": 3,}')).toBe('{"a": [1, 2], "b": 3}')
  })

  it('fixes unquoted string values', () => {
    const input = '{"title": Hello World}'
    const result = repairJSON(input)
    expect(JSON.parse(result).title).toBe('Hello World')
  })

  it('preserves valid JSON', () => {
    const valid = '{"title": "test", "body": ["a", "b"]}'
    expect(repairJSON(valid)).toBe(valid)
  })

  it('handles nested unquoted values in arrays', () => {
    const input = '["hello", world, "foo"]'
    const result = repairJSON(input)
    const parsed = JSON.parse(result)
    expect(parsed[1]).toBe('world')
  })
})

describe('cleanText', () => {
  it('strips markdown table separators', () => {
    expect(cleanText('|---|---|')).toBe('')
    expect(cleanText('| ------ |')).toBe('')
  })

  it('strips table cell pipes but keeps content', () => {
    expect(cleanText('| Hello | World |').includes('Hello')).toBe(true)
    expect(cleanText('| Hello | World |').includes('World')).toBe(true)
  })

  it('strips bold/italic markers', () => {
    expect(cleanText('**bold**')).toBe('bold')
    expect(cleanText('*italic*')).toBe('italic')
    expect(cleanText('***both***')).toBe('both')
  })

  it('strips inline code backticks', () => {
    expect(cleanText('`code`')).toBe('code')
  })

  it('strips heading markers', () => {
    expect(cleanText('## Title')).toBe('Title')
    expect(cleanText('### Sub Title')).toBe('Sub Title')
  })

  it('returns non-string input unchanged', () => {
    expect(cleanText(42 as any)).toBe(42)
  })

  it('handles empty string', () => {
    expect(cleanText('')).toBe('')
  })
})

describe('cleanSlideStrings', () => {
  it('cleans body array items', () => {
    const slide = { body: ['**bold text**', '`code here`'] }
    const result = cleanSlideStrings(slide)
    expect(result.body[0]).toBe('bold text')
    expect(result.body[1]).toBe('code here')
  })

  it('cleans features array', () => {
    const slide = {
      features: [
        { name: '**Bold**', desc: '`code` desc' }
      ]
    }
    const result = cleanSlideStrings(slide)
    expect(result.features[0].name).toBe('Bold')
    expect(result.features[0].desc).toBe('code desc')
  })

  it('cleans title and subtitle', () => {
    const slide = { title: '## Heading', subtitle: '**bold**' }
    const result = cleanSlideStrings(slide)
    expect(result.title).toBe('Heading')
    expect(result.subtitle).toBe('bold')
  })

  it('truncates long strings', () => {
    const longBody = 'a'.repeat(100)
    const slide = { body: [longBody] }
    const result = cleanSlideStrings(slide)
    expect(result.body[0].length).toBeLessThanOrEqual(41) // 40 + …
  })

  it('preserves non-string fields', () => {
    const slide = { layout: 'content', order: 1 }
    const result = cleanSlideStrings(slide)
    expect(result.layout).toBe('content')
    expect(result.order).toBe(1)
  })
})

describe('extractJSON', () => {
  it('extracts from ```json code block', () => {
    const text = 'Here is the result:\n```json\n{"title": "test"}\n```\nDone.'
    const result = extractJSON(text)
    expect(JSON.parse(result).title).toBe('test')
  })

  it('extracts raw JSON object from text', () => {
    const text = 'Some text {"title": "test"} more text'
    const result = extractJSON(text)
    expect(JSON.parse(result).title).toBe('test')
  })

  it('returns raw text when no JSON found', () => {
    const text = 'plain text'
    expect(extractJSON(text)).toBe('plain text')
  })

  it('repairs broken JSON in code block', () => {
    const text = '```json\n{"title": Hello}\n```'
    const result = extractJSON(text)
    expect(JSON.parse(result).title).toBe('Hello')
  })

  it('returns raw when even repair fails', () => {
    const text = '```json\n{invalid {{{json\n```'
    const result = extractJSON(text)
    expect(typeof result).toBe('string')
  })
})
