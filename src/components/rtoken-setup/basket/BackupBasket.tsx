import { Trans } from '@lingui/macro'
import DocsLink from 'components/docs-link/DocsLink'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
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
      <Flex variant="layout.verticalAlign" mt={4}>
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
      <Box sx={{ textAlign: 'center' }} py={8} px={4}>
        <EmptyBoxIcon />
        <Text sx={{ fontWeight: 500, display: 'block' }} my={2}>
          <Trans>Empty backup basket</Trans>
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

// TODO: Create readonly component and remove flag
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
      <Flex variant="layout.verticalAlign">
        <Text variant="sectionTitle">Emergency Collateral</Text>
        <DocsLink link="https://reserve.org/protocol/monetary_units_baskets/#baskets" />
      </Flex>
      {targetUnits.map((targetUnit) =>
        readOnly && !backupBasket[targetUnit]?.collaterals.length ? (
          <Box my={3} px={1} key={targetUnit}>
            <Text>
              <Trans>No emergency collateral for target</Trans> {targetUnit}
            </Text>
          </Box>
        ) : (
          <Box key={targetUnit}>
            <EmergencyCollateral
              readOnly={readOnly}
              onAdd={handleAdd}
              key={targetUnit}
              targetUnit={targetUnit}
              {...backupBasket[targetUnit]}
            />
          </Box>
        )
      )}
      {!targetUnits.length && <Placeholder />}
    </Box>
  )
}

export default BackupBasket
