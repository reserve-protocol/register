import { Trans } from '@lingui/macro'
import { Button } from 'components'
import RTokenLight from 'components/icons/RTokenLight'
import { useAtomValue } from 'jotai'
import { borderRadius } from 'theme'
import { Text, BoxProps, Box } from 'theme-ui'
import { basketAtom } from '../atoms'

interface Props extends BoxProps {
  onSetup(): void
}

const BasketOverview = ({ onSetup, ...props }: Props) => {
  const basket = useAtomValue(basketAtom)

  if (!Object.keys(basket).length) {
    return (
      <Box
        sx={(theme: any) => ({
          display: 'flex',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: borderRadius.boxes,
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: 286,
        })}
        {...props}
      >
        <RTokenLight />
        <Text mt={3} mb={3} sx={{ fontSize: 3 }}>
          <Trans>Set your collateral basket</Trans>
        </Text>
        <Button onClick={onSetup} px={4}>
          <Trans>Set basket</Trans>
        </Button>
      </Box>
    )
  }

  return <Box>Display basket config...</Box>
}

export default BasketOverview
