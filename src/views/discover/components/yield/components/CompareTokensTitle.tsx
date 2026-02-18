import { Trans } from '@lingui/macro'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import { useTheme } from 'next-themes'
import CompareFilters from './CompareFilters'

const CompareBg = ({ position }: { position: 'left' | 'right' }) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div
      className="hidden lg:block w-[400px] h-[158px] top-0 -z-10 absolute bg-contain bg-no-repeat"
      style={{
        backgroundImage: 'url(/imgs/bg-compare.png)',
        opacity: isDark ? 0.25 : 1,
        left: position === 'left' ? 0 : undefined,
        right: position === 'right' ? 0 : undefined,
        transform: position === 'right' ? 'scaleX(-1)' : undefined,
      }}
    />
  )
}

const CompareTokensTitle = () => {
  return (
    <div className="flex flex-col items-center gap-1 mt-8 md:mt-14 mb-4 md:mb-14">
      <BasketCubeIcon key="box-three" fontSize={36} />

      <div className="flex items-center relative justify-center w-full gap-6">
        <CompareBg position="left" />

        <div className="flex flex-col items-center gap-1 text-center max-w-[400px]">
          <span className="block text-2xl font-bold">
            <Trans>Browse RTokens</Trans>
          </span>
          <span className="text-legend">
            <Trans>
              Inspect collateral backing, mint, stake, redeem & explore
              additional earn opportunities across DeFi
            </Trans>
          </span>
        </div>

        <CompareBg position="right" />
      </div>
      <div className="mt-4">
        <CompareFilters />
      </div>
    </div>
  )
}

export default CompareTokensTitle
