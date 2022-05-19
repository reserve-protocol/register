import { Button } from 'components'
import useDebounce from 'hooks/useDebounce'
import { useAtom, useAtomValue } from 'jotai'
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
import QuantitiesUpdater from './QuantitiesUpdater'

/**
 * Issuance
 */
const Issue = ({ data, ...props }: { data: ReserveToken }) => {
  const [amount, setAmount] = useAtom(issueAmountAtom)
  const isValid = useAtomValue(isValidIssuableAmountAtom)
  const debouncedValue = useDebounce(amount, 400)
  const [issuing, setIssuing] = useState(false)

  return (
    <>
      <MaxIssuableUpdater />
      <QuantitiesUpdater amount={debouncedValue} />
      {issuing && (
        <ConfirmModal
          data={data}
          onClose={() => {
            setIssuing(false)
            setAmount('')
          }}
        />
      )}
      <Card p={4} {...props}>
        <IssueInput />
        <Button
          sx={{ width: '100%' }}
          disabled={!isValid || issuing}
          mt={2}
          onClick={() => setIssuing(true)}
        >
          + Mint {data.token.symbol}
        </Button>
      </Card>
    </>
  )
}

export default Issue
