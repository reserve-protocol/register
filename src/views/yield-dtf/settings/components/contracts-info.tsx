import { t } from '@lingui/macro'
import useRToken from '@/hooks/useRToken'
import { useAtomValue } from 'jotai'
import { chainIdAtom, rTokenAssetsAtom, rTokenContractsAtom } from '@/state/atoms'
import { ContractKey } from '@/state/rtoken/atoms/rTokenContractsAtom'
import { shortenAddress } from '@/utils'
import { RSR_ADDRESS } from '@/utils/addresses'
import { InfoCard, InfoCardItem } from './settings-info-card'

const ContractsInfo = () => {
  const contracts = useAtomValue(rTokenContractsAtom)
  const assets = useAtomValue(rTokenAssetsAtom) ?? {}
  const rToken = useRToken()
  const chainId = useAtomValue(chainIdAtom)
  const contractList: [string, ContractKey][] = [
    [t`Main`, 'main'],
    [t`Backing Manager`, 'backingManager'],
    [t`Basket Handler`, 'basketHandler'],
    [t`RToken Trader`, 'rTokenTrader'],
    [t`RSR Trader`, 'rsrTrader'],
    [t`Broker`, 'broker'],
    [t`Asset Registry`, 'assetRegistry'],
    [rToken?.stToken?.name ?? t`stRSR Token`, 'stRSR'],
    [t`Furnace`, 'furnace'],
    [t`Distributor`, 'distributor'],
  ]

  return (
    <InfoCard title={t`Related Contracts`}>
      {contractList.map(([label, prop], index) => (
        <InfoCardItem
          key={label}
          label={label}
          border={index !== 0}
          value={
            !contracts ? undefined : (
              <span className="flex items-center">
                {shortenAddress(contracts[prop].address)}
                <span className="ml-2 text-legend text-xs">
                  v{contracts[prop].version}
                </span>
              </span>
            )
          }
          address={contracts ? contracts[prop]?.address : undefined}
        />
      ))}
      <InfoCardItem
        label="RToken asset"
        value={
          !rToken?.address || !assets[rToken.address] ? undefined : (
            <span className="flex items-center">
              {shortenAddress(assets[rToken.address].address)}
              <span className="ml-2 text-legend text-xs">
                v{assets[rToken.address].version}
              </span>
            </span>
          )
        }
        address={assets[rToken?.address ?? '']?.address || undefined}
      />
      <InfoCardItem
        label="RSR Token"
        value={shortenAddress(RSR_ADDRESS[chainId] || '')}
        address={RSR_ADDRESS[chainId] || undefined}
      />
    </InfoCard>
  )
}

export default ContractsInfo
