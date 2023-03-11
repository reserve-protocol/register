import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useAtom, useAtomValue } from 'jotai'
import { Box, BoxProps, Text } from 'theme-ui'
import { basketChangesAtom, isNewBasketProposedAtom } from '../atoms'
import ListItemPreview from './ListItemPreview'
import PreviewBox from './PreviewBox'

const ProposedBasketPreview = (props: BoxProps) => {
  const [isNewBasketProposed, setProposeNewBasket] = useAtom(
    isNewBasketProposedAtom
  )
  const basketChanges = useAtomValue(basketChangesAtom)

  if (!isNewBasketProposed) {
    return null
  }

  return (
    <>
      <Box variant="layout.borderBox" {...props}>
        <Box variant="layout.verticalAlign">
          <Text variant="strong" sx={{ color: 'warning' }}>
            <Trans>New primary basket</Trans>
          </Text>
          <SmallButton
            ml="auto"
            variant="muted"
            onClick={() => setProposeNewBasket(false)}
          >
            <Trans>Revert</Trans>
          </SmallButton>
        </Box>
      </Box>
      {!!basketChanges.length && (
        <PreviewBox
          variant="layout.borderBox"
          count={basketChanges.length}
          mt={4}
          title={t`Primary basket`}
        >
          {basketChanges.map((change, index) => (
            <ListItemPreview
              mt={3}
              isNew={change.isNew}
              label={change.collateral.symbol}
              key={index}
            />
          ))}
        </PreviewBox>
      )}
    </>
  )
}

export default ProposedBasketPreview
