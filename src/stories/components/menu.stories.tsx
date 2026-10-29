import { useState } from 'react'
import { PopupFieldTrigger } from '@/components/design-system-v1/popup-field-trigger'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Check, MoreHorizontal, Settings, Trash2 } from 'lucide-react'
import { IconButton } from '@/components/icon-button'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from '@/components/design-system-v1/menu'
const meta = {
  title: 'Components/Actions/Menu',
  component: Menu,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          '`@/components/design-system-v1/menu` · A short list of actions or one choice opened from a trigger. Keep the primary task visible on the page, never only inside a menu. Destructive items use the danger tone and sit after a separator. For a choice, align the menu to the start of its field and mark the selected option with a trailing check, as the sort menu does. Unavailable items stay visible and disabled rather than disappearing.',
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

export const LabeledField: Story = {
  name: 'Labeled field',
  render: function Render() {
    const [selected, setSelected] = useState('Avg. 30d%')
    return (
      <div className="w-80 max-w-full">
        <Menu>
          <MenuTrigger asChild>
            <PopupFieldTrigger
              aria-label={`Sort by: ${selected}`}
              contextLabel="Sort by"
            >
              {selected}
            </PopupFieldTrigger>
          </MenuTrigger>
          <MenuContent align="start">
            {['Avg. 30d%', 'TVL', 'Gov. Token'].map((value) => (
              <MenuItem
                key={value}
                role="menuitemradio"
                aria-checked={selected === value}
                trailingVisual={selected === value ? <Check /> : undefined}
                onSelect={() => setSelected(value)}
              >
                {value}
              </MenuItem>
            ))}
          </MenuContent>
        </Menu>
      </div>
    )
  },
}
