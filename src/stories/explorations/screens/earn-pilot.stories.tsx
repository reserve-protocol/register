import { Description, Heading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs, useGlobals } from 'storybook/preview-api'
import { Link } from '@/components/design-system-v1/link'
import { ConnectedCanvas } from '../../shared/connected-docs'
import { EarnPilot, type EarnPilotArgs } from './earn-pilot'

const meta = {
  title: 'Explorations/Screen pilots/Participate and Earn',
  decorators: [
    (Story, context) =>
      context.viewMode === 'docs' ? (
        <div className="space-y-4">
          <div className="px-6 pt-4">
            <Link
              treatment="standalone"
              external
              externalAnnouncement="Opens the selected screen in a new tab without Storybook navigation"
              href={`./iframe.html?${new URLSearchParams({
                id: context.id,
                viewMode: 'story',
                globals: `theme:${context.globals.theme ?? 'light'}`,
                args: `family:${context.args.family};state:${context.args.state};wallet:${context.args.wallet}`,
              })}`}
            >
              Open full screen
            </Link>
          </div>
          <div
            className="max-w-full overflow-x-auto bg-muted"
            data-testid="earn-pilot-review-frame"
          >
            <div className="min-w-[1440px]">
              <Story />
            </div>
          </div>
        </div>
      ) : (
        <Story />
      ),
  ],
  render: function Render(args, context) {
    const [, updateArgs] = useArgs<EarnPilotArgs>()
    const [globals, updateGlobals] = useGlobals()
    return (
      <EarnPilot
        {...args}
        embedded={context.viewMode === 'docs'}
        onFamilyChange={(family) =>
          updateArgs({ family: family as EarnPilotArgs['family'] })
        }
        theme={globals.theme as 'light' | 'dark'}
        onThemeChange={(theme) => updateGlobals({ theme })}
      />
    )
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full-screen composition using the reviewed Earn and DeFi tables, canonical tabs and shared pilot navigation. Historical fixtures, not live opportunities or wallet balances. Page layout remains exploratory.',
      },
      page: () => (
        <div data-wide-docs>
          <Title />
          <Description />
          <Heading>Review the screen</Heading>
          <p>
            Open full screen to review the page without Storybook framing.
            Category, data state, wallet display and theme carry over. The three
            category controls, search, filters and table sorting work locally;
            account, transaction and rate-help actions retain the existing
            static reference behavior.
          </p>
          <ConnectedCanvas of={Pilot} />
          <Heading>Remaining compositions</Heading>
          <p>
            The headings and risk labels preserve current product wording,
            arranged with design-system typography. FAQs and their graphics,
            featured DeFi pools and the APY explanation still need composition
            review. DeFi asset-type shortcuts remain deferred. Search and chain
            selection work in all three categories; Index and Yield also offer
            DTF selection. Filters reset when changing category. The wallet
            control changes the table presentation only; navigation remains the
            reviewed disconnected example.
          </p>
          <p>
            Phone layout trial: category and chain selection use the existing
            Select, DTF and chain filters share a row, the subtitle uses Body,
            and facts form one paragraph without icons on a white surface. The
            category selector, ordinary sections and global header use matching
            20px mobile insets in both axes. Desktop retains tabs, chain
            segments and Lead. Shared component defaults are unchanged.
          </p>
          <p>
            Index and Yield compact tables trial a full-width sort dropdown with
            the existing field and direction choices. Other table examples
            retain their current triggers.
          </p>
        </div>
      ),
    },
  },
  args: { family: 'index', state: 'default', wallet: false },
  argTypes: {
    family: {
      name: 'Category',
      control: 'inline-radio',
      options: ['index', 'yield', 'defi'],
    },
    state: {
      name: 'Data state',
      control: 'select',
      options: ['default', 'loading', 'missing', 'long', 'empty'],
    },
    wallet: {
      name: 'Wallet columns',
      control: 'boolean',
      if: { arg: 'family', neq: 'defi' },
    },
  },
} satisfies Meta<EarnPilotArgs>

export default meta
type Story = StoryObj<typeof meta>
export const Pilot: Story = {}
