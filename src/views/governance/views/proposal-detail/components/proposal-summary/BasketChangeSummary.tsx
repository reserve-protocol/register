import AsteriskIcon from 'components/icons/AsteriskIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowRight, ArrowUp, Plus, X } from 'react-feather'
import 'react-json-view-lite/dist/index.css'
import { collateralYieldAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, Flex, Grid, Spinner, Text } from 'theme-ui'
import { formatPercentage } from 'utils'
import { collateralDisplay } from 'utils/constants'
import { ProposalCall } from 'views/governance/atoms'
import {
  BasketItem,
  DiffItem,
  useBasketChangesSummary,
} from 'views/governance/hooks'

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

const StatusBox = ({ status }: { status: DiffItem['status'] }) => {
  const statusMap = {
    added: {
      label: 'Add',
      icon: <Plus size={16} />,
    },
    removed: {
      label: 'Remove',
      icon: <X size={16} />,
    },
    increased: {
      label: 'Increase',
      icon: <ArrowUp size={16} />,
    },
    reduced: {
      label: 'Reduce',
      icon: <ArrowDown size={16} />,
    },
    unchanged: {
      label: 'No change',
      icon: <AsteriskIcon />,
    },
  }

  return (
    <Box
      variant="layout.verticalAlign"
      ml="auto"
      px="2"
      py="1"
      sx={{
        height: 'fit-content',
        border: '1px solid',
        borderColor: 'border',
        fontSize: 1,
        fontWeight: 500,
        gap: 1,
        borderRadius: borderRadius.boxes,
      }}
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
      <Box variant="layout.verticalAlign" sx={{ justifyContent: 'center' }}>
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
      <StatusBox status={item.status} />
    </>
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
          <BasketDiffItem item={item} />
        ))}
      </Grid>
      <BasketAPYDiff
        proposal={data?.proposalBasket}
        snapshot={data?.snapshotBasket}
        meta={data?.tokensMeta}
      />
    </Box>
  )
}

export default BasketChangeSummary
