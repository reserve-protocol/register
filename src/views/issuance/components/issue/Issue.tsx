import { t, Trans } from '@lingui/macro'
import { Button } from 'components'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { rTokenStateAtom } from 'state/atoms'
import { Card } from 'theme-ui'
import {
  issueAmountAtom,
  isValidIssuableAmountAtom,
} from 'views/issuance/atoms'
import ConfirmIssuance from './ConfirmIssuance'
import IssueInput from './IssueInput'

/**
 * Issuance
 */
const Issue = () => {
  const [amount, setAmount] = useAtom(issueAmountAtom)
  const isValid = useAtomValue(isValidIssuableAmountAtom)
  const [issuing, setIssuing] = useState(false)
  const { issuancePaused, frozen } = useAtomValue(rTokenStateAtom)
  const missingCollateral = amount && !isValid
  const rToken = useRToken()

  return (
    <>
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
