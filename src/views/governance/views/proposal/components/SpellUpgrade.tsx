import { Trans } from '@lingui/macro'
import DocsLink from 'components/docs-link/DocsLink'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Card, Divider, Label, Radio, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { spellUpgradeAtom } from '../atoms'

const SPELL_CONTRACTS = {
  [ChainId.Mainnet]: '0xb1df3a104d73ff86f9aaab60b491a5c44b090391',
  [ChainId.Base]: '0x1744c9933feb8e76563fce63d5c95a4e7f967c2a',
}

export const spellAddressAtom = atom((get) => {
  const chainId = get(chainIdAtom)
  return SPELL_CONTRACTS[chainId]
})

const SpellUpgrade = (props: BoxProps) => {
  const [spell, setSpell] = useAtom(spellUpgradeAtom)
  const chainId = useAtomValue(chainIdAtom)
  const spellContract = useAtomValue(spellAddressAtom)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpell(e.target.value as 'none' | 'spell1' | 'spell2')
  }

  if (!spellContract) return null

  return (
    <Card {...props} p={4}>
      <Box variant="layout.verticalAlign">
        <Text variant="title">
          <Trans>3.4.0 Upgrade spells</Trans>
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
            value="spell1"
            onChange={onChange}
            checked={spell === 'spell1'}
          />
          <Trans>Cast Spell 1</Trans>
        </Label>
        <Label>
          <Radio
            name="dark-mode"
            value="spell2"
            onChange={onChange}
            checked={spell === 'spell2'}
          />
          <Trans>Cast Spell 2</Trans>
        </Label>
      </Box>
    </Card>
  )
}

export default SpellUpgrade
