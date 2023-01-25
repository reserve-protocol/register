import { Trans } from '@lingui/macro'
import GoTo from 'components/button/GoTo'
import TokenItem from 'components/token-item'
import { useAtomValue } from 'jotai'
import { rtokenBackupAtom, rTokenBasketAtom } from 'state/atoms'
import { Box, BoxProps, Card, Flex, Text } from 'theme-ui'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

/**
 * View: Settings > Display RToken emergency collaterals per target unit
 */
const EmergencyCollateralInfo = (props: BoxProps) => {
  const units = Object.keys(useAtomValue(rTokenBasketAtom))
  const backupBasket = useAtomValue(rtokenBackupAtom)

  return (
    <Card p={4} {...props}>
      <Text variant="sectionTitle" mb={5}>
        <Trans>Emergency Collateral</Trans>
      </Text>

      {units.map((unit, unitIndex) => (
        <Box key={unit} mt={unitIndex ? 4 : 0}>
          <Text variant="strong" sx={{ display: 'block' }} mb={3}>
            {unit} <Trans>Backups</Trans>
          </Text>
          {backupBasket[unit]?.collaterals.length ? (
            <>
              <Flex>
                <Text>
                  <Trans>Diversity Factor</Trans>
                </Text>
                <Text ml="auto">{backupBasket[unit].diversityFactor}</Text>
              </Flex>
              {backupBasket[unit].collaterals.map((collateral, index) => (
                <Box
                  variant="layout.verticalAlign"
                  mt={2}
                  key={collateral.address}
                >
                  <TokenItem size={14} symbol={collateral.symbol} />
                  <Text ml="auto">{index + 1}</Text>
                  <GoTo
                    ml={2}
                    href={getExplorerLink(
                      collateral.address,
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
