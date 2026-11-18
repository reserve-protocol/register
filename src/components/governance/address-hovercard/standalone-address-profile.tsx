import FacadeRead from '@/abis/FacadeRead'
import { FACADE_ADDRESS } from '@/utils/addresses'
import {
  useIndexDtfVoterState,
  useYieldDtfVoterState,
} from '@reserve-protocol/react-sdk'
import { erc20Abi, formatEther, parseAbi, type Address } from 'viem'
import { useReadContract } from 'wagmi'
import { AddressProfileView } from './address-profile-card'
import { type DtfType } from './address-profile'

export type HovercardDtf = {
  address: string
  chainId: number
  type: DtfType
  symbol?: string
  // Index only: the governor of the proposal shown next to the address.
  governor?: string
}

type StandaloneProps = {
  address: Address
  dtf: HovercardDtf
  fresh?: boolean
  className?: string
}

type IndexVoterParams = NonNullable<Parameters<typeof useIndexDtfVoterState>[0]>
type YieldVoterParams = NonNullable<Parameters<typeof useYieldDtfVoterState>[0]>

const governorAbi = parseAbi(['function token() view returns (address)'])

// The vote token is an identity read; it never changes for a governor or an RToken.
const IDENTITY_READ = { staleTime: Infinity }

const IndexStandaloneProfile = ({ address, dtf, ...rest }: StandaloneProps) => {
  const { data: stToken, isError: isTokenError } = useReadContract({
    abi: governorAbi,
    address: dtf.governor as Address,
    chainId: dtf.chainId,
    functionName: 'token',
    query: { enabled: !!dtf.governor, ...IDENTITY_READ },
  })
  const { data: voter, isError: isVoterError } = useIndexDtfVoterState(
    stToken
      ? ({ chainId: dtf.chainId, stToken, account: address } as IndexVoterParams)
      : undefined
  )
  const unavailable = !dtf.governor || isTokenError || isVoterError

  return (
    <AddressProfileView
      address={address}
      chainId={dtf.chainId}
      dtfAddress={dtf.address}
      dtfType="index"
      roles={[]}
      voter={
        voter && {
          ownPower: Number(voter.balance.formatted),
          votingPower: Number(voter.votingPower.formatted),
          votingWeight: voter.votingWeight,
          isSelfDelegated: voter.isSelfDelegated,
        }
      }
      voterLoading={!voter && !unavailable}
      hideVotingPower={unavailable}
      {...rest}
    />
  )
}

const YieldStandaloneProfile = ({ address, dtf, ...rest }: StandaloneProps) => {
  const { data: stToken, isError: isTokenError } = useReadContract({
    abi: FacadeRead,
    address: FACADE_ADDRESS[dtf.chainId] as Address,
    chainId: dtf.chainId,
    functionName: 'stToken',
    args: [dtf.address as Address],
    query: IDENTITY_READ,
  })
  const { data: supply, isError: isSupplyError } = useReadContract({
    abi: erc20Abi,
    address: stToken,
    chainId: dtf.chainId,
    functionName: 'totalSupply',
    query: { enabled: !!stToken },
  })
  const { data: voter, isError: isVoterError } = useYieldDtfVoterState(
    stToken
      ? ({ chainId: dtf.chainId, stToken, account: address } as YieldVoterParams)
      : undefined
  )
  const unavailable = isTokenError || isSupplyError || isVoterError
  const votingPower = voter ? Number(voter.votingPower.formatted) : 0
  const stTokenSupply = supply ? Number(formatEther(supply)) : 0
  const isReady = !!voter && supply !== undefined

  return (
    <AddressProfileView
      address={address}
      chainId={dtf.chainId}
      dtfAddress={dtf.address}
      dtfType="yield"
      roles={[]}
      voter={
        isReady
          ? {
              ownPower: Number(voter.stTokenBalance.formatted),
              votingPower,
              votingWeight: stTokenSupply
                ? (votingPower / stTokenSupply) * 100
                : 0,
              isSelfDelegated: voter.isSelfDelegated,
            }
          : undefined
      }
      voterLoading={!isReady && !unavailable}
      hideVotingPower={unavailable}
      {...rest}
    />
  )
}

// For lists that span many DTFs: the DTF comes from the row, so the DTF's roles are not loaded.
const StandaloneAddressProfile = (props: StandaloneProps) =>
  props.dtf.type === 'index' ? (
    <IndexStandaloneProfile {...props} />
  ) : (
    <YieldStandaloneProfile {...props} />
  )

export default StandaloneAddressProfile
