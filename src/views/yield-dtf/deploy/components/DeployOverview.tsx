import { Trans, t } from '@lingui/macro'
import Deployer from 'abis/Deployer'
import CopyValue from '@/components/ui/copy-value'
import GoTo from '@/components/ui/go-to'
import TransactionButton from '@/components/ui/transaction-button'
import Spinner from '@/components/ui/spinner'
import DeployActionIcon from 'components/icons/DeployActionIcon'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chainIdAtom } from 'state/atoms'
import { shortenString } from 'utils'
import { DEPLOYER_ADDRESS } from 'utils/addresses'
import { ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address, decodeEventLog } from 'viem'
import useDeploy from '../useDeploy'
import TransactionError from 'components/transaction-error/TransactionError'

const Pending = () => (
  <>
    <Spinner className="mt-3 mb-2" size={24} />
    <span className="font-medium block">
      <Trans>Pending, sign in wallet</Trans>
    </span>
    <p className="text-legend">
      <Trans>
        Please sign the transaction in your wallet to continue with the
        deployment process.
      </Trans>
    </p>
  </>
)

const Mining = ({ hash }: { hash: string }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <>
      <Spinner size={24} className="mt-3 mb-2" />
      <span className="font-medium text-lg block mb-2">
        <Trans>Deploy transaction submitted</Trans>
      </span>
      <p className="text-legend">
        <Trans>
          Meditate peacefully on the stability of a future asset backed reserve
          currency while your RToken deploys 🧘‍♂️
        </Trans>
      </p>
      <p className="text-legend mt-2">
        <Trans>
          Please don't close this window to avoid issues finding your way back
          here.
        </Trans>
      </p>
      <div className="flex items-center justify-center mt-4">
        <span>{shortenString(hash)}</span>
        <CopyValue ml={3} mr={2} value={hash} />
        <GoTo
          href={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
        />
      </div>
    </>
  )
}

interface Props {
  onDeploy(rtoken: Address): void
  className?: string
}

const DeployOverview = ({ onDeploy, className }: Props) => {
  const navigate = useNavigate()
  const chainId = useAtomValue(chainIdAtom)
  const { gas, write, isReady, hash, validationError, error, isLoading } =
    useDeploy()
  const { data, status } = useWatchTransaction({
    hash,
    label: 'Deploy RToken',
  })

  const handleDeploySuccess = () => {
    const deployLog = data?.logs
      ? data.logs.find(
          (logs) => logs.address === DEPLOYER_ADDRESS[chainId].toLowerCase()
        )
      : undefined

    try {
      if (deployLog) {
        const {
          args: { rToken },
        } = decodeEventLog({
          abi: Deployer,
          ...deployLog,
        })

        onDeploy(rToken)
      } else {
        // In the weird case there is no token on the logs (most likely a bug)
        // Redirect the user to the token list so they can find their token and continue the process
        navigate(ROUTES.TOKENS)
      }
    } catch (e) {
      console.log('error', e)
    }
  }

  useEffect(() => {
    if (status === 'success') {
      handleDeploySuccess()
    }
  }, [status])

  return (
    <div
      className={`border border-border rounded-3xl p-4 h-fit mt-0 sm:mt-4 lg:mt-6 mb-4 ${className || ''}`}
    >
      <div className="flex flex-col items-center text-center py-2">
        <DeployActionIcon />
        <span className="text-xl font-medium mt-2 mb-1">
          <Trans>Tx1. RToken Deploy</Trans>
        </span>
        {(() => {
          if (isLoading && !hash) {
            return <Pending />
          }

          if (hash) {
            return <Mining hash={hash} />
          }

          return (
            <>
              <p className="text-legend text-center">
                <Trans>
                  You will be the temporary owner until governance is deployed
                  in transaction 2.
                </Trans>
              </p>

              <TransactionButton
                text={t`Deploy RToken`}
                className="mt-6 w-full"
                disabled={!isReady}
                onClick={write}
                gas={gas}
              />

              <TransactionError mt={3} error={validationError || error} />
            </>
          )
        })()}
      </div>
    </div>
  )
}

export default DeployOverview
