import styled from '@emotion/styled'
import { Button, NumericalInput } from 'components'
import useDebounce from 'hooks/useDebounce'
import { useAtom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { Box, Card, Text } from 'theme-ui'
import { ReserveToken } from 'types'
import { formatCurrency } from 'utils'
import {
  issueAmountAtom,
  isValidIssuableAmountAtom,
  maxIssuableAtom,
} from 'views/issuance/atoms'
import ConfirmModal from './ConfirmModal'
import IssueInput from './IssueInput'
import MaxIssuableUpdater from './MaxIssuableUpdater'
import useQuantities from './useQuantities'

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

/**
 * Issuance
 */
const Issue = ({ data, ...props }: { data: ReserveToken }) => {
  const amount = useAtomValue(issueAmountAtom)
  const isValid = useAtomValue(isValidIssuableAmountAtom)
  const debouncedValue = useDebounce(amount, 400)
  const [issuing, setIssuing] = useState(false)
  // Update quantities after input change
  useQuantities(data, debouncedValue)

  return (
    <>
      <MaxIssuableUpdater />
      {issuing && (
        <ConfirmModal data={data} onClose={() => setIssuing(false)} />
      )}
      <Card {...props}>
        <IssueInput />
        <Button
          sx={{ width: '100%' }}
          disabled={!isValid || issuing}
          mt={3}
          onClick={() => setIssuing(true)}
        >
          + Mint {data.token.symbol}
        </Button>
      </Card>
    </>
  )
}

export default Issue
