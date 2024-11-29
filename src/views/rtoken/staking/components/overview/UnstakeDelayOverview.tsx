import { atom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { rTokenConfigurationAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { parseDuration } from 'utils'
import UnstakeDelay, { UnstakeFlow } from '../UnstakeDelay'

const delayAtom = atom((get) => {
  const params = get(rTokenConfigurationAtom)

  return parseDuration(+params?.unstakingDelay || 0)
})

const UnstakeDelayOverview = () => {
  const delay = useAtomValue(delayAtom)
  const [isOpen, setOpen] = useState(false)

  return (
    <Box mt={4} variant="layout.borderBox">
      <Box
        variant="layout.verticalAlign"
        sx={{ fontSize: 3, fontWeight: 700, cursor: 'pointer' }}
        onClick={() => setOpen(!isOpen)}
      >
        <Text mr="auto">Unstake delay</Text>
        <Text variant="bold" mr={3}>
          {delay}
        </Text>
        {isOpen ? <Minus /> : <Plus />}
      </Box>
      {isOpen && (
        <>
          <UnstakeFlow />
          <Text mt={3} variant="legend" sx={{ fontSize: 1, display: 'block' }}>
            Funds will be used in the case of a collateral default during the
            unstaking delay and up until the point of the manually triggered
            withdraw transaction.
          </Text>
        </>
      )}
    </Box>
  )
}

export default UnstakeDelayOverview
