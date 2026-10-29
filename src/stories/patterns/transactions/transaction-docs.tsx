import {
  Description,
  Heading,
  Stories,
  Title,
} from '@storybook/addon-docs/blocks'
import { ConnectedCanvas, type DocStory } from '../../shared/connected-docs'

export const TransactionDocs = ({ interactive }: { interactive: DocStory }) => (
  <>
    <Title />
    <Description />
    <Heading>Proposed presentation rules</Heading>
    <ul>
      <li>
        Input keeps the amount, asset and available operation editable. Keep
        secondary quote facts subordinate to the amount and primary action.
      </li>
      <li>
        After commitment, preserve the chosen operation and amounts. Show the
        current wallet or network step; a spinner means waiting, not a known
        percentage.
      </li>
      <li>
        Recovery retains the last useful input and identifies the failed step.
        Retry must not imply that an earlier successful approval is repeated.
      </li>
      <li>
        Outcome presents final received values and the next available action.
        Family-specific approval, order, withdrawal and delegation mechanics
        stay separate.
      </li>
    </ul>
    <ConnectedCanvas of={interactive} />
    <Stories includePrimary={false} />
  </>
)
