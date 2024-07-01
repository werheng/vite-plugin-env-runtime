import { describe, expect, it } from 'vitest'
import { createContext } from '../src'

describe('transform', () => {
  const ctx = createContext()
  const globName = '__CONFIG__'

  it('includes', () => {
    const code = `
      let a = import.meta.env.VITE_APP_TITLE
      a = import.meta.env.VITE_APP_COLOR
      a = import.meta.env.VITE_APP_COLOR_OTHER
    `
    const fuzzy = ctx.transform(code, {
      includeList: ['VITE_*'],
      globName,
    })
    const precise = ctx.transform(code, {
      includeList: ['VITE_APP_COLOR'],
      globName,
    })

    expect(fuzzy.code).toBe(`
      let a = window.${globName}.VITE_APP_TITLE
      a = window.${globName}.VITE_APP_COLOR
      a = window.${globName}.VITE_APP_COLOR_OTHER
    `)
    expect(precise.code).toBe(`
      let a = import.meta.env.VITE_APP_TITLE
      a = window.${globName}.VITE_APP_COLOR
      a = import.meta.env.VITE_APP_COLOR_OTHER
    `)
  })

  it('excludes', () => {
    const code = `
      let a = import.meta.env.VITE_APP_TITLE
      a = import.meta.env.VITE_EXCLUDE_VALUE
      a = import.meta.env.VITE_EXCLUDE_VALUE_DATA
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
      let a = window.${globName}.VITE_APP_TITLE
      a = import.meta.env.VITE_EXCLUDE_VALUE
      a = import.meta.env.VITE_EXCLUDE_VALUE_DATA
    `)
    expect(precise.code).toBe(`
      let a = window.${globName}.VITE_APP_TITLE
      a = import.meta.env.VITE_EXCLUDE_VALUE
      a = window.${globName}.VITE_EXCLUDE_VALUE_DATA
    `)
  })
})
