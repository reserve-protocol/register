import { Description, Heading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConnectedCanvas } from '../../shared/connected-docs'
import { OverviewLayoutDiagram } from './overview-layout-diagram'

const meta = {
  title: 'Explorations/Screen layouts/Index DTF overview',
  component: OverviewLayoutDiagram,
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => (
        <div data-wide-docs>
          <Title />
          <Description />
          <p>
            This first proposal covers standard basket Index DTFs. The
            yield-index overview has a separate content structure and will need
            its own layout review.
          </p>
          <Heading>Review the proposed layout</Heading>
          <ConnectedCanvas of={Playground} />
          <Heading>Decisions to review</Heading>
          <p>
            The starting proposal uses a centered 1400px frame including
            navigation, 24px outer gutters above phone widths, a fluid primary
            column and a 480px support column. Compare a 1600px cap, zero
            gutters or 432px support using the controls above.
          </p>
          <p>
            Primary content keeps at least 768px while support is alongside it.
            With the recommended settings, support disappears below a 1372px
            viewport. Product navigation switches to mobile controls below
            1024px; its desktop expansion overlays content at 256px.
          </p>
          <p>
            Preserve the existing reading order: supporting content follows the
            chart at intermediate widths. On phones, a compact video library
            precedes Holdings; a written description follows it. Optional covers
            leave no space when absent.
          </p>
          <p>
            Keep the existing global header arrangement and sticky product
            navigation. Main and support content share the page scroll; the
            support column stays in normal flow. The later screen pilot will
            verify real chart and swap dimensions, floating controls and
            safe-area clearance.
          </p>
          <Heading>Existing foundation rules</Heading>
          <p>
            White structural sections use 24px content insets and 2px beige gaps
            on both axes. Subsections may use 1px seams. Outer viewport gutters
            and the gray review frame are separate from those relationships.
          </p>
        </div>
      ),
      description: {
        component:
          'Layout proposal for review before the overview screen pilot. The diagrams show region widths and reading order; they do not approve page geometry or demonstrate financial execution.',
      },
    },
  },
  args: {
    viewport: '1440',
    frameCap: '1400',
    gutter: '24',
    supportWidth: '480',
    expandedNavigation: false,
    about: 'video',
    cover: false,
  },
  argTypes: {
    viewport: {
      name: 'Viewport width',
      control: 'select',
      options: ['1600', '1440', '1372', '1371', '1280', '1024', '390'],
    },
    frameCap: {
      name: 'Maximum frame width',
      control: 'inline-radio',
      options: ['1400', '1600'],
    },
    gutter: {
      name: 'Outer desktop gutters',
      control: 'inline-radio',
      options: ['24', '0'],
    },
    supportWidth: {
      name: 'Support column width',
      control: 'inline-radio',
      options: ['480', '432'],
    },
    expandedNavigation: {
      name: 'Expanded desktop navigation',
      if: { arg: 'viewport', neq: '390' },
      control: 'boolean',
    },
    about: {
      name: 'About content',
      control: 'inline-radio',
      options: ['video', 'text'],
    },
    cover: {
      name: 'Optional cover for written About',
      if: { arg: 'about', eq: 'text' },
      control: 'boolean',
    },
  },
} satisfies Meta<typeof OverviewLayoutDiagram>

export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = { tags: ['!dev'] }
export const WideDesktop: Story = {
  name: 'Wide desktop',
  args: { viewport: '1600' },
}
export const Intermediate: Story = { args: { viewport: '1280' } }
export const Phone: Story = { args: { viewport: '390' } }
