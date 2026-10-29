import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ColumnDef, type Table as TableInstance } from '@tanstack/react-table'
import DataTable from '../data-table'

type Item = { name: string }

const columns: ColumnDef<Item>[] = [{ accessorKey: 'name', header: 'Name' }]

const makeItems = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({ name: `item-${i}` }))

const getDataRowCount = () =>
  screen.getAllByRole('row').filter((row) => row.textContent?.includes('item-'))
    .length

describe('DataTable pagination toggling', () => {
  it('switches presentation without mounting both or losing sorted page state', () => {
    const data = [{ name: 'b' }, { name: 'a' }, { name: 'c' }]
    const props = {
      columns,
      data,
      pagination: { pageSize: 2 },
      renderToolbar: (table: TableInstance<Item>) => (
        <button onClick={() => table.setSorting([{ id: 'name', desc: true }])}>
          Reverse
        </button>
      ),
    }
    const cards = (table: TableInstance<Item>) => (
      <ul>
        {table.getRowModel().rows.map((row) => (
          <li key={row.id}>{row.original.name}</li>
        ))}
      </ul>
    )
    const { rerender } = render(<DataTable {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Reverse' }))
    rerender(<DataTable {...props} renderAlternative={cards} />)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent)
    ).toEqual(['c', 'b'])
    rerender(<DataTable {...props} />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
      ['c', 'b']
    )
  })
  it('limits the sorted rows without changing sorting when the limit expands', () => {
    const data = [{ name: 'b' }, { name: 'a' }, { name: 'c' }]
    const props = {
      columns,
      data,
      initialSorting: [{ id: 'name', desc: false }],
    }
    const toolbar = (table: TableInstance<Item>) => (
      <button onClick={() => table.setSorting([{ id: 'name', desc: true }])}>
        Reverse
      </button>
    )
    const { rerender } = render(
      <DataTable {...props} rowLimit={2} renderToolbar={toolbar} />
    )
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
      ['a', 'b']
    )
    rerender(<DataTable {...props} renderToolbar={toolbar} />)
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
      ['a', 'b', 'c']
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reverse' }))
    rerender(<DataTable {...props} rowLimit={2} renderToolbar={toolbar} />)
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
      ['c', 'b']
    )
  })
  it('opts into table naming and sort announcements without changing unnamed defaults', () => {
    const { rerender } = render(
      <DataTable
        columns={columns}
        data={makeItems(2)}
        initialSorting={[{ id: 'name', desc: true }]}
      />
    )
    expect(screen.getByRole('table')).not.toHaveAttribute('aria-label')
    expect(screen.getByRole('columnheader')).not.toHaveAttribute('aria-sort')
    rerender(
      <DataTable
        ariaLabel="Positions"
        columns={columns}
        data={makeItems(2)}
        initialSorting={[{ id: 'name', desc: true }]}
      />
    )
    expect(screen.getByRole('table', { name: 'Positions' })).toBeVisible()
    expect(screen.getByRole('columnheader')).toHaveAttribute(
      'aria-sort',
      'descending'
    )
  })
  it('shows all rows again after pagination toggles on and back off', () => {
    // Mirrors discover search: 19 DTFs unpaginated, a keystroke matches >20
    // (pagination on), then clearing the search turns pagination back off.
    const { rerender } = render(
      <DataTable columns={columns} data={makeItems(19)} />
    )
    expect(getDataRowCount()).toBe(19)

    rerender(
      <DataTable
        columns={columns}
        data={makeItems(26)}
        pagination={{ pageSize: 20 }}
      />
    )
    expect(getDataRowCount()).toBe(20)

    rerender(<DataTable columns={columns} data={makeItems(19)} />)
    expect(getDataRowCount()).toBe(19)
  })

  it('paginates with the configured page size from the first render', () => {
    render(
      <DataTable
        columns={columns}
        data={makeItems(26)}
        pagination={{ pageSize: 20 }}
      />
    )
    expect(getDataRowCount()).toBe(20)
  })

  it('renders all rows when pagination is disabled', () => {
    render(<DataTable columns={columns} data={makeItems(30)} />)
    expect(getDataRowCount()).toBe(30)
  })
})
