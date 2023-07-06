import { t, Trans } from '@lingui/macro'
import { Button } from 'components'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { Card } from 'theme-ui'
import {
  issueAmountAtom,
  isValidIssuableAmountAtom,
  quantitiesAtom,
} from 'views/issuance/atoms'
import ConfirmIssuance from './ConfirmIssuance'
import IssueInput from './IssueInput'
import MaxIssuableUpdater from './MaxIssuableUpdater'
import QuantitiesUpdater from './QuantitiesUpdater'
import { rTokenStateAtom } from 'state/atoms'

/**
 * Issuance
 */
const Issue = () => {
  const [amount, setAmount] = useAtom(issueAmountAtom)
  const setQuantities = useSetAtom(quantitiesAtom)
  const isValid = useAtomValue(isValidIssuableAmountAtom)
  const [issuing, setIssuing] = useState(false)
  const { issuancePaused, frozen } = useAtomValue(rTokenStateAtom)
  const missingCollateral = amount && !isValid
  const rToken = useRToken()

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
      <Card p={4}>
        <IssueInput title={t`Mint`} compact={false} />
        <Button
          sx={{ width: '100%' }}
          disabled={!isValid || issuing || issuancePaused || frozen}
          variant={missingCollateral ? 'error' : 'primary'}
          mt={3}
          onClick={() => setIssuing(true)}
        >
          {missingCollateral ? (
            <Trans>Missing collateral</Trans>
          ) : (
            <Trans>+ Mint {rToken?.symbol ?? ''}</Trans>
          )}
        </Button>
      </Card>
    </>
  )
}

export default Issue
