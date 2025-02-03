import dtfIndexGovernanceDeployerAbi from '@/abis/dtf-index-governance-deployer-abi'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { getCurrentTime } from '@/utils'
import { INDEX_GOVERNANCE_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  erc20Abi,
  isAddress,
  keccak256,
  parseEther,
  parseEventLogs,
  toBytes,
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
import { Input } from '@/components/ui/input'

const CreateDAO = () => {
  const chainId = useAtomValue(chainIdAtom)
  const [name, setName] = useState('')
  const formReadyForSubmit = useAtomValue(formReadyForSubmitAtom)
  const { watch, getValues } = useFormContext()
  const governanceERC20address = watch('governanceERC20address')
  const indexDTFSymbol = watch('symbol')
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

  const vlSymbol = `vl${symbol}${name ? `-${name}` : ''}`

  const submit = () => {
    const formData = getValues()

    const basketVotingDelay = formData.basketVotingDelay
    const basketVotingPeriod = formData.basketVotingPeriod
    const basketVotingThreshold = formData.basketVotingThreshold
    const basketVotingQuorum = formData.basketVotingQuorum
    const basketExecutionDelay = formData.basketExecutionDelay
    const guardians = formData.guardians.filter(Boolean)

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
          guardians,
        },
        keccak256(toBytes(getCurrentTime())),
      ],
    })
  }

  useEffect(() => {
    setName(indexDTFSymbol)
  }, [indexDTFSymbol])

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
        setStTokenSymbol(vlSymbol)
      }
    }
  }, [receipt, isSuccess, setDaoCreated])

  return (
    <div className="flex flex-col gap-2">
      {!!formReadyForSubmit && (
        <Input
          className="[&:focus::placeholder]:opacity-0 [&:focus::placeholder]:transition-opacity"
          placeholder="suffix"
          startAdornment={
            <span className="text-sm text-muted-foreground">{`vl${symbol}-`}</span>
          }
          value={name}
          onChange={(e) =>
            setName(e.target.value.slice(0, 12).replaceAll(' ', ''))
          }
        />
      )}
      <Button
        className="w-full"
        disabled={
          !formReadyForSubmit ||
          !name ||
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
            ? `Create ${vlSymbol} DAO`
            : 'Create DAO'}
      </Button>
      {(isError || txError) && (
        <div className="px-4 py-2 text-sm font-medium text-red-800 bg-red-100 rounded-md">
          Error creating DAO token
        </div>
      )}
    </div>
  )
}

export default CreateDAO
