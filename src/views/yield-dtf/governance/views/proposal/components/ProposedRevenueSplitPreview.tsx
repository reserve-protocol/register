import { t, Trans } from '@lingui/macro'
import { SmallButton } from '@/components/old/button'
import {
  ExternalAddressSplit,
  revenueSplitAtom,
} from 'components/rtoken-setup/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { Plus, X } from 'lucide-react'
import { Box, BoxProps, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { revenueSplitChangesAtom } from '../atoms'
import {
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
  const { distributions, externals, count } = useAtomValue(
    revenueSplitChangesAtom
  )
  const [revenueSplit, setRevenueSplit] = useAtom(revenueSplitAtom)

  if (!count) {
    return null
  }

  const handleRevertDistribution = (change: DistributionChange) => {
    if (change.isExternal) {
      const index = revenueSplit.external.findIndex(
        (r) => r.address === change.key
      )
      let newExternals: ExternalAddressSplit[]

      if (change.isTotal) {
        newExternals = [
          ...revenueSplit.external.slice(0, index),
          { ...revenueSplit.external[index], total: change.current },
          ...revenueSplit.external.slice(index + 1),
        ]
      } else {
        const [holders, stakers] = change.current.split('/')
        newExternals = [
          ...revenueSplit.external.slice(0, index),
          { ...revenueSplit.external[index], holders, stakers },
          ...revenueSplit.external.slice(index + 1),
        ]
      }

      // Force re-render of the form to catch the reset values
      setRevenueSplit({
        ...revenueSplit,
        external: [
          ...revenueSplit.external.slice(0, index),
          ...revenueSplit.external.slice(index + 1),
        ],
      })
      setTimeout(() => {
        setRevenueSplit({
          ...revenueSplit,
          external: newExternals,
        })
      }, 10)
    } else {
      setRevenueSplit({ ...revenueSplit, [change.key]: change.current })
    }
  }

  const handleRevertExternal = (change: ExternalChange) => {
    const index = change.isNew
      ? revenueSplit.external.findIndex((r) => {
          return r.address === change.split.address
        })
      : -1

    setRevenueSplit({
      ...revenueSplit,
      external: !change.isNew
        ? [...revenueSplit.external, change.split]
        : [
            ...revenueSplit.external.slice(0, index),
            ...revenueSplit.external.slice(index + 1),
          ],
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
        <Box variant="layout.verticalAlign" key={change.split.address} mt={3}>
          {change.isNew ? (
            <Plus color="#11BB8D" size={18} />
          ) : (
            <X color="#FF0000" size={18} />
          )}
          <Box ml={2}>
            <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
              {change.isNew ? <Trans>Add</Trans> : <Trans>Remove</Trans>}
            </Text>
            <Text>{shortenAddress(change.split.address)}</Text>
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
