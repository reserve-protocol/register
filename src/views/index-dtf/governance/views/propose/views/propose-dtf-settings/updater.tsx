import dtfIndexAbiV5 from '@/abis/dtf-index-abi'
import { isLoaded } from '@/utils'
import dtfStakingVaultAbi from '@/abis/dtf-index-staking-vault'
import {
  folioVersionAtom,
  indexDTFAtom,
  indexDTFFeeAtom,
  indexDTFRebalanceControlAtom,
} from '@/state/dtf/atoms'
import {
  useIndexDtfIdentity,
  useIndexDtfImmutableFeeRecipients,
  useIndexDtfSelfFee,
  useIndexDtfTradeAllowlist,
} from '@reserve-protocol/react-sdk'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useReadContract, useReadContracts } from 'wagmi'
import {
  feeRecipientsAtom,
  isProposalConfirmedAtom,
  proposalDescriptionAtom,
  removedBasketTokensAtom,
  selectedSectionAtom,
  tokenNameChangeAtom,
  mandateChangeAtom,
  rolesChangesAtom,
  revenueDistributionChangesAtom,
  dtfRevenueChangesAtom,
  auctionLengthChangeAtom,
  weightControlChangeAtom,
  bidsEnabledChangeAtom,
  governanceChangesAtom,
  optimisticGovernanceChangesAtom,
  currentOptimisticAllowedActionsAtom,
  currentQuorumPercentageAtom,
  tokenJarAtom,
  immutableFeeRecipientsAtom,
  currentSelfFeeAtom,
  currentTradeAllowlistAtom,
  selfFeeChangeAtom,
  tradeAllowlistChangesAtom,
  optimisticActionsAtom,
} from './atoms'
import {
  isProposalThresholdChanged,
  getCurrentProposalThreshold,
  secondsToDays,
} from '../../shared'
import {
  DEFAULT_OPTIMISTIC_VETO_DELAY,
  DEFAULT_OPTIMISTIC_VETO_PERIOD,
  DEFAULT_OPTIMISTIC_VETO_THRESHOLD,
  arraysEqualIgnoreCase,
  selectorRegistryAbi,
} from './optimistic'
import type { OptimisticActionId } from './optimistic'
import { getAddress, isAddress, type Address } from 'viem'

const resetAtom = atom(null, (get, set) => {
  set(removedBasketTokensAtom, [])
  set(selectedSectionAtom, undefined)
  set(isProposalConfirmedAtom, false)
  set(proposalDescriptionAtom, undefined)
  set(tokenNameChangeAtom, undefined)
  set(mandateChangeAtom, undefined)
  set(rolesChangesAtom, {})
  set(revenueDistributionChangesAtom, {})
  set(dtfRevenueChangesAtom, {})
  set(auctionLengthChangeAtom, undefined)
  set(weightControlChangeAtom, undefined)
  set(bidsEnabledChangeAtom, undefined)
  set(governanceChangesAtom, {})
  set(optimisticGovernanceChangesAtom, {})
  set(currentOptimisticAllowedActionsAtom, undefined)
  set(tokenJarAtom, undefined)
  set(selfFeeChangeAtom, undefined)
  set(tradeAllowlistChangesAtom, {})
  set(immutableFeeRecipientsAtom, undefined)
  set(currentSelfFeeAtom, undefined)
  set(currentTradeAllowlistAtom, undefined)
})

const toAllowlistKey = (address: string) => address.toLowerCase()

