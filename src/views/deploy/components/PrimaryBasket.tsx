import { t, Trans } from '@lingui/macro'
import { TitleCard } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import { Box, CardProps, Divider, Flex, Text } from 'theme-ui'

interface Props extends CardProps {
  onAdd(
    data: {
      basket: 'primary' | 'backup'
      targetUnit?: string
    } | null
  ): void
}

const PrimaryBasket = ({ onAdd }: Props) => {
  return (
    <TitleCard
      sx={{ height: 'fit-content' }}
      title={t`Primary basket`}
      right={
        <Flex variant="layout.verticalAlign">
          <SmallButton onClick={() => onAdd({ basket: 'primary' })} mr={2}>
            <Trans>Add</Trans>
          </SmallButton>
          <Help
            content={
              <Text>
                <Trans>TODO: Help copy</Trans>
              </Text>
            }
          />
        </Flex>
      }
    >
      <Flex variant="layout.verticalAlign">
        <Text>
          <Trans>Basket</Trans>
        </Text>
        <Box mx="auto" />
        <Text>0%</Text>
        <Help ml={2} content="TODO" />
      </Flex>
      <Divider mx={-4} my={3} />
      <Text variant="legend" sx={{ fontSize: 1 }}>
        <Trans>
          This is the basket & weights you want your RToken to use as it’s
          primary backing.
        </Trans>
      </Text>
    </TitleCard>
  )
}

export default PrimaryBasket
