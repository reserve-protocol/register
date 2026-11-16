import { Trans, useLingui } from '@lingui/react/macro'
import Help from 'components/help'
import CircleIcon from 'components/icons/CircleIcon'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import EarnIcon from 'components/icons/EarnIcon'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import { atom, useAtomValue } from 'jotai'
import {
  estimatedApyAtom,
  rTokenAtom,
  rTokenBackingDistributionAtom,
  rTokenPriceAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { rTokenOvercollateralizationUsdAtom } from 'state/rtoken/atoms/rTokenBackingDistributionAtom'
import { formatCurrency, formatPercentage } from 'utils'
import CollateralsChart from './collaterals-chart'
import { rTokenTargetPriceAtom } from '@/views/yield-dtf/overview/atoms'

// TODO: TARGET PEG PRICE (ETH+)
const backingOverviewAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const rTokenState = get(rTokenStateAtom)
  const distribution = get(rTokenBackingDistributionAtom)
  const price = get(rTokenPriceAtom)
  const apys = get(estimatedApyAtom)
  const pegData = get(rTokenTargetPriceAtom)

  return {
    symbol: rToken?.symbol ?? '',
    backing: distribution?.backing ?? 0,
    staked: distribution?.staked ?? 0,
    stakedUsd: get(rTokenOvercollateralizationUsdAtom),
    yield: apys.basket,
    price: price,
    pegData,
    isCollaterized: rTokenState?.isCollaterized ?? true,
  }
})

const BackingOverview = ({ current }: { current: string }) => {
  const data = useAtomValue(backingOverviewAtom)
  const { t } = useLingui()
  const symbol = data.symbol

  return (
    <div className="mr-1 p-3 sm:p-4  flex flex-col w-full xl:w-[280px] h-fit shrink-0 text-sm sm:text-base bg-card rounded-2xl">
      <div className="flex items-start">
        <div className="flex items-center">
          <EarnNavIcon fontSize={16} />
          <span className="ml-2">1 {data.symbol}</span>
        </div>

        <div className="ml-auto text-right">
          {!!data.pegData ? (
            <>
              <span className="font-semibold">
                {formatCurrency(data.pegData.price)} {data.pegData.unit}
              </span>
              <span className="block text-legend text-xs">
                ${formatCurrency(data?.price)}
              </span>
            </>
          ) : (
            <span className="font-semibold">
              ${formatCurrency(data?.price)}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center">
        <EarnIcon color="currentColor" />
        <span className="ml-2">
          <Trans>Blended Yield</Trans>
        </span>
        <span className="ml-auto font-semibold">{data.yield.toFixed(2)}%</span>
      </div>
      <div className="hidden xl:block">
        <CollateralsChart />
      </div>
      <div className="mt-2 xl:mt-0 flex items-center">
        <CircleIcon color="currentColor" />
        <span className="ml-2">
          <Trans>Backing</Trans>
        </span>
        {data.isCollaterized ? (
          <span className="ml-auto font-semibold">
            {data.backing.toFixed(0)}%
          </span>
        ) : (
          <span className="ml-auto font-semibold text-rebalancing">
            Rebalancing
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center">
        <CollaterizationIcon fontSize={16} />
        <span className="ml-2">
          <Trans>Staked RSR</Trans>
        </span>
        <Help
          className="ml-1"
          size={12}
          content={
            <>
              <p>
                {t`RSR held by the staking contract (staked and in unstaking cooldown) as a % of ${symbol} market cap. This RSR can be seized to cover a collateral default.`}
              </p>
              {data.stakedUsd && (
                <div className="mt-2 flex flex-col gap-0.5">
                  <div className="flex justify-between gap-4">
                    <span>{t`RSR staked`}</span>
                    <span>${formatCurrency(data.stakedUsd.staked, 0)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>{t`RSR unstaking & pending rewards`}</span>
                    <span>${formatCurrency(data.stakedUsd.unstaking, 0)}</span>
                  </div>
                  <div className="flex justify-between gap-4 font-semibold">
                    <span>{t`Total`}</span>
                    <span>${formatCurrency(data.stakedUsd.total, 0)}</span>
                  </div>
                </div>
              )}
            </>
          }
        />
        <span className="ml-auto font-semibold">
          {formatPercentage(data.staked)}
        </span>
      </div>
    </div>
  )
}

export default BackingOverview
