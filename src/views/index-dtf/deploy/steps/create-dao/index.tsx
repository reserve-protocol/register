import dtfIndexGovernanceDeployerAbi from '@/abis/dtf-index-governance-deployer-abi'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { INDEX_GOVERNANCE_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  erc20Abi,
  isAddress,
  keccak256,
  parseEther,
  parseEventLogs,
  toBytes,
  toHex,
  zeroAddress,
} from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import {
  daoCreatedAtom,
  daoTokenAddressAtom,
  daoTokenSymbolAtom,
  formReadyForSubmitAtom,
} from '../../atoms'
import { getCurrentTime } from '@/utils'

const CreateDAO = () => {
  const chainId = useAtomValue(chainIdAtom)
  const formReadyForSubmit = useAtomValue(formReadyForSubmitAtom)
  const { watch, getValues } = useFormContext()
  const governanceERC20address = watch('governanceERC20address')
  const setDaoCreated = useSetAtom(daoCreatedAtom)
  const setStTokenAddress = useSetAtom(daoTokenAddressAtom)
  const setStTokenSymbol = useSetAtom(daoTokenSymbolAtom)

  const { data: symbol } = useReadContract({
    abi: erc20Abi,
    functionName: 'symbol',
    address: governanceERC20address,
    query: { enabled: isAddress(governanceERC20address) },
  })

  const { writeContract, data, isPending, isError } = useWriteContract()
  const {
    data: receipt,
    isSuccess,
    isError: txError,
  } = useWaitForTransactionReceipt({
    hash: data,
  })

  const submit = () => {
    const formData = getValues()

    const vlSymbol = `vl${symbol}-${formData.symbol}`
    const basketVotingDelay =
      formData.basketVotingDelay || formData.customBasketVotingDelay
    const basketVotingPeriod =
      formData.basketVotingPeriod || formData.customBasketVotingPeriod
    const basketVotingThreshold =
      formData.basketVotingThreshold || formData.customBasketVotingThreshold
    const basketVotingQuorum =
      formData.basketVotingQuorum || formData.customBasketVotingQuorum
    const basketExecutionDelay =
      formData.basketExecutionDelay || formData.customBasketExecutionDelay
    const guardianAddress = formData.guardianAddress

    writeContract({
      address: INDEX_GOVERNANCE_DEPLOYER_ADDRESS[chainId],
      abi: dtfIndexGovernanceDeployerAbi,
      functionName: 'deployGovernedStakingToken',
      args: [
        `Vote Lock ${vlSymbol}`,
        vlSymbol,
        governanceERC20address,
        {
          votingDelay: basketVotingDelay! * 60,
          votingPeriod: basketVotingPeriod! * 60,
          proposalThreshold: parseEther(basketVotingThreshold!.toString()),
          quorumPercent: BigInt(Math.floor(basketVotingQuorum!)),
          timelockDelay: BigInt(Math.floor(basketExecutionDelay!) * 60),
          guardians: [guardianAddress ?? zeroAddress],
        },
        keccak256(toBytes(getCurrentTime())),
      ],
    })
  }

  useEffect(() => {
    if (receipt && isSuccess) {
      setDaoCreated(true)

      const event = parseEventLogs({
        abi: dtfIndexGovernanceDeployerAbi,
        logs: receipt.logs,
        eventName: 'DeployedGovernedStakingToken',
      })[0]

      if (event) {
        const { stToken } = event.args
        setStTokenAddress(stToken)
        setStTokenSymbol(`vl${symbol}`)
      }
    }
  }, [receipt, isSuccess, setDaoCreated])

  return (
    <>
      <Button
        className="w-full"
        disabled={
          !formReadyForSubmit ||
          !governanceERC20address ||
          !symbol ||
          isPending ||
          (data && !receipt)
        }
        onClick={submit}
      >
        {isPending || (data && !receipt)
          ? 'Creating...'
          : symbol
            ? `Create vl${symbol} DAO`
            : 'Create DAO'}
      </Button>
      {(isError || txError) && (
        <div className="px-4 py-2 text-sm font-medium text-red-800 bg-red-100 rounded-md">
          Error creating DAO token
        </div>
      )}
    </>
  )
}

export default CreateDAO