// Folio 6.0 state the settings proposal edits or must preserve; read from RPC.
const V6SettingsReads = () => {
  const versionState = useAtomValue(folioVersionAtom)
  const identity = useIndexDtfIdentity()
  const params =
    versionState.status === 'ready' &&
    versionState.major === 6 &&
    identity.address
      ? identity
      : undefined
  const { data: immutable } = useIndexDtfImmutableFeeRecipients(params)
  const { data: selfFee } = useIndexDtfSelfFee(params)
  const { data: allowlist } = useIndexDtfTradeAllowlist(params)
  const setImmutable = useSetAtom(immutableFeeRecipientsAtom)
  const setSelfFee = useSetAtom(currentSelfFeeAtom)
  const setAllowlist = useSetAtom(currentTradeAllowlistAtom)

  useEffect(() => setImmutable(immutable), [immutable, setImmutable])
  useEffect(
    () =>
      // D18 fraction → percent at the form's 0.01% precision, without float drift.
      setSelfFee(
        selfFee ? Number(selfFee.raw / 10n ** 14n) / 100 : undefined
      ),
    [selfFee, setSelfFee]
  )
  useEffect(() => setAllowlist(allowlist), [allowlist, setAllowlist])

  return null
}

const Updater = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const feeRecipients = useAtomValue(feeRecipientsAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const versionState = useAtomValue(folioVersionAtom)
  const platformFee = useAtomValue(indexDTFFeeAtom)
  const isV5 = versionState.status === 'ready' && versionState.major >= 5
  const allOptimisticActions = useAtomValue(optimisticActionsAtom)
  const currentSelfFee = useAtomValue(currentSelfFeeAtom)
  const currentTradeAllowlist = useAtomValue(currentTradeAllowlistAtom)
  const selfFeeChange = useAtomValue(selfFeeChangeAtom)
  const tradeAllowlistChanges = useAtomValue(tradeAllowlistChangesAtom)
  const setSelfFeeChange = useSetAtom(selfFeeChangeAtom)
  const setTradeAllowlistChanges = useSetAtom(tradeAllowlistChangesAtom)
  const optimisticGovernance = indexDTF?.ownerGovernance?.optimistic
  const optimisticSelectorRegistry = optimisticGovernance?.selectorRegistry

  const optimisticSelectorContracts = useMemo(() => {
    if (
      !indexDTF?.id ||
      !indexDTF.ownerGovernance?.isOptimistic ||
      !optimisticSelectorRegistry
    ) {
      return []
    }

    return allOptimisticActions.map((action) => ({
      abi: selectorRegistryAbi,
      address: optimisticSelectorRegistry,
      functionName: 'isAllowed' as const,
      args: [indexDTF.id as Address, action.selector] as const,
      chainId: indexDTF.chainId,
    }))
  }, [
    indexDTF?.id,
    indexDTF?.chainId,
    indexDTF?.ownerGovernance?.isOptimistic,
    optimisticSelectorRegistry,
    allOptimisticActions,
  ])

  const { data: optimisticSelectorResults } = useReadContracts({
    contracts: optimisticSelectorContracts,
    allowFailure: false,
    query: {
      enabled: optimisticSelectorContracts.length > 0,
    },
  })

  const currentOptimisticAllowedActions = useMemo(() => {
    if (!optimisticSelectorResults) return undefined

    return allOptimisticActions
      .filter((_, index) => optimisticSelectorResults[index])
      .map((action) => action.id)
  }, [optimisticSelectorResults, allOptimisticActions])

  // Read bidsEnabled from contract (v5+ only)
  const { data: currentBidsEnabled } = useReadContract({
    abi: dtfIndexAbiV5,
    address: indexDTF?.id,
    functionName: 'bidsEnabled',
    chainId: indexDTF?.chainId,
    query: {
      enabled: !!indexDTF?.id && isV5,
    },
  })

  // Read the stToken's tokenJar so fee-recipient classification folds it into the
  // governance share (the new StakingVault routes governance fees to the jar).
  const { data: tokenJar } = useReadContract({
    abi: dtfStakingVaultAbi,
    address: indexDTF?.stToken?.id,
    functionName: 'tokenJar',
    chainId: indexDTF?.chainId,
    query: {
      enabled: !!indexDTF?.stToken?.id,
    },
  })
  const setTokenJar = useSetAtom(tokenJarAtom)
  const reset = useSetAtom(resetAtom)
  const { reset: resetForm, watch, control } = useFormContext()
  const governanceChanges = useAtomValue(governanceChangesAtom)
  const tokenNameChange = useAtomValue(tokenNameChangeAtom)
  const mandateChange = useAtomValue(mandateChangeAtom)
  const rolesChanges = useAtomValue(rolesChangesAtom)
  const revenueDistributionChanges = useAtomValue(
    revenueDistributionChangesAtom
  )
  const dtfRevenueChanges = useAtomValue(dtfRevenueChangesAtom)
  const auctionLengthChange = useAtomValue(auctionLengthChangeAtom)
  const weightControlChange = useAtomValue(weightControlChangeAtom)
  const bidsEnabledChange = useAtomValue(bidsEnabledChangeAtom)
  const optimisticGovernanceChanges = useAtomValue(
    optimisticGovernanceChangesAtom
  )
  const currentQuorumPercentage = useAtomValue(currentQuorumPercentageAtom)
  const isResettingForm = useRef(false)

  // Set atoms for changes
  const setTokenNameChange = useSetAtom(tokenNameChangeAtom)
  const setMandateChange = useSetAtom(mandateChangeAtom)
  const setRolesChanges = useSetAtom(rolesChangesAtom)
  const setRevenueDistributionChanges = useSetAtom(
    revenueDistributionChangesAtom
  )
  const setDtfRevenueChanges = useSetAtom(dtfRevenueChangesAtom)
  const setAuctionLengthChange = useSetAtom(auctionLengthChangeAtom)
  const setWeightControlChange = useSetAtom(weightControlChangeAtom)
  const setBidsEnabledChange = useSetAtom(bidsEnabledChangeAtom)
  const setGovernanceChanges = useSetAtom(governanceChangesAtom)
  const setOptimisticGovernanceChanges = useSetAtom(
    optimisticGovernanceChangesAtom
  )
  const setCurrentOptimisticAllowedActions = useSetAtom(
    currentOptimisticAllowedActionsAtom
  )

  // Watch form fields
  const tokenName = watch('tokenName')
  const mandate = watch('mandate')
  const mintFee = watch('mintFee')
  const folioFee = watch('folioFee')
  const governanceShare = watch('governanceShare')
  const deployerShare = watch('deployerShare')
  const auctionLength = watch('auctionLength')
  const weightControl = watch('weightControl')
  const bidsEnabled = watch('bidsEnabled')
  const governanceVotingDelay = watch('governanceVotingDelay')
  const governanceVotingPeriod = watch('governanceVotingPeriod')
  const governanceVotingThreshold = watch('governanceVotingThreshold')
  const governanceVotingQuorum = watch('governanceVotingQuorum')
  const governanceExecutionDelay = watch('governanceExecutionDelay')
  const optimisticVetoDelay = watch('optimisticVetoDelay')
  const optimisticVetoPeriod = watch('optimisticVetoPeriod')
  const optimisticVetoThreshold = watch('optimisticVetoThreshold')
  const selfFee = watch('selfFee')
  const tradeAllowlistEnabled = watch('tradeAllowlistEnabled')
  const tradeAllowlistTokens = useWatch({
    name: 'tradeAllowlistTokens',
    control,
  })

  // Use useWatch for arrays to ensure updates are captured immediately
  const guardians = useWatch({
    name: 'guardians',
    control,
  })
  const brandManagers = useWatch({
    name: 'brandManagers',
    control,
  })
  const auctionLaunchers = useWatch({
    name: 'auctionLaunchers',
    control,
  })
  const optimisticProposers = useWatch({
    name: 'optimisticProposers',
    control,
  })
  const optimisticActions = useWatch({
    name: 'optimisticActions',
    control,
  })
  const additionalRevenueRecipients = useWatch({
    name: 'additionalRevenueRecipients',
    control,
  })

  useEffect(() => {
    setCurrentOptimisticAllowedActions(currentOptimisticAllowedActions)
  }, [currentOptimisticAllowedActions, setCurrentOptimisticAllowedActions])

  useEffect(() => {
    setTokenJar(tokenJar as Address | undefined)
  }, [tokenJar, setTokenJar])

  useEffect(() => {
    if (indexDTF && indexDTF.ownerGovernance && feeRecipients) {
      isResettingForm.current = true

      // Get current governance values
      const currentVotingDelay = secondsToDays(
        Number(indexDTF.ownerGovernance.votingDelay)
      )
      const currentVotingPeriod = secondsToDays(
        Number(indexDTF.ownerGovernance.votingPeriod)
      )
      const currentThreshold = getCurrentProposalThreshold(indexDTF.ownerGovernance)
      const currentExecutionDelay = secondsToDays(
        Number(indexDTF.ownerGovernance.timelock.executionDelay)
      )
      const optimistic = indexDTF.ownerGovernance.optimistic
      const currentOptimisticVetoDelay = secondsToDays(
        optimistic?.vetoDelay ?? DEFAULT_OPTIMISTIC_VETO_DELAY
      )
      const currentOptimisticVetoPeriod = secondsToDays(
        optimistic?.vetoPeriod ?? DEFAULT_OPTIMISTIC_VETO_PERIOD
      )
      const currentOptimisticVetoThreshold =
        optimistic?.vetoThreshold ?? DEFAULT_OPTIMISTIC_VETO_THRESHOLD

      resetForm({
        tokenName:
          tokenNameChange !== undefined
            ? tokenNameChange
            : indexDTF.token.name,
        mandate: mandateChange !== undefined ? mandateChange : indexDTF.mandate,
        governanceVoteLock: indexDTF.stToken?.id,
        mintFee:
          dtfRevenueChanges.mintFee !== undefined
            ? dtfRevenueChanges.mintFee
            : indexDTF.mintingFee * 100,
        folioFee:
          dtfRevenueChanges.tvlFee !== undefined
            ? dtfRevenueChanges.tvlFee
            : indexDTF.annualizedTvlFee * 100,
        governanceShare:
          revenueDistributionChanges.governanceShare !== undefined
            ? revenueDistributionChanges.governanceShare
            : feeRecipients.governanceShare,
        deployerShare:
          revenueDistributionChanges.deployerShare !== undefined
            ? revenueDistributionChanges.deployerShare
            : feeRecipients.deployerShare,
        additionalRevenueRecipients:
          revenueDistributionChanges.additionalRecipients !== undefined
            ? revenueDistributionChanges.additionalRecipients
            : feeRecipients.externalRecipients,
        fixedPlatformFee: isLoaded(platformFee) ? platformFee : 0,
        auctionLength:
          auctionLengthChange !== undefined
            ? auctionLengthChange
            : indexDTF.auctionLength / 60,
        weightControl:
          weightControlChange !== undefined
            ? weightControlChange
            : rebalanceControl?.weightControl ?? true,
        bidsEnabled:
          bidsEnabledChange !== undefined
            ? bidsEnabledChange
            : currentBidsEnabled ?? true,
        // Apply governance changes if they exist, otherwise use current values
        governanceVotingDelay:
          governanceChanges.votingDelay !== undefined
            ? governanceChanges.votingDelay / 86400
            : currentVotingDelay,
        governanceVotingPeriod:
          governanceChanges.votingPeriod !== undefined
            ? governanceChanges.votingPeriod / 86400
            : currentVotingPeriod,
        governanceVotingQuorum:
          governanceChanges.quorumPercent !== undefined
            ? governanceChanges.quorumPercent
            : currentQuorumPercentage,
        governanceVotingThreshold:
          governanceChanges.proposalThreshold !== undefined
            ? governanceChanges.proposalThreshold
            : currentThreshold,
        governanceExecutionDelay:
          governanceChanges.executionDelay !== undefined
            ? governanceChanges.executionDelay / 86400
            : currentExecutionDelay,
        guardians:
          rolesChanges.guardians !== undefined
            ? rolesChanges.guardians
            : indexDTF.ownerGovernance.timelock.guardians,
        brandManagers:
          rolesChanges.brandManagers !== undefined
            ? rolesChanges.brandManagers
            : indexDTF.brandManagers,
        auctionLaunchers:
          rolesChanges.auctionLaunchers !== undefined
            ? rolesChanges.auctionLaunchers
            : indexDTF.auctionLaunchers,
        optimisticVetoDelay:
          optimisticGovernanceChanges.vetoDelay !== undefined
            ? optimisticGovernanceChanges.vetoDelay / 86400
            : currentOptimisticVetoDelay,
        optimisticVetoPeriod:
          optimisticGovernanceChanges.vetoPeriod !== undefined
            ? optimisticGovernanceChanges.vetoPeriod / 86400
            : currentOptimisticVetoPeriod,
        optimisticVetoThreshold:
          optimisticGovernanceChanges.vetoThreshold !== undefined
            ? optimisticGovernanceChanges.vetoThreshold
            : currentOptimisticVetoThreshold,
        optimisticProposers:
          optimisticGovernanceChanges.optimisticProposers !== undefined
            ? optimisticGovernanceChanges.optimisticProposers
            : indexDTF.ownerGovernance.optimistic?.proposers ?? [],
        optimisticActions:
          optimisticGovernanceChanges.allowedActions !== undefined
            ? optimisticGovernanceChanges.allowedActions
            : currentOptimisticAllowedActions ?? [],
        selfFee: selfFeeChange ?? currentSelfFee,
        tradeAllowlistEnabled:
          tradeAllowlistChanges.enabled ?? currentTradeAllowlist?.enabled,
        tradeAllowlistTokens: [
          ...(currentTradeAllowlist?.tokens ?? []).filter(
            (token) =>
              !tradeAllowlistChanges.remove?.some(
                (removed) => toAllowlistKey(removed) === toAllowlistKey(token)
              )
          ),
          ...(tradeAllowlistChanges.add ?? []),
        ],
      })

      // Reset the flag after form reset
      setTimeout(() => {
        isResettingForm.current = false
      }, 100)
    }
  }, [
    indexDTF?.id,
    !!feeRecipients,
    // Re-seed once the tokenJar read resolves and reclassifies the governance
    // share (it lands after feeRecipients first becomes available).
    feeRecipients?.governanceShare,
    currentBidsEnabled,
    currentOptimisticAllowedActions,
    currentSelfFee,
    currentTradeAllowlist,
  ])

  // Watch for token name changes (v5+ only)
  useEffect(() => {
    if (indexDTF && tokenName !== undefined && isV5) {
      if (tokenName !== indexDTF.token.name) {
        setTokenNameChange(tokenName)
      } else {
        setTokenNameChange(undefined)
      }
    }
  }, [tokenName, indexDTF?.token.name, isV5])

  // Watch for mandate changes
  useEffect(() => {
    if (indexDTF && mandate !== undefined) {
      if (mandate !== indexDTF.mandate) {
        setMandateChange(mandate)
      } else {
        setMandateChange(undefined)
      }
    }
  }, [mandate, indexDTF?.mandate])

  // Watch for role changes
  useEffect(() => {
    if (indexDTF && indexDTF.ownerGovernance) {
      const changes: any = {}

      // Check guardians
      if (
        guardians &&
        JSON.stringify(guardians.filter(Boolean).sort()) !==
          JSON.stringify(
            (indexDTF.ownerGovernance.timelock.guardians || []).sort()
          )
      ) {
        changes.guardians = guardians.filter(Boolean)
      }

      // Check brand managers
      if (
        brandManagers &&
        JSON.stringify(brandManagers.filter(Boolean).sort()) !==
          JSON.stringify((indexDTF.brandManagers || []).sort())
      ) {
        changes.brandManagers = brandManagers.filter(Boolean)
      }

      // Check auction launchers
      if (
        auctionLaunchers &&
        JSON.stringify(auctionLaunchers.filter(Boolean).sort()) !==
          JSON.stringify((indexDTF.auctionLaunchers || []).sort())
      ) {
        changes.auctionLaunchers = auctionLaunchers.filter(Boolean)
      }

      setRolesChanges(changes)
    }
  }, [guardians, brandManagers, auctionLaunchers, indexDTF?.id])

  // Watch for fee changes
  useEffect(() => {
    if (indexDTF) {
      setDtfRevenueChanges((prevChanges) => {
        const changes = { ...prevChanges }

        if (mintFee !== undefined && mintFee !== indexDTF.mintingFee * 100) {
          changes.mintFee = mintFee
        } else {
          delete changes.mintFee
        }

        if (
          folioFee !== undefined &&
          folioFee !== indexDTF.annualizedTvlFee * 100
        ) {
          changes.tvlFee = folioFee
        } else {
          delete changes.tvlFee
        }

        return changes
      })
    }
  }, [mintFee, folioFee, indexDTF?.mintingFee, indexDTF?.annualizedTvlFee])

  // Watch for revenue distribution changes
  useEffect(() => {
    if (feeRecipients) {
      // Update governance share
      if (governanceShare !== undefined) {
        // Compare as numbers, handling edge cases
        const current = Number(feeRecipients.governanceShare)
        const newVal = Number(governanceShare)

        if (!isNaN(current) && !isNaN(newVal) && current !== newVal) {
          setRevenueDistributionChanges((prev) => ({
            ...prev,
            governanceShare: newVal,
          }))
        } else if (governanceShare !== feeRecipients.governanceShare) {
          // Fallback to direct comparison if number conversion fails
          setRevenueDistributionChanges((prev) => ({
            ...prev,
            governanceShare,
          }))
        } else {
          setRevenueDistributionChanges((prev) => {
            const { governanceShare, ...rest } = prev
            return rest
          })
        }
      }

      // Update deployer share
      if (deployerShare !== undefined) {
        // Compare as numbers, handling edge cases
        const current = Number(feeRecipients.deployerShare)
        const newVal = Number(deployerShare)

        if (!isNaN(current) && !isNaN(newVal) && current !== newVal) {
          setRevenueDistributionChanges((prev) => ({
            ...prev,
            deployerShare: newVal,
          }))
        } else if (deployerShare !== feeRecipients.deployerShare) {
          // Fallback to direct comparison if number conversion fails
          setRevenueDistributionChanges((prev) => ({ ...prev, deployerShare }))
        } else {
          setRevenueDistributionChanges((prev) => {
            const { deployerShare, ...rest } = prev
            return rest
          })
        }
      }

      // Update additional recipients
      if (additionalRevenueRecipients !== undefined) {
        const hasChanged =
          JSON.stringify(additionalRevenueRecipients) !==
          JSON.stringify(feeRecipients.externalRecipients)
        if (hasChanged) {
          setRevenueDistributionChanges((prev) => ({
            ...prev,
            additionalRecipients: additionalRevenueRecipients,
          }))
        } else {
          setRevenueDistributionChanges((prev) => {
            const { additionalRecipients, ...rest } = prev
            return rest
          })
        }
      }
    }
  }, [
    governanceShare,
    deployerShare,
    additionalRevenueRecipients,
    feeRecipients,
    setRevenueDistributionChanges,
  ])

  // Watch for auction length changes
  useEffect(() => {
    if (indexDTF && auctionLength !== undefined) {
      if (auctionLength !== indexDTF.auctionLength / 60) {
        setAuctionLengthChange(auctionLength)
      } else {
        setAuctionLengthChange(undefined)
      }
    }
  }, [auctionLength, indexDTF?.auctionLength])

  // Watch for weight control changes
  useEffect(() => {
    if (rebalanceControl && weightControl !== undefined) {
      if (weightControl !== rebalanceControl.weightControl) {
        setWeightControlChange(weightControl)
      } else {
        setWeightControlChange(undefined)
      }
    }
  }, [weightControl, rebalanceControl?.weightControl])

  // Watch for bids enabled changes (v5+ only)
  useEffect(() => {
    if (isV5 && bidsEnabled !== undefined && currentBidsEnabled !== undefined) {
      if (bidsEnabled !== currentBidsEnabled) {
        setBidsEnabledChange(bidsEnabled)
      } else {
        setBidsEnabledChange(undefined)
      }
    }
  }, [bidsEnabled, currentBidsEnabled, isV5])

  // Watch for self fee changes (v6)
  useEffect(() => {
    if (currentSelfFee === undefined || selfFee === undefined) return
    const next = Number(selfFee)
    setSelfFeeChange(
      Number.isFinite(next) && next !== currentSelfFee ? next : undefined
    )
  }, [selfFee, currentSelfFee, setSelfFeeChange])

  // Watch for trade allowlist changes (v6)
  useEffect(() => {
    if (!currentTradeAllowlist) return
    const current = new Set(currentTradeAllowlist.tokens.map(toAllowlistKey))
    // Lowercase first: a mixed-case address with a bad checksum would make the SDK encoder throw.
    const proposed = ((tradeAllowlistTokens ?? []) as string[])
      .filter((token) => token && isAddress(token, { strict: false }))
      .map((token) => getAddress(token.toLowerCase()))
    const proposedKeys = new Set(proposed.map(toAllowlistKey))
    const add = proposed.filter(
      (token, index) =>
        !current.has(toAllowlistKey(token)) &&
        proposed.findIndex(
          (other) => toAllowlistKey(other) === toAllowlistKey(token)
        ) === index
    )
    const remove = currentTradeAllowlist.tokens.filter(
      (token) => !proposedKeys.has(toAllowlistKey(token))
    )
    const enabled =
      tradeAllowlistEnabled !== undefined &&
      tradeAllowlistEnabled !== currentTradeAllowlist.enabled
        ? (tradeAllowlistEnabled as boolean)
        : undefined

    setTradeAllowlistChanges({
      ...(enabled !== undefined ? { enabled } : {}),
      ...(add.length ? { add } : {}),
      ...(remove.length ? { remove } : {}),
    })
  }, [
    tradeAllowlistTokens,
    tradeAllowlistEnabled,
    currentTradeAllowlist,
    setTradeAllowlistChanges,
  ])

  // Watch for governance changes
  useEffect(() => {
    if (indexDTF && indexDTF.ownerGovernance) {
      const governance = indexDTF.ownerGovernance

      setGovernanceChanges((prevChanges) => {
        const changes = { ...prevChanges }

        // Check voting delay (convert from days to seconds for comparison)
        if (governanceVotingDelay !== undefined) {
          const newValueInSeconds = Math.round(governanceVotingDelay * 86400)
          if (newValueInSeconds !== Number(governance.votingDelay)) {
            changes.votingDelay = newValueInSeconds
          } else {
            delete changes.votingDelay
          }
        }

        // Check voting period (convert from days to seconds for comparison)
        if (governanceVotingPeriod !== undefined) {
          const newValueInSeconds = Math.round(governanceVotingPeriod * 86400)
          if (newValueInSeconds !== Number(governance.votingPeriod)) {
            changes.votingPeriod = newValueInSeconds
          } else {
            delete changes.votingPeriod
          }
        }

        // Threshold compares on the seeded percentage basis
        if (governanceVotingThreshold !== undefined) {
          if (
            isProposalThresholdChanged(
              governanceVotingThreshold,
              getCurrentProposalThreshold(governance)
            )
          ) {
            changes.proposalThreshold = governanceVotingThreshold
          } else {
            delete changes.proposalThreshold
          }
        }

        // Check voting quorum
        if (governanceVotingQuorum !== undefined) {
          if (governanceVotingQuorum !== currentQuorumPercentage) {
            changes.quorumPercent = governanceVotingQuorum
          } else {
            delete changes.quorumPercent
          }
        }

        // Check execution delay (convert from days to seconds for comparison)
        if (governanceExecutionDelay !== undefined) {
          const newValueInSeconds = Math.round(governanceExecutionDelay * 86400)
          if (
            governance.timelock?.executionDelay !== undefined &&
            newValueInSeconds !== Number(governance.timelock.executionDelay)
          ) {
            changes.executionDelay = newValueInSeconds
          } else {
            delete changes.executionDelay
          }
        }

        return changes
      })
    }
  }, [
    governanceVotingDelay,
    governanceVotingPeriod,
    governanceVotingThreshold,
    governanceVotingQuorum,
    governanceExecutionDelay,
    indexDTF?.ownerGovernance,
    setGovernanceChanges,
    currentQuorumPercentage,
  ])

  // Watch for optimistic governance changes
  useEffect(() => {
    const governance = indexDTF?.ownerGovernance
    if (!governance?.isOptimistic) {
      setOptimisticGovernanceChanges({})
      return
    }

    setOptimisticGovernanceChanges((prevChanges) => {
      const changes = { ...prevChanges }
      const optimistic = governance.optimistic
      const currentVetoDelay = optimistic?.vetoDelay ?? DEFAULT_OPTIMISTIC_VETO_DELAY
      const currentVetoPeriod =
        optimistic?.vetoPeriod ?? DEFAULT_OPTIMISTIC_VETO_PERIOD
      const currentVetoThreshold =
        optimistic?.vetoThreshold ?? DEFAULT_OPTIMISTIC_VETO_THRESHOLD

      if (optimisticVetoDelay !== undefined) {
        const newValueInSeconds = Math.round(optimisticVetoDelay * 86400)
        if (newValueInSeconds !== Number(currentVetoDelay)) {
          changes.vetoDelay = newValueInSeconds
        } else {
          delete changes.vetoDelay
        }
      }

      if (optimisticVetoPeriod !== undefined) {
        const newValueInSeconds = Math.round(optimisticVetoPeriod * 86400)
        if (newValueInSeconds !== Number(currentVetoPeriod)) {
          changes.vetoPeriod = newValueInSeconds
        } else {
          delete changes.vetoPeriod
        }
      }

      if (optimisticVetoThreshold !== undefined) {
        if (Number(optimisticVetoThreshold) !== Number(currentVetoThreshold)) {
          changes.vetoThreshold = Number(optimisticVetoThreshold)
        } else {
          delete changes.vetoThreshold
        }
      }

      if (optimisticProposers) {
        const newProposers = optimisticProposers.filter(Boolean) as Address[]
        const currentProposers = governance.optimistic?.proposers ?? []

        if (!arraysEqualIgnoreCase(newProposers, currentProposers)) {
          changes.optimisticProposers = newProposers
        } else {
          delete changes.optimisticProposers
        }
      }

      if (optimisticActions && currentOptimisticAllowedActions) {
        const newActions = optimisticActions.filter(
          Boolean
        ) as OptimisticActionId[]

        if (!arraysEqualIgnoreCase(newActions, currentOptimisticAllowedActions)) {
          changes.allowedActions = newActions
        } else {
          delete changes.allowedActions
        }
      }

      return changes
    })
  }, [
    optimisticVetoDelay,
    optimisticVetoPeriod,
    optimisticVetoThreshold,
    optimisticProposers,
    optimisticActions,
    currentOptimisticAllowedActions,
    indexDTF?.ownerGovernance,
    setOptimisticGovernanceChanges,
  ])

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  return <V6SettingsReads />
}

export default Updater
