/** Repair common AI JSON mistakes: trailing commas, unquoted strings */
export function repairJSON(json: string): string {
  // Fix trailing commas before ] or }
  let s = json.replace(/,\s*([}\]])/g, '$1')

  // Fix unquoted string values after , [ or : by walking the string
  let result = ''
  let i = 0
  let inStr = false

  while (i < s.length) {
    if (s[i] === '"' && (i === 0 || s[i - 1] !== '\\')) {
      inStr = !inStr
      result += s[i]; i++; continue
    }
    if (inStr) { result += s[i]; i++; continue }

    // After , [ or : — check for unquoted string value
    if (s[i] === ',' || s[i] === '[' || s[i] === ':') {
      result += s[i]; i++
      while (i < s.length && ' \t\n\r'.includes(s[i])) { result += s[i]; i++ }
      // If next char looks like the start of an unquoted string
      if (i < s.length && !'"{[0123456789-tfnnull'.includes(s[i]) && s[i] !== ']' && s[i] !== '}') {
        let start = i
        while (i < s.length && s[i] !== ',' && s[i] !== ']' && s[i] !== '}') i++
        let val = s.substring(start, i).trim()
        // Strip trailing lone quote (AI sometimes adds " at end but not start)
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

/** Strip any markdown formatting artifacts from a string */
export function cleanText(s: string): string {
  if (typeof s !== 'string') return s
  return s
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
}

/** Clean all string fields in a slide object */
export function cleanSlideStrings(slide: any): any {
  const truncate = (s: string, max: number) => {
    const c = cleanText(s)
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

  // Try as-is first
  try { JSON.parse(raw); return raw } catch {}

  // Try repair
  const repaired = repairJSON(raw)
  try { JSON.parse(repaired); return repaired } catch {}

  return raw
}
