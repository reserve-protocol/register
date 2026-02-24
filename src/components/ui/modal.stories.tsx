import type { Meta, StoryObj } from '@storybook/react'
import Modal from './modal'
import { Button } from './button'
import { useState } from 'react'

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,

  parameters: {
    docs: {
      description: {
        component:
          'Legacy wrapper around Dialog. Prefer using Dialog directly for new code.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Modal>

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false)
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open Modal</Button>
          {open && (
            <Modal title="Confirm Action" onClose={() => setOpen(false)}>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to proceed?
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpen(false)}>Confirm</Button>
              </div>
            </Modal>
          )}
        </>
      )
    }
    return <Demo />
  },
}

export const NoTitle: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false)
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open Modal</Button>
          {open && (
            <Modal onClose={() => setOpen(false)}>
              <p>A modal without a title.</p>
            </Modal>
          )}
        </>
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
        <>
          <Button onClick={() => setOpen(true)}>Wide Modal</Button>
          {open && (
            <Modal
              title="Wide Modal"
              width="600px"
              onClose={() => setOpen(false)}
            >
              <p className="text-sm text-muted-foreground">
                This modal is 600px wide.
              </p>
            </Modal>
          )}
        </>
      )
    }
    return <Demo />
  },
}

export const HiddenCloseButton: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false)
      return (
        <>
          <Button onClick={() => setOpen(true)}>No Close Button</Button>
          {open && (
            <Modal title="No Close Button" hideCloseButton>
              <p className="text-sm text-muted-foreground">
                This modal has no close button. Click outside to dismiss.
              </p>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setOpen(false)}>Done</Button>
              </div>
            </Modal>
          )}
        </>
      )
    }
    return <Demo />
  },
}

export const CloseOnClickAway: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false)
      return (
        <>
          <Button onClick={() => setOpen(true)}>Click Away to Close</Button>
          {open && (
            <Modal
              title="Click Away"
              closeOnClickAway
              onClose={() => setOpen(false)}
            >
              <p className="text-sm text-muted-foreground">
                Click outside this modal to close it.
              </p>
            </Modal>
          )}
        </>
      )
    }
    return <Demo />
  },
}
