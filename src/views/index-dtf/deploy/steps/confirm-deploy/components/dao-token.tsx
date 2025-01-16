import { useAtom, useAtomValue } from 'jotai'
import { indexDeployFormDataAtom } from '../atoms'
import {
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { INDEX_GOVERNANCE_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { chainIdAtom } from '@/state/atoms'
import dtfIndexGovernanceDeployerAbi from '@/abis/dtf-index-governance-deployer-abi'
import { erc20Abi, parseEther, parseEventLogs } from 'viem'
import { useEffect } from 'react'
import { daoTokenAddressAtom } from '../../../atoms'
import { Button } from '@/components/ui/button'
import { ExplorerDataType } from '@/utils/getExplorerLink'
import { getExplorerLink } from '@/utils/getExplorerLink'
import { ArrowUpRightIcon } from 'lucide-react'

// TODO: Check subgraph for existing DAO token by underlying token
const DaoToken = () => {
  const chainId = useAtomValue(chainIdAtom)
  const formData = useAtomValue(indexDeployFormDataAtom)
  const [daoTokenAddress, setDaoTokenAddress] = useAtom(daoTokenAddressAtom)
  const { data: tokenData } = useReadContracts(
    formData?.governanceERC20address
      ? {
          contracts: [
            {
              abi: erc20Abi,
              address: formData.governanceERC20address,
              functionName: 'name',
            },
            {
              abi: erc20Abi,
              address: formData.governanceERC20address,
              functionName: 'symbol',
            },
          ],
          allowFailure: false,
        }
      : undefined
  )
  const { writeContract, data, isPending, isError } = useWriteContract()
  const {
    data: receipt,
    isSuccess,
    isError: txError,
  } = useWaitForTransactionReceipt({
    hash: data,
  })

  const handleCreateDaoToken = () => {
    if (!formData?.governanceERC20address || !tokenData) return

    writeContract({
      address: INDEX_GOVERNANCE_DEPLOYER_ADDRESS[chainId],
      abi: dtfIndexGovernanceDeployerAbi,
      functionName: 'deployGovernedStakingToken',
      args: [
        `Staked ${tokenData[0]}`,
        `st${tokenData[1][0].toUpperCase()}${tokenData[1].slice(1)}`,
        formData.governanceERC20address,
        {
          votingDelay: formData.basketVotingDelay! * 60,
          votingPeriod: formData.basketVotingPeriod! * 60,
          proposalThreshold: parseEther(
            formData.basketVotingThreshold!.toString()
          ),
          quorumPercent: BigInt(formData.basketVotingQuorum!),
          timelockDelay: BigInt(formData.basketExecutionDelay! * 60),
          guardian: formData.guardianAddress!,
        },
      ],
    })
  }

  useEffect(() => {
    if (receipt) {
      const decoded = parseEventLogs({
        abi: dtfIndexGovernanceDeployerAbi,
        logs: receipt.logs,
        eventName: 'DeployedGovernedStakingToken',
      })

      if (decoded[0].args.stToken) {
        setDaoTokenAddress(decoded[0].args.stToken)
      }
    }
  }, [receipt])

  return (
    <div className="p-4 space-y-4 bg-muted/70 m-2 rounded-lg shadow-sm">
      <h3 className="text-primary font-medium">
        A DAO token needs to be created for the underlying token.
      </h3>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-700">Underlying:</span>
          <span className="text-gray-600">
            {tokenData ? `${tokenData[0]} ($${tokenData[1]})` : 'Loading...'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-700">DAO Token:</span>
          <span className="text-gray-600">
            {tokenData
              ? `Staked ${tokenData[0]} ($st${tokenData[1][0].toUpperCase()}${tokenData[1].slice(1)})`
              : 'Loading...'}
          </span>
        </div>
      </div>

      {(isError || txError) && (
        <div className="px-4 py-2 text-sm font-medium text-red-800 bg-red-100 rounded-md">
          Error creating DAO token
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-green-800 bg-green-100 rounded-md">
          DAO token created{' '}
          {daoTokenAddress && (
            <a
              className="flex items-center gap-1 text-primary"
              href={getExplorerLink(
                daoTokenAddress,
                chainId,
                ExplorerDataType.ADDRESS
              )}
              target="_blank"
            >
              View on explorer
              <ArrowUpRightIcon size={16} />
            </a>
          )}
        </div>
      )}

      {!isSuccess && (
        <Button
          size="sm"
          className="w-full"
          disabled={isPending || (data && !receipt)}
          onClick={handleCreateDaoToken}
        >
          {isPending || (data && !receipt) ? 'Creating...' : 'Create DAO Token'}
        </Button>
      )}
    </div>
  )
}

export default DaoToken
