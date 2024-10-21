import { Trans } from '@lingui/macro'
import GoTo from 'components/button/GoTo'
import { MODES } from 'components/dark-mode-toggle'
import TokenLogo from 'components/icons/TokenLogo'
import TabMenu from 'components/tab-menu'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import React, { useState } from 'react'
import { ArrowRight, ChevronDown, ChevronUp, Circle } from 'react-feather'
import {
  JsonView,
  collapseAllNested,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import { chainIdAtom, collateralYieldAtom } from 'state/atoms'
import {
  Box,
  BoxProps,
  Card,
  Divider,
  Flex,
  Grid,
  Text,
  useColorMode,
} from 'theme-ui'
import { formatPercentage } from 'utils'
import { collateralDisplay } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address } from 'viem'
import { safeJsonFormat } from 'views/deploy/utils'
import { ContractProposal, ProposalCall } from 'views/governance/atoms'
import {
  BasketItem,
  PrimaryBasketRaw,
  useBasketChangesSummary,
} from 'views/governance/hooks'

interface Props extends BoxProps {
  data: ContractProposal
  snapshotBlock?: number
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
        <Text variant="bold" mr="auto">
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
  </>
)

const useBasketApy = (
  basket: BasketItem,
  chainId: number,
  symbols: Record<string, string>
) => {
  const apys = useAtomValue(collateralYieldAtom)[chainId]

  return Object.keys(basket).reduce((acc, token) => {
    return (
      acc +
      (apys[symbols[token]?.toLowerCase()] || 0) *
        (Number(basket[token].share) / 100)
    )
  }, 0)
}

// TODO: Currently only considering primary basket
const DetailedCallPreview = ({
  call,
  snapshotBlock,
}: {
  call: ProposalCall
  snapshotBlock?: number
}) => {
  const rToken = useRToken()
  const { data, isLoading, error } = useBasketChangesSummary(
    call.data,
    rToken?.address,
    rToken?.chainId,
    snapshotBlock
  )
  const apys = useAtomValue(collateralYieldAtom)[rToken?.chainId ?? 1] || {}
  const proposedApy = useBasketApy(
    data?.proposalBasket ?? {},
    rToken?.chainId ?? 1,
    data?.tokensMeta ?? {}
  )
  const currentApy = useBasketApy(
    data?.snapshotBasket ?? {},
    rToken?.chainId ?? 1,
    data?.tokensMeta ?? {}
  )

  return (
    <Box mt="2">
      <Grid
        columns={3}
        gap={2}
        mb="2"
        sx={{ color: 'secondaryText', fontSize: 1 }}
      >
        <Text>Collateral token</Text>
        <Text mx="auto">Old weight / New weight</Text>
        <Text ml="auto">Change</Text>
      </Grid>
      <Grid columns={3} gap={2}>
        {data?.diff.map((item) => (
          <>
            <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
              <TokenLogo mr="2" symbol={item.symbol} />
              <Box sx={{ fontSize: 1 }}>
                <Text variant="bold">
                  {collateralDisplay[item.symbol.toLowerCase()] || item.symbol}
                </Text>
                <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                  <Text sx={{ fontWeight: 500 }}>{item.targetUnit}</Text>|
                  <Text variant="legend">APY:</Text>{' '}
                  <Text sx={{ fontWeight: 500 }}>
                    {formatPercentage(apys[item.symbol.toLowerCase()])}
                  </Text>
                </Box>
              </Box>
            </Box>
            <Box
              variant="layout.verticalAlign"
              sx={{ justifyContent: 'center' }}
            >
              <Text sx={{ minWidth: '52px' }}>
                {formatPercentage(item.oldWeight)}
              </Text>
              <Flex
                mx="2"
                sx={{
                  backgroundColor: 'inputAlternativeBackground',
                  height: '20px',
                  width: '20px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '4px',
                }}
              >
                <ArrowRight size={12} />
              </Flex>
              <Text sx={{ minWidth: '52px' }}>
                {formatPercentage(item.newWeight)}
              </Text>
            </Box>
            <Box ml="auto">{item.status}</Box>
          </>
        ))}
      </Grid>
      <Box
        variant="layout.verticalAlign"
        pt="3"
        mt="2"
        sx={{
          borderTop: '1px solid',
          fontWeight: 500,
          borderColor: 'darkBorder',
        }}
      >
        <Text mr="auto">30-day blended APY:</Text>
        <Text variant="legend" mr="1">
          {formatPercentage(currentApy)}
        </Text>
        <ArrowRight size={16} />
        <Text ml="1">{formatPercentage(proposedApy)}</Text>
      </Box>
    </Box>
  )
}

const previewOptions = [
  { label: 'Summary', key: 'summary' },
  { label: 'Raw', key: 'raw' },
]

const CallPreview = ({
  call,
  index,
  total,
  snapshotBlock,
}: {
  call: ProposalCall
  index: number
  total: number
  snapshotBlock?: number
}) => {
  const displayDetailedOption = call.signature === 'setPrimeBasket'
  const [detailed, setDetailed] = useState(
    displayDetailedOption ? 'summary' : 'raw'
  )
  const isDetailed = detailed === 'summary'

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
        <Text
          variant="bold"
          color="primary"
          className="mr-auto"
          sx={{ fontSize: 2 }}
        >
          {index + 1}/{total} {isDetailed && 'Set Primary basket'}
        </Text>
        {displayDetailedOption && (
          <TabMenu
            ml="auto"
            active={detailed}
            items={previewOptions}
            background="border"
            onMenuChange={(kind: string) => setDetailed(kind)}
          />
        )}
      </Box>
      {isDetailed ? (
        <DetailedCallPreview call={call} snapshotBlock={snapshotBlock} />
      ) : (
        <RawCallPreview call={call} />
      )}
      <Divider mt={3} sx={{ borderColor }} />
      <CallData data={call.callData} borderColor={borderColor} />
    </Box>
  )
}

const CallList = ({
  calls,
  snapshotBlock,
}: {
  calls: ContractProposal['calls']
  snapshotBlock?: number
}) => {
  const total = calls.length

  return (
    <Flex mt="2" sx={{ flexDirection: 'column', gap: 2 }}>
      {calls.map((call, index) => (
        <CallPreview
          key={call.signature}
          call={call}
          index={index}
          total={total}
          snapshotBlock={snapshotBlock}
        />
      ))}
    </Flex>
  )
}

// Actions setPrimeBasket
const ContractProposalDetails = ({ data, snapshotBlock, ...props }: Props) => {
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
      <CallList calls={data.calls} snapshotBlock={snapshotBlock} />
    </Card>
  )
}

export default React.memo(ContractProposalDetails)
