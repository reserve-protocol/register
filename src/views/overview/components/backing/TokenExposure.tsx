import { Box, Card } from 'theme-ui'

const TokenExposure = () => {
  return (
    <Card variant="inner">
      <Box
        variant="layout.verticalAlign"
        p={4}
        sx={{ borderBottom: '1px solid', borderColor: 'border' }}
      >
        {/* <RiskIcon />
        <Text ml="2" mr="auto" variant="bold" sx={{ fontSize: 3 }}>
          <Trans>Other Risks</Trans>
        </Text> */}
      </Box>
    </Card>
  )
}

export default TokenExposure
