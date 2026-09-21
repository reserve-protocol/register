import type { Meta, StoryObj } from '@storybook/react-vite'

import ModalGeometryStudy from './reference/modal-geometry-study'
import { ZapperModalSpecimen } from './reference/zapper-modal-study'

const meta = {
  title: 'Explorations/Transactions/Modal Geometry',
  component: ModalGeometryStudy,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'Historical exploratory reference preserving the fixed-point 432px task and 384px compact modal specimens. These widths document the earlier geometry study and are not new canonical API.',
      },
    },
  },
} satisfies Meta<typeof ModalGeometryStudy>

export default meta
type Story = StoryObj<typeof meta>

export const WidthAndContinuity: Story = {
  render: () => <ModalGeometryStudy />,
}

export const ZapperQuoteSpecimen: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-6">
      <ZapperModalSpecimen widthClass="max-w-[432px]" amount="16.464247" />
    </div>
  ),
}
