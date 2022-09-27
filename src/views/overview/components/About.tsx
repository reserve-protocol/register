import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'

// TODO: Pull this info from listing
const About = (props: BoxProps) => {
  const rToken = useAtomValue(rTokenAtom)

  return (
    <Box {...props}>
      {rToken?.mandate && (
        <>
          <Text mb={3} sx={{ fontSize: 4, display: 'block', fontWeight: 500 }}>
            {rToken?.symbol} <Trans>Mandate</Trans>
          </Text>
          <Text as="p" variant="legend">
            {rToken?.mandate}
          </Text>
        </>
      )}
      {rToken?.meta?.about && (
        <>
          <Text mb={3} sx={{ fontSize: 4, display: 'block', fontWeight: 500 }}>
            <Trans>About</Trans> {rToken?.symbol}
          </Text>
          <Text as="p">{rToken?.meta?.about}</Text>
        </>
      )}
    </Box>
  )
}

export default About
