import { useState, useEffect } from 'react'
import RSR from '../../abis/RSR.json'
import Insurance from '../../abis/Insurance.json'
import { INSURANCE_ADDRESS, RSR_ADDRESS } from '../constants/addresses'

const { promiseTransaction, state } = usePromiseTransaction(chainId, options)

const InsuranceContract = new Contract(INSURANCE_ADDRESS, Insurance)
const RSRContract = new Contract(RSR_ADDRESS, RSR)

// TODO
const useStakeContract = () => {
  const [loading, setLoading] = useState(false)
  const { state: stakeState, send: stake } = useContractFunction(InsuranceContract, 'stake')
  const { state: approveState, send: approve } = useContractFunction(RSRContract, 'approve')

  const handleStake = () => {
    setLoading(true)
  }
}
