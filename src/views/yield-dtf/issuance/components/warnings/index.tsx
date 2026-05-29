import { Trans, useLingui } from '@lingui/react/macro'
import { isInactiveDTF, useDTFStatus } from '@/hooks/use-dtf-status'
import AlertIcon from 'components/icons/AlertIcon'
import useRToken from 'hooks/useRToken'
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

export const IssuancePausedBanner = ({ className }: { className?: string }) => {
  const { issuancePaused } = useAtomValue(rTokenStateAtom)

  if (!issuancePaused) return null

  return (
    <div className={cn('rounded-xl border border-secondary bg-card p-4', className)}>
      <div className="flex items-center">
        <AlertIcon width={24} height={24} className='flex-shrink-0' />
        <div className="ml-4">
          <span className="font-bold text-warning">
            <Trans>Warning</Trans>
          </span>
          <span className="block mt-1 text-warning">
            <Trans>
              Minting has been temporarily paused due to an abundance of caution
              related to the Kelp DAO exploit.
            </Trans>{' '}
            <a
              href="https://x.com/reserveprotocol/status/2046007367679267080"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              <Trans>Read more</Trans>
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}

export const IssuancePausedZapBanner = ({ className }: { className?: string }) => {
  const { issuancePaused } = useAtomValue(rTokenStateAtom)

  if (!issuancePaused) return null

  return (
    <div className={cn('rounded-xl border border-secondary bg-card p-4', className)}>
      <div className="flex items-center">
        <AlertIcon width={24} height={24} className='flex-shrink-0' />
        <div className="ml-4">
          <span className="font-bold text-warning">
            <Trans>Warning</Trans>
          </span>
          <span className="block mt-1 text-warning">
            <Trans>
              Due to limited liquidity on Aave related to the Kelp DAO exploit,
              Zaps will swap for RTokens in DEX pools. Please pay attention to
              price impact before redeeming.
            </Trans>{' '}
            <a
              href="https://x.com/reserveprotocol/status/2046007367679267080"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              <Trans>Read more</Trans>
            </a>
          </span>
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
  const { t } = useLingui()
  const { isCollaterized } = useAtomValue(rTokenStateAtom)

  if (isCollaterized) return null

  return (
    <WarningBanner
      className={className}
      title={t`DTF Basket is under re-collateralization.`}
      description={t`For redemptions, please wait until the process is complete.`}
    />
  )
}

export const MaintenanceBanner = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const maintenance = useAtomValue(maintenanceAtom)

  if (!maintenance) return null

  return (
    <WarningBanner
      className={className}
      title={t`RToken zapper is under maintenance.`}
      description={t`This should last for a few hours, manual minting/redemption is available.`}
    />
  )
}

export const DisabledArbitrumBanner = ({
  className,
}: {
  className?: string
}) => {
  const { t } = useLingui()
  const chainId = useAtomValue(chainIdAtom)

  if (chainId !== ChainId.Arbitrum) return null

  return (
    <WarningBanner
      className={className}
      title={t`Arbitrum mints are no longer supported.`}
      description={t`Because of a low usage, the Reserve DApp is sunsetting mints on Arbitrum. Redemptions will continue to be supported. Yield DTFs are always backed 1:1 by underlying assets and can be permissonlessly redeemed at any time.`}
    />
  )
}

export const DeprecatedBanner = ({
  className,
}: {
  className?: string
}) => {
  const { t } = useLingui()
  const rToken = useRToken()
  const status = useDTFStatus(rToken?.address, rToken?.chainId)

  if (!isInactiveDTF(status)) return null

  const symbol = `$${rToken?.symbol}`

  return (
    <WarningBanner
      className={className}
      title={t`Inactive DTF`}
      description={t`This DTF is no longer actively governed and can only be sold. This DTF cannot rebalance its basket nor can it new ${symbol} tokens be created.`}
    />
  )
}
