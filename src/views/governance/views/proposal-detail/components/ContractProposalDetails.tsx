import { Trans } from '@lingui/macro'
import GoTo from 'components/button/GoTo'
import { MODES } from 'components/dark-mode-toggle'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import {
  JsonView,
  collapseAllNested,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Card, Divider, Text, useColorMode } from 'theme-ui'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { safeJsonFormat } from 'views/deploy/utils'
import { ContractProposal } from 'views/governance/atoms'

interface Props extends BoxProps {
  data: ContractProposal
  borderColor?: string
}

const CallData = ({
  data,
  borderColor = 'darkBorder',
}: {
  data: string
  borderColor?: string
}) => {
  const [isOpen, setOpen] = useState(false)

  return (
    <Box>
      <Box
        py={2}
        sx={{ cursor: 'pointer' }}
        variant="layout.verticalAlign"
        onClick={() => setOpen(!isOpen)}
      >
        <Text variant="strong" mr="auto">
          <Trans>Executable code</Trans>
        </Text>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Box>
      {isOpen && (
        <>
          <Divider mb={3} mx={-4} sx={{ borderColor }} />
          <Box as="code" sx={{ overflowWrap: 'break-word' }}>
            {data}
          </Box>
          <Box mb={3} />
        </>
      )}
    </Box>
  )
}

// Actions setPrimeBasket
const ContractProposalDetails = ({
  data,
  borderColor = 'darkBorder',
  ...props
}: Props) => {
  const chainId = useAtomValue(chainIdAtom)
  const [colorMode] = useColorMode()

  if (!data.calls.length) {
    return null
  }

  return (
    <Card p={4} pb={3} {...props}>
      <Box>
        <Text sx={{ fontWeight: 500 }} mr={1}>
          {data.calls.length}
        </Text>
        <Text variant="legend">
          change{data.calls.length > 1 ? 's' : ''} in:
        </Text>
        <Box variant="layout.verticalAlign">
          <Text variant="strong" mr={2}>
            {data.label}
          </Text>
          <GoTo
            href={getExplorerLink(
              data.address,
              chainId,
              ExplorerDataType.ADDRESS
            )}
          />
        </Box>
      </Box>
      <Divider my={4} mx={-4} sx={{ borderColor }} />
      {data.calls.map((call, index) => (
        <Box key={index}>
          {!!index && <Divider mb={4} mx={-4} sx={{ borderColor }} />}
          <Box mb={3}>
            <Text
              variant="legend"
              sx={{ display: 'block', fontSize: 1 }}
              mb={2}
            >
              <Trans>Signature</Trans>
            </Text>
            <Text>
              {call.signature}({call.parameters.join(', ')})
            </Text>
          </Box>

          <Text variant="legend" sx={{ fontSize: 1, display: 'block' }} mb={2}>
            <Trans>Parameters</Trans>
          </Text>
          {call.data.length > 1 ? (
            <JsonView
              shouldExpandNode={collapseAllNested}
              style={colorMode === MODES.LIGHT ? defaultStyles : darkStyles}
              data={call.data}
            />
          ) : (
            <Text sx={{ wordBreak: 'break-all' }}>
              {call.data && call.data[0] !== undefined
                ? typeof call.data[0] === 'object'
                  ? safeJsonFormat(call.data[0])
                  : call.data[0].toString()
                : 'None'}
            </Text>
          )}

          <Divider mt={4} mx={-4} sx={{ borderColor }} />
          <CallData data={call.callData} borderColor={borderColor} />
        </Box>
      ))}
    </Card>
  )
}

export default ContractProposalDetails
