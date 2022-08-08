import { t, Trans } from '@lingui/macro'
import TokenLogo from 'components/icons/TokenLogo'
import IconInfo from 'components/info-icon'
import { useFormContext } from 'react-hook-form'
import { Box, BoxProps, Text } from 'theme-ui'

/**
 * View: Deploy -> Token setup
 */
const StakingTokenInfo = (props: BoxProps) => {
  const { watch } = useFormContext()
  const ticker = watch('ticker')
  const stRSR = ticker ? `st${ticker.toString().toUpperCase()}RSR` : 'stRSR'

  return (
    <Box {...props}>
      <Text variant="title">
        <Trans>Staking Token</Trans>
      </Text>
      <IconInfo
        mt={4}
        icon={<TokenLogo />}
        title={t`Staking Token`}
        text={`${stRSR} Token`}
      />
      <IconInfo
        mt={3}
        icon={<TokenLogo />}
        title={t`Staking token Ticker`}
        text={stRSR}
      />
    </Box>
  )
}

export default StakingTokenInfo
