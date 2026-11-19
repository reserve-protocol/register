import { Buffer } from 'buffer'

window.global = window.global ?? window
window.Buffer = window.Buffer ?? Buffer
window.process = window.process ?? { env: {} } // Minimal process polyfill

type GroupBy = <K extends PropertyKey, T>(
  items: Iterable<T>,
  keyOf: (item: T, index: number) => K
) => Partial<Record<K, T[]>>

// WHY: solariskit's wallet list calls Object.groupBy, missing before Safari 17.4.
const objectWithGroupBy = Object as ObjectConstructor & { groupBy?: GroupBy }
objectWithGroupBy.groupBy ??= <K extends PropertyKey, T>(
  items: Iterable<T>,
  keyOf: (item: T, index: number) => K
) => {
  const groups: Partial<Record<K, T[]>> = {}
  let index = 0
  for (const item of items) (groups[keyOf(item, index++)] ??= []).push(item)
  return groups
}

export {}
