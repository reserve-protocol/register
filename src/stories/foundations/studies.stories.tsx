import type { Meta, StoryObj } from '@storybook/react-vite'
import AccessibilityStudy from './reference/accessibility-study'
import ColorContrastReview from './reference/color-contrast-review'
import ControlGeometryMatrix from './reference/control-geometry-matrix'
import ElevationStudy from './reference/elevation-study'
import ShapeStudy from './reference/shape-study'
import {
  ResponsiveInsetSpecimens,
  RowRhythmSpecimens,
} from './reference/spacing-rhythm-specimens'
import { TypographyReviewContexts } from './reference/typography-review-contexts'
import { TypographyRecommendedRefinements } from './reference/typography-recommended-refinements'
import ButtonHierarchyDecision from './reference/button-hierarchy-decision'
import ButtonLoadingDecision from './reference/button-loading-decision'

const meta = {
  title: 'Explorations/Foundation studies',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        component: 'Foundations applied to real content.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-6xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Contrast: Story = { render: () => <ColorContrastReview /> }
export const KeyboardAndMeaning: Story = {
  name: 'Keyboard and meaning',
  render: () => <AccessibilityStudy />,
}
export const ControlGeometry: Story = {
  name: 'Control geometry',
  render: () => <ControlGeometryMatrix />,
}
export const Elevation: Story = { render: () => <ElevationStudy /> }
export const Shape: Story = { render: () => <ShapeStudy /> }
export const ResponsiveInsets: Story = {
  name: 'Responsive insets',
  render: () => <ResponsiveInsetSpecimens />,
}
export const RowDensity: Story = {
  name: 'Row density',
  render: () => <RowRhythmSpecimens />,
}
export const TypographyContexts: Story = {
  name: 'Typography contexts',
  render: () => <TypographyReviewContexts />,
}
export const TypographyRefinements: Story = {
  name: 'Typography refinements',
  render: () => <TypographyRecommendedRefinements />,
}
export const ButtonHierarchy: Story = {
  name: 'Button hierarchy',
  render: () => <ButtonHierarchyDecision />,
}
export const ButtonLoading: Story = {
  name: 'Button loading',
  render: () => <ButtonLoadingDecision />,
}
