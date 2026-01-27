import { Trans } from '@lingui/macro'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import ChainLogo from 'components/icons/ChainLogo'
import PositionIcon from 'components/icons/PositionIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useRTokenLogo from 'hooks/useRTokenLogo'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  accountHoldingsAtom,
  accountTokensAtom,
  rsrPriceAtom,
  walletAtom,
} from 'state/atoms'
import { AccountRTokenPosition } from 'state/wallet/updaters/AccountUpdater'
import { formatCurrency, getTokenRoute } from 'utils'
import { RSR_ADDRESS } from 'utils/addresses'
import { supportedChainList } from 'utils/constants'
import { useBalance } from 'wagmi'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const PortfolioToken = ({ position }: { position: AccountRTokenPosition }) => {
  const logo = useRTokenLogo(position.address, position.chain)
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(getTokenRoute(position.address, position.chain))
    mixpanel.track('Selected RToken', {
      Source: 'Portfolio Table',
      RToken: position.address,
    })
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-4 bg-secondary relative rounded-xl cursor-pointer mt-4 p-6"
      onClick={handleClick}
    >
      <div className="flex items-center">
        <TokenLogo width={24} className="mr-2" src={logo} />
        <span className="ml-1 font-semibold">
          {formatCurrency(+position.balance)} {position.symbol}
        </span>
      </div>

      <div className="hidden sm:flex items-center">
        <span className="mr-2 font-semibold">=</span>
        <span className="text-legend">${formatCurrency(+position.usdAmount)}</span>
      </div>

      <div className="flex flex-wrap ml-8 sm:ml-0 items-center">
        <div className="flex items-center">
          <PositionIcon />
          <span className="whitespace-nowrap ml-2">
            {formatCurrency(position.stakedRSR)} RSR
          </span>
        </div>

        <span className="ml-2 text-legend">
          (${formatCurrency(+position.stakedRSRUsd)})
        </span>
      </div>
      <div className="text-right absolute sm:relative right-5 top-[calc(50%-10px)]">
        <ChainLogo chain={position.chain} />
      </div>
    </div>
  )
}

const AccountRSR = ({ chain }: { chain: number }) => {
  const wallet = useAtomValue(walletAtom) || '0x'
  const rsrPrice = useAtomValue(rsrPriceAtom)

  const { data } = useBalance({
    token: RSR_ADDRESS[chain],
    address: wallet,
    chainId: chain,
  })

  return (
    <div className="flex items-center">
      <div className="relative">
        <TokenLogo width={24} symbol="rsr" bordered chain={chain} />
      </div>
      <div className="ml-4">
        <span className="font-semibold block">
          {formatCurrency(Number(data?.formatted ?? 0))} RSR
        </span>
        <span className="text-xs text-legend">
          ${formatCurrency(Number(data?.formatted ?? 0) * rsrPrice)}
        </span>
      </div>
    </div>
  )
}

interface PortfolioProps {
  className?: string
}

const Portfolio = ({ className }: PortfolioProps) => {
  const rTokens = useAtomValue(accountTokensAtom)
  const wallet = useAtomValue(walletAtom)
  const holdings = useAtomValue(accountHoldingsAtom)
  const { openConnectModal } = useConnectModal()

  if (!wallet) {
    return (
      <div className="mx-1 sm:mx-0">
        <h2 className="ml-8 mb-6 text-2xl font-semibold">
          <Trans>Portfolio</Trans>
        </h2>
        <Card
          onClick={openConnectModal}
          className="py-8 border-2 border-dashed border-border text-center cursor-pointer"
        >
          <LogIn size={32} className="mx-auto" />

          <span className="mt-4 block">
            <Trans>Please connect your wallet</Trans>
          </span>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn(className)}>
      <div>
        <div className="ml-6">
          <span className="mb-1 text-xl font-medium text-legend block">
            <Trans>Wallet staked RSR + RToken Value</Trans>
          </span>
          <h1 className="text-2xl sm:text-5xl font-normal">
            ${formatCurrency(holdings)}
          </h1>
          <div className="mt-2 flex items-center">
            {supportedChainList.map((chain) => (
              <div key={chain} className="flex items-center mr-4">
                <span className="mr-4 text-2xl">+</span>
                <AccountRSR chain={chain} />
              </div>
            ))}
          </div>
        </div>
        {rTokens?.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <span className="pl-6 mb-4 sm:mb-0 text-xl font-medium text-legend block">
              <Trans>Your RTokens</Trans>
            </span>
            <div className="hidden sm:grid grid-cols-4 p-6">
              <span className="font-semibold">Token</span>
              <span className="text-legend">USD value</span>
              <span className="text-legend">
                <Trans>Your staked RSR</Trans>
              </span>
              <div></div>
            </div>
            <div className="-mt-4">
              {rTokens.map((position) => (
                <PortfolioToken key={position.address} position={position} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Portfolio
