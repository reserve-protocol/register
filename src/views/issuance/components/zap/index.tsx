import { t, Trans } from '@lingui/macro'
import { Button } from 'components'
import ZapTokenSelector from './ZapTokenSelector'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useState } from 'react'
import { Card, Grid } from 'theme-ui'
import {
  issueAmountAtom,
  isValidIssuableAmountAtom,
  quantitiesAtom,
} from 'views/issuance/atoms'
import ConfirmIssuance from '../issue/ConfirmIssuance'
import IssueInput from '../issue/IssueInput'
import MaxIssuableUpdater from '../issue/MaxIssuableUpdater'
import QuantitiesUpdater from '../issue/QuantitiesUpdater'
import ZapInput from './ZapInput'

/**
 * Issuance
 */
const Zap = () => {
  const [amount, setAmount] = useAtom(issueAmountAtom)
  const setQuantities = useUpdateAtom(quantitiesAtom)
  const isValid = useAtomValue(isValidIssuableAmountAtom)
  const [issuing, setIssuing] = useState(false)
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
        <Grid columns={2}>
          <ZapTokenSelector />
          <ZapInput />
        </Grid>
        <Button
          sx={{ width: '100%' }}
          disabled={!isValid || issuing}
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

export default Zap
