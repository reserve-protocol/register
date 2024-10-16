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
import {
  Box,
  BoxProps,
  Card,
  Divider,
  Flex,
  Text,
  useColorMode,
} from 'theme-ui'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { safeJsonFormat } from 'views/deploy/utils'
import { ContractProposal, ProposalCall } from 'views/governance/atoms'

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
          <Divider mb={3} sx={{ borderColor }} />
          <Box as="code" sx={{ overflowWrap: 'break-word' }}>
            {data}
          </Box>
          <Box mb={3} />
        </>
      )}
    </Box>
  )
}

const Header = ({ label, address }: { label: string; address: string }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <Box variant="layout.verticalAlign" color="primary" p="2">
      <Text variant="bold" sx={{ fontSize: 3 }} mr={1}>
        {label}
      </Text>
      <GoTo
        mt="2px"
        color="primary"
        href={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
      />
    </Box>
  )
}

const JSONPreview = ({ data }: { data: any }) => {
  const [colorMode] = useColorMode()

  if (data.length > 1) {
    return (
      <JsonView
        shouldExpandNode={collapseAllNested}
        style={colorMode === MODES.LIGHT ? defaultStyles : darkStyles}
        data={data}
      />
    )
  }

  return (
    <Text variant="bold" sx={{ wordBreak: 'break-all' }}>
      {data && data[0] !== undefined
        ? typeof data[0] === 'object'
          ? safeJsonFormat(data[0])
          : data[0].toString()
        : 'None'}
    </Text>
  )
}
const borderColor = 'darkBorder'

const RawCallPreview = ({ call }: { call: ProposalCall }) => (
  <>
    <Box mb={2}>
      <Text variant="legend" sx={{ display: 'block', fontSize: 1 }} mb={1}>
        <Trans>Signature</Trans>
      </Text>
      <Text variant="bold">
        {call.signature}({call.parameters.join(', ')})
      </Text>
    </Box>

    <Text variant="legend" sx={{ fontSize: 1, display: 'block' }} mb={1}>
      <Trans>Parameters</Trans>
    </Text>
    <JSONPreview data={call.data} />

    <Divider mt={3} sx={{ borderColor }} />
    <CallData data={call.callData} borderColor={borderColor} />
  </>
)

const DetailedCallPreview = ({ call }: { call: ProposalCall }) => {
  return <Box />
}

const CallPreview = ({
  call,
  index,
  total,
}: {
  call: ProposalCall
  index: number
  total: number
}) => {
  const [detailed, setDetailed] = useState(false)

  return (
    <Box
      key={index}
      p="2"
      sx={{
        borderRadius: 8,
        background: 'cardAlternative',
        boxShadow: '0px 4px 33px 0px rgba(66, 61, 43, 0.03)',
      }}
    >
      <Box variant="layout.verticalAlign" mb="2">
        <Text variant="bold" color="primary" sx={{ fontSize: 2 }}>
          {index + 1}/{total}
        </Text>
      </Box>
      {detailed ? (
        <DetailedCallPreview call={call} />
      ) : (
        <RawCallPreview call={call} />
      )}
    </Box>
  )
}

const CallList = ({ calls }: { calls: ContractProposal['calls'] }) => {
  const total = calls.length

  return (
    <Flex mt="2" sx={{ flexDirection: 'column', gap: 2 }}>
      {calls.map((call, index) => (
        <CallPreview
          key={call.signature}
          call={call}
          index={index}
          total={total}
        />
      ))}
    </Flex>
  )
}

// Actions setPrimeBasket
const ContractProposalDetails = ({
  data,
  borderColor = 'darkBorder',
  ...props
}: Props) => {
  if (!data.calls.length) {
    return null
  }

  return (
    <Card
      p={2}
      sx={{
        background: 'cardBackground',
        border: '8px solid',
        borderColor: 'contentBackground',
      }}
      {...props}
    >
      <Header label={data.label} address={data.address} />
      <CallList calls={data.calls} />
    </Card>
  )
}

export default ContractProposalDetails
