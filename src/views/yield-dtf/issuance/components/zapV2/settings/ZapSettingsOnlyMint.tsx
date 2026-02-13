import { Checkbox } from '@/components/ui/checkbox'
import { useZap } from '../context/ZapContext'

const ZapSettingsOnlyMint = () => {
  const { onlyMint, setOnlyMint } = useZap()

  return (
    <div className="rounded-lg border border-secondary bg-card">
      <label className="flex justify-between p-3 cursor-pointer">
        <div className="flex items-center gap-1.5">
          <span>Force minting RTokens</span>
        </div>
        <Checkbox
          title="Force minting RTokens"
          onCheckedChange={() => setOnlyMint(!onlyMint)}
          checked={onlyMint}
        />
      </label>
    </div>
  )
}

export default ZapSettingsOnlyMint
