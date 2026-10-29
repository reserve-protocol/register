import {
  Description,
  Heading,
  Stories,
  Title,
} from '@storybook/addon-docs/blocks'
import { ConnectedCanvas, type DocStory } from './connected-docs'

export const PlaygroundDocs = ({ interactive }: { interactive: DocStory }) => (
  <>
    <Title />
    <Description />
    <Heading>Interactive example</Heading>
    <ConnectedCanvas of={interactive} />
    <Stories includePrimary={false} title="Examples" />
  </>
)
