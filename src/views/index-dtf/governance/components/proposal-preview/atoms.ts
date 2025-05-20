import dtfAdminAbi from '@/abis/dtf-admin-abi'
import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfIndexGovernance from '@/abis/dtf-index-governance'
import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import Timelock from '@/abis/Timelock'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { atom } from 'jotai'
import { Abi } from 'viem'
import {
  spellAbi as governanceSpell_31_03_2025Abi,
  spellAddress as governanceSpell_31_03_2025Address,
} from '../../views/propose/upgrade-banners/propose-governance-spell-31-03-2025'

export const dtfAbiMapppingAtom = atom((get) => {
  const dtf = get(indexDTFAtom)

  if (!dtf) return undefined

  const abiMapping: Record<string, Abi> = {
    [dtf.id.toLowerCase()]: dtfIndexAbi,
    [dtf.proxyAdmin.toLowerCase()]: dtfAdminAbi,
  }

  if (dtf.ownerGovernance) {
    abiMapping[dtf.ownerGovernance.id.toLowerCase()] = dtfIndexGovernance
    abiMapping[dtf.ownerGovernance.timelock.id.toLowerCase()] = Timelock
  }

  if (dtf.tradingGovernance) {
    abiMapping[dtf.tradingGovernance.id.toLowerCase()] = dtfIndexGovernance
    abiMapping[dtf.tradingGovernance.timelock.id.toLowerCase()] = Timelock
  }

  if (dtf.stToken) {
    abiMapping[dtf.stToken.id.toLowerCase()] = dtfIndexStakingVault

    if (dtf.stToken.governance) {
      abiMapping[dtf.stToken.governance.id.toLowerCase()] = dtfIndexGovernance
      abiMapping[dtf.stToken.governance.timelock.id.toLowerCase()] = Timelock
    }
  }

  if (governanceSpell_31_03_2025Address[dtf.chainId]) {
    abiMapping[governanceSpell_31_03_2025Address[dtf.chainId].toLowerCase()] =
      governanceSpell_31_03_2025Abi
  }

  return abiMapping
})

export const dtfContractAliasAtom = atom((get) => {
  const dtf = get(indexDTFAtom)

  if (!dtf) return undefined

  const aliasMapping: Record<string, string> = {
    [dtf.id.toLowerCase()]: 'Folio',
    [dtf.proxyAdmin.toLowerCase()]: 'ProxyAdmin',
  }

  if (dtf.ownerGovernance) {
    aliasMapping[dtf.ownerGovernance.id.toLowerCase()] = 'Owner Governance'
    aliasMapping[dtf.ownerGovernance.timelock.id.toLowerCase()] =
      'Owner Governance Timelock'
  }

  if (dtf.tradingGovernance) {
    aliasMapping[dtf.tradingGovernance.id.toLowerCase()] = 'Trading Governance'
    aliasMapping[dtf.tradingGovernance.timelock.id.toLowerCase()] =
      'Trading Governance Timelock'
  }

  if (dtf.stToken) {
    aliasMapping[dtf.stToken.id.toLowerCase()] = 'Lock Vault'

    if (dtf.stToken.governance) {
      aliasMapping[dtf.stToken.governance.id.toLowerCase()] = 'Lock Governance'
      aliasMapping[dtf.stToken.governance.timelock.id.toLowerCase()] =
        'Lock Governance Timelock'
    }
  }

  if (governanceSpell_31_03_2025Address[dtf.chainId]) {
    aliasMapping[governanceSpell_31_03_2025Address[dtf.chainId].toLowerCase()] =
      'GovernanceSpell_31_03_2025'
  }

  return aliasMapping
})
