import { atom, Atom, SetStateAction } from 'jotai'

export default function atomWithDebounce<T>(
  initialValue: Atom<T>,
  delayMilliseconds = 500,
  shouldDebounceOnReset = false
) {
  const prevTimeoutAtom = atom<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  // DO NOT EXPORT currentValueAtom as using this atom to set state can cause
  // inconsistent state between currentValueAtom and debouncedValueAtom
  const isDebouncingAtom = atom(false)
  const outValue = atom(null as { value: T } | null)

  const debouncedValueAtom = atom(
    (get) => {
      const out = get(outValue)
      if (out == null) {
        return get(initialValue)
      }
      return out.value
    },
    (get, set, update: SetStateAction<T>) => {
      clearTimeout(get(prevTimeoutAtom))

      const storedValue = get(outValue)
      const currentValue = get(initialValue)

      const nextValue =
        typeof update === 'function'
          ? (update as (prev: T) => T)(currentValue)
          : update

      const onDebounceStart = () => {
        set(outValue, { value: nextValue })
        set(isDebouncingAtom, true)
      }

      const onDebounceEnd = () => {
        set(debouncedValueAtom, nextValue)
        set(isDebouncingAtom, false)
      }

      onDebounceStart()

      if (
        !shouldDebounceOnReset &&
        storedValue != null &&
        nextValue === storedValue.value
      ) {
        onDebounceEnd()
        return
      }

      const nextTimeoutId = setTimeout(() => {
        onDebounceEnd()
      }, delayMilliseconds)

      // set previous timeout atom in case it needs to get cleared
      set(prevTimeoutAtom, nextTimeoutId)
    }
  )

  // exported atom setter to clear timeout if needed
  const clearTimeoutAtom = atom(null, (get, set, _arg) => {
    clearTimeout(get(prevTimeoutAtom))
    set(isDebouncingAtom, false)
  })

  return {
    currentValueAtom: atom((get) => get(outValue)),
    isDebouncingAtom,
    clearTimeoutAtom,
    debouncedValueAtom: atom(get => get(debouncedValueAtom)),
  }
}
