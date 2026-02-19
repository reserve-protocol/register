import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import DocsLink from '@/components/utils/docs-link'
import { Trans } from '@lingui/macro'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { ChainId } from 'utils/chains'

import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { proposedRolesAtom, spell4_2_0UpgradeAtom } from '../atoms'

const SPELL_CONTRACTS = {
  [ChainId.Mainnet]: '0xbFf761D367291281f3c4DB4Bda2C591d6DDE3601',
  [ChainId.Base]: '0xB57DB893c95e50f67A62B8dcE411D8e06FF224E1',
}

export const spell4_2_0AddressAtom = atom((get) => {
  const chainId = get(chainIdAtom)
  return SPELL_CONTRACTS[chainId]
})

const SpellUpgrade4_2_0 = ({ className }: { className?: string }) => {
  const [spell, setSpell] = useAtom(spell4_2_0UpgradeAtom)
  const chainId = useAtomValue(chainIdAtom)
  const spellContract = useAtomValue(spell4_2_0AddressAtom)
  const setProposedRoles = useSetAtom(proposedRolesAtom)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as 'none' | 'spell'
    setSpell(value)
    setProposedRoles(({ owners, ...rest }) => ({
      ...rest,
      owners: [
        ...owners.filter((owner) => owner !== spellContract),
        ...(value === 'none' ? [] : [spellContract]),
      ],
    }))
  }

  if (!spellContract) return null

  return (
    <Card className={`p-6 bg-secondary ${className ?? ''}`}>
      <div className="flex items-center">
        <span className="text-xl font-medium">
          <Trans>4.2.0 Upgrade spell</Trans>
        </span>
        <DocsLink
          link={getExplorerLink(
            spellContract,
            chainId,
            ExplorerDataType.ADDRESS
          )}
        />
      </div>
      <Separator className="my-6 -mx-6 w-[calc(100%+3rem)]" />
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="spell-4-2-0"
            value="none"
            onChange={onChange}
            checked={spell === 'none'}
            className="w-4 h-4"
          />
          <Trans>None</Trans>

        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="spell-4-2-0"
            value="spell"
            onChange={onChange}
            checked={spell === 'spell'}
            className="w-4 h-4"
          />
          <Trans>Cast Spell</Trans>
        </label>
      </div>
    </Card>
  )
}

export default SpellUpgrade4_2_0
