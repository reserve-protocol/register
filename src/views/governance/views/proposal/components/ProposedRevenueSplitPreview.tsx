import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { revenueSplitAtom } from 'components/rtoken-setup/atoms'
import { useAtom } from 'jotai'
import { Plus, X } from 'react-feather'
import { Box, BoxProps, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import useRevenueSplitChanges, {
  DistributionChange,
  ExternalChange,
} from '../hooks/useRevenueSplitChanges'
import { ParameterChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

const getDistributionSubtitle = (change: DistributionChange) => {
  if (change.isExternal && !change.isTotal) {
    return `RToken/RSR - ${shortenAddress(change.key)}`
  }

  if (change.isExternal) {
    return `Total - ${shortenAddress(change.key)}`
  }

  return change.key[0].toUpperCase() + change.key.substring(1)
}

const ProposedRevenueSplitPreview = (props: BoxProps) => {
  const { distributions, externals, count } = useRevenueSplitChanges()
  const [revenueSplit, setRevenueSplit] = useAtom(revenueSplitAtom)

  if (!count) {
    return null
  }

  const handleRevertDistribution = (change: DistributionChange) => {}

  const handleRevertExternal = (change: ExternalChange) => {
    setRevenueSplit({
      ...revenueSplit,
      external: change.isNew ? [...revenueSplit.external] : [],
    })
  }

  return (
    <PreviewBox
      variant="layout.borderBox"
      count={count}
      title={t`Revenue split`}
      {...props}
    >
      {distributions.map((change) => (
        <ParameterChangePreview
          mt={3}
          title={t`Change distribution`}
          subtitle={getDistributionSubtitle(change)}
          current={change.current}
          proposed={change.proposed}
          onRevert={() => handleRevertDistribution(change)}
          key={change.key}
        />
      ))}
      {externals.map((change) => (
        <Box variant="layout.verticalAlign" key={change.key} mt={3}>
          {change.isNew ? (
            <Plus color="#11BB8D" size={18} />
          ) : (
            <X color="#FF0000" size={18} />
          )}
          <Box ml={2}>
            <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
              {change.isNew ? <Trans>Add</Trans> : <Trans>Remove</Trans>}
            </Text>
            <Text>{shortenAddress(change.key)}</Text>
          </Box>
          <SmallButton
            ml="auto"
            variant="muted"
            onClick={() => handleRevertExternal(change)}
          >
            <Trans>Revert</Trans>
          </SmallButton>
        </Box>
      ))}
    </PreviewBox>
  )
}

export default ProposedRevenueSplitPreview
