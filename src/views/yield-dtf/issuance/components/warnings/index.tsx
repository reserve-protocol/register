import AlertIcon from 'components/icons/AlertIcon'
import { atom, useAtomValue } from 'jotai'
import { chainIdAtom, rTokenStateAtom } from 'state/atoms'
import { cn } from '@/lib/utils'
import { ChainId } from 'utils/chains'

// TODO: Use CMS for this state? or maybe environment variables, chain specific
const maintenanceAtom = atom((get) => {
  return false
})

const WarningBanner = ({
  title,
  description,
  className,
}: {
  title: string
  description: string
  className?: string
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-secondary bg-card p-4',
        className
      )}
    >
      <div className="flex items-center">
        <AlertIcon width={32} height={32} />
        <div className="ml-4">
          <span className="font-bold text-warning">{title}</span>
          <br />
          <span className="block mt-1 text-warning">{description}</span>
        </div>
      </div>
    </div>
  )
}

export const CollateralizationBanner = ({
  className,
}: {
  className?: string
}) => {
  const { isCollaterized } = useAtomValue(rTokenStateAtom)

  if (isCollaterized) return null

  return (
    <WarningBanner
      className={className}
      title="RToken basket is under re-collateralization."
      description="For redemptions, please wait until the process is complete or manually redeem using the previous basket."
    />
  )
}

export const MaintenanceBanner = ({ className }: { className?: string }) => {
  const maintenance = useAtomValue(maintenanceAtom)

  if (!maintenance) return null

  return (
    <WarningBanner
      className={className}
      title="RToken zapper is under maintenance."
      description="This should last for a few hours, manual minting/redemption is available."
    />
  )
}

export const DisabledArbitrumBanner = ({
  className,
}: {
  className?: string
}) => {
  const chainId = useAtomValue(chainIdAtom)

  if (chainId !== ChainId.Arbitrum) return null

  return (
    <WarningBanner
      className={className}
      title="Arbitrum mints are no longer supported."
      description="Because of a low usage, the Reserve DApp is sunsetting mints on Arbitrum. Redemptions will continue to be supported. Yield DTFs are always backed 1:1 by underlying assets and can be permissonlessly redeemed at any time."
    />
  )
}
