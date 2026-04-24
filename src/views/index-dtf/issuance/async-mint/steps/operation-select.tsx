import Help from '@/components/ui/help'
import { useSetAtom } from 'jotai'
import { ArrowRight, Coins, OctagonAlert, Wallet } from 'lucide-react'
import { wizardStepAtom } from '../atoms'

const OperationCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  disabled,
}: {
  title: string
  description: string
  icon: React.ElementType
  onClick: () => void
  disabled?: boolean
}) => (
  <button
    className="bg-background rounded-[20px] p-3 w-full text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
    onClick={onClick}
    disabled={disabled}
  >
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 shrink-0">
          <Icon size={16} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-medium text-base">{title}</span>
          <span className="text-sm text-muted-foreground font-light">
            {description}
          </span>
        </div>
      </div>
      <div className="bg-muted group-hover:bg-primary group-hover:text-primary-foreground size-8 rounded-full flex items-center justify-center transition-colors shrink-0 ml-3">
        <ArrowRight size={16} strokeWidth={1.5} />
      </div>
    </div>
  </button>
)

const OperationSelect = () => {
  const setStep = useSetAtom(wizardStepAtom)

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full max-w-[468px] mx-auto">
      {/* Header area — same as gnosis-required */}
      <div className="flex flex-col min-h-[307px] rounded-[20px]">
        <div className="flex-1 px-6 pt-6 pb-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center pr-4">
              <img
                src="https://storage.reserve.org/cowswap.svg"
                alt="CoW Protocol"
                className="w-8 h-8 z-[2] border border-secondary rounded-full"
              />
              <img
                src="https://storage.reserve.org/universal.svg"
                alt="Universal Protocol"
                className="w-8 h-8 -ml-4 z-[1]"
              />
            </div>
            <div className="h-8 px-3 bg-background rounded-full flex items-center gap-1 text-sm font-light">
              <OctagonAlert size={16} strokeWidth={1.5} />
              <span>Gnosis Safe Required</span>
              <Help
                size={16}
                content="This feature uses atomic batch transactions which require a Gnosis Safe wallet."
                className="text-muted-foreground/80"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-semibold text-primary max-w-[306px]">
              Get better prices by accessing off-chain liquidity
            </h2>
            <p className="text-base font-light">
              Automated Slow Mints can provide better quotes for minting or
              redeeming a DTF, especially when dealing with significant amounts
              of capital or DTFs with bridged or low DEX liquidity collateral
              assets.
            </p>
          </div>
        </div>
      </div>

      {/* Operation cards */}
      <div className="flex flex-col gap-0.5">
        <OperationCard
          title="Mint"
          description="Acquire collateral and mint DTF tokens"
          icon={Wallet}
          onClick={() => setStep('collateral-decision')}
        />
        <OperationCard
          title="Redeem"
          description="Coming soon"
          icon={Coins}
          onClick={() => {}}
          disabled
        />
      </div>
    </div>
  )
}

export default OperationSelect
