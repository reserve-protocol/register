import { useFormContext } from 'react-hook-form'
import BasicInput from '../../components/basic-input'
import { useReadContract } from 'wagmi'
import { erc20Abi, isAddress } from 'viem'

const GovernanceExistingERC20 = () => {
  const { watch } = useFormContext()
  const governanceERC20address = watch('governanceERC20address')

  const { data: symbol } = useReadContract({
    abi: erc20Abi,
    functionName: 'symbol',
    address: governanceERC20address,
    query: { enabled: isAddress(governanceERC20address) },
  })

  return (
    <div className="px-2">
      <BasicInput
        fieldName="governanceERC20address"
        label={symbol || 'ERC20 address'}
        placeholder="0x..."
        highlightLabel={!!symbol}
      />
    </div>
  )
}

export default GovernanceExistingERC20
