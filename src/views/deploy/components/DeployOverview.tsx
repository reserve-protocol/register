import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import { InfoBox } from 'components'
import { Box, Flex, BoxProps, Image, Text, Button, Divider } from 'theme-ui'

const Container = styled(Box)`
  height: fit-content;
`

const DeployOverview = (props: BoxProps) => {
  return (
    <Container variant="layout.borderBox" {...props}>
      <Flex sx={{ alignItems: 'center', flexDirection: 'column' }}>
        <Image height={32} width={32} src="/svgs/deploytx.svg" />
        <Text variant="title" sx={{ fontSize: 4 }} mt={2}>
          <Trans>Tx1. RToken Deploy</Trans>
        </Text>
        <Text variant="legend" as="p" mt={2} sx={{ textAlign: 'center' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ipsum dolor
          sit amet, consectetur adipiscing elit. Sit amet, consectetur
          adipiscing elit.
        </Text>
        <Button variant="accentAction" mt={3} sx={{ width: '100%' }}>
          <Trans>Deploy RToken</Trans>
        </Button>
        <Box mt={3} sx={{ fontSize: 1, textAlign: 'center' }}>
          <Text variant="legend" mr={1}>
            <Trans>Estimated gas cost: --</Trans>
          </Text>
          {/* {fee ? (
          <Text sx={{ fontWeight: 500 }}>${formatCurrency(fee)}</Text>
        ) : (
          <Spinner color="black" size={12} />
        )} */}
        </Box>
      </Flex>

      <Divider sx={{ borderColor: 'darkBorder' }} my={3} mx={-4} />
      <Box>
        <InfoBox light mb={3} title={'Staking token'} subtitle={'test'} />
        <InfoBox light title={'Staking token ticker'} subtitle={'test'} />
      </Box>
      <Divider sx={{ borderColor: 'darkBorder' }} my={3} mx={-4} />
      <Box>
        <Text variant="strong" mb={2}>
          Help title
        </Text>
        <Text as="p" variant="legend">
          Help text
        </Text>
      </Box>
    </Container>
  )
}

export default DeployOverview
