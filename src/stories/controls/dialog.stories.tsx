import { EligibilityDialogPreview } from '../components/reference/eligibility-dialog-preview'
import { DialogHeaderExamples } from '../components/reference/dialog-header-examples'
import { LiquiditySimulationDialog } from '../components/reference/liquidity-simulation-dialog'
import { PlaygroundDocs } from '../shared/playground-docs'
import { WhitepaperDialog } from '../components/reference/whitepaper-dialog'
import { BridgeInformationDialog } from '../components/reference/bridge-information-dialog'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { DialogContent } from '@/components/dialog'

const meta = {
  title: 'Components/Feedback and overlays/Dialog',
  parameters: {
    controls: { include: ['width'] },
    docs: {
      page: () => <PlaygroundDocs interactive={Shell} />,
      description: {
        component:
          '`@/components/dialog` · The only V1 modal: centered on desktop at 432px (standard) or 384px (compact), and a bottom sheet on phones. The close action matches its row: quiet beside a title or topic icon, bordered beside bordered controls. Dialogs never nest; a routine reversible task needs one completion action, and a destructive confirmation adds an explicit safe exit. The leading example is the real basket-builder liquidity simulation: an initial $10,000 setting, $10–$100,000 bounds, exact integer entry and coarse slider increments. Out-of-range or empty drafts clamp on blur, closing discards the draft, and Simulate applies it locally; it does not run the price-impact engine. Transaction flows keep their own patterns.',
      },
    },
  },
  component: DialogContent,
  args: {
    width: 'standard',
  },
  argTypes: {
    children: { control: false },
    width: { control: 'inline-radio', options: ['compact', 'standard'] },
  },
} satisfies Meta<typeof DialogContent>

export default meta
type Story = StoryObj<typeof meta>

export const Shell: Story = {
  name: 'Liquidity simulation amount',
  tags: ['!dev'],
  render: ({ width }) => <LiquiditySimulationDialog width={width} />,
}

export const HeaderExamples: Story = {
  name: 'Header examples',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Header anatomy only. Each documentation panel is separate from its white, static header specimen on a neutral stage. The Avoid panel has a destructive-tone outline and crossed-circle marker outside the header. These illustrations are not interactive dialogs. The main example uses title-and-close; the working topic-icon example below uses the same task. Bordered transaction controls remain demonstrated by their existing transaction patterns. The Avoid example is intentionally incorrect and is not an available task variant.',
      },
    },
  },
  render: () => <DialogHeaderExamples />,
}

export const TopicHeader: Story = {
  name: 'Topic icon header',
  parameters: {
    docs: {
      description: {
        story:
          'The same real liquidity-simulation task with a relevant configuration icon, a quiet close action, and 16px before the title.',
      },
    },
  },
  render: ({ width }) => (
    <LiquiditySimulationDialog width={width} topicHeader />
  ),
}

export const Eligibility: Story = {
  name: 'Eligibility',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Eligibility: standard 432px desktop width, no row dividers, first-line checkbox alignment, 16px below the topic-icon row, and an inline jurisdiction disclosure with semicolon-separated entries that wrap naturally. Existing wording, text sizes and mobile insets are retained. Use Close preview in the Storybook toolbar to leave this non-dismissible example.',
      },
    },
  },
  render: () => <EligibilityDialogPreview />,
}

export const LongContent: Story = {
  name: 'Expanded jurisdictions',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'The same standard 432px desktop dialog with jurisdiction details expanded inline. Semicolons separate complete jurisdiction entries while existing internal commas are retained. Text wraps naturally at the existing supporting size, with no inner scroll box or fade. The canonical body handles overflow on short screens while the header and confirmation area stay visible. Use Close preview in the Storybook toolbar to leave this non-dismissible example. Policy wording and the external documentation link are unchanged.',
      },
    },
  },
  render: () => <EligibilityDialogPreview expanded />,
}

export const WhitepaperInformation: Story = {
  name: 'Whitepaper information',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Read-only CFB document example using the app’s existing v2/v1 labels, publication date, nine-item change summary and PDF destinations. Each version pairs its title/detail with an external PDF Link; both versions stay together at the top, and the canonical Collapsible change summary follows, so expanding it grows downward without hiding either PDF. The Collapsible keeps its native trigger, chevron, content inset and motion, with the Show/Hide cue marking it as expandable. The dialog is capped at 640px, so the expanded log scrolls in the body under the product-navigation overflow fade. The surrounding container aligns its text with the version rows. Canonical title-and-close header; no submission footer. The body scrolls below the fixed header. Content is captured from the current product source.',
      },
    },
  },
  render: () => <WhitepaperDialog />,
}

export const AssetBridgeInformation: Story = {
  name: 'Asset and bridge information',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'The captured NVIDIA/Ondo example matches the product reference: reference and held-asset group labels, full-width identities, and the real provider explanation before documentation/risk actions. Both identities share a two-line anatomy: the held token carries a canonical chain badge, with its chain and inline address copy in the supporting line. The title names the asset; the provider is named once, under the same label role as the other groups. Spacing uses the layout recipes: tabs sit 16px below the title and 16px above their content, 8px from label to content, 24px between groups. Whitespace separates the groups within one continuous white body; canonical header, Tabs, EntityIdentity, CopyableValue and Links retain native geometry. The active tab determines content height and the canonical body handles viewport overflow; inactive content is unmounted. Reopening restores Overview. Content is captured from product source.',
      },
    },
  },
  render: () => <BridgeInformationDialog />,
}

export const BridgedCryptoInformation: Story = {
  name: 'Bridged crypto information',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'The same asset-information composition, titled by the held BTCB Token, with the captured Bitcoin reference and BSC Bridge description, risks and destinations. This crypto variant retains Native L1 Asset metadata rather than the exchange-specific stock reference.',
      },
    },
  },
  render: () => <BridgeInformationDialog example="bitcoin" />,
}
