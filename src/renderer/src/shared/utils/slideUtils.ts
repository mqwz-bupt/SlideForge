/** Repair common AI JSON mistakes: trailing commas, unquoted strings, unquoted keys, single quotes */
export function repairJSON(json: string): string {
  // Fix trailing commas before ] or }
  let s = json.replace(/,\s*([}\]])/g, '$1')

  // Replace non-standard quotes (single, Chinese) with double-quoted strings
  s = replaceNonstandardQuotes(s)

  // Walk the string to fix unquoted values AND unquoted keys
  // Track whether we're inside an object {} or array [] context
  let result = ''
  let i = 0
  let inStr = false
  const contextStack: ('o' | 'a')[] = [] // 'o'=object, 'a'=array

  const inObject = () => contextStack.length === 0 || contextStack[contextStack.length - 1] === 'o'

  while (i < s.length) {
    if (s[i] === '"' && (i === 0 || s[i - 1] !== '\\')) {
      inStr = !inStr
      result += s[i]; i++; continue
    }
    if (inStr) {
      const code = s.charCodeAt(i)
      if (s[i] === '\n' || s[i] === '\r' || s[i] === '\t' || code < 0x20) {
        result += ' '
      } else {
        result += s[i]
      }
      i++
      continue
    }

    // Track context: push on { or [, pop on } or ]
    if (s[i] === '{') {
      contextStack.push('o')
      result += s[i]; i++
      // Check if first key is unquoted
      while (i < s.length && ' \t\n\r'.includes(s[i])) { result += s[i]; i++ }
      if (i < s.length && /[a-zA-Z_\u4e00-\u9fff]/.test(s[i])) {
        let start = i
        while (i < s.length && /[a-zA-Z0-9_\u4e00-\u9fff]/.test(s[i])) i++
        const key = s.substring(start, i)
        result += '"' + key + '"'
        while (i < s.length && ' \t\n\r'.includes(s[i])) { result += s[i]; i++ }
        if (i < s.length && s[i] !== ':') result += ':'
      }
      continue
    }
    if (s[i] === '[') {
      contextStack.push('a')
      result += s[i]; i++
      // Check if first array element is unquoted
      while (i < s.length && ' \t\n\r'.includes(s[i])) { result += s[i]; i++ }
      if (i < s.length && !'"{[0123456789-tfnnull'.includes(s[i]) && s[i] !== ']' && s[i] !== '}') {
        let start = i
        while (i < s.length && s[i] !== ',' && s[i] !== ']' && s[i] !== '}') i++
        let val = s.substring(start, i).trim()
        if (val.endsWith('"')) val = val.slice(0, -1).trim()
        result += '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
      }
      continue
    }
    if (s[i] === '}' || s[i] === ']') {
      if (contextStack.length > 0) contextStack.pop()
      result += s[i]; i++; continue
    }

    // After , in object context — check for unquoted KEY
    if (s[i] === ',' && inObject()) {
      result += s[i]; i++
      while (i < s.length && ' \t\n\r'.includes(s[i])) { result += s[i]; i++ }
      // If next char is a letter/underscore/CJK (unquoted key), quote it
      if (i < s.length && /[a-zA-Z_\u4e00-\u9fff]/.test(s[i])) {
        let start = i
        while (i < s.length && /[a-zA-Z0-9_\u4e00-\u9fff]/.test(s[i])) i++
        const key = s.substring(start, i)
        result += '"' + key + '"'
        // Skip whitespace after key
        while (i < s.length && ' \t\n\r'.includes(s[i])) { result += s[i]; i++ }
        // If no colon after key, add one
        if (i < s.length && s[i] !== ':') {
          result += ':'
        }
        continue
      }
      continue
    }

    // After , in array context — check for unquoted VALUE
    if (s[i] === ',' && !inObject()) {
      result += s[i]; i++
      while (i < s.length && ' \t\n\r'.includes(s[i])) { result += s[i]; i++ }
      if (i < s.length && !'"{[0123456789-tfnnull'.includes(s[i]) && s[i] !== ']' && s[i] !== '}') {
        let start = i
        while (i < s.length && s[i] !== ',' && s[i] !== ']' && s[i] !== '}') i++
        let val = s.substring(start, i).trim()
        if (val.endsWith('"')) val = val.slice(0, -1).trim()
        result += '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
        continue
      }
      continue
    }

    // After : — check for unquoted string VALUE
    if (s[i] === ':') {
      result += s[i]; i++
      while (i < s.length && ' \t\n\r'.includes(s[i])) { result += s[i]; i++ }
      if (i < s.length && !'"{[0123456789-tfnnull'.includes(s[i]) && s[i] !== ']' && s[i] !== '}') {
        let start = i
        while (i < s.length && s[i] !== ',' && s[i] !== ']' && s[i] !== '}') i++
        let val = s.substring(start, i).trim()
        if (val.endsWith('"')) val = val.slice(0, -1).trim()
        result += '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
        continue
      }
      continue
    }

    result += s[i]; i++
  }
  return result
}

