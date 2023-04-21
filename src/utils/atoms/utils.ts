import { Atom, atom, Setter, Getter } from 'jotai'
import { loadable } from 'jotai/utils'

/**
 *  This module provides utility functions to simplify using jotai atoms
 */

export const simplifyLoadable = <T>(
  loadableToUnwrap: ReturnType<typeof loadable<T>>
) =>
  atom((get) => {
    const o = get(loadableToUnwrap)
    if (o.state !== 'hasData' || o.data == null) {
      return null
    }
    return o.data
  })

/**
 * This is a derived atom that will bail out of execution if it "get"'s any atom that is null.
 * The usecase is that you can simplify a lot of null checks away by just using this atom.
 *
 * @example
 * In the example we have two atoms, a and b, they can both be null.
 * We want to compute the sum if both are non-null and null otherwise
 *
 * ```
 * const aAtom = atom(null as null|number)
 * const bAtom = atom(42 as null|number)
 *
 * const aPlusB = atom(get => {
 *  const [a, b] = [get(aAtom), get(bAtom)]
 *  if (a == null || b == null) {
 *    return null
 *  }
 *  retrun a + b
 * })
 *
 * // Using `onlyNonNull` instead of standard atoms
 * const aPlusBAlt = onlyNonNullAtom(get => get(aAtom) + get(bAtom))
 * ```
 *
 * Inspiration is taken from Rust, where you can use the `?` operator to safely unwrap
 * values and bail out if values are missing
 *
 * ```
 * fn add(a: Option<u32>, b: Option<u32>) -> Option<u32> {
 *  Some(a? + b?);
 * }
 * ```
 */
export const onlyNonNullAtom = <T>(
  config: <
    Get extends <A>(a: Atom<A | null>, defaultValue?: A) => NonNullable<A>
  >(
    get: Get
  ) => T,
  defaultValue?: T
) => {
  return atom((get) => {
    try {
      const out = config((a, orValue) => {
        const o = get(a) ?? orValue ?? null
        if (o == null) {
          throw new Error('')
        }
        return o
      })
      if (Promise === out?.constructor) {
        return new Promise((resolve, reject) => {
          return (out as unknown as Promise<T>).then(resolve).catch(reject)
        }) as T
      }
      return out
    } catch (e) {
      if (defaultValue != null) {
        return defaultValue
      }
      return null
    }
  })
}

export const atomWithOnWrite = <T>(
  initialValue: T,
  onWrite: (get: Getter, set: Setter, prev: T, next: T) => void
) => {
  const backing = atom(initialValue)
  type BackingType = typeof backing

  return atom(
    (get) => get(backing),
    (get, set, arg) => {
      const prev = get(backing)
      const next =
        typeof arg === 'function' ? (arg as (prev: T) => T)(prev) : arg

      set(backing, next)
      onWrite(get, set, prev, next)
    }
  ) as BackingType
}
