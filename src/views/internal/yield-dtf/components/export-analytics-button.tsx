import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { listedYieldDTFsAtom } from '../atoms'
import {
  exportYieldDTFAnalytics,
  ExportProgress,
} from '@/utils/yield-dtf-analytics'

const ExportAnalyticsButton = () => {
  const dtfList = useAtomValue(listedYieldDTFsAtom)
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<ExportProgress>({
    current: 0,
    total: 0,
  })

  const handleExport = async () => {
    if (dtfList.length === 0) return

    setIsExporting(true)
    setProgress({ current: 0, total: dtfList.length, phase: 'fetching' })

    try {
      const inputs = dtfList.map((dtf) => ({
        address: dtf.id,
        symbol: dtf.symbol,
        name: dtf.name,
        chainId: dtf.chainId,
      }))

      await exportYieldDTFAnalytics(inputs, setProgress)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const getButtonLabel = () => {
    if (!isExporting) return 'Export Analytics CSV'

    if (progress.phase === 'generating') return 'Generating CSV...'

    if (progress.currentDtf) {
      return `${progress.current + 1}/${progress.total}: ${progress.currentDtf}`
    }

    return `Exporting ${progress.current}/${progress.total}...`
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting || dtfList.length === 0}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {getButtonLabel()}
    </Button>
  )
}

export default ExportAnalyticsButton
