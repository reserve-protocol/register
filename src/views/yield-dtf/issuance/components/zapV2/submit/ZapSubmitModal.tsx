import { Button } from '@/components/ui/button'
import { Trans, useLingui } from '@lingui/react/macro'
import { Modal } from 'components'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { useZap } from '../context/ZapContext'
import ZapInputUSD from '../input/ZapInputUSD'
import ZapOutputUSD from '../output/ZapOutputUSD'
import ZapDetails from '../overview/ZapDetails'
import ZapConfirm from './ZapConfirm'
import { ZapTxProvider } from '../context/ZapTxContext'
import Skeleton from 'react-loading-skeleton'
import MintersModal from '../minters-modal'

const ZapOverview = () => {
  const [collapsed, setCollapsed] = useState(true)
  const { tokenIn, tokenOut, amountIn, amountOut, loadingZap } = useZap()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <TokenLogo symbol={tokenIn.symbol} width={24} />
          <div className="flex flex-col">
            <span>
              <Trans>You use:</Trans>
            </span>
            <span className="text-[26px] font-bold">
              {amountIn} {tokenIn.symbol}
            </span>
            <ZapInputUSD />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TokenLogo symbol={tokenOut.symbol} width={24} />
          <div className="flex flex-col">
            <span>
              <Trans>You receive:</Trans>
            </span>
            {loadingZap ? (
              <Skeleton width={300} height={35} />
            ) : (
              <span className="text-[26px] font-bold">
                {amountOut} {tokenOut.symbol}
              </span>
            )}

            <ZapOutputUSD />
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center">
          <Separator className="flex-1 border-dashed border-muted-foreground/30" />
          <Button size="sm" variant="ghost" onClick={() => setCollapsed((c) => !c)}>
            <span className="flex items-center text-muted-foreground min-w-[92px] justify-between">
              <span className="mr-2">
                {collapsed ? <Trans>Show more</Trans> : <Trans>Show less</Trans>}
              </span>
              <AsteriskIcon />
            </span>
          </Button>
          <Separator className="flex-1 border-dashed border-muted-foreground/30" />
        </div>
        <div
          className={cn(
            'overflow-hidden transition-[max-height]',
            collapsed
              ? 'max-h-0 duration-100 ease-in-out'
              : 'max-h-[1000px] duration-400 ease-in-out'
          )}
        >
          <ZapDetails hideGasCost />
        </div>
      </div>
      <ZapTxProvider>
        <ZapConfirm />
      </ZapTxProvider>
    </div>
  )
}

const ZapSubmitModal = () => {
  const { t } = useLingui()
  const { setOpenSubmitModal, operation, refreshQuote } = useZap()

  const handleClose = () => {
    setOpenSubmitModal(false)
    refreshQuote()
  }

  return (
    <Modal
      title={operation === 'mint' ? t`Review Mint` : t`Review Redeem`}
      onClose={handleClose}
      width={440}
    >
      <ZapOverview />
      <MintersModal />
    </Modal>
  )
}

export default ZapSubmitModal
