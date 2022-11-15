import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { Box, BoxProps, Divider, Flex, Text } from 'theme-ui'
import { backupCollateralAtom, basketAtom } from '../atoms'
import EmergencyCollateral from './EmergencyCollateral'

interface Props extends BoxProps {
  onAdd?(
    data: {
      basket: 'primary' | 'backup'
      targetUnit?: string
    } | null
  ): void
  readOnly?: boolean
}

const Placeholder = () => (
  <Box>
    <Box sx={{ opacity: '40%' }}>
      <Flex variant="layout.verticalAlign">
        <Text variant="title" mr={2}>
          <Trans>Emergency collateral</Trans>
        </Text>
        <SmallButton ml="auto" disabled>
          <Trans>Add Token</Trans>
        </SmallButton>
      </Flex>
      <Divider my={3} />
      <Flex variant="layout.verticalAlign">
        <Text>
          <Trans>Diversity factor</Trans>
        </Text>
        <Text ml="auto">N=</Text>
        <Box
          sx={{ backgroundColor: 'lightBackground', borderRadius: 16 }}
          mr={2}
          px={3}
        >
          <Text sx={{ color: '#333' }}>0</Text>
        </Box>
      </Flex>
      <Divider my={3} />
      <Box sx={{ textAlign: 'center' }} py={8} px={4}>
        <EmptyBoxIcon />
        <Text sx={{ fontWeight: 500, display: 'block' }}>
          <Trans>Emergency Collateral</Trans>
        </Text>
        <Text variant="legend" sx={{ fontSize: 1 }}>
          <Trans>
            Each target unit of your primary basket will have defined emergency
            collateral to replace with in case of default.
          </Trans>
        </Text>
      </Box>
    </Box>
  </Box>
)

/**
 * View: Deploy -> BasketSetup
 * Show emergency collateral per target unit
 */
const BackupBasket = ({
  onAdd = () => {},
  readOnly = false,
  ...props
}: Props) => {
  const targetUnits = Object.keys(useAtomValue(basketAtom))
  const backupBasket = useAtomValue(backupCollateralAtom)

  const handleAdd = useCallback(
    (targetUnit: string) => {
      onAdd({ basket: 'backup', targetUnit })
    },
    [onAdd]
  )

  if (readOnly && !targetUnits.length) {
    return null
  }

  return (
    <Box {...props}>
      {targetUnits.map((targetUnit) =>
        readOnly && !backupBasket[targetUnit]?.collaterals.length ? null : (
          <EmergencyCollateral
            mb={4}
            readOnly={readOnly}
            onAdd={handleAdd}
            key={targetUnit}
            targetUnit={targetUnit}
            {...backupBasket[targetUnit]}
          />
        )
      )}
      {!targetUnits.length && <Placeholder />}
    </Box>
  )
}

export default BackupBasket
