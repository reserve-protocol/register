import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { basketAtom } from 'components/rtoken-setup/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { Box, BoxProps, Text } from 'theme-ui'
import { basketChangesAtom, isNewBasketProposedAtom } from '../atoms'
import { CollateralChange } from '../hooks/useBackupChanges'
import ListItemPreview from './ListItemPreview'
import PreviewBox from './PreviewBox'

const ProposedBasketPreview = (props: BoxProps) => {
  const [isNewBasketProposed, setProposeNewBasket] = useAtom(
    isNewBasketProposedAtom
  )
  const basketChanges = useAtomValue(basketChangesAtom)
  const [proposedPrimaryBasket, setBasketProposed] = useAtom(basketAtom)

  if (!isNewBasketProposed) {
    return null
  }

  const handleRevert = (change: CollateralChange) => {
    const proposedBasket =
      proposedPrimaryBasket[change.collateral.targetUnit] || {}

    if (change.isNew) {
      const index = proposedBasket.collaterals.findIndex(
        (c) => c.address === change.collateral.address
      )

      setBasketProposed({
        ...proposedPrimaryBasket,
        [change.collateral.targetUnit]: {
          ...proposedBasket,
          collaterals: [
            ...proposedBasket.collaterals.slice(0, index),
            ...proposedBasket.collaterals.slice(index + 1),
          ],
        },
      })
    } else {
      setBasketProposed({
        ...proposedPrimaryBasket,
        [change.collateral.targetUnit]: {
          ...proposedBasket,
          collaterals: [
            ...(proposedBasket?.collaterals || []),
            // TODO: Missing add weight on revert?
            change.collateral,
          ],
        },
      })
    }
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
              mt={4}
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
