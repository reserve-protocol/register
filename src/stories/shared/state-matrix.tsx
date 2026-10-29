import type { ReactNode } from 'react'

interface StateMatrixRow {
  label: string
  cells: ReactNode[]
}

interface StateMatrixGroup {
  label: string
  rows: StateMatrixRow[]
}

export const StateMatrix = ({
  columns,
  groups,
}: {
  columns: string[]
  groups: StateMatrixGroup[]
}) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full min-w-[820px] border-collapse text-left">
      <thead>
        <tr className="border-b border-border">
          <th className="w-24 px-3 py-3 text-xs font-medium text-muted-foreground">
            Size
          </th>
          <th className="w-24 px-3 py-3 text-xs font-medium text-muted-foreground">
            State
          </th>
          {columns.map((column) => (
            <th
              key={column}
              className="px-3 py-3 text-xs font-medium text-muted-foreground"
              scope="col"
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {groups.flatMap((group) =>
          group.rows.map((row, rowIndex) => (
            <tr
              key={`${group.label}-${row.label}`}
              className="border-b border-border"
            >
              {rowIndex === 0 && (
                <th
                  rowSpan={group.rows.length}
                  className="px-3 py-4 align-top text-sm font-medium"
                  scope="rowgroup"
                >
                  {group.label}
                </th>
              )}
              <th
                className="px-3 py-4 text-sm font-normal text-muted-foreground"
                scope="row"
              >
                {row.label}
              </th>
              {row.cells.map((cell, cellIndex) => (
                <td key={columns[cellIndex]} className="px-3 py-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)
