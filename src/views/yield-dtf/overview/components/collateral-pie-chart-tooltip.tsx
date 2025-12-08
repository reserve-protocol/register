import { t } from '@lingui/macro'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import CirclesIcon from 'components/icons/CirclesIcon'
import PlatformExposureIcon from 'components/icons/PlatformExposureIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { ListedToken } from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { FC, memo, useMemo } from 'react'
import { rsrPriceAtom } from 'state/atoms'
import { collateralsMetadataAtom } from 'state/cms/atoms'
import { formatCurrency } from 'utils'

type ItemProps = {
  name: string
  value: number
  logo?: string
}

type CollateralPieChartTooltipProps = {
  token: ListedToken
}

const Item: FC<ItemProps> = ({ logo, name, value }) => {
  return (
    <div className="flex items-center bg-background border border-border text-foreground px-2 py-1.5 rounded-md flex-grow">
      <div className="flex items-center justify-between gap-2 flex-grow">
        <div className="flex items-center gap-1">
          <TokenLogo width={16} src={logo} />
          <span className="text-sm font-medium">{name}</span>
        </div>
        <span className="text-sm">{value.toFixed(0)}%</span>
      </div>
    </div>
  )
}

const CollateralPieChartTooltip: FC<CollateralPieChartTooltipProps> = ({
  token,
}) => {
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const metadata = useAtomValue(collateralsMetadataAtom)

  const rsrUSD = useMemo(
    () => formatCurrency(token.rsrStaked * rsrPrice, 0),
    [rsrPrice, token]
  )

  const chartData = useMemo(
    () =>
      token.collaterals.map((c) => {
        const symbol = c.symbol.toLowerCase().replace('-vault', '')
        const cmsCollateral = metadata?.[symbol]
        return {
          name: c.symbol,
          value:
            +(token.collateralDistribution[c.id.toLowerCase()]?.dist ?? 0) *
            100,
          logo:
            symbol === 'steakusdc'
              ? `imgs/steakusdc.png`
              : `svgs/${symbol}.svg`,
          project: cmsCollateral?.protocol?.name || 'GENERIC',
          projectLogo: cmsCollateral?.protocol?.logo,
          tokenDistribution: cmsCollateral?.tokenDistribution || [],
        }
      }),
    []
  )

  const collateralItems = useMemo(
    () =>
      chartData
        .map(({ name, value, logo }) => ({
          key: name,
          name,
          logo,
          value,
        }))
        .sort((a, b) => b.value - a.value),
    [chartData]
  )

  const platformItems = useMemo(
    () =>
      chartData
        .map(({ name, value, project, projectLogo }) => ({
          key: name,
          name: project,
          logo: projectLogo,
          value,
        }))
        .reduce((acc, current) => {
          const existing = acc.find(
            (item) => (item as ItemProps).name === current.name
          )
          if (existing) {
            existing.value += current.value
            return acc
          }
          return acc.concat(current as ItemProps)
        }, [] as ItemProps[])
        .sort((a, b) => b.value - a.value),
    [chartData]
  )

  const tokenItems = useMemo(
    () =>
      chartData
        .flatMap(({ name, tokenDistribution, value }) =>
          tokenDistribution.map(({ token, distribution }) => ({
            name,
            token,
            value: distribution * value,
          }))
        )
        .map(({ name, token, value }) => ({
          key: name + token,
          name: token,
          value,
          logo: `svgs/${token?.toLowerCase()}.svg`,
        }))
        .reduce((acc, current) => {
          const existing = acc.find(
            (item) => (item as ItemProps).name === current.name
          )
          if (existing) {
            existing.value += current.value
            return acc
          }
          return acc.concat(current as ItemProps)
        }, [] as ItemProps[])
        .sort((a, b) => b.value - a.value),
    [chartData]
  )

  return (
    <div className="flex flex-col items-start w-full max-w-full sm:max-w-[480px] min-w-full sm:min-w-[350px] p-0 sm:p-4 gap-4 rounded-[14px] bg-card sm:bg-card border-none sm:border-[3px] sm:border-muted sm:shadow-[0px_10px_45px_6px_rgba(0,0,0,0.10)]">
      <div className="flex flex-col items-start gap-2 w-full">
        <div className="flex items-center ml-2 gap-1">
          <BasketCubeIcon width={17} height={17} />
          <span className="text-sm">{t`Collateral(s)`}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          {collateralItems.map((item) => (
            <Item
              key={item.name}
              name={item.name}
              logo={item.logo}
              value={item.value}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 w-full">
        <div className="flex items-center ml-2 gap-1">
          <CirclesIcon
            color="currentColor"
            width={13}
            height={13}
            style={{ marginLeft: '1px' }}
          />
          <span className="text-sm">{t`Token exposure`}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          {tokenItems.map((item) => (
            <Item
              key={item.name}
              name={item.name}
              logo={item.logo}
              value={item.value}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 w-full">
        <div className="flex items-center ml-2 gap-1">
          <PlatformExposureIcon />
          <span className="text-sm">{t`Platform exposure`}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          {platformItems.map((item) => (
            <Item
              key={item.name}
              name={item.name}
              logo={item.logo}
              value={item.value}
            />
          ))}
        </div>
      </div>
      <hr className="border-border w-full my-0" />
      <div className="flex items-center gap-2 justify-between w-full">
        <div className="flex items-center gap-2">
          <TokenLogo width={16} src="/svgs/rsr.svg" />
          <div className="flex flex-col items-start">
            <span className="text-sm">
              {t`Staked RSR Overcollateralisation`}
            </span>
            <span className="font-medium">
              {token.overcollaterization.toFixed(0)}%
            </span>
          </div>
        </div>
        <span className="text-sm text-[#666666]">${rsrUSD}</span>
      </div>
    </div>
  )
}

export default memo(CollateralPieChartTooltip)
