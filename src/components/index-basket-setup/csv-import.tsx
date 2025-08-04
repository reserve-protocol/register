import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { isAddress } from '@/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { DownloadCloud, FilePlus2 } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  basketItemsAtom,
  currentInputTypeAtom,
  proposedSharesAtom,
  proposedUnitsAtom,
} from './atoms'

const MAX_FILE_SIZE = 1024 * 1024 // 1MB

interface CsvImportProps {
  title?: string
  description?: React.ReactNode
  templateFilename?: string
  onImportComplete?: () => void
}

export const CsvImport = ({
  title = 'Replace Basket with CSV',
  description,
  templateFilename,
  onImportComplete,
}: CsvImportProps) => {
  const dtf = useAtomValue(indexDTFAtom)
  const basketItems = useAtomValue(basketItemsAtom)
  const currentInputType = useAtomValue(currentInputTypeAtom)
  const proposedShares = useAtomValue(proposedSharesAtom)
  const proposedUnits = useAtomValue(proposedUnitsAtom)
  const setProposedShares = useSetAtom(proposedSharesAtom)
  const setProposedUnits = useSetAtom(proposedUnitsAtom)
  const [error, setError] = useState<string | null>(null)

  const processCsvData = useCallback(
    (csvText: string) => {
      try {
        const rows = csvText.split('\n')
        const newShares: Record<string, string> = {}
        const newUnits: Record<string, string> = {}

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

          // Only update values for tokens that exist in the basket
          if (basketItems[address]) {
            // Convert scientific notation to decimal string if present
            const normalizedValue = valueStr.toLowerCase().includes('e')
              ? Number.parseFloat(valueStr).toString()
              : valueStr

            if (currentInputType === 'shares') {
              newShares[address] = normalizedValue
            } else {
              newUnits[address] = normalizedValue
            }
          }
        })

        // Update the appropriate atom based on current input type
        if (currentInputType === 'shares') {
          setProposedShares((prev) => ({ ...prev, ...newShares }))
        } else {
          setProposedUnits((prev) => ({ ...prev, ...newUnits }))
        }

        setError(null)
        onImportComplete?.()
      } catch (err) {
        console.error('Error processing CSV:', err)
        setError('Failed to process CSV file. Please check the format.')
      }
    },
    [
      basketItems,
      currentInputType,
      setProposedShares,
      setProposedUnits,
      onImportComplete,
    ]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null)

      if (rejectedFiles.length > 0) {
        setError('Please upload a CSV file less than 1MB.')
        return
      }

      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]

      const reader = new FileReader()
      reader.onload = (event) => {
        const csvText = event.target?.result as string
        if (!csvText) {
          setError('Failed to read CSV file')
          return
        }

        processCsvData(csvText)
      }

      reader.onerror = () => {
        setError('Error reading the file')
      }

      reader.readAsText(file)
    },
    [processCsvData]
  )

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

    if (basketItems && Object.keys(basketItems).length > 0) {
      template += `\n${Object.values(basketItems)
        .map((item) => {
          const address = item.token.address.toLowerCase()
          const value =
            currentInputType === 'shares'
              ? proposedShares[address] || item.currentValue || '0'
              : proposedUnits[address] || item.currentValue || '0'
          return `${item.token.symbol},${item.token.address},${value}`
        })
        .join('\n')}`
    }

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    // Create a temporary anchor element to download the file
    const a = document.createElement('a')
    a.href = url
    a.download =
      templateFilename || `${dtf?.token.symbol || 'basket'}_template.csv`
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
        <p className="font-bold">{title}</p>
        {description || (
          <p>
            <span className="text-primary cursor-pointer">
              Select a CSV file to upload
            </span>{' '}
            <span className="text-legend">or drag and drop it here</span>
          </p>
        )}
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
