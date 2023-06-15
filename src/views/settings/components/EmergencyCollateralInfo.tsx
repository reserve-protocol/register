import { Trans } from '@lingui/macro'
import GoTo from 'components/button/GoTo'
import DiversityFactorIcon from 'components/icons/DiversityFactorIcon'
import TokenItem from 'components/token-item'
import { useAtomValue } from 'jotai'
import { chainIdAtom, rTokenBackupAtom, rTokenBasketAtom } from 'state/atoms'
import { Box, BoxProps, Card, Flex, Text, Divider } from 'theme-ui'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

/**
 * View: Settings > Display RToken emergency collaterals per target unit
 */
const EmergencyCollateralInfo = (props: BoxProps) => {
  const units = Object.keys(useAtomValue(rTokenBasketAtom))
  const backupBasket = useAtomValue(rTokenBackupAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <Card p={4} {...props}>
      <Text variant="title">
        <Trans>Emergency Collateral</Trans>
      </Text>
      {units.map((unit, unitIndex) => (
        <Box key={unit} mt={unitIndex ? 4 : 0}>
          <Divider mx={-4} my={4} sx={{ borderColor: 'darkBorder' }} />
          <Text variant="strong" mb={3} sx={{ display: 'block' }}>
            {unit} <Trans>Backups</Trans>
          </Text>
          {backupBasket[unit]?.collaterals.length ? (
            <>
              <Flex>
                <Flex sx={{ alignItems: 'center' }} mb={1}>
                  <DiversityFactorIcon />
                  <Text ml={2}>
                    <Trans>Diversity Factor</Trans>
                  </Text>
                </Flex>
                <Text ml="auto">{backupBasket[unit].diversityFactor}</Text>
              </Flex>
              {backupBasket[unit].collaterals.map((collateral, index) => (
                <Box
                  variant="layout.verticalAlign"
                  mt={3}
                  key={collateral.address}
                >
                  <TokenItem width={16} symbol={collateral.symbol} />
                  <Text ml="auto">{index + 1}</Text>
                  <GoTo
                    ml={2}
                    href={getExplorerLink(
                      collateral.address,
                      chainId,
                      ExplorerDataType.ADDRESS
                    )}
                  />
                </Box>
              ))}
            </>
          ) : (
            <Text variant="legend">
              <Trans>No emergency collateral for this target unit</Trans>
            </Text>
          )}
        </Box>
      ))}
    </Card>
  )
}

export default EmergencyCollateralInfo
