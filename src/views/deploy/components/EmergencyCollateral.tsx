import { Trans } from '@lingui/macro'
import { NumericalInput, TitleCard } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import IconInfo from 'components/info-icon'
import { Move, X } from 'react-feather'
import { Box, CardProps, Flex, IconButton, Text } from 'theme-ui'
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

  const handleRemove = (index: number) => {}

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
        <Box ml="auto" sx={{ width: 42 }} mr={2}>
          <NumericalInput
            sx={{ textAlign: 'center' }}
            placeholder="0"
            value={diversityFactor}
            onChange={handleDiversityFactor}
          />
        </Box>
        <Help content="TODO" />
      </Flex>
      {collaterals.map((collateral, index) => (
        <Flex mt={3} key={collateral.address} variant="layout.verticalAlign">
          <Move
            size={16}
            style={{ cursor: 'pointer' }}
            color="var(--theme-ui-colors-secondaryText)"
          />
          <Text variant="legend" ml={2} mr={3}>
            {index}
          </Text>
          <IconInfo
            icon={<TokenLogo />}
            title={targetUnit}
            text={collateral.symbol}
          />
          <IconButton
            ml="auto"
            sx={{ cursor: 'pointer' }}
            onClick={() => handleRemove(index)}
          >
            <X size={20} color="var(--theme-ui-colors-secondaryText)" />
          </IconButton>
        </Flex>
      ))}
    </TitleCard>
  )
}

export default EmergencyCollateral
