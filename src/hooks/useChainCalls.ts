import { useAtomValue } from 'jotai/utils'
import { useWeb3React } from '@web3-react/core'
import { Multicall } from 'ethereum-multicall'
import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import { multicallAtom } from 'state/providers/web3Provider'
import { ContractCall } from 'types'

const useChainCall = (calls: ContractCall[]) => {
  const multicall = useAtomValue(multicallAtom)

  return new Array(calls.length).fill(null)
}
