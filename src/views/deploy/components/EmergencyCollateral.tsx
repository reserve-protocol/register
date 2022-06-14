import { Trans } from '@lingui/macro'
import { TitleCard } from 'components'
import { Box, Card, Text, CardProps, Flex } from 'theme-ui'
import { BackupCollateral, Collateral } from '../atoms'

interface Props extends CardProps {
  targetUnit: string
  diversityFactor: string
  collaterals: Collateral[]
}

// TODO: Open collateral modal filtered by target unit
const EmergencyCollateral = ({
  targetUnit,
  diversityFactor,
  collaterals,
  ...props
}: Props) => {
  return (
    <TitleCard
      customTitle={
        <Flex sx={{ flexDirection: 'column' }}>
          <Text>
            <Trans>Emergency collateral</Trans>
          </Text>
          <Text>- {targetUnit}</Text>
        </Flex>
      }
    ></TitleCard>
  )
}

export default EmergencyCollateral
