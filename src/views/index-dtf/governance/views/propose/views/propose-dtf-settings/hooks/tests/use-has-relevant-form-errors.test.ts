import type { FieldErrors } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { hasRelevantFormErrors } from '../has-relevant-form-errors'

type Changes = Parameters<typeof hasRelevantFormErrors>[1]

const baseChanges = (): Changes => ({
  rolesChanges: {},
  revenueDistributionChanges: {},
  dtfRevenueChanges: {},
  governanceChanges: {},
  optimisticChanges: {},
})

const errorFor = (field: string) =>
  ({ [field]: { type: 'custom' } }) as FieldErrors

const cases: Array<{
  name: string
  error: string
  change: (changes: Changes) => void
}> = [
  {
    name: 'token name',
    error: 'tokenName',
    change: (c) => (c.tokenNameChange = true),
  },
  {
    name: 'mandate',
    error: 'mandate',
    change: (c) => (c.mandateChange = true),
  },
  {
    name: 'guardians',
    error: 'guardians',
    change: (c) => (c.rolesChanges.guardians = true),
  },
  {
    name: 'brand managers',
    error: 'brandManagers',
    change: (c) => (c.rolesChanges.brandManagers = true),
  },
  {
    name: 'auction launchers',
    error: 'auctionLaunchers',
    change: (c) => (c.rolesChanges.auctionLaunchers = true),
  },
  {
    name: 'cross-role validation',
    error: 'roles',
    change: (c) => (c.rolesChanges.guardians = true),
  },
  {
    name: 'governance share',
    error: 'governanceShare',
    change: (c) => (c.revenueDistributionChanges.governanceShare = true),
  },
  {
    name: 'deployer share',
    error: 'deployerShare',
    change: (c) => (c.revenueDistributionChanges.deployerShare = true),
  },
  {
    name: 'additional recipients',
    error: 'additionalRevenueRecipients',
    change: (c) => (c.revenueDistributionChanges.additionalRecipients = true),
  },
  {
    name: 'cross-distribution validation',
    error: 'revenue-distribution',
    change: (c) => (c.revenueDistributionChanges.governanceShare = true),
  },
  {
    name: 'mint fee',
    error: 'mintFee',
    change: (c) => (c.dtfRevenueChanges.mintFee = true),
  },
  {
    name: 'TVL fee',
    error: 'folioFee',
    change: (c) => (c.dtfRevenueChanges.tvlFee = true),
  },
  {
    name: 'auction length',
    error: 'auctionLength',
    change: (c) => (c.auctionLengthChange = true),
  },
  {
    name: 'weight control',
    error: 'weightControl',
    change: (c) => (c.weightControlChange = true),
  },
  {
    name: 'bids enabled',
    error: 'bidsEnabled',
    change: (c) => (c.bidsEnabledChange = true),
  },
  {
    name: 'voting delay',
    error: 'governanceVotingDelay',
    change: (c) => (c.governanceChanges.votingDelay = true),
  },
  {
    name: 'voting period',
    error: 'governanceVotingPeriod',
    change: (c) => (c.governanceChanges.votingPeriod = true),
  },
  {
    name: 'quorum',
    error: 'governanceVotingQuorum',
    change: (c) => (c.governanceChanges.quorumPercent = true),
  },
  {
    name: 'proposal threshold',
    error: 'governanceVotingThreshold',
    change: (c) => (c.governanceChanges.proposalThreshold = true),
  },
  {
    name: 'execution delay',
    error: 'governanceExecutionDelay',
    change: (c) => (c.governanceChanges.executionDelay = true),
  },
  {
    name: 'optimistic veto delay',
    error: 'optimisticVetoDelay',
    change: (c) => (c.optimisticChanges.vetoDelay = true),
  },
  {
    name: 'optimistic veto period',
    error: 'optimisticVetoPeriod',
    change: (c) => (c.optimisticChanges.vetoPeriod = true),
  },
  {
    name: 'optimistic veto threshold',
    error: 'optimisticVetoThreshold',
    change: (c) => (c.optimisticChanges.vetoThreshold = true),
  },
  {
    name: 'optimistic proposers',
    error: 'optimisticProposers',
    change: (c) => (c.optimisticChanges.optimisticProposers = true),
  },
  {
    name: 'cross-optimistic validation',
    error: 'optimistic',
    change: (c) => (c.optimisticChanges.optimisticProposers = true),
  },
]

describe('hasRelevantFormErrors', () => {
  it.each(cases)(
    'blocks an invalid changed $name field',
    ({ error, change }) => {
      const changes = baseChanges()
      change(changes)

      expect(hasRelevantFormErrors(errorFor(error), changes)).toBe(true)
    }
  )

  it('ignores an error for an unchanged setting', () => {
    const changes = baseChanges()
    changes.mandateChange = true

    expect(hasRelevantFormErrors(errorFor('mintFee'), changes)).toBe(false)
  })

  it('does not report relevant errors when nothing changed', () => {
    expect(hasRelevantFormErrors(errorFor('mandate'), baseChanges())).toBe(
      false
    )
  })
})
