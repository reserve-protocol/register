import { Trans } from '@lingui/macro'
import DocsLink from '@/components/utils/docs-link'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ChainId } from 'utils/chains'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { proposedRolesAtom, spell3_4_0UpgradeAtom } from '../atoms'

const SPELL_CONTRACTS = {
  [ChainId.Mainnet]: '0xb1df3a104d73ff86f9aaab60b491a5c44b090391',
  [ChainId.Base]: '0x1744c9933feb8e76563fce63d5c95a4e7f967c2a',
}

export const spell3_4_0AddressAtom = atom((get) => {
  const chainId = get(chainIdAtom)
  return SPELL_CONTRACTS[chainId]
})

const SpellUpgrade3_4_0 = ({ className }: { className?: string }) => {
  const [spell, setSpell] = useAtom(spell3_4_0UpgradeAtom)
  const chainId = useAtomValue(chainIdAtom)
  const spellContract = useAtomValue(spell3_4_0AddressAtom)
  const setProposedRoles = useSetAtom(proposedRolesAtom)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as 'none' | 'spell1' | 'spell2'
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
    <Card className={`p-6 ${className ?? ''}`}>
      <div className="flex items-center">
        <span className="text-xl font-medium">
          <Trans>3.4.0 Upgrade spells</Trans>
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
            name="spell-3-4-0"
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
            name="spell-3-4-0"
            value="spell1"
            onChange={onChange}
            checked={spell === 'spell1'}
            className="w-4 h-4"
          />
          <Trans>Cast Spell 1</Trans>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="spell-3-4-0"
            value="spell2"
            onChange={onChange}
            checked={spell === 'spell2'}
            className="w-4 h-4"
          />
          <Trans>Cast Spell 2</Trans>
        </label>
      </div>
    </Card>
  )
}

export default SpellUpgrade3_4_0
