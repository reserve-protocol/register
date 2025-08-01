import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { isAddress } from '@/utils'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { DownloadCloud, FilePlus2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  finalizeProposedBasketAtom,
  finalizeProposedUnitsAtom,
  rebalanceTokenMapAtom
} from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'

const MAX_FILE_SIZE = 1024 * 1024 // 1MB


const FinalizeWeightsCsvSetup = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const finalizeBasket = useAtomValue(finalizeProposedBasketAtom)
  const proposedUnits = useAtomValue(finalizeProposedUnitsAtom)
  const setProposedUnits = useSetAtom(finalizeProposedUnitsAtom)
  const rebalanceParams = useRebalanceParams()
  const [error, setError] = useState<string | null>(null)
  
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)

    if (rejectedFiles.length > 0) {
      setError('Please upload a CSV file less than 1MB.')
      return
    }

    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string
        if (!csvText) {
          setError('Failed to read CSV file')
          return
        }

        // Process CSV directly
        if (!finalizeBasket || !rebalanceParams) return

        const rows = csvText.split('\n')
        const newProposedUnits = { ...proposedUnits }

        // Skip header row and process each data row
        rows.slice(1).forEach((row) => {
          if (!row.trim()) return

          const values = row.split(',')
          if (values.length < 3) return

          const symbol = values[0].trim()
          const address = values[1].trim().toLowerCase()
          const valueStr = values[2].trim() || '0'

          // Validate that this token is in the rebalance
          if (!rebalanceParams.rebalance.tokens.map(t => t.toLowerCase()).includes(address)) {
            return // Skip tokens not in the rebalance
          }

          if (!address || !isAddress(address) || !valueStr || isNaN(Number(valueStr))) {
            return
          }

          // Update units only for existing rebalance tokens
          if (finalizeBasket[address]) {
            const normalizedValue = valueStr.toLowerCase().includes('e')
              ? Number.parseFloat(valueStr).toString()
              : valueStr
            
            newProposedUnits[address] = normalizedValue
          }
        })

        // Update state
        setProposedUnits(newProposedUnits)
      } catch (err) {
        console.error('Error parsing CSV:', err)
        setError('Failed to parse CSV file. Please check the format.')
      }
    }

    reader.onerror = () => {
      setError('Error reading the file')
    }

    reader.readAsText(file)
  }, [finalizeBasket, proposedUnits, rebalanceParams, setProposedUnits])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  })

  const handleTemplate = (e: React.MouseEvent) => {
    e.stopPropagation()
    let template = `symbol,address,value`

    if (finalizeBasket) {
      template += `\n${Object.values(finalizeBasket)
        .map(
          (asset) =>
            `${asset.token.symbol},${asset.token.address},${proposedUnits[asset.token.address.toLowerCase()] || asset.currentUnits}`
        )
        .join('\n')}`
    }

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    // Create a temporary anchor element to download the file
    const a = document.createElement('a')
    a.href = url
    a.download = `${dtf?.token.symbol}_rebalance_weights_template.csv`
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-4 border border-dashed rounded-xl',
        isDragActive && 'border-primary bg-muted/50',
        error && 'border-destructive'
      )}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <div className="rounded-full border border-foreground p-2">
        <FilePlus2 size={16} />
      </div>
      <div className="text-base mr-auto">
        <p className="font-bold">Upload Basket Weights CSV</p>
        <p>
          <span className="text-primary cursor-pointer">
            Select a CSV file to upload
          </span>{' '}
          <span className="text-legend">or drag and drop it here</span>
        </p>
      </div>
      <Button
        variant="ghost"
        className="text-legend font-normal gap-2"
        onClick={handleTemplate}
      >
        CSV Template
        <DownloadCloud size={14} />
      </Button>
    </div>
  )
}

export default FinalizeWeightsCsvSetup