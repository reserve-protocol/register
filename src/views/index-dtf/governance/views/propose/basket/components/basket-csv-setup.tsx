import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { ChevronDown, Download, DownloadCloud, FilePlus2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  isUnitBasketAtom,
  proposedIndexBasketAtom,
  proposedSharesAtom,
  proposedUnitsAtom,
} from '../atoms'
import { isAddress } from '@/utils'

const MAX_FILE_SIZE = 1024 * 1024 // 1MB

const setNewBasketFromCsvAtom = atom(null, (get, set, csv: string) => {
  const proposedSharesMap = get(proposedSharesAtom)
  const proposedUnitsMap = get(proposedUnitsAtom)
  const proposedIndexBasket = get(proposedIndexBasketAtom)

  if (!proposedIndexBasket) return

  const rows = csv.split('\n')
  const newProposedIndexBasket = { ...proposedIndexBasket }
  const newProposedShares = { ...proposedSharesMap }
  const newProposedUnits = { ...proposedUnitsMap }

  // Skip header row and process each data row
  rows.slice(1).forEach((row) => {
    if (!row.trim()) return // Skip empty rows

    const values = row.split(',')
    if (values.length < 3) return // Ensure we have enough columns

    const symbol = values[0].trim()
    const address = values[1].trim().toLowerCase()
    const valueStr = values[2].trim() || '0'

    // Validate data
    if (
      !address ||
      !isAddress(address) ||
      !valueStr ||
      isNaN(Number(valueStr))
    ) {
      return
    }

    // Add token to basket if it doesn't exist
    if (!newProposedIndexBasket[address]) {
      newProposedIndexBasket[address] = {
        token: {
          address: address as `0x${string}`,
          symbol,
          decimals: 18,
          name: symbol,
        },
        currentShares: '0',
        currentUnits: '0',
      }
    }

    // Update shares and units
    // Convert scientific notation to decimal string if present
    const normalizedValue = valueStr.toLowerCase().includes('e')
      ? Number.parseFloat(valueStr.toString()).toString()
      : valueStr

    newProposedShares[address] = normalizedValue
    newProposedUnits[address] = normalizedValue
  })

  // Update atoms with new values
  set(proposedIndexBasketAtom, newProposedIndexBasket)
  set(proposedSharesAtom, newProposedShares)
  set(proposedUnitsAtom, newProposedUnits)
})

const BasketCsvSetup = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const isUnitBasket = useAtomValue(isUnitBasketAtom)
  const assets = useAtomValue(proposedIndexBasketAtom)
  const setNewBasketFromCsv = useSetAtom(setNewBasketFromCsvAtom)
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

        // Update the basket state
        setNewBasketFromCsv(csvText)
      } catch (err) {
        console.error('Error parsing CSV:', err)
        setError('Failed to parse CSV file. Please check the format.')
      }
    }

    reader.onerror = () => {
      setError('Error reading the file')
    }

    reader.readAsText(file)
  }, [])

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

    if (assets) {
      template += `\n${Object.values(assets)
        .map(
          (asset) =>
            `${asset.token.symbol},${asset.token.address},${isUnitBasket ? asset.currentUnits : asset.currentShares}`
        )
        .join('\n')}`
    }

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    // Create a temporary anchor element to download the file
    const a = document.createElement('a')
    a.href = url
    a.download = `${dtf?.token.symbol}_basket_template.csv`
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
        <p className="font-bold">Replace Basket with CSV</p>
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

export default BasketCsvSetup
