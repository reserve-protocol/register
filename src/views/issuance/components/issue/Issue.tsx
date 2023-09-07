import { t, Trans } from '@lingui/macro'
import { Button } from 'components'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import {
  balancesAtom,
  chainIdAtom,
  publicClientAtom,
  rTokenAtom,
  rTokenStateAtom,
  walletAtom,
} from 'state/atoms'
import { Card } from 'theme-ui'
import {
  issueAmountAtom,
  isValidIssuableAmountAtom,
  maxIssuableAtom,
} from 'views/issuance/atoms'
import ConfirmIssuance from './ConfirmIssuance'
import IssueInput from './IssueInput'
import { FACADE_ADDRESS, USDC_ADDRESS } from 'utils/addresses'
import FacadeRead from 'abis/FacadeRead'

const useMaxIssuable = async () => {
  const rToken = useAtomValue(rTokenAtom)
  const account = useAtomValue(walletAtom)
  const client = useAtomValue(publicClientAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { issuancePaused, frozen } = useAtomValue(rTokenStateAtom)
  const balances = useAtomValue(balancesAtom)
  const setMaxIssuable = useSetAtom(maxIssuableAtom)

  if (!rToken || !client || !account || frozen || issuancePaused) {
    return setMaxIssuable(0n)
  }

  // RSV
  if (!rToken.main) {
    setMaxIssuable(balances[USDC_ADDRESS[chainId]].value ?? 0n)
  }

  try {
    const { result } = await client.simulateContract({
      abi: FacadeRead,
      address: FACADE_ADDRESS[chainId],
      functionName: 'maxIssuable',
      args: [rToken.address, account],
    })

    setMaxIssuable(result)
  } catch (e) {
    console.error('Error fetching max issuable')
    setMaxIssuable(0n)
  }

  return null
}

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
  useMaxIssuable()

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