/** Replace single-quoted and Chinese-quoted strings with double-quoted in JSON context.
 *  String-boundary aware: only replaces quotes OUTSIDE existing ASCII double-quoted strings,
 *  so Chinese quotes inside "..." values are preserved as content. */
function replaceNonstandardQuotes(s: string): string {
  let result = ''
  let i = 0
  let inStr = false
  // Track what kind of quote opened the string, so we know what can close it
  // 'ascii' = opened by ", 'chinese' = opened by \u201c/\u201d, 'single' = opened by '/\u2018
  let openedBy: 'ascii' | 'chinese' | 'single' = 'ascii'

  while (i < s.length) {
    const ch = s[i]

    if (inStr) {
      if (ch === '\\' && i + 1 < s.length) {
        result += ch + s[i + 1]
        i += 2; continue
      }
      // ASCII " always closes any string type
      if (ch === '"') {
        inStr = false
        result += ch; i++; continue
      }
      // Matching non-ASCII closers
      if (ch === '\u201d' && (openedBy === 'chinese' || openedBy === 'single')) {
        inStr = false
        result += '"'; i++; continue
      }
      if ((ch === "'" || ch === '\u2019') && openedBy === 'single') {
        inStr = false
        result += '"'; i++; continue
      }
      // All other chars (including mismatched quotes) are content
      result += ch; i++; continue
    }

    // Outside a string
    if (ch === '"') {
      inStr = true
      openedBy = 'ascii'
      result += ch; i++; continue
    }
    if (ch === '\u201c' || ch === '\u201d') {
      inStr = true
      openedBy = 'chinese'
      result += '"'; i++; continue
    }
    if (ch === "'" || ch === '\u2018' || ch === '\u2019') {
      inStr = true
      openedBy = 'single'
      result += '"'; i++; continue
    }

    result += ch; i++
  }
  return result
}

