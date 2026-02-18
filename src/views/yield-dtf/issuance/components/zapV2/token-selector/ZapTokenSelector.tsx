import { ChevronDown } from 'lucide-react'
import { useZap } from '../context/ZapContext'
import ZapTokenSelected from './ZapTokenSelected'
import ZapTokensModal from './ZapTokensModal'

const ZapTokenSelector = () => {
  const { openTokenSelector, setOpenTokenSelector } = useZap()

  return (
    <>
      {openTokenSelector && <ZapTokensModal />}
      <div
        className="flex items-center cursor-pointer gap-1"
        onClick={() => setOpenTokenSelector(true)}
      >
        <div className="flex items-center px-2 py-1 rounded border border-muted-foreground/20 bg-background shadow-[0px_1px_8px_2px_rgba(0,0,0,0.05)]">
          <ZapTokenSelected />
          <ChevronDown size={20} strokeWidth={1.8} />
        </div>
      </div>
    </>
  )
}

export default ZapTokenSelector
