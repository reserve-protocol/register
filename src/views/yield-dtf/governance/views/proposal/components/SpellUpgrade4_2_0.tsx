import { Trans } from '@lingui/macro'
import DocsLink from '@/components/utils/docs-link'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Card, Divider, Label, Radio, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { proposedRolesAtom, spell4_2_0UpgradeAtom } from '../atoms'

const SPELL_CONTRACTS = {
  [ChainId.Mainnet]: '0x133c3eb12b06C647A887804b20F3B597096F6A24',
  [ChainId.Base]: '0x890FAa00C16EAD6AA76F18A1A7fe9C40838F9122',
}

export const spellAddressAtom = atom((get) => {
  const chainId = get(chainIdAtom)
  return SPELL_CONTRACTS[chainId]
})

const SpellUpgrade4_2_0 = (props: BoxProps) => {
  const [spell, setSpell] = useAtom(spell4_2_0UpgradeAtom)
  const chainId = useAtomValue(chainIdAtom)
  const spellContract = useAtomValue(spellAddressAtom)
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
    <Card {...props} p={4}>
      <Box variant="layout.verticalAlign">
        <Text variant="title">
          <Trans>4.2.0 Upgrade spells</Trans>
        </Text>
        <DocsLink
          link={getExplorerLink(
            spellContract,
            chainId,
            ExplorerDataType.ADDRESS
          )}
        />
      </Box>
      <Divider my={4} mx={-4} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Label>
          <Radio
            name="dark-mode"
            value="none"
            onChange={onChange}
            checked={spell === 'none'}
          />
          <Trans>None</Trans>
        </Label>
        <Label>
          <Radio
            name="dark-mode"
            value="spell"
            onChange={onChange}
            checked={spell === 'spell'}
          />
          <Trans>Cast Spell</Trans>
        </Label>
      </Box>
    </Card>
  )
}

export default SpellUpgrade4_2_0
