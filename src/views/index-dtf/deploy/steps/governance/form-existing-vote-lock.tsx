import { gql } from 'graphql-request'
import BasicInput from '../../components/basic-input'
import useIndexDTFSubgraph from '@/hooks/useIndexDTFSugbraph'
import { useFormContext } from 'react-hook-form'
import { erc20Abi, isAddress } from 'viem'
import { useReadContract } from 'wagmi'
import { ChainId } from '@/utils/chains'

const stTokenQuery = gql`
  query getStakingToken($id: String!) {
    stakingToken(id: $id) {
      id
    }
  }
`

const GovernanceExistingVoteLock = () => {
  const { watch } = useFormContext()
  const governanceVoteLock = watch('governanceVoteLock')

  const { data: stToken } = useIndexDTFSubgraph(
    governanceVoteLock ? stTokenQuery : null,
    {
      id: governanceVoteLock?.toLowerCase(),
    }
  )

  const { data: symbol } = useReadContract({
    abi: erc20Abi,
    functionName: 'symbol',
    address: stToken?.stakingToken?.id,
    query: {
      enabled:
        stToken?.stakingToken?.id && isAddress(stToken?.stakingToken?.id),
    },
    chainId: ChainId.Base, // TODO: change hardcoded chainId
  })

  return (
    <div className="flex flex-col gap-2 px-3">
      <BasicInput
        fieldName="governanceVoteLock"
        label={symbol || 'Vote Lock address'}
        placeholder="0x..."
        highlightLabel={!!symbol}
      />
    </div>
  )
}

export default GovernanceExistingVoteLock
