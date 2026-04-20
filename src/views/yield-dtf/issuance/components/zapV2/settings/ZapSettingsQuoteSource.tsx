import Enso from '@/components/icons/Enso'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Route, Zap } from 'lucide-react'
import { ZapQuoteSource } from '../api/quote-providers'
import { useZap } from '../context/ZapContext'

const OPTIONS: { value: ZapQuoteSource; label: string; icon: JSX.Element }[] = [
  { value: 'best', label: 'Best Quote', icon: <Route size={14} /> },
  { value: 'zap', label: 'Zap', icon: <Zap size={14} /> },
  { value: 'enso', label: 'Enso', icon: <Enso width={14} /> },
]

const ZapSettingsQuoteSource = () => {
  const { quoteSource, setQuoteSource } = useZap()

  return (
    <Select
      value={quoteSource}
      onValueChange={(value) => setQuoteSource(value as ZapQuoteSource)}
    >
      <SelectTrigger className="rounded-lg border-secondary bg-card">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map(({ value, label, icon }) => (
          <SelectItem key={value} value={value}>
            <div className="flex items-center gap-2">
              {icon}
              <span>{label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default ZapSettingsQuoteSource
