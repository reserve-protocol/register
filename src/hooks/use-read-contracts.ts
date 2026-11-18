import { useReadContracts as useWagmiReadContracts } from 'wagmi'

type ContractCall = { abi?: unknown; address?: unknown; functionName?: unknown }
type ReadContractsParameters = {
  contracts?: readonly ContractCall[]
  query?: { enabled?: unknown }
}

const readContracts = useWagmiReadContracts as unknown as (
  parameters: ReadContractsParameters
) => unknown

// WHY: wagmi v3 dropped v2's guard that skipped the query while a contract had no address.
export const useReadContracts = ((parameters: ReadContractsParameters = {}) => {
  const contracts = parameters.contracts ?? []
  const isReady =
    contracts.length > 0 &&
    contracts.every(
      ({ abi, address, functionName }) => abi && address && functionName
    )

  return readContracts({
    ...parameters,
    query: {
      ...parameters.query,
      enabled: Boolean(isReady && (parameters.query?.enabled ?? true)),
    },
  })
}) as typeof useWagmiReadContracts
