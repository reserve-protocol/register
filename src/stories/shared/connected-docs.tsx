import {
  Canvas,
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from '@storybook/addon-docs/blocks'
import type { ComponentProps } from 'react'

export type DocStory = NonNullable<ComponentProps<typeof Canvas>['of']> &
  NonNullable<ComponentProps<typeof Controls>['of']>

export const ConnectedCanvas = ({
  of,
  include,
}: {
  of: DocStory
  include?: ComponentProps<typeof Controls>['include']
}) => (
  <div className="storybook-docs-interactive sb-unstyled">
    <Controls of={of} include={include} />
    <Canvas of={of} />
  </div>
)

export const ConnectedDocs = () => (
  <>
    <Title />
    <Subtitle />
    <Description />
    <div className="storybook-docs-interactive sb-unstyled">
      <Controls />
      <Primary />
    </div>
    <Stories includePrimary={false} />
  </>
)
