import { act, render, screen } from '@testing-library/react'
import type { ColumnDef } from '@tanstack/react-table'
import { describe, expect, it, vi } from 'vitest'
import ExplorerTable from '../explorer-table'

vi.mock('@/hooks/use-media-query', () => ({ useIsMobile: () => false }))

type Row = { id: string }

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
  })

describe('ExplorerTable', () => {
  // Regression: a paged table without a `sorting` prop re-rendered forever and froze route transitions.
  it('stops rendering once a paged table without sorting has mounted', async () => {
    let cellRenders = 0
    const columns: ColumnDef<Row>[] = [
      {
        id: 'id',
        header: 'Id',
        cell: ({ row }) => {
          cellRenders += 1
          return row.original.id
        },
      },
    ]

    const data = [{ id: 'a' }, { id: 'b' }]
    const table = () => (
      <ExplorerTable
        data={data}
        columns={columns}
        renderItem={(row) => row.id}
        pageSize={1}
      />
    )

    const { rerender } = render(table())
    await settle()
    // The library arms its page reset on the first render; the loop needs a second one.
    rerender(table())
    await settle()
    const afterUpdate = cellRenders
    await settle()

    expect(screen.getAllByTestId('explorer-row')).toHaveLength(1)
    expect(cellRenders).toBe(afterUpdate)
  })

  it('stops rendering when an unpaged table gets a new array from its parent', async () => {
    let headerRenders = 0
    const columns: ColumnDef<Row>[] = [
      {
        id: 'id',
        header: () => {
          headerRenders += 1
          return 'Id'
        },
        accessorFn: (row) => row.id,
      },
    ]
    const table = (rows: Row[]) => (
      <ExplorerTable
        data={rows}
        columns={columns}
        renderItem={(row) => row.id}
        sorting={[{ id: 'id', desc: true }]}
      />
    )

    const { rerender } = render(table([{ id: 'a' }]))
    await settle()
    rerender(table([{ id: 'a' }]))
    await settle()
    const afterUpdate = headerRenders
    await settle()

    expect(headerRenders).toBe(afterUpdate)
  })

  it('shows the progress bar while more rows are still loading', () => {
    const columns: ColumnDef<Row>[] = [
      { id: 'id', header: 'Id', accessorFn: (row) => row.id },
    ]
    const props = {
      data: [{ id: 'a' }],
      columns,
      renderItem: (row: Row) => row.id,
    }

    const { rerender } = render(<ExplorerTable {...props} isFetching />)
    expect(screen.getByTestId('explorer-progress')).toBeInTheDocument()
    expect(screen.getAllByTestId('explorer-row')).toHaveLength(1)

    rerender(<ExplorerTable {...props} />)
    expect(screen.queryByTestId('explorer-progress')).not.toBeInTheDocument()
  })
})
