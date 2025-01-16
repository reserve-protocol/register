import { t, Trans } from '@lingui/macro'
import { SmallButton } from '@/components/old/button'
import { backupCollateralAtom } from 'components/rtoken-setup/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { Box, BoxProps, Checkbox, Text } from 'theme-ui'
import {
  autoRegisterBackupAssetsAtom,
  backupChangesAtom,
  isNewBackupProposedAtom,
} from '../atoms'
import {
  CollateralChange,
  DiversityFactorChange,
} from '../hooks/useBackupChanges'
import { ParameterChangePreview } from './ItemPreview'
import ListItemPreview from './ListItemPreview'
import PreviewBox from './PreviewBox'

const ProposedBackupPreview = (props: BoxProps) => {
  const [isNewBackupProposed, setProposeNewBackup] = useAtom(
    isNewBackupProposedAtom
  )
  const { count, diversityFactor, collateralChanges, priorityChanges } =
    useAtomValue(backupChangesAtom)
  const [proposedBackup, setProposedBackup] = useAtom(backupCollateralAtom)
  const [autoRegister, setAutoRegister] = useAtom(autoRegisterBackupAssetsAtom)

  if (!isNewBackupProposed) {
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
    const proposedBasket = proposedBackup[change.collateral.targetName] || {}

    if (change.isNew) {
      const index = proposedBasket.collaterals.findIndex(
        (c) => c.address === change.collateral.address
      )

      setProposedBackup({
        ...proposedBackup,
        [change.collateral.targetName]: {
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
        [change.collateral.targetName]: {
          diversityFactor:
            proposedBackup[change.collateral.targetName].diversityFactor + 1,
          collaterals: [...proposedBasket.collaterals, change.collateral],
        },
      })
    }
  }

  return (
    <>
      <Box variant="layout.borderBox" {...props}>
        <Box variant="layout.verticalAlign">
          <Text variant="strong" sx={{ color: 'warning' }}>
            <Trans>New backup configuration</Trans>
          </Text>
          <SmallButton
            ml="auto"
            variant="muted"
            onClick={() => setProposeNewBackup(false)}
          >
            <Trans>Revert</Trans>
          </SmallButton>
        </Box>
        <label>
          <Box variant="layout.verticalAlign" mt={2}>
            <Checkbox
              checked={autoRegister}
              onChange={() => setAutoRegister(!autoRegister)}
            />
            <Text variant="strong">Generate Asset Registry calls</Text>
          </Box>
        </label>
      </Box>
      {!!count && (
        <PreviewBox
          variant="layout.borderBox"
          count={count}
          title={t`Backup basket`}
          mt={4}
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
          {collateralChanges.map((change) => (
            <ListItemPreview
              mt={3}
              isNew={change.isNew}
              onRevert={() => handleRevertCollateral(change)}
              label={change.collateral.symbol}
              key={change.collateral.symbol}
            />
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
      )}
    </>
  )
}

export default ProposedBackupPreview
