import { Trans } from '@lingui/macro'
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
        <Text mr={3}>
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
      <Text variant="sectionTitle">{data.label}</Text>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
      {data.calls.map((call, index) => (
        <Box key={index}>
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
          {data.calls[0].data.length > 1 ? (
            <JsonView
              shouldInitiallyExpand={collapseAllNested}
              style={colorMode === MODES.LIGHT ? defaultStyles : darkStyles}
              data={data.calls[0].data}
            />
          ) : (
            <Text>
              {data.calls[0].data && data.calls[0].data[0]
                ? data.calls[0].data[0]
                : 'None'}
            </Text>
          )}

          <Divider mt={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
          <CallData data={data.calls[0]?.callData ?? ''} />
        </Box>
      ))}
    </Card>
  )
}

export default ContractProposalDetails
