import { describe, expect, it } from 'vitest'
import { isSafeHttpUrl } from '../url'

describe('isSafeHttpUrl', () => {
  it('accepts https URLs', () => {
    expect(isSafeHttpUrl('https://example.com/doc.pdf')).toBe(true)
  })

  it('accepts http URLs', () => {
    expect(isSafeHttpUrl('http://example.com')).toBe(true)
  })

  it('accepts protocol-relative URLs (resolve to page protocol)', () => {
    expect(isSafeHttpUrl('//cdn.example.com/file')).toBe(true)
  })

  it('accepts relative paths (resolve to app origin)', () => {
    expect(isSafeHttpUrl('/dtf-llm/photon-dtf.md')).toBe(true)
  })

  it('rejects javascript: URLs, including cased/padded variants', () => {
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeHttpUrl('  JavaScript:alert(1)')).toBe(false)
  })

  it('rejects data: URLs', () => {
    expect(isSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(
      false
    )
  })

  it('rejects other protocols', () => {
    expect(isSafeHttpUrl('vbscript:x')).toBe(false)
    expect(isSafeHttpUrl('file:///etc/passwd')).toBe(false)
  })

  it('rejects empty and missing values', () => {
    expect(isSafeHttpUrl('')).toBe(false)
    expect(isSafeHttpUrl(undefined)).toBe(false)
    expect(isSafeHttpUrl(null)).toBe(false)
  })
})
