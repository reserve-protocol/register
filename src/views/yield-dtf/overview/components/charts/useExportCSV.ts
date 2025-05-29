import { useCallback } from 'react'

export interface CSVRow {
  [key: string]: string | number
}

export interface CSVHeader {
  key: string
  label: string
}

export interface UseExportCSVProps {
  headers: CSVHeader[]
  rows: CSVRow[]
  filename?: string
}

const useExportCSV = ({
  headers,
  rows,
  filename = 'export.csv',
}: UseExportCSVProps) => {
  const exportToCSV = useCallback(() => {
    // Create CSV content
    const csvContent = [
      headers.map((header) => header.label).join(','), // First line: headers
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header.key]
            // Escape commas and quotes in values
            const escapedValue =
              typeof value === 'string' ? `${value.replace(/"/g, '""')}` : value
            return escapedValue
          })
          .join(',')
      ),
    ].join('\n')

    // Create blob and URL
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    // Create and simulate click on download link
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [headers, rows, filename])

  return exportToCSV
}

export default useExportCSV
