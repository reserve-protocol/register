import { t, Trans } from '@lingui/macro'
import { Button, TitleCard } from 'components'
import { SmallButton } from 'components/button'
import { smallButton } from 'theme'
import { Box, Text, Card, CardProps, Divider, Flex } from 'theme-ui'

interface Props extends CardProps {}

const PrimaryBasket = () => {
  return (
    <TitleCard
      title={t`Primary basket`}
      right={
        <Flex>
          <SmallButton>
            <Trans>Add</Trans>
          </SmallButton>
        </Flex>
      }
    ></TitleCard>
  )
}

export default PrimaryBasket
