import AlertIcon from 'components/icons/AlertIcon'
import { isInactiveDTF, useDTFStatus } from '@/hooks/use-dtf-status'
import useRToken from 'hooks/useRToken'
import TokenInfo from './token-info'
import TokenMandate from './token-mandate'
import TokenStats from './token-stats'

const DeprecatedBanner = () => {
  const rToken = useRToken()
  const status = useDTFStatus(rToken?.address, rToken?.chainId)

  if (!isInactiveDTF(status)) return null

  return (
    <div className="rounded-xl border border-secondary bg-card p-4 mx-4 sm:mx-8 mt-6">
      <div className="flex items-center">
        <AlertIcon width={32} height={32} />
        <div className="ml-4">
          <span className="font-bold text-warning">
            DTF Inactive
          </span>
          <br />
          <span className="block mt-1 text-warning">
            This DTF is no longer actively governed and can only be sold. This DTF cannot rebalance its basket nor can it new ${rToken?.symbol} tokens be created.
          </span>
        </div>
      </div>
    </div>
  )
}

const Hero = () => (
  <div>
    <DeprecatedBanner />
    <div className="mx-4 sm:mx-8 mt-6">
      <TokenInfo />
      <div className="mt-8 sm:mt-16 gap-6 grid grid-cols-1 2xl:grid-cols-[3fr_2fr] items-end">
        <TokenStats />
        <TokenMandate />
      </div>
    </div>
  </div>
)

export default Hero