/** Strip any markdown formatting artifacts from a string, preserving math delimiters */
export function cleanText(s: string): string {
  if (typeof s !== 'string') return s

  // Temporarily protect math regions so markdown stripping doesn't break LaTeX
  const mathRegions: string[] = []
  let protected_ = s
    .replace(/\$\$[\s\S]*?\$\$/g, (m) => { mathRegions.push(m); return `\x00M${mathRegions.length - 1}\x00` })
    .replace(/\\\[[\s\S]*?\\\]/g, (m) => { mathRegions.push(m); return `\x00M${mathRegions.length - 1}\x00` })
    .replace(/\\\([\s\S]*?\\\)/g, (m) => { mathRegions.push(m); return `\x00M${mathRegions.length - 1}\x00` })
    .replace(/\$[^$\n]+?\$/g, (m) => { mathRegions.push(m); return `\x00M${mathRegions.length - 1}\x00` })

  protected_ = protected_
    // Remove markdown table rows: |---|---| or |------|
    .replace(/^\|?[-:\s|]+\|?$/gm, '')
    // Remove table cell pipes but keep content: | text | → text
    .replace(/\|\s*/g, ' ')
    .replace(/\s*\|/g, ' ')
    // Remove code block markers
    .replace(/```[\s\S]*?```/g, '')
    .replace(/```/g, '')
    // Remove bold/italic markers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // Remove inline code backticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove excess whitespace
    .replace(/\s{2,}/g, ' ')
    .trim()

  // Restore math regions
  protected_ = protected_.replace(/\x00M(\d+)\x00/g, (_, i) => mathRegions[Number(i)])
  return protected_
}

/** Check if a string contains math delimiters that should not be truncated */
function hasMath(s: string): boolean {
  return /\$\$|\\\[|\\\(|\$[^$\n]+?\$/.test(s)
}

/** Clean all string fields in a slide object */
export function cleanSlideStrings(slide: any): any {
  const truncate = (s: string, max: number) => {
    const c = cleanText(s)
    if (hasMath(c)) return c // Don't truncate math expressions
    return c.length > max ? c.slice(0, max - 1) + '…' : c
  }
  const result: any = {}
  for (const [k, v] of Object.entries(slide)) {
    if (k === 'body' || k === 'leftBody' || k === 'rightBody') {
      result[k] = Array.isArray(v) ? v.map((item: any) => typeof item === 'string' ? truncate(item, 40) : item) : v
    } else if (k === 'features' && Array.isArray(v)) {
      result[k] = v.map((f: any) => ({
        ...f,
        name: typeof f.name === 'string' ? truncate(f.name, 20) : f.name,
        desc: typeof f.desc === 'string' ? truncate(f.desc, 30) : f.desc
      }))
    } else if (typeof v === 'string') {
      result[k] = k === 'title' || k === 'subtitle' ? truncate(v, 50) : truncate(v, 60)
    } else {
      result[k] = v
    }
  }
  return result
}

/** Replace CJK punctuation with ASCII equivalents (commas, colons, angle brackets).
 *  Chinese curly quotes are NOT replaced here — they are handled by replaceNonstandardQuotes()
 *  which is string-boundary aware and won't break quotes inside JSON string values. */
function normalizeCJKPunctuation(text: string): string {
  return text
    .replace(/\u3001/g, ',')            // 、→ ,
    .replace(/\uff0c/g, ',')            // ，→ ,
    .replace(/\uff1a/g, ':')            // ：→ :
    .replace(/\u300a/g, '<')            // 《→ <
    .replace(/\u300b/g, '>')            // 》→ >
}

/** Strip single-line (// ...) and multi-line comments from JSON */
function stripJSONComments(text: string): string {
  let result = ''
  let i = 0
  let inStr = false

  while (i < text.length) {
    const ch = text[i]

    if (inStr) {
      result += ch
      if (ch === '\\' && i + 1 < text.length) {
        result += text[++i]
      } else if (ch === '"') {
        inStr = false
      }
      i++
      continue
    }

    if (ch === '"') {
      inStr = true
      result += ch
      i++
    } else if (ch === '/' && i + 1 < text.length && text[i + 1] === '/') {
      i += 2
      while (i < text.length && text[i] !== '\n') i++
    } else if (ch === '/' && i + 1 < text.length && text[i + 1] === '*') {
      i += 2
      while (i < text.length && !(text[i] === '*' && i + 1 < text.length && text[i + 1] === '/')) i++
      i += 2
    } else {
      result += ch
      i++
    }
  }

  return result
}

/** Strip invisible/control characters that AI models sometimes inject */
function stripInvisibleChars(s: string): string {
  // Remove zero-width chars, BOM, non-breaking space, and other control chars
  // Keep \n \r \t as they may be significant for multiline JSON
  return s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f\u200b\u200c\u200d\u200e\u200f\ufeff\u00a0\u2028\u2029]/g, '')
}

/** Fix missing commas between object properties: `"a":1 "b":2` → `"a":1,"b":2` */
function fixMissingCommas(s: string): string {
  let result = ''
  let i = 0
  let inStr = false

  while (i < s.length) {
    if (s[i] === '\\' && inStr && i + 1 < s.length) {
      result += s[i] + s[i + 1]; i += 2; continue
    }
    if (s[i] === '"') inStr = !inStr
    result += s[i]; i++

    // After closing " of a string value (not in a string), check if next non-space is " or { or [
    // which would indicate a missing comma
    if (!inStr && s[i - 1] === '"') {
      let j = i
      while (j < s.length && ' \t\n\r'.includes(s[j])) j++
      if (j < s.length && (s[j] === '"' || s[j] === '{' || s[j] === '[' || /[a-zA-Z_\u4e00-\u9fff]/.test(s[j]))) {
        // Check if we're after a value (not after a key's opening quote)
        // Heuristic: if the last non-space char before the next token is " and we're
        // not right after a : (which would mean key position), insert comma
        let lookback = result.trimEnd()
        let lastSignificant = lookback[lookback.length - 1]
        if (lastSignificant === '"' || lastSignificant === '}' || lastSignificant === ']' || lastSignificant === ')' || /\d/.test(lastSignificant)) {
          result += ','
        }
      }
    }
  }
  return result
}

/** Extract JSON from AI response (handles markdown code blocks + repair) */
export function extractJSON(text: string): string {
  let raw = ''
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/)
  if (jsonMatch) raw = jsonMatch[1].trim()
  else {
    const objMatch = text.match(/\{[\s\S]*\}/)
    if (objMatch) raw = objMatch[0]
    else raw = text
  }

  // Step 1: Normalize Chinese punctuation (commas, colons, angle brackets — NOT quotes)
  raw = normalizeCJKPunctuation(raw)

  // Step 2: Strip invisible characters
  raw = stripInvisibleChars(raw)

  // Step 3: Strip JSON comments (some AI models add // notes)
  raw = stripJSONComments(raw)

  // Try as-is first
  try { JSON.parse(raw); return raw } catch {}

  // Try repair (trailing commas, unquoted keys/values, non-standard quotes)
  let repaired = repairJSON(raw)
  try { JSON.parse(repaired); return repaired } catch {}

  // Try fixing missing commas between properties
  repaired = fixMissingCommas(repaired)
  try { JSON.parse(repaired); return repaired } catch {}

  // Try repair + fixMissingCommas + balance
  const balanced = balanceJSON(repaired)
  try { JSON.parse(balanced); return balanced } catch {}

  return raw
}

function balanceJSON(input: string): string {
  let result = input.trim()
  const stack: string[] = []
  let inStr = false
  let escaped = false

  for (let i = 0; i < result.length; i++) {
    const ch = result[i]
    if (inStr) {
      if (escaped) {
        escaped = false
      } else if (ch === '\\') {
        escaped = true
      } else if (ch === '"') {
        inStr = false
      }
      continue
    }

    if (ch === '"') inStr = true
    else if (ch === '{') stack.push('}')
    else if (ch === '[') stack.push(']')
    else if ((ch === '}' || ch === ']') && stack[stack.length - 1] === ch) stack.pop()
  }

  if (inStr) result += '"'
  while (stack.length) result += stack.pop()
  return result
}

export function parseAIJSON<T = any>(text: string, context = 'AI response'): T {
  const extracted = extractJSON(text)
  try {
    return JSON.parse(extracted) as T
  } catch (err: any) {
    // Log diagnostics for debugging
    const pos = parseInt(err?.message?.match(/position (\d+)/)?.[1] || '0')
    const start = Math.max(0, pos - 40)
    const end = Math.min(extracted.length, pos + 40)
    console.warn(`[parseAIJSON] ${context} failed:`, err?.message)
    console.warn(`[parseAIJSON] Context around error (pos ${pos}):`, JSON.stringify(extracted.slice(start, end)))
    console.warn(`[parseAIJSON] Full raw AI response:`, text.slice(0, 500))
    const detail = err?.message ? ` (${err.message})` : ''
    throw new Error(`${context} is not valid JSON${detail}. Please retry generation.`)
  }
}
