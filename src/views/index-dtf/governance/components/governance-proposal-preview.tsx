import { Skeleton } from '@/components/ui/skeleton'

import { useAtomValue } from 'jotai'

import { Address, decodeFunctionData, getAbiItem } from 'viem'

import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfIndexGovernance from '@/abis/dtf-index-governance'
import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFBasketSharesAtom,
} from '@/state/dtf/atoms'
import { DecodedCalldata } from '@/types'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { atom } from 'jotai'
import { ArrowUpRightIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Abi, Hex } from 'viem'
import BasketProposalPreview from '../views/propose/basket/components/proposal-basket-preview'
import RawCallPreview from './proposal-preview/raw-call-preview'
import TokenRewardPreview from './proposal-preview/token-reward-preview'

const dtfAbiMapppingAtom = atom((get) => {
  const dtf = get(indexDTFAtom)

  if (!dtf) return undefined

  const abiMapping: Record<string, Abi> = {
    [dtf.id.toLowerCase()]: dtfIndexAbi,
  }

  if (dtf.ownerGovernance) {
    abiMapping[dtf.ownerGovernance.id.toLowerCase()] = dtfIndexGovernance
  }

  if (dtf.tradingGovernance) {
    abiMapping[dtf.tradingGovernance.id.toLowerCase()] = dtfIndexGovernance
  }

  if (dtf.stToken) {
    abiMapping[dtf.stToken.id.toLowerCase()] = dtfIndexStakingVault

    if (dtf.stToken.governance) {
      abiMapping[dtf.stToken.governance.id.toLowerCase()] = dtfIndexGovernance
    }
  }

  return abiMapping
})

const dtfContractAliasAtom = atom((get) => {
  const dtf = get(indexDTFAtom)

  if (!dtf) return undefined

  const aliasMapping: Record<string, string> = {
    [dtf.id.toLowerCase()]: 'Folio',
  }

  if (dtf.ownerGovernance) {
    aliasMapping[dtf.ownerGovernance.id.toLowerCase()] = 'Owner Governance'
  }

  if (dtf.tradingGovernance) {
    aliasMapping[dtf.tradingGovernance.id.toLowerCase()] = 'Trading Governance'
  }

  if (dtf.stToken) {
    aliasMapping[dtf.stToken.id.toLowerCase()] = 'Lock Vault'

    if (dtf.stToken.governance) {
      aliasMapping[dtf.stToken.governance.id.toLowerCase()] = 'Lock Governance'
    }
  }

  return aliasMapping
})

const useDecodedCalldatas = (
  targets: Address[] | undefined,
  calldatas: Hex[] | undefined
) => {
  const dtfAbiMapping = useAtomValue(dtfAbiMapppingAtom)
  const dtfContractAlias = useAtomValue(dtfContractAliasAtom)

  return useMemo(() => {
    if (!dtfAbiMapping || !targets || !calldatas) return [undefined, undefined]

    // TODO: In theory, call order is important, but most likely proposals will be contract independent
    const dataByContract: Record<string, DecodedCalldata[]> = {}
    const unknownContracts: Record<string, Hex[]> = {}

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      const calldata = calldatas[i]
      const abi = dtfAbiMapping[target.toLowerCase()]

      try {
        if (!abi) {
          throw new Error('No ABI found')
        }

        const { functionName, args } = decodeFunctionData({
          abi,
          data: calldata,
        })

        const result = getAbiItem({
          abi,
          name: functionName as string,
        })

        dataByContract[target.toLowerCase()] = [
          ...(dataByContract[target.toLowerCase()] || []),
          {
            signature: functionName,
            parameters:
              result && 'inputs' in result
                ? result.inputs.map((input) => `${input.name}: ${input.type}`)
                : [],
            callData: calldata,
            data: (args ?? []) as unknown as unknown[] as string[],
          },
        ]
      } catch (e) {
        console.error('ERROR', e)
        // TODO: Should not happen but there could be an error on the ABI while upgrading?
        unknownContracts[target.toLowerCase()] = [
          ...(unknownContracts[target.toLowerCase()] || []),
          calldata,
        ]
      }
    }

    return [dataByContract, unknownContracts]
  }, [dtfAbiMapping, dtfContractAlias, targets, calldatas])
}

const ChangesOverviewComponentMap: Record<
  string,
  React.ComponentType<{ decodedCalldata: DecodedCalldata }>
> = {
  removeRewardToken: TokenRewardPreview,
  addRewardToken: TokenRewardPreview,
}

const BasketChanges = ({ calldatas }: { calldatas: DecodedCalldata[] }) => {
  const dtf = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const shares = useAtomValue(indexDTFBasketSharesAtom)
  const prices = useAtomValue(indexDTFBasketPricesAtom)

  if (!dtf) return <Skeleton className="h-80" />

  return (
    <BasketProposalPreview
      calldatas={calldatas.map((calldata) => calldata.callData)}
      basket={basket}
      shares={shares}
      prices={prices}
      address={dtf.id.toLowerCase() as Address}
    />
  )
}

