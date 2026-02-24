import type { Meta, StoryObj } from '@storybook/react'
import Sidebar from '.'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof Sidebar>

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false)
      return (
        <div className="p-8">
          <Button onClick={() => setOpen(true)}>Open Sidebar</Button>
          {open && (
            <Sidebar onClose={() => setOpen(false)}>
              <div className="p-6">
                <h2 className="text-lg font-bold mb-4">Sidebar Content</h2>
                <p className="text-sm text-muted-foreground">
                  Click the overlay to close.
                </p>
              </div>
            </Sidebar>
          )}
        </div>
      )
    }
    return <Demo />
  },
}

export const CustomWidth: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false)
      return (
        <div className="p-8">
          <Button onClick={() => setOpen(true)}>Narrow Sidebar</Button>
          {open && (
            <Sidebar onClose={() => setOpen(false)} width="360px">
              <div className="p-6">
                <h2 className="text-lg font-bold mb-4">Narrow Panel</h2>
                <p className="text-sm text-muted-foreground">
                  This sidebar is 360px wide.
                </p>
              </div>
            </Sidebar>
          )}
        </div>
      )
    }
    return <Demo />
  },
}
