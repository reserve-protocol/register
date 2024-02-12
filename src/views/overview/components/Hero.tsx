import { Trans } from '@lingui/macro'
import { Button } from 'components'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import ChainLogo from 'components/icons/ChainLogo'
import MandateIcon from 'components/icons/MandateIcon'
import StackedChainLogo from 'components/icons/StackedChainLogo'
import StakedIcon from 'components/icons/StakedIcon'
import { CurrentRTokenLogo } from 'components/icons/TokenLogo'
import Popup from 'components/popup'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { ChevronDown, MoreHorizontal } from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router-dom'
import {
  chainIdAtom,
  estimatedApyAtom,
  rTokenListAtom,
  rTokenPriceAtom,
  rTokenStateAtom,
  rsrPriceAtom,
  selectedRTokenAtom,
} from 'state/atoms'
import { Box, BoxProps, Grid, Text } from 'theme-ui'
import { formatCurrency, shortenAddress } from 'utils'
import { BRIDGED_RTOKENS, ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address } from 'viem'

const BridgeTokenList = () => {
  const current = useAtomValue(selectedRTokenAtom)
  const chainId = useAtomValue(chainIdAtom)

  const tokenAddresses = useMemo(() => {
    const bridged = BRIDGED_RTOKENS[chainId]?.[current ?? '']

    if (!bridged) {
      return []
    }

    return [{ address: current as Address, chain: chainId }, ...bridged]
  }, [current, chainId])

  return (
    <Box p={3} backgroundColor="background">
      {tokenAddresses.map((token, i) => (
        <Box
          variant="layout.verticalAlign"
          mt={!!i ? 2 : 0}
          key={token.address}
        >
          <ChainLogo chain={token.chain} />
          <Text mx={2}>{shortenAddress(token.address)}</Text>

          <CopyValue mr={1} ml="auto" value={token.address} />
          <GoTo
            style={{ position: 'relative', top: '2px' }}
            href={getExplorerLink(
              token.address,
              token.chain,
              ExplorerDataType.TOKEN
            )}
          />
        </Box>
      ))}
    </Box>
  )
}

const TokenAddresses = () => {
  const [isVisible, setVisible] = useState(false)
  const current = useAtomValue(selectedRTokenAtom)
  const chainId = useAtomValue(chainIdAtom)
  const availableChains = useMemo(() => {
    const chains = [chainId]
    const bridged = BRIDGED_RTOKENS[chainId]?.[current ?? '']

    if (bridged) {
      for (const token of bridged) {
        chains.push(token.chain)
      }
    }

    return chains
  }, [current, chainId])
  const isBridged = availableChains.length > 1

  return (
    <Popup
      zIndex={0}
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={<BridgeTokenList />}
      placement="auto-start"
    >
      <Box
        mb={[3, 7]}
        variant="layout.verticalAlign"
        sx={{
          cursor: isBridged ? 'pointer' : 'cursor',
          flexGrow: 0,
          userSelect: 'none',
        }}
        onClick={() => isBridged && setVisible(!isVisible)}
      >
        <StackedChainLogo chains={availableChains} />
        <Text mr={2} variant="legend">
          {!!current && shortenAddress(current)}
        </Text>
        {isBridged && <ChevronDown size={16} />}
        {!isBridged && current && (
          <>
            <CopyValue mr={1} ml="auto" value={current} />
            <GoTo
              style={{ position: 'relative', top: '2px' }}
              href={getExplorerLink(current, chainId, ExplorerDataType.TOKEN)}
            />
          </>
        )}
      </Box>
    </Popup>
  )
}

const Actions = () => {
  const navigate = useNavigate()
  // TODO: Grab this from theGraph?
  const { holders, stakers } = useAtomValue(estimatedApyAtom)

  return (
    <Box variant="layout.verticalAlign" mt={4}>
      <Button
        mr={3}
        variant="accent"
        onClick={() => navigate(`../${ROUTES.ISSUANCE}`)}
      >
        <Trans>
          {!!holders ? `${formatCurrency(holders, 1)}% Est. APY` : 'Mint'}
        </Trans>
      </Button>
      <Button mr={3} onClick={() => navigate(`../${ROUTES.STAKING}`)}>
        Stake RSR {!!stakers && `- ${formatCurrency(stakers, 1)}% Est. APY`}
      </Button>
      <Button variant="bordered">
        <Box sx={{ height: 22 }}>
          <MoreHorizontal />
        </Box>
      </Button>
    </Box>
  )
}

// TODO: Move this to a more re-usable place?
const rTokenOverviewAtom = atom((get) => {
  const state = get(rTokenStateAtom)
  const rTokenPrice = get(rTokenPriceAtom)
  const rsrPrice = get(rsrPriceAtom)

  if (!rTokenPrice || !rsrPrice) {
    return null
  }

  return {
    supply: state.tokenSupply * rTokenPrice,
    staked: state.stTokenSupply * rsrPrice,
  }
})

const TokenMetrics = () => {
  const data = useAtomValue(rTokenOverviewAtom)

  return (
    <>
      <Text sx={{ display: 'block' }}>
        <Trans>Total Market Cap</Trans>
      </Text>

      <Text variant="accent" as="h1" sx={{ fontSize: 6 }}>
        ${formatCurrency(data?.supply ?? 0)}
      </Text>
      <Box variant="layout.verticalAlign">
        <StakedIcon />
        <Text ml={2}>
          <Trans>Stake pool USD value:</Trans>
        </Text>
        <Text ml="1" variant="strong">
          ${formatCurrency(data?.staked ?? 0)}
        </Text>
      </Box>
    </>
  )
}

const TokenStats = () => {
  return (
    <Box>
      <CurrentRTokenLogo mb={3} width={40} />
      <TokenMetrics />
      <Actions />
    </Box>
  )
}

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
        <Trans>{expanded ? '-' : '+'} Off-chain note</Trans>
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
        <Trans>Mandate</Trans>
      </Text>
      <Text as="p" variant="legend">
        {rToken?.mandate ? rToken.mandate : <Skeleton count={6} />}
      </Text>
      <OffChainNote />
    </Box>
  )
}

const Hero = () => {
  return (
    <Box ml="4">
      <TokenAddresses />
      <Grid gap={6} columns={[1, 1, 1, 2]}>
        <TokenStats />
        <TokenMandate />
      </Grid>
    </Box>
  )
}

export default Hero
