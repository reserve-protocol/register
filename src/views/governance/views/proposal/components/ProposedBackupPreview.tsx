import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { backupCollateralAtom } from 'components/rtoken-setup/atoms'
import { useAtom } from 'jotai'
import { Plus, X } from 'react-feather'
import { Box, BoxProps, Text } from 'theme-ui'
import useBackupChanges, {
  CollateralChange,
  DiversityFactorChange,
} from '../hooks/useBackupChanges'
import { ParameterChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

const ProposedBackupPreview = (props: BoxProps) => {
  const { count, diversityFactor, collateralChanges, priorityChanges } =
    useBackupChanges()
  const [proposedBackup, setProposedBackup] = useAtom(backupCollateralAtom)

  if (!count) {
    return null
  }

  const handleRevertDiversity = (change: DiversityFactorChange) => {
    setProposedBackup({
      ...proposedBackup,
      [change.target]: {
        diversityFactor: change.current,
        collaterals: proposedBackup[change.target].collaterals,
      },
    })
  }

  const handleRevertCollateral = (change: CollateralChange) => {
    const proposedBasket = proposedBackup[change.collateral.targetUnit]

    if (change.isNew) {
      const index = proposedBasket.collaterals.findIndex(
        (c) => c.address === change.collateral.address
      )

      setProposedBackup({
        ...proposedBackup,
        [change.collateral.targetUnit]: {
          diversityFactor:
            proposedBasket.diversityFactor > 0
              ? proposedBasket.diversityFactor - 1
              : 0,
          collaterals: [
            ...proposedBasket.collaterals.slice(0, index),
            ...proposedBasket.collaterals.slice(index + 1),
          ],
        },
      })
    } else {
      setProposedBackup({
        ...proposedBackup,
        [change.collateral.targetUnit]: {
          diversityFactor:
            proposedBackup[change.collateral.targetUnit].diversityFactor + 1,
          collaterals: [...proposedBasket.collaterals, change.collateral],
        },
      })
    }
  }

  return (
    <PreviewBox
      variant="layout.borderBox"
      count={count}
      title={t`Backup basket`}
      {...props}
    >
      {diversityFactor.map((change) => (
        <ParameterChangePreview
          mt={3}
          title={t`Change diversity factor`}
          subtitle={change.target}
          current={change.current.toString()}
          proposed={change.proposed.toString()}
          onRevert={() => handleRevertDiversity(change)}
          key={change.target}
        />
      ))}
      {collateralChanges.map((change, index) => (
        <Box
          variant="layout.verticalAlign"
          key={change.collateral.address}
          mt={3}
        >
          {change.isNew ? (
            <Plus color="#11BB8D" size={18} />
          ) : (
            <X color="#FF0000" size={18} />
          )}
          <Box ml={2}>
            <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
              {change.isNew ? <Trans>Add</Trans> : <Trans>Remove</Trans>}
            </Text>
            <Text>{change.collateral.symbol}</Text>
          </Box>
          <SmallButton
            ml="auto"
            variant="muted"
            onClick={() => handleRevertCollateral(change)}
          >
            <Trans>Revert</Trans>
          </SmallButton>
        </Box>
      ))}
      {priorityChanges.map((change) => (
        <ParameterChangePreview
          key={change.collateral.address}
          mt={3}
          title={t`Change diversity factor`}
          subtitle={change.collateral.symbol}
          current={change.current.toString()}
          proposed={change.proposed.toString()}
        />
      ))}
    </PreviewBox>
  )
}

export default ProposedBackupPreview
