import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const DocumentationSpecimenGrid = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <div
    className={cn(
      'grid w-full min-w-0 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3',
      className
    )}
  >
    {children}
  </div>
)

export const DocumentationSpecimenCell = ({
  children,
  label,
  className,
}: {
  children: ReactNode
  label: ReactNode
  className?: string
}) => (
  <div className={cn('min-w-0', className)}>
    <p className="mb-2 text-xs leading-4 text-muted-foreground">{label}</p>
    {children}
  </div>
)

export const DocumentationSpecimenMatrix = ({
  axisLabel,
  columns,
  rows,
}: {
  axisLabel: ReactNode
  columns: readonly ReactNode[]
  rows: readonly { label: ReactNode; cells: readonly ReactNode[] }[]
}) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full min-w-[44rem] border-separate border-spacing-0 text-left">
      <thead>
        <tr>
          <th className="border-b border-border px-4 py-3 text-xs font-medium text-muted-foreground">
            {axisLabel}
          </th>
          {columns.map((column, index) => (
            <th
              key={index}
              className="border-b border-border px-4 py-3 text-xs font-medium text-foreground"
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <th
              className={cn(
                'px-4 py-4 text-xs font-medium text-muted-foreground',
                rowIndex < rows.length - 1 && 'border-b border-border'
              )}
            >
              {row.label}
            </th>
            {row.cells.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className={cn(
                  'px-4 py-4 align-middle',
                  rowIndex < rows.length - 1 && 'border-b border-border'
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
