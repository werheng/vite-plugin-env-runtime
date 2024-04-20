import { describe, expect, it } from 'vitest'
import { createContext } from '../src'

describe('transform', () => {
  const ctx = createContext()
  const globName = '__CONFIG__'

  it('includes', () => {
    const code = `
      import.meta.env.VITE_APP_TITLE
      import.meta.env.VITE_APP_COLOR
    `
    const fuzzy = ctx.transform(code, {
      includeList: ['VITE_*'],
      globName,
    })
    const precise = ctx.transform(code, {
      includeList: ['VITE_APP_TITLE'],
      globName,
    })

    expect(fuzzy.code).toBe(`
      window.${globName}.VITE_APP_TITLE
      window.${globName}.VITE_APP_COLOR
    `)
    expect(precise.code).toBe(`
      window.${globName}.VITE_APP_TITLE
      import.meta.env.VITE_APP_COLOR
    `)
  })

  it('excludes', () => {
    const code = `
      import.meta.env.VITE_APP_TITLE
      import.meta.env.VITE_EXCLUDE_DATA
      import.meta.env.VITE_EXCLUDE_VALUE
    `

    const fuzzy = ctx.transform(code, {
      includeList: ['VITE_*'],
      excludeList: ['VITE_EXCLUDE_*'],
      globName,
    })
    const precise = ctx.transform(code, {
      includeList: ['VITE_*'],
      excludeList: ['VITE_EXCLUDE_VALUE'],
      globName,
    })

    expect(fuzzy.code).toBe(`
      window.${globName}.VITE_APP_TITLE
      import.meta.env.VITE_EXCLUDE_DATA
      import.meta.env.VITE_EXCLUDE_VALUE
    `)
    expect(precise.code).toBe(`
      window.${globName}.VITE_APP_TITLE
      window.${globName}.VITE_EXCLUDE_DATA
      import.meta.env.VITE_EXCLUDE_VALUE
    `)
  })
})
