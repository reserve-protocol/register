import { Description, Heading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs, useGlobals } from 'storybook/preview-api'
import { Link } from '@/components/design-system-v1/link'
import { ConnectedCanvas } from '../../shared/connected-docs'
import { OverviewPilot, type OverviewPilotArgs } from './overview-pilot'

const meta = {
  title: 'Explorations/Screen pilots/Index DTF overview',
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
                args: `chartType:${context.args.chartType};holdingsTab:${context.args.holdingsTab}`,
              })}`}
            >
              Open full screen
            </Link>
          </div>
          <div
            className="max-w-full overflow-x-auto bg-muted"
            data-testid="overview-pilot-review-frame"
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
    const [, updateArgs] = useArgs<OverviewPilotArgs>()
    const [globals, updateGlobals] = useGlobals()
    return (
      <OverviewPilot
        {...args}
        embedded={context.viewMode === 'docs'}
        theme={globals.theme as 'light' | 'dark'}
        onThemeChange={(theme) => updateGlobals({ theme })}
        onHoldingsTabChange={(tab) =>
          updateArgs({ holdingsTab: tab as OverviewPilotArgs['holdingsTab'] })
        }
      />
    )
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Partial screen pilot using reviewed navigation, the PHOTON overview chart, Holdings and the existing zapper card. Page geometry remains exploratory. Fixtures are not live or a synchronized financial snapshot.',
      },
      page: () => (
        <div data-wide-docs>
          <Title />
          <Description />
          <p>
            The 480px support column contains the embedded zapper card, keeping
            its Buy/Sell controls and CMC20 example data for layout review. Its
            white surface aligns with the chart, without a modal shadow or close
            action. It starts before a quote and does not connect to PHOTON
            trading. A temporary empty white section fills the rest of the
            initial viewport for layout review. At narrower widths the column
            disappears. Native 44px mobile controls retain their static action
            behavior; Buy / Sell shortens to Trade before chat hides as space
            runs out. Ordinary mobile sections and the header use matching 20px
            insets in both axes.
          </p>
          <Heading>Review the screen</Heading>
          <p>
            Docs shows a desktop screen at 1440px; scroll inside the preview if
            needed. Use Open full screen above to open the selected example in
            its own tab, without Storybook navigation or framing. Resize that
            window to review desktop and phone layouts. The selected chart,
            Holdings view and theme carry over.
          </p>
          <ConnectedCanvas of={Pilot} />
          <Heading>What works here</Heading>
          <p>
            Inspect the chart with a pointer or keyboard, switch line/candles
            with the control above, change Holdings tabs and sort assets.
            Desktop product navigation expands over the content. Phone
            navigation opens the reviewed drawers. The zapper retains its local
            amount, asset selection, settings and refresh interactions.
          </p>
          <p>
            The chart replays the existing YTD capture. Its range labels
            preserve the reviewed placement and do not fetch other ranges.
            Account actions, other page links and bridge targets are outside
            this pilot. The reviewed DTF switcher opens on desktop and phone;
            other DTF screens are unavailable while this pilot covers PHOTON
            only.
          </p>
          <Heading>Needs visual review before implementation</Heading>
          <ul>
            <li>
              PHOTON trading, account balance and eligibility integration, plus
              wiring the compact Buy / Sell control to a transaction flow.
            </li>
            <li>
              Video library, written About, covers, resource links and social
              links.
            </li>
            <li>
              Embedded AI chat, wiring its floating control, and About Reserve.
            </li>
            <li>
              Fees &amp; Stats: metrics exist, but the complete section needs
              review.
            </li>
            <li>
              Stock-backed badge, governance participation and creator notes.
            </li>
            <li>Overview transaction history and disclosure.</li>
          </ul>
          <p>
            These sections are omitted because composing them would require
            further visual decisions. Their reading order remains unverified.
            Yield-index overview screens need a separate pilot.
          </p>
        </div>
      ),
    },
  },
  args: { chartType: 'line', holdingsTab: 'exposure' },
  argTypes: {
    chartType: {
      name: 'Chart type',
      control: 'inline-radio',
      options: ['line', 'candles'],
    },
    holdingsTab: {
      name: 'Holdings view',
      control: 'inline-radio',
      options: ['exposure', 'collateral'],
    },
  },
} satisfies Meta<OverviewPilotArgs>

export default meta
type Story = StoryObj<typeof meta>
export const Pilot: Story = {}
