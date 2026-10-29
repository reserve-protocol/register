import {
  Description,
  Heading,
  Subtitle,
  Title,
} from '@storybook/addon-docs/blocks'
import type { ComponentProps } from 'react'

import { ConnectedCanvas, type DocStory } from './connected-docs'

export const FocusedDocs = ({
  of,
  include,
}: {
  of: DocStory
  include?: ComponentProps<typeof ConnectedCanvas>['include']
}) => (
  <>
    <Title />
    <Subtitle />
    <Description />
    <Heading>Interactive example</Heading>
    <ConnectedCanvas of={of} include={include} />
  </>
)
