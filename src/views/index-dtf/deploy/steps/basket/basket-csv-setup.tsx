import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAtom, useAtomValue } from 'jotai'
import { DownloadCloud, FilePlus2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import useTokenList from '@/hooks/use-token-list'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { isAddress } from '@/utils'
import { useFormContext } from 'react-hook-form'
import { basketAtom } from '../../atoms'

const MAX_FILE_SIZE = 1024 * 1024 // 1MB

const getRowValues = (row: string) => {
  if (!row.trim()) return // Skip empty rows

  const values = row.split(',')
  if (values.length < 3) return undefined // Ensure we have enough columns

  const symbol = values[0].trim()
  const address = values[1].trim().toLowerCase()
  let value = values[2].trim() || '0'

  // Normalize scientific notation to decimal string
  if (value.toLowerCase().includes('e')) {
    value = Number.parseFloat(value.toString()).toString()
  }

  // Validate data
  if (!address || !isAddress(address) || !value || isNaN(Number(value))) {
    return undefined
  }

  return { symbol, address, value }
}

const BasketCsvSetup = () => {
  const chainId = useAtomValue(chainIdAtom)
  const [basket, setBasket] = useAtom(basketAtom)
  const { data: tokenList } = useTokenList(chainId)
  const { setValue, getValues } = useFormContext()
  const [error, setError] = useState<string | null>(null)
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null)

      if (!tokenList) {
        setError('Loading token list... please try again')
        return
      }

      if (rejectedFiles.length > 0) {
        setError('Please upload a CSV file less than 1MB.')
        return
      }

      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const tokenListMap = tokenList.reduce(
            (acc, token) => {
              acc[token.address.toLowerCase()] = token
              return acc
            },
            {} as Record<string, Token>
          )

          const csvText = event.target?.result as string
          if (!csvText) {
            setError('Failed to read CSV file')
            return
          }

          // Make sure there are no duplicate tokens
          const newBasketAddresses = new Set<string>()
          const newBasket: Token[] = []
          const newShares: { address: string; percentage: string }[] = []

          csvText
            .split('\n')
            .slice(1)
            .forEach((row) => {
              const values = getRowValues(row)

              // Unsupported token
              if (
                !values ||
                !tokenListMap[values.address] ||
                newBasketAddresses.has(values.address)
              )
                return

              newBasketAddresses.add(values.address)
              newBasket.push(tokenListMap[values.address])
              newShares.push({
                address: values.address,
                percentage: values.value,
              })
            })

          setBasket(newBasket)
          setValue('tokensDistribution', newShares)
        } catch (err) {
          console.error('Error parsing CSV:', err)
          setError('Failed to parse CSV file. Please check the format.')
        }
      }

      reader.onerror = () => {
        setError('Error reading the file')
      }

      reader.readAsText(file)
    },
    [tokenList, setValue, setBasket]
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

    if (basket.length > 0) {
      const currentDistribution = (
        getValues('tokensDistribution') || []
      ).reduce(
        (
          acc: Record<string, number>,
          { address, percentage }: { address: string; percentage: number }
        ) => {
          acc[address.toLowerCase()] = percentage
          return acc
        },
        {} as Record<string, number>
      )

      template += `\n${basket
        .map(
          (asset) =>
            `${asset.symbol},${asset.address},${currentDistribution[asset.address.toLowerCase()] || 0}`
        )
        .join('\n')}`
    }

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    // Create a temporary anchor element to download the file
    const a = document.createElement('a')
    a.href = url
    a.download = 'basket_template.csv'
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-4 border border-dashed bg-muted/70 rounded-xl m-4 mt-0',
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
        <p className="font-bold">Setup Basket with CSV</p>
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
