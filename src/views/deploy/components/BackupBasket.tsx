import { t, Trans } from '@lingui/macro'
import { Card, TitleCard } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
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
    <TitleCard
      title={t`Emergency collateral`}
      right={
        <Flex variant="layout.verticalAlign">
          <SmallButton disabled mr={2}>
            <Trans>Add</Trans>
          </SmallButton>
          <Help content="TODO" />
        </Flex>
      }
    >
      <Flex variant="layout.verticalAlign">
        <Text>
          <Trans>Diversity factor</Trans>
        </Text>
        <Box
          sx={{ backgroundColor: 'lightBackground', borderRadius: 16 }}
          ml="auto"
          mr={2}
          px={3}
          py={1}
        >
          <Text>n=0</Text>
        </Box>
        <Help content="TODO" />
      </Flex>
      <Divider my={3} mx={-4} />
      <Text variant="legend" sx={{ fontSize: 1 }}>
        <Trans>
          Emergancy collateral with listed in the order of “priority” and the
          diversity factor defining the amount of tokens to replace a default
          with.
        </Trans>
      </Text>
    </TitleCard>
    <Card mt={3}>
      <Flex variant="verticalAlign">
        <Text variant="legend" sx={{ fontSize: 1 }}>
          <Trans>Each RToken Target unit will have an emergency basket.</Trans>
        </Text>
        <Help ml="auto" content="TODO" />
      </Flex>
    </Card>
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
            mb={3}
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
