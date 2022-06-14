import { t, Trans } from '@lingui/macro'
import { TitleCard } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import { Card, CardProps, Flex } from 'theme-ui'

interface Props extends CardProps {}

const Placeholder = ({ onAdd }: { onAdd(): void }) => (
  <TitleCard
    title={t`Emergency collateral`}
    right={
      <Flex variant="layout.verticalAlign">
        <SmallButton onClick={onAdd} mr={2}>
          <Trans>Add</Trans>
        </SmallButton>
        <Help content="TODO" />
      </Flex>
    }
  ></TitleCard>
)

const BasketCollateral = () => {
  return <Card></Card>
}

export default BasketCollateral
