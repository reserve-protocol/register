import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  ActivityDashboard,
  type ActivityDashboardProps,
} from './activity-dashboard'

const meta = {
  title: 'Dashboard (unreviewed)/eUSD activity layout',
  component: ActivityDashboard,
  args: { layout: 'stacked', state: 'ready' },
  argTypes: {
    layout: { control: 'inline-radio', options: ['stacked', 'diverging'] },
    state: {
      control: 'inline-radio',
      options: ['ready', 'loading', 'empty', 'unavailable'],
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Unreviewed first composition for the eUSD activity landing page, built from the Activity chart. One period control above the charts scopes every panel, so their numbers always agree. Inside a page, chart panels use the `panel` headline so the page title stays the single largest heading. Like the screen pilots, the heading and panels are content regions on the structural substrate, which shows as 2px seams (beige in light, near-black in dark); every region uses the same 20px inset, 24px from 1024px, so content aligns down the page. The map region is a placeholder until the countries map is built. Data is sample data; this is not the landing page and approves no production layout.',
      },
    },
  },
} satisfies Meta<ActivityDashboardProps>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Diverging: Story = {
  name: 'Withdrawals below the baseline',
  args: { layout: 'diverging' },
}

export const Loading: Story = { args: { state: 'loading' } }
