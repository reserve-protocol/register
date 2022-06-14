import { t, Trans } from '@lingui/macro'
import { Card, TitleCard } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import { useAtomValue } from 'jotai'
import { Box, Text, CardProps, Flex, Input, Divider } from 'theme-ui'
import { backupCollateralAtom } from '../atoms'
import EmergencyCollateral from './EmergencyCollateral'

interface Props extends CardProps {}

const Placeholder = ({ onAdd }: { onAdd(targetUnit?: string): void }) => (
  <Box>
    <TitleCard
      title={t`Emergency collateral`}
      right={
        <Flex variant="layout.verticalAlign">
          <SmallButton onClick={() => onAdd()} mr={2}>
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
        <Box mx="auto" />
        <Input sx={{ width: 48 }} disabled defaultValue="n=0" mr={2} />
        <Help content="TODO" />
      </Flex>
      <Divider my={3} />
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
        <Box mx="auto" />
        <Help content="TODO" />
      </Flex>
    </Card>
  </Box>
)

const BackupBasket = () => {
  const backupBasket = useAtomValue(backupCollateralAtom)
  const handleAdd = (targetUnit: string) => {
    console.log('handle add')
  }

  if (!Object.keys(backupBasket).length) {
    return <Placeholder onAdd={handleAdd} />
  }

  return (
    <Box>
      {Object.keys(backupBasket).map((targetUnit) => (
        <EmergencyCollateral
          targetUnit={targetUnit}
          {...backupBasket[targetUnit]}
        />
      ))}
    </Box>
  )
}

export default BackupBasket
