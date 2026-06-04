import { describe, it, expect } from 'vitest'
import { PROVIDER_PRESETS } from '../../src/main/ai/types'

describe('PROVIDER_PRESETS', () => {
  it('has deepseek preset', () => {
    expect(PROVIDER_PRESETS.deepseek).toBeDefined()
    expect(PROVIDER_PRESETS.deepseek.baseURL).toContain('deepseek.com')
    expect(PROVIDER_PRESETS.deepseek.model).toBeTruthy()
  })

  it('has qwen preset', () => {
    expect(PROVIDER_PRESETS.qwen).toBeDefined()
    expect(PROVIDER_PRESETS.qwen.baseURL).toContain('dashscope.aliyuncs.com')
  })

  it('has glm preset', () => {
    expect(PROVIDER_PRESETS.glm).toBeDefined()
    expect(PROVIDER_PRESETS.glm.baseURL).toContain('bigmodel.cn')
  })

  it('has wenxin preset', () => {
    expect(PROVIDER_PRESETS.wenxin).toBeDefined()
    expect(PROVIDER_PRESETS.wenxin.baseURL).toContain('baidubce.com')
    expect(PROVIDER_PRESETS.wenxin.model).toContain('ernie')
  })

  it('every preset has required fields', () => {
    for (const [name, preset] of Object.entries(PROVIDER_PRESETS)) {
      expect(preset.provider, `${name}.provider`).toBeTruthy()
      expect(preset.model, `${name}.model`).toBeTruthy()
      expect(preset.baseURL, `${name}.baseURL`).toMatch(/^https:\/\//)
    }
  })

  it('presets have unique base URLs', () => {
    const urls = Object.values(PROVIDER_PRESETS).map(p => p.baseURL)
    const uniqueUrls = new Set(urls)
    expect(uniqueUrls.size).toBe(urls.length)
  })

  it('presets have unique provider names', () => {
    const providers = Object.values(PROVIDER_PRESETS).map(p => p.provider)
    const uniqueProviders = new Set(providers)
    expect(uniqueProviders.size).toBe(providers.length)
  })
})
