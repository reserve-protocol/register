import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '../data-table'

type Item = { name: string }

const columns: ColumnDef<Item>[] = [{ accessorKey: 'name', header: 'Name' }]

const makeItems = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({ name: `item-${i}` }))

const getDataRowCount = () =>
  screen.getAllByRole('row').filter((row) => row.textContent?.includes('item-'))
    .length

describe('DataTable pagination toggling', () => {
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
