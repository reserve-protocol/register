import { Trans } from '@lingui/macro'
import GoTo from 'components/button/GoTo'
import { MODES } from 'components/dark-mode-toggle'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import {
  collapseAllNested,
  darkStyles,
  defaultStyles,
  JsonView,
} from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import { Box, BoxProps, Card, Divider, Text, useColorMode } from 'theme-ui'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { ContractProposal } from 'views/governance/atoms'

interface Props extends BoxProps {
  data: ContractProposal
}

const CallData = ({ data }: { data: string }) => {
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
          <Divider mb={3} mx={-4} sx={{ borderColor: 'darkBorder' }} />
          <Box as="code" sx={{ overflowWrap: 'break-word' }}>
            {data}
          </Box>
        </>
      )}
    </Box>
  )
}

// Actions setPrimeBasket
const ContractProposalDetails = ({ data, ...props }: Props) => {
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
            href={getExplorerLink(data.address, ExplorerDataType.ADDRESS)}
          />
        </Box>
      </Box>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
      {data.calls.map((call, index) => (
        <Box key={index}>
          {!!index && (
            <Divider mb={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
          )}
          <Box mb={3}>
            <Text
              variant="legend"
              sx={{ display: 'block', fontSize: 1 }}
              mb={2}
            >
              <Trans>Signature</Trans>
            </Text>
            <Text>{call.signature}</Text>
          </Box>

          <Text variant="legend" sx={{ fontSize: 1, display: 'block' }} mb={2}>
            <Trans>Parameters</Trans>
          </Text>
          {call.data.length > 1 ? (
            <JsonView
              shouldInitiallyExpand={collapseAllNested}
              style={colorMode === MODES.LIGHT ? defaultStyles : darkStyles}
              data={call.data}
            />
          ) : (
            <Text>
              {call.data && call.data[0] !== undefined
                ? call.data[0].toString()
                : 'None'}
            </Text>
          )}

          <Divider mt={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
          <CallData data={call.callData} />
        </Box>
      ))}
    </Card>
  )
}

export default ContractProposalDetails
