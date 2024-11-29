import AsteriskIcon from 'components/icons/AsteriskIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowRight, ArrowUp, Plus, X } from 'lucide-react'
import 'react-json-view-lite/dist/index.css'
import { collateralYieldAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, BoxProps, Flex, Grid, Spinner, Text } from 'theme-ui'
import { formatPercentage } from 'utils'
import { collateralDisplay } from 'utils/constants'
import { ProposalCall } from '@/views/rtoken/governance/atoms'
import {
  BasketItem,
  DiffItem,
  useBasketChangesSummary,
} from '@/views/rtoken/governance/hooks'

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

interface IStatusBox extends BoxProps {
  status: DiffItem['status']
}

const StatusBox = ({ status, sx = {}, ...props }: IStatusBox) => {
  const statusMap = {
    added: {
      label: 'Add',
      icon: <Plus size={16} color="#2150A9" />,
    },
    removed: {
      label: 'Remove',
      icon: <X size={16} color="#FF0000" />,
    },
    increased: {
      label: 'Increase',
      icon: <ArrowUp size={16} color="#11BB8D" />,
    },
    reduced: {
      label: 'Reduce',
      color: 'warning',
      icon: <ArrowDown size={16} color="#FF8A00" />,
    },
    unchanged: {
      label: 'No change',
      icon: <AsteriskIcon />,
    },
  }

  return (
    <Box
      variant="layout.verticalAlign"
      px="10px"
      py="1"
      sx={{
        height: 'fit-content',
        border: '1px solid',
        borderColor: 'border',
        fontSize: [0, 1],
        fontWeight: 500,
        gap: 1,
        borderRadius: borderRadius.boxes,
        ...sx,
      }}
      {...props}
    >
      {statusMap[status].icon}
      <Text color={status === 'unchanged' ? 'secondaryText' : 'text'}>
        {statusMap[status].label}
      </Text>
    </Box>
  )
}

const BasketDiffItem = ({ item }: { item: DiffItem }) => {
  const rToken = useRToken()
  const apys = useAtomValue(collateralYieldAtom)[rToken?.chainId ?? 1] || {}

  return (
    <Grid columns={[1, 3]} gap={[1, 2]} sx={{ width: '100%' }}>
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
        sx={{
          justifyContent: ['left', 'center'],
          fontWeight: 500,
        }}
      >
        <StatusBox
          sx={{ display: ['flex', 'none'] }}
          mr="auto"
          status={item.status}
        />

        <Text
          sx={{
            minWidth: '52px',
            color:
              item.status === 'added' || item.status === 'unchanged'
                ? 'secondaryText'
                : 'text',
            textAlign: 'right',
          }}
        >
          {item.status === 'added' ? 'N/A' : formatPercentage(item.oldWeight)}
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
        <Text
          sx={{
            minWidth: '52px',
            color: item.status === 'unchanged' ? 'secondaryText' : 'text',
          }}
        >
          {formatPercentage(item.newWeight)}
        </Text>
      </Box>
      <StatusBox
        sx={{ display: ['none', 'flex'] }}
        ml="auto"
        status={item.status}
      />
    </Grid>
  )
}

const BasketAPYDiff = ({
  snapshot = {},
  proposal = {},
  meta = {},
}: {
  snapshot?: BasketItem
  proposal?: BasketItem
  meta?: Record<string, string>
}) => {
  const rToken = useRToken()
  const proposedApy = useBasketApy(proposal, rToken?.chainId ?? 1, meta)
  const currentApy = useBasketApy(snapshot, rToken?.chainId ?? 1, meta)

  return (
    <Box
      variant="layout.verticalAlign"
      pt="3"
      mt="2"
      sx={{
        borderTop: '1px solid',
        fontWeight: 500,
        borderColor: 'border',
      }}
    >
      <Text mr="auto">30-day blended APY:</Text>
      <Text variant="legend" ml="3" mr="1">
        {formatPercentage(currentApy)}
      </Text>
      <ArrowRight size={16} />
      <Text ml="1">{formatPercentage(proposedApy)}</Text>
    </Box>
  )
}

const BasketChangeSummary = ({
  call,
  snapshotBlock,
}: {
  call: ProposalCall
  snapshotBlock?: number
}) => {
  const rToken = useRToken()
  const { data, isLoading } = useBasketChangesSummary(
    call.data,
    rToken?.address,
    rToken?.chainId,
    snapshotBlock
  )

  if (isLoading) {
    return (
      <Flex
        my="4"
        sx={{ flexDirection: 'column', gap: 2, alignItems: 'center' }}
      >
        <Spinner size={20} />
        <Text variant="legend">Loading summary...</Text>
      </Flex>
    )
  }

  return (
    <Box mt="2">
      <Grid
        columns={[2, 3]}
        gap={2}
        mb="2"
        sx={{ color: 'secondaryText', fontSize: 1 }}
      >
        <Text>Collateral token</Text>
        <Text mr={['none', 'auto']} ml="auto">
          Old weight / New weight
        </Text>
        <Text ml="auto" sx={{ display: ['none', 'block'] }}>
          Change
        </Text>
      </Grid>
      <Flex sx={{ flexDirection: 'column', gap: [3, 2], width: '100%' }}>
        {data?.diff.map((item) => (
          <BasketDiffItem key={item.address} item={item} />
        ))}
      </Flex>
      <BasketAPYDiff
        proposal={data?.proposalBasket}
        snapshot={data?.snapshotBasket}
        meta={data?.tokensMeta}
      />
    </Box>
  )
}

export default BasketChangeSummary
