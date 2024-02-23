import { atom } from "jotai"
import { rTokenPriceAtom, rTokenStateAtom } from "state/atoms"

export const rTokenTargetPriceAtom = atom(get => {
  const price = get(rTokenPriceAtom)
  const { tokenSupply, basketsNeeded } = get(rTokenStateAtom)
  const targetUnits = get(rTokenStateAtom)

  return 0
})