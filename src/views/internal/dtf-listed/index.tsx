import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import ExportAnalyticsButton from './components/export-analytics-button'
import ListedDTFTable from './components/listed-dtf-table'
import Updater from './updater'

const InternalDTFListed = () => {
  const [internalWallets, setInternalWallets] = useState('')
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')

  const parsedWallets = internalWallets
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return (
    <div className="container px-1 md:px-4 py-6 sm:py-8">
      <Updater />

      <div className="mb-8 px-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Listed DTFs</h1>
            <p className="text-muted-foreground">
              Whitelisted Index DTFs displayed on the discover page with their
              governance addresses
            </p>
          </div>
          <ExportAnalyticsButton
            internalWallets={parsedWallets}
            supabaseUrl={supabaseUrl}
            supabaseKey={supabaseKey}
          />
        </div>
      </div>

      <div className="space-y-4 px-2">
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Internal Wallets
          </label>
          <Textarea
            placeholder="Paste internal wallet addresses, one per line"
            value={internalWallets}
            onChange={(e) => setInternalWallets(e.target.value)}
            rows={4}
            className="font-mono text-xs"
          />
          {parsedWallets.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {parsedWallets.length} address
              {parsedWallets.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Supabase URL
            </label>
            <Input
              placeholder="https://your-project.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Supabase Key
            </label>
            <Input
              type="password"
              placeholder="Anon key"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </div>
        <ListedDTFTable />
      </div>
    </div>
  )
}

export default InternalDTFListed
