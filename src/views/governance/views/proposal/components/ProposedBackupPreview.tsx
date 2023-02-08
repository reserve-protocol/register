import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { Check, Plus, X } from 'react-feather'
import { Box, BoxProps, Text } from 'theme-ui'
import useBackupChanges, {
  CollateralChange,
  CollateralPriorityChange,
  DiversityFactorChange,
} from '../hooks/useBackupChanges'
import { ParameterChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

const ProposedBackupPreview = (props: BoxProps) => {
  const { count, diversityFactor, collateralChanges, priorityChanges } =
    useBackupChanges()

  if (!count) {
    return null
  }

  const handleRevertDiversity = (change: DiversityFactorChange) => {}

  const handleRevertPriority = (change: CollateralPriorityChange) => {}

  const handleRevertCollateral = (change: CollateralChange) => {}

  return (
    <PreviewBox
      variant="layout.borderBox"
      count={count}
      title={`Backup basket`}
      {...props}
    >
      {diversityFactor.map((change) => (
        <ParameterChangePreview
          title={t`Change diversity factor`}
          subtitle={change.target}
          current={change.current.toString()}
          proposed={change.proposed.toString()}
          onRevert={() => handleRevertDiversity(change)}
        />
      ))}
      {collateralChanges.map((change, index) => (
        <Box
          variant="layout.verticalAlign"
          key={change.collateral.address}
          mt={index ? 3 : 0}
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
          title={t`Change diversity factor`}
          subtitle={change.collateral.symbol}
          current={change.current.toString()}
          proposed={change.proposed.toString()}
          onRevert={() => handleRevertPriority(change)}
        />
      ))}
    </PreviewBox>
  )
}

export default ProposedBackupPreview
