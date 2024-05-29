import { Trans } from '@lingui/macro'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import { Box, BoxProps, Text } from 'theme-ui'
import CompareFilters from './CompareFilters'

const CompareBg = (props: BoxProps) => (
  <Box
    sx={{
      display: ['none', 'none', 'block'],
      width: '400px',
      height: '160px',
      top: 0,
      zIndex: -1,
      position: 'absolute',
      background: `url(/imgs/bg-compare.png) no-repeat`,
      backgroundSize: 'cover',
      ...props.sx,
    }}
  />
)

const CompareTokensTitle = () => {
  return (
    <Box variant="layout.centered" sx={{ gap: 1 }} mt={[5, 7]} mb={[3, 7]}>
      <BasketCubeIcon key="box-three" fontSize={36} />

      <Box
        variant="layout.verticalAlign"
        sx={{
          position: 'relative',
          justifyContent: 'center',
          width: '100%',
          gap: 4,
        }}
      >
        <CompareBg sx={{ left: 0 }} />

        <Box
          variant="layout.centered"
          sx={{ gap: 1, textAlign: 'center', maxWidth: '400px' }}
        >
          <Text sx={{ display: 'block', fontSize: 5, fontWeight: '700' }}>
            <Trans>Browse RTokens</Trans>
          </Text>
          <Text variant="legend">
            <Trans>
              Inspect collateral backing, mint, stake, redeem & explore
              additional earn opportunities across DeFi
            </Trans>
          </Text>
        </Box>

        <CompareBg
          sx={{
            '-webkit-transform': 'scaleX(-1)',
            transform: 'scaleX(-1)',
            right: 0,
          }}
        />
      </Box>
      <Box mt={3}>
        <CompareFilters />
      </Box>
    </Box>
  )
}

export default CompareTokensTitle
