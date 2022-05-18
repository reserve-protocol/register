import { Button } from 'components'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { Card } from 'theme-ui'
import { ReserveToken } from 'types'
import {
  issueAmountAtom,
  isValidIssuableAmountAtom,
} from 'views/issuance/atoms'
import ConfirmModal from './ConfirmModal'
import IssueInput from './IssueInput'
import MaxIssuableUpdater from './MaxIssuableUpdater'
import useQuantities from './useQuantities'

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
      <Card p={4} {...props}>
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
