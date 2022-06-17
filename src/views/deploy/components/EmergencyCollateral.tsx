import { Trans } from '@lingui/macro'
import { Input, NumericalInput, TitleCard } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import { Box, Card, Text, CardProps, Flex } from 'theme-ui'
import { BackupCollateral, Collateral } from '../atoms'

interface Props extends CardProps {
  targetUnit: string
  diversityFactor?: string
  collaterals?: Collateral[]
}

// TODO: Open collateral modal filtered by target unit
const EmergencyCollateral = ({
  targetUnit,
  diversityFactor = '0',
  collaterals = [],
  ...props
}: Props) => {
  const handleDiversityFactor = (n: string) => {}

  return (
    <TitleCard
      customTitle={
        <Flex sx={{ flexDirection: 'column' }} my={-1}>
          <Text>
            <Trans>Emergency collateral</Trans>
          </Text>
          <Text>- {targetUnit}</Text>
        </Flex>
      }
      right={
        <Flex variant="layout.verticalAlign">
          <SmallButton mr={2}>
            <Trans>Add</Trans>
          </SmallButton>
          <Help content="TODO" />
        </Flex>
      }
      {...props}
    >
      <Flex variant="layout.verticalAlign">
        <Text>
          <Trans>Diversity factor</Trans>
        </Text>
        <Box mx="auto" />
        <Box sx={{ width: 42 }} mr={2}>
          <NumericalInput
            sx={{ textAlign: 'center' }}
            placeholder="0"
            value={diversityFactor}
            onChange={handleDiversityFactor}
          />
        </Box>{' '}
        <Help content="TODO" />
      </Flex>
    </TitleCard>
  )
}

export default EmergencyCollateral