const TABS = {
  SUMMARY: 'summary',
  RAW: 'raw',
}

const ContractProposalChanges = ({
  decodedCalldatas,
  address,
}: {
  decodedCalldatas: DecodedCalldata[]
  address: Address
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const alias =
    useAtomValue(dtfContractAliasAtom)?.[address.toLowerCase()] ?? 'Unknown'

  return (
    <Tabs
      defaultValue={TABS.SUMMARY}
      className="flex flex-col gap-4 p-2 pt-4 rounded-3xl bg-background"
    >
      <div className="mx-4 py-4 flex items-center flex-wrap gap-2 border-b">
        <h1 className="text-xl font-bold text-primary">{alias}</h1>
        <Link
          target="_blank"
          className="mr-auto"
          to={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
        >
          <Button
            size="icon-rounded"
            className="bg-primary/10 text-primary h-6 w-6 p-0 hover:text-white"
          >
            <ArrowUpRightIcon size={18} strokeWidth={1.5} />
          </Button>
        </Link>

        <TabsList className="h-9">
          <TabsTrigger value={TABS.SUMMARY} className="w-max h-7">
            Summary
          </TabsTrigger>

          <TabsTrigger value={TABS.RAW} className="w-max h-7">
            Raw
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent className="m-0" value={TABS.SUMMARY}>
        {decodedCalldatas.map((decodedCalldata: DecodedCalldata, index) => {
          const Component =
            ChangesOverviewComponentMap[decodedCalldata.signature]

          if (!Component) {
            return (
              <div
                className="p-4"
                key={`summary-${decodedCalldata.callData}-${index}`}
              >
                <h4 className="text-primary text-lg font-semibold mb-2">
                  {index + 1}/{decodedCalldatas.length}
                </h4>
                <RawCallPreview call={decodedCalldata} />
              </div>
            )
          }

          return (
            <div
              className="p-4"
              key={`summary-${decodedCalldata.callData}-${index}`}
            >
              <h4 className="text-primary text-lg font-semibold mb-2">
                {index + 1}/{decodedCalldatas.length}
              </h4>
              <Component decodedCalldata={decodedCalldata} />
            </div>
          )
        })}
      </TabsContent>
      <TabsContent className="m-0" value={TABS.RAW}>
        {decodedCalldatas.map((call, index) => (
          <div className="p-4" key={`raw-${call.callData}-${index}`}>
            <h4 className="text-primary text-lg font-semibold mb-2">
              {index + 1}/{decodedCalldatas.length}
            </h4>
            <RawCallPreview call={call} />
          </div>
        ))}
      </TabsContent>
    </Tabs>
  )
}

const FolioChangePreview = ({
  decodedCalldata,
  address,
}: {
  decodedCalldata: DecodedCalldata[]
  address: Address
}) => {
  const { basketChangeCalls, restCalls } = useMemo(() => {
    return decodedCalldata.reduce(
      (
        acc: {
          basketChangeCalls: DecodedCalldata[]
          restCalls: DecodedCalldata[]
        },
        call
      ) => {
        if (call.signature === 'approveAuction') {
          acc.basketChangeCalls.push(call)
        } else {
          acc.restCalls.push(call)
        }
        return acc
      },
      {
        basketChangeCalls: [] as DecodedCalldata[],
        restCalls: [] as DecodedCalldata[],
      }
    )
  }, [decodedCalldata])

  return (
    <div>
      {!!basketChangeCalls.length && (
        <BasketChanges calldatas={basketChangeCalls} />
      )}
      {!!restCalls.length && (
        <ContractProposalChanges
          decodedCalldatas={restCalls}
          address={address}
        />
      )}
    </div>
  )
}

const GovernanceProposalPreview = ({
  targets,
  calldatas,
}: {
  targets: Address[] | undefined
  calldatas: Hex[] | undefined
}) => {
  const alias = useAtomValue(dtfContractAliasAtom)
  const [dataByContract, unknownContracts] = useDecodedCalldatas(
    targets,
    calldatas
  )

  if (!dataByContract) {
    return <Skeleton className="h-80" />
  }

  return (
    <div>
      {Object.entries(dataByContract).map(([contract, decodedCalldatas]) =>
        alias?.[contract] === 'Folio' ? (
          <FolioChangePreview
            key={`folio-${contract}`}
            decodedCalldata={decodedCalldatas}
            address={contract as Address}
          />
        ) : (
          <ContractProposalChanges
            key={contract}
            decodedCalldatas={decodedCalldatas}
            address={contract as Address}
          />
        )
      )}
    </div>
  )
}

export default GovernanceProposalPreview
