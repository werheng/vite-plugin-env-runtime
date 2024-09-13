import type { Arrayable, Options } from './types'
import { minimatch } from 'minimatch'

export function arraify<T>(target: Arrayable<T>) {
  return Array.isArray(target) ? target : [target]
}

export function createFilter(include: Options['include'], exclude: Options['exclude']) {
  const includeMatchers = arraify(include!)
  const excludeMatchers = arraify(exclude!)

  return (content: string | unknown) => {
    if (typeof content !== 'string')
      return false

    for (let i = 0; i < excludeMatchers.length; ++i) {
      const matcher = excludeMatchers[i]
      if (minimatch(content, matcher))
        return false
    }

    for (let i = 0; i < includeMatchers.length; ++i) {
      const matcher = includeMatchers[i]
      if (minimatch(content, matcher))
        return true
    }

    return !includeMatchers.length
  }
}
