import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '..'

describe('Dialog', () => {
  it('keeps a non-dismissible dialog open when Escape is pressed', () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogContent dismissible={false}>
          <DialogTitle>Transaction pending</DialogTitle>
          <DialogDescription>Wait for confirmation.</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    fireEvent.keyDown(
      screen.getByRole('dialog', { name: 'Transaction pending' }),
      { key: 'Escape' }
    )
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(
      screen.getByRole('dialog', { name: 'Transaction pending' })
    ).toBeVisible()
  })
})
