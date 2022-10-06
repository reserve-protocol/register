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
          <Text mb={3} variant="title">
            {rToken?.symbol} <Trans>Mandate</Trans>
          </Text>
          <Text as="p" variant="legend">
            {rToken?.mandate}
          </Text>
        </>
      )}
      {rToken?.meta?.about && (
        <>
          <Text mt={4} mb={3} variant="title">
            <Trans>About</Trans>
          </Text>
          <Text as="p">{rToken?.meta?.about}</Text>
        </>
      )}
    </Box>
  )
}

export default About
