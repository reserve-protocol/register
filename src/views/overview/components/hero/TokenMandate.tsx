import { Trans } from '@lingui/macro'
import MandateIcon from 'components/icons/MandateIcon'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { rTokenListAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'

const OffChainNote = () => {
  const rToken = useRToken()
  const rTokenList = useAtomValue(rTokenListAtom)
  const [expanded, setExpanded] = useState(false)

  if (!rToken?.listed) {
    return null
  }

  return (
    <Box mt={4}>
      <Text
        mb={2}
        variant="strong"
        role="button"
        sx={{ cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <Trans>{expanded ? '-' : '+'} Description</Trans>
      </Text>
      {expanded && (
        <Text as="p" variant="legend">
          {rTokenList[rToken.address]?.about}
        </Text>
      )}
    </Box>
  )
}

const TokenMandate = () => {
  const rToken = useRToken()

  return (
    <Box
      sx={{
        maxWidth: 500,
        borderLeft: '1px solid',
        borderColor: ['transparent', 'transparent', 'transparent', 'border'],
        paddingLeft: [0, 0, 0, 7],
      }}
    >
      <MandateIcon />
      <Text sx={{ fontSize: 3 }} variant="strong" mb={2} mt={3}>
        <Trans>Governor Mandate</Trans>
      </Text>
      <Text as="p" variant="legend">
        {rToken?.mandate ? rToken.mandate : <Skeleton count={6} />}
      </Text>
      <OffChainNote />
    </Box>
  )
}

export default TokenMandate
