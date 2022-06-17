import { Trans } from '@lingui/macro'
import { NumericalInput, TitleCard } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import IconInfo from 'components/info-icon'
import { Move } from 'react-feather'
import { Box, CardProps, Flex, Text } from 'theme-ui'
import { Collateral } from '../atoms'

interface Props extends CardProps {
  targetUnit: string
  diversityFactor?: string
  collaterals?: Collateral[]
  onAdd(targetUnit: string): void
}

// TODO: Open collateral modal filtered by target unit
const EmergencyCollateral = ({
  targetUnit,
  diversityFactor = '0',
  collaterals = [],
  onAdd,
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
          <SmallButton onClick={() => onAdd(targetUnit)} mr={2}>
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
      {collaterals.map((collateral, index) => (
        <Flex mt={3} key={collateral.address} variant="layout.verticalAlign">
          <IconInfo
            icon={<TokenLogo />}
            title={targetUnit}
            text={collateral.symbol}
          />
          <Box mx="auto" />
          <Text mr={3}>{index}</Text>
          <Move
            size={20}
            style={{ cursor: 'pointer' }}
            color="var(--theme-ui-colors-secondaryText)"
          />
        </Flex>
      ))}
    </TitleCard>
  )
}

export default EmergencyCollateral
