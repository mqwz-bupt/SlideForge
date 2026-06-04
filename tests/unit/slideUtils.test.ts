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

  it('fixes unquoted object keys', () => {
    const input = '{title:"AI导论",sections:[{order:1,title:"概述"}]}'
    const result = repairJSON(input)
    const parsed = JSON.parse(result)
    expect(parsed.title).toBe('AI导论')
    expect(parsed.sections[0].order).toBe(1)
    expect(parsed.sections[0].title).toBe('概述')
  })

  it('fixes mixed quoted/unquoted keys in nested objects', () => {
    const input = '{"sections":[{"order":1,title:"技术"},{order:2,"title":"应用"}]}'
    const result = repairJSON(input)
    const parsed = JSON.parse(result)
    expect(parsed.sections[0].title).toBe('技术')
    expect(parsed.sections[1].title).toBe('应用')
  })

  it('replaces single-quoted strings with double quotes', () => {
    const input = "{'title': 'Hello', 'body': ['a', 'b']}"
    const result = repairJSON(input)
    const parsed = JSON.parse(result)
    expect(parsed.title).toBe('Hello')
    expect(parsed.body).toEqual(['a', 'b'])
  })

  it('handles first unquoted element in array', () => {
    const input = '[hello, "world"]'
    const result = repairJSON(input)
    const parsed = JSON.parse(result)
    expect(parsed[0]).toBe('hello')
    expect(parsed[1]).toBe('world')
  })

  it('preserves Chinese curly quotes inside ASCII-quoted string values', () => {
    const input = '{"title":"\u201cAI\u201d\u91cd\u8981\u6027","body":["test"]}'
    const result = repairJSON(input)
    const parsed = JSON.parse(result)
    expect(parsed.title).toBe('\u201cAI\u201d\u91cd\u8981\u6027')
  })

  it('handles Chinese quotes used as JSON delimiters', () => {
    const input = '{\u201ctitle\u201d:\u201cHello World\u201d}'
    const result = repairJSON(input)
    const parsed = JSON.parse(result)
    expect(parsed.title).toBe('Hello World')
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

  it('does not truncate body items containing math', () => {
    const longFormula = '$$\\text{明暗法: } I_{\\text{表面}} = I_{\\text{光源}} \\cdot \\cos(\\theta)$$'
    const slide = { body: [longFormula] }
    const result = cleanSlideStrings(slide)
    expect(result.body[0]).toBe(longFormula)
    expect(result.body[0].length).toBeGreaterThan(40)
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

  it('fixes missing commas between properties', () => {
    const text = '{"title":"AI" "sections":[]}'
    const result = extractJSON(text)
    const parsed = JSON.parse(result)
    expect(parsed.title).toBe('AI')
    expect(parsed.sections).toEqual([])
  })

  it('strips invisible characters', () => {
    const text = '{"title":"AI\u200b导论"}'
    const result = extractJSON(text)
    const parsed = JSON.parse(result)
    expect(parsed.title).toBe('AI导论')
  })

  it('handles realistic AI outline output', () => {
    const text = '{"title":"人工智能导论","sections":[{"order":1,"title":"基本概念","points":["AI的定义","图灵测试"]},{"order":2,"title":"机器学习","points":["监督学习","无监督学习"]}],"estimatedMinutes":15}'
    const result = extractJSON(text)
    const parsed = JSON.parse(result)
    expect(parsed.sections.length).toBe(2)
    expect(parsed.sections[0].points.length).toBe(2)
  })
})
