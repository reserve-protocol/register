import {
  Canvas,
  Description,
  Heading,
  Title,
} from '@storybook/addon-docs/blocks'
import type { ReactNode } from 'react'
import { ConnectedCanvas, type DocStory } from './connected-docs'

export const OverviewDocs = ({
  overview,
  interactive,
  details,
}: {
  overview: DocStory
  interactive: DocStory
  details?: ReactNode
}) => (
  <>
    <Title />
    <Description />
    <Canvas of={overview} />
    {details}
    <Heading>Interactive example</Heading>
    <ConnectedCanvas of={interactive} />
  </>
)
