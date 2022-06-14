import { t, Trans } from '@lingui/macro'
import TokenLogo from 'components/icons/TokenLogo'
import IconInfo from 'components/info-icon'
import { useFormContext } from 'react-hook-form'
import { borderRadius } from 'theme'
import { Box, BoxProps, Text } from 'theme-ui'

const StakingTokenInfo = (props: BoxProps) => {
  const { watch } = useFormContext()
  const ticker = watch('ticker')
  const stRSR = ticker ? `st${ticker.toString().toUpperCase()}RSR` : 'stRSR'

  return (
    <Box
      {...props}
      p={4}
      mb={4}
      sx={(theme: any) => ({
        border: `1px solid ${theme.colors.border}`,
        borderRadius: borderRadius.boxes,
      })}
    >
      <Text sx={{ fontSize: 3 }}>
        <Trans>Staking Token</Trans>
      </Text>
      <IconInfo
        mt={3}
        icon={<TokenLogo />}
        title={t`Staking Token`}
        text={`${stRSR} Token`}
      />
      <IconInfo
        mt={2}
        icon={<TokenLogo />}
        title={t`Staking token Ticker`}
        text={stRSR}
      />
    </Box>
  )
}

export default StakingTokenInfo
