import { t, Trans } from '@lingui/macro'
import { Button } from 'components'
import { useAtom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useState } from 'react'
import { Card } from 'theme-ui'
import { ReserveToken } from 'types'
import {
  issueAmountAtom,
  isValidIssuableAmountAtom,
  quantitiesAtom,
} from 'views/issuance/atoms'
import ConfirmIssuance from './ConfirmIssuance'
import IssueInput from './IssueInput'
import MaxIssuableUpdater from './MaxIssuableUpdater'
import QuantitiesUpdater from './QuantitiesUpdater'

/**
 * Issuance
 */
const Issue = ({ data, ...props }: { data: ReserveToken }) => {
  const [amount, setAmount] = useAtom(issueAmountAtom)
  const setQuantities = useUpdateAtom(quantitiesAtom)
  const isValid = useAtomValue(isValidIssuableAmountAtom)
  const [issuing, setIssuing] = useState(false)

  return (
    <>
      <MaxIssuableUpdater />
      <QuantitiesUpdater amount={amount} onChange={setQuantities} />
      {issuing && (
        <ConfirmIssuance
          onClose={() => {
            setIssuing(false)
            setAmount('')
          }}
        />
      )}
      <Card p={4} {...props}>
        <IssueInput title={t`Mint`} />
        <Button
          sx={{ width: '100%' }}
          disabled={!isValid || issuing}
          mt={2}
          onClick={() => setIssuing(true)}
        >
          <Trans>+ Mint {data.symbol}</Trans>
        </Button>
      </Card>
    </>
  )
}

export default Issue
