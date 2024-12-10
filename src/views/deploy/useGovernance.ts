import FacadeWrite from 'abis/FacadeWrite'
import { setupRolesAtom } from 'components/rtoken-setup/atoms'
import useContractWrite from 'hooks/useContractWrite'
import useDebounce from 'hooks/useDebounce'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import { chainIdAtom } from 'state/atoms'
import { FACADE_WRITE_ADDRESS } from 'utils/addresses'
import { Address, zeroAddress } from 'viem'

export const useGovernanceTx = () => {
  const { getValues } = useFormContext()
  const formFields = useDebounce(useWatch(), 500)
  const { isValid, isValidating } = useFormState()
  const validForm =
    !!import.meta.env.VITE_DISABLE_VALIDATION || (isValid && !isValidating)

  const roles = useAtomValue(setupRolesAtom)
  const rToken = useRToken()
  const chainId = useAtomValue(chainIdAtom)

  return useMemo(() => {
    try {
      const {
        defaultGovernance,
        unpause,
        votingDelay,
        votingPeriod,
        proposalThresholdAsMicroPercent,
        quorumPercent,
        minDelay,
        guardian,
        owner,
      } = getValues()

      if (
        !validForm ||
        !rToken?.address ||
        (defaultGovernance && !guardian) ||
        (!defaultGovernance && !owner)
      ) {
        return undefined
      }

      const args: [
        Address,
        boolean,
        boolean,
        {
          votingDelay: bigint
          votingPeriod: bigint
          proposalThresholdAsMicroPercent: bigint
          quorumPercent: bigint
          timelockDelay: bigint
        },
        {
          owner: Address
          guardian: Address
          pausers: Address[]
          shortFreezers: Address[]
          longFreezers: Address[]
        }
      ] = [
        rToken.address,
        !!defaultGovernance,
        unpause === '1',
        {
          votingDelay: BigInt(+votingDelay * 60 * 60),
          votingPeriod: BigInt(+votingPeriod * 60 * 60),
          proposalThresholdAsMicroPercent: BigInt(
            +proposalThresholdAsMicroPercent * 1e6
          ),
          quorumPercent: BigInt(quorumPercent),
          timelockDelay: BigInt(+minDelay * 60 * 60),
        },
        {
          owner: defaultGovernance ? zeroAddress : (owner as Address),
          guardian: defaultGovernance ? (guardian as Address) : zeroAddress,
          ...roles,
        },
      ]

      return args
    } catch (e) {
      console.error('Error setting up tx', e)
      return undefined
    }
  }, [formFields, roles, rToken?.address, validForm, chainId])
}

const useGovernance = () => {
  const txData = useGovernanceTx()
  const chainId = useAtomValue(chainIdAtom)

  return useContractWrite({
    address: FACADE_WRITE_ADDRESS[chainId],
    abi: FacadeWrite,
    functionName: 'setupGovernance',
    args: txData,
    enabled: !!txData,
  })
}

export default useGovernance
