import { t } from '@lingui/macro'
import InfoIcon from 'components/icons/InfoIcon'
import IconInfo from 'components/info-icon'
import { useAtomValue } from 'jotai'
import { maxIssuanceAtom, maxRedemptionAtom } from 'state/atoms'
import { Box, BoxProps, Grid } from 'theme-ui'
import { formatCurrency } from 'utils'

const IssuanceInfo = (props: BoxProps) => {
  const redeemAvailable = useAtomValue(maxRedemptionAtom)
  const issuanceAvailable = useAtomValue(maxIssuanceAtom)

  return (
    <Box variant="layout.borderBox" p={0} {...props}>
      <Grid gap={0} columns={2}>
        <Box p={4} sx={{ borderRight: '1px solid', borderColor: 'border' }}>
          <IconInfo
            icon={<InfoIcon />}
            title={t`Global mint max`}
            help={t`Each RToken can have an issuance throttle to limit the amount of extractable value in the case of an attack. After a large isuance, the issuance limit recharges linearly to the defined maximum at a defined speed of recharge`}
            text={formatCurrency(issuanceAvailable)}
          />
        </Box>
        <Box p={4}>
          <IconInfo
            icon={<InfoIcon />}
            title={t`Global redeem max`}
            help={t`Each RToken can have a redemption throttle to limit the amount of extractable value in the case of an attack. After a large redemption, the redemption limit recharges linearly to the defined maximum at a defined speed of recharge.`}
            text={formatCurrency(redeemAvailable)}
          />
        </Box>
      </Grid>
    </Box>
  )
}
export default IssuanceInfo
