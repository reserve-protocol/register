import { indexDTFAtom } from '@/state/dtf/atoms'
import { atom } from 'jotai'
import {
  spellAddress as governanceSpell_31_03_2025Address,
} from '../../views/propose/upgrade-banners/propose-governance-spell-31-03-2025'
import {
  spellAddress as v4SpellAddress,
} from '../../views/propose/upgrade-banners/propose-v4-upgrade'
import {
  spellAddress as v5SpellAddress,
} from '../../views/propose/upgrade-banners/propose-v5-upgrade'
import {
  spellAddress as v5OptimisticSpellAddress,
} from '../../views/propose/upgrade-banners/propose-v5-optimistic-upgrade'

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
    aliasMapping[dtf.tradingGovernance.id.toLowerCase()] = 'Basket Governance'
    aliasMapping[dtf.tradingGovernance.timelock.id.toLowerCase()] =
      'Basket Governance Timelock'
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

  if (v4SpellAddress[dtf.chainId]) {
    aliasMapping[v4SpellAddress[dtf.chainId].toLowerCase()] = 'V4 Upgrade Spell'
  }

  if (v5SpellAddress[dtf.chainId]) {
    aliasMapping[v5SpellAddress[dtf.chainId].toLowerCase()] = 'V5 Upgrade Spell'
  }

  if (v5OptimisticSpellAddress[dtf.chainId]) {
    aliasMapping[v5OptimisticSpellAddress[dtf.chainId].toLowerCase()] =
      'Reserve Optimistic Governance Spell'
  }

  return aliasMapping
})
