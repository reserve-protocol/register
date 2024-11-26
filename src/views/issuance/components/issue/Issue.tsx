import { t, Trans } from '@lingui/macro'
import FacadeRead from 'abis/FacadeRead'
import { Button } from 'components'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useState } from 'react'
import {
  balancesAtom,
  chainIdAtom,
  rTokenAtom,
  rTokenStateAtom,
  walletAtom,
} from 'state/atoms'
import { Card } from 'theme-ui'
import { FACADE_ADDRESS } from 'utils/addresses'
import {
  issueAmountAtom,
  isValidIssuableAmountAtom,
  maxIssuableAtom,
} from 'views/issuance/atoms'
import { usePublicClient } from 'wagmi'
import ConfirmIssuance from './ConfirmIssuance'
import IssueInput from './IssueInput'
import { isRTokenMintEnabled } from 'state/geolocation/atoms'

const useMaxIssuable = async () => {
  const rToken = useAtomValue(rTokenAtom)
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const client = usePublicClient({ chainId })
  const { issuancePaused, frozen } = useAtomValue(rTokenStateAtom)
  const balances = useAtomValue(balancesAtom)
  const setMaxIssuable = useSetAtom(maxIssuableAtom)

  if (!rToken || !client || !account || frozen || issuancePaused) {
    return setMaxIssuable(0n)
  }

  // RSV
  if (rToken && !rToken.main) {
    setMaxIssuable(balances[rToken.collaterals[0].address].value ?? 0n)
    return
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
  const isEnabled = useAtomValue(isRTokenMintEnabled)
  const rToken = useRToken()
  useMaxIssuable()

  const handleIssue = () => {
    mixpanel.track('Clicked Mint', {
      RToken: rToken?.address.toLowerCase() ?? '',
    })
    setIssuing(true)
  }

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
          disabled={
            !isValid ||
            issuing ||
            issuancePaused ||
            frozen ||
            !isEnabled.value ||
            isEnabled.loading
          }
          variant={missingCollateral ? 'error' : 'primary'}
          mt={3}
          onClick={handleIssue}
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
