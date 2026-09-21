import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoreHorizontal, Settings, Trash2 } from 'lucide-react'
import { IconButton } from '@/components/icon-button'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from '@/components/design-system-v1/menu'
const meta = {
  title: 'Components/Menu',
  component: Menu,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          'Import Menu primitives from @/components/design-system-v1/menu. Arrow keys move through actions; Escape closes and returns focus.',
      },
    },
  },
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton label="More actions" icon={<MoreHorizontal />} />
      </MenuTrigger>
      <MenuContent>
        <MenuItem leadingIcon={<Settings />}>Settings</MenuItem>
        <MenuItem disabled>Unavailable action</MenuItem>
        <MenuSeparator />
        <MenuItem leadingIcon={<Trash2 />} tone="destructive">
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
} satisfies Meta<typeof Menu>
export default meta
type Story = StoryObj<typeof meta>
export const Actions: Story = {}
