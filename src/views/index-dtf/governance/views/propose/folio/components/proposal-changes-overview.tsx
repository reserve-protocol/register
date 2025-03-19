import { useFormContext } from 'react-hook-form'
import { useAtomValue } from 'jotai'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { Button } from '@/components/ui/button'
import { GovernanceInputs } from '../schema'
import { Card } from '@/components/ui/card'
import {
  ChevronDown,
  ChevronUp,
  Crown,
  GalleryHorizontal,
  User,
  X,
  Plus,
  ArrowRight,
  Percent,
} from 'lucide-react'
import { useState, useMemo } from 'react'

// --- Utils ---
const timeUtils = {
  secondsToMinutes: (seconds: number) => Math.round(seconds / 60),
  secondsToHours: (seconds: number) => Math.round(seconds / 3600),

  // Explicitly check for numeric value differences (handles toggle selections)
  isValueChanged: (current: number, original: number) => {
    return Math.abs(current - original) >= 0.01 // Allow for minor floating point differences
  },
}

// --- Types ---
type ChangeItem = {
  type: 'remove' | 'add' | 'replace'
  fieldKey: keyof GovernanceInputs
  value: any
  originalValue?: any
  section?: string
}

type ChangeSection = {
  title: string
  icon: React.ReactNode
  fields: string[]
  changes: ChangeItem[]
}

// --- Component for rendering a change value ---
const ChangeValueDisplay = ({
  value,
  fieldKey,
}: {
  value: any
  fieldKey: keyof GovernanceInputs
}) => {
  const formattedValue =
    typeof value === 'string' && value.startsWith('0x')
      ? value.substring(0, 6) + '...' + value.substring(value.length - 4)
      : String(value)

  const showPercentage = fieldKey.includes('Fee') || fieldKey.includes('Share')

  return (
    <span className="font-mono text-sm truncate max-w-[200px]">
      {formattedValue}
      {showPercentage ? '%' : ''}
    </span>
  )
}

// --- Component for rendering a single change item ---
const ChangeItemDisplay = ({
  change,
  onDiscard,
}: {
  change: ChangeItem
  onDiscard: (item: ChangeItem) => void
}) => {
  return (
    <div className="border-b last:border-b-0 p-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2 w-full">
          <div className="text-sm text-muted-foreground">
            {change.type === 'add' && 'New'}
            {change.type === 'remove' && 'Remove'}
            {change.type === 'replace' && 'Replacing'}
            {change.section && ` (${change.section})`}
          </div>

          {change.type === 'replace' && (
            <div className="flex items-center gap-2">
              <div className="text-red-500 flex items-center gap-2">
                <X size={16} className="text-red-500" />
                <ChangeValueDisplay
                  value={change.originalValue}
                  fieldKey={change.fieldKey}
                />
              </div>
              <ArrowRight size={14} className="text-muted-foreground" />
              <div className="text-blue-500 flex items-center gap-2">
                <Plus size={16} className="text-blue-500" />
                <ChangeValueDisplay
                  value={change.value}
                  fieldKey={change.fieldKey}
                />
              </div>
            </div>
          )}

          {change.type === 'add' && (
            <div className="text-blue-500 flex items-center gap-2">
              <Plus size={16} />
              <ChangeValueDisplay
                value={change.value}
                fieldKey={change.fieldKey}
              />
            </div>
          )}

          {change.type === 'remove' && (
            <div className="text-red-500 flex items-center gap-2">
              <X size={16} />
              <ChangeValueDisplay
                value={change.value}
                fieldKey={change.fieldKey}
              />
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="ml-2 text-muted-foreground"
          onClick={() => onDiscard(change)}
        >
          Discard
        </Button>
      </div>
    </div>
  )
}

// --- Component for rendering a section of changes ---
const ChangesList = ({
  section,
  onDiscard,
}: {
  section: ChangeSection
  onDiscard: (item: ChangeItem) => void
}) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {section.icon}
          <div>
            <span className="font-semibold">
              {section.changes.length} changes in:
            </span>
            <span className="ml-1">{section.title}</span>
          </div>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {isOpen && (
        <div className="border-t">
          {section.changes.map((change, idx) => (
            <ChangeItemDisplay
              key={`${change.fieldKey}-${idx}`}
              change={change}
              onDiscard={onDiscard}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// --- Component for when no changes have been made ---
const NoChangesMessage = () => (
  <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground mt-4">
    No changes have been made yet.
  </div>
)

// --- Component for the proposal summary header ---
const ProposalSummaryHeader = () => (
  <div className="space-y-2">
    <h3 className="text-lg font-medium">Proposal Summary</h3>
    <p className="text-sm text-muted-foreground">
      Review your changes before creating the governance proposal. All changes
      will be subject to approval by governance token holders.
    </p>
  </div>
)

// --- Custom hook for tracking form field changes ---
const useFormFields = () => {
  const { watch } = useFormContext<GovernanceInputs>()

  // Watch specific fields to ensure changes are detected
  return {
    folioFee: watch('folioFee'),
    mintFee: watch('mintFee'),
    auctionLength: watch('auctionLength'),
    auctionDelay: watch('auctionDelay'),
    governanceShare: watch('governanceShare'),
    deployerShare: watch('deployerShare'),
    brandManagers: watch('brandManagers'),
    auctionLaunchers: watch('auctionLaunchers'),
    mandate: watch('mandate'),
    additionalRevenueRecipients: watch('additionalRevenueRecipients'),
  }
}

// --- Custom hook for detecting changes ---
const useChangesTracker = (indexDTF: any) => {
  const formValues = useFormFields()

  // Calculate changes between current form values and original indexDTF
  const changes = useMemo(() => {
    if (!indexDTF) return []

    const allChanges: ChangeItem[] = []

    // Check mandate changes
    if (formValues.mandate !== indexDTF.mandate) {
      allChanges.push({
        type: 'replace',
        fieldKey: 'mandate',
        value: formValues.mandate,
        originalValue: indexDTF.mandate,
      })
    }

    // Check fee changes
    const originalFolioFee = indexDTF.annualizedTvlFee * 100
    if (timeUtils.isValueChanged(formValues.folioFee, originalFolioFee)) {
      allChanges.push({
        type: 'replace',
        fieldKey: 'folioFee',
        value: formValues.folioFee,
        originalValue: originalFolioFee,
        section: 'Annualized TVL Fee',
      })
    }

    const originalMintFee = indexDTF.mintingFee * 100
    if (timeUtils.isValueChanged(formValues.mintFee, originalMintFee)) {
      allChanges.push({
        type: 'replace',
        fieldKey: 'mintFee',
        value: formValues.mintFee,
        originalValue: originalMintFee,
        section: 'Mint Fee',
      })
    }

    // Check auction settings changes
    const originalAuctionLengthMin = timeUtils.secondsToMinutes(
      indexDTF.auctionLength
    )
    if (
      timeUtils.isValueChanged(
        formValues.auctionLength,
        originalAuctionLengthMin
      )
    ) {
      allChanges.push({
        type: 'replace',
        fieldKey: 'auctionLength',
        value: formValues.auctionLength,
        originalValue: originalAuctionLengthMin,
        section: 'Minutes',
      })
    }

    const originalAuctionDelayHours = timeUtils.secondsToHours(
      indexDTF.auctionDelay
    )
    if (
      timeUtils.isValueChanged(
        formValues.auctionDelay,
        originalAuctionDelayHours
      )
    ) {
      allChanges.push({
        type: 'replace',
        fieldKey: 'auctionDelay',
        value: formValues.auctionDelay,
        originalValue: originalAuctionDelayHours,
        section: 'Hours',
      })
    }

    // Handle array fields with separate utilities
    processArrayChanges(allChanges, formValues, indexDTF)

    // Handle fee recipients
    processFeeRecipientChanges(allChanges, formValues, indexDTF)

    return allChanges
  }, [formValues, indexDTF])

  return changes
}

// --- Helper function for processing array changes ---
const processArrayChanges = (
  allChanges: ChangeItem[],
  formValues: ReturnType<typeof useFormFields>,
  indexDTF: any
) => {
  // Process brand managers
  const originalBrandManagers = indexDTF.brandManagers || []
  const currentBrandManagers = formValues.brandManagers || []

  // Check if arrays are different
  const brandManagersChanged =
    currentBrandManagers.length !== originalBrandManagers.length ||
    currentBrandManagers.some(
      (address) => address && !originalBrandManagers.includes(address)
    ) ||
    originalBrandManagers.some(
      (address) => address && !currentBrandManagers.includes(address)
    )

  if (brandManagersChanged) {
    // Added brand managers
    currentBrandManagers.forEach((address) => {
      if (address && !originalBrandManagers.includes(address)) {
        allChanges.push({
          type: 'add',
          fieldKey: 'brandManagers',
          value: address,
        })
      }
    })

    // Removed brand managers
    originalBrandManagers.forEach((address) => {
      if (address && !currentBrandManagers.includes(address)) {
        allChanges.push({
          type: 'remove',
          fieldKey: 'brandManagers',
          value: address,
        })
      }
    })
  }

  // Process auction launchers
  const originalAuctionLaunchers = indexDTF.auctionLaunchers || []
  const currentAuctionLaunchers = formValues.auctionLaunchers || []

  // Check if arrays are different
  const auctionLaunchersChanged =
    currentAuctionLaunchers.length !== originalAuctionLaunchers.length ||
    currentAuctionLaunchers.some(
      (address) => address && !originalAuctionLaunchers.includes(address)
    ) ||
    originalAuctionLaunchers.some(
      (address) => address && !currentAuctionLaunchers.includes(address)
    )

  if (auctionLaunchersChanged) {
    // Added auction launchers
    currentAuctionLaunchers.forEach((address) => {
      if (address && !originalAuctionLaunchers.includes(address)) {
        allChanges.push({
          type: 'add',
          fieldKey: 'auctionLaunchers',
          value: address,
        })
      }
    })

    // Removed auction launchers
    originalAuctionLaunchers.forEach((address) => {
      if (address && !currentAuctionLaunchers.includes(address)) {
        allChanges.push({
          type: 'remove',
          fieldKey: 'auctionLaunchers',
          value: address,
        })
      }
    })
  }
}

// --- Helper function for processing fee recipient changes ---
const processFeeRecipientChanges = (
  allChanges: ChangeItem[],
  formValues: ReturnType<typeof useFormFields>,
  indexDTF: any
) => {
  try {
    if (indexDTF.feeRecipients && indexDTF.feeRecipients.length > 0) {
      // Check governance share changes (if governance token exists)
      if (indexDTF.stToken?.id) {
        const governanceRecipient = indexDTF.feeRecipients.find(
          (r: any) =>
            r.address &&
            r.address.toLowerCase() === indexDTF.stToken?.id.toLowerCase()
        )

        const originalGovernanceShare = governanceRecipient
          ? parseFloat(governanceRecipient.percentage)
          : 0

        if (
          timeUtils.isValueChanged(
            formValues.governanceShare,
            originalGovernanceShare
          )
        ) {
          allChanges.push({
            type: 'replace',
            fieldKey: 'governanceShare',
            value: formValues.governanceShare,
            originalValue: originalGovernanceShare,
            section: 'Governance Share',
          })
        }
      }

      // Check deployer share changes
      const deployerRecipient = indexDTF.feeRecipients.find(
        (r: any) =>
          r.address &&
          r.address.toLowerCase() === indexDTF.deployer.toLowerCase()
      )

      const originalDeployerShare = deployerRecipient
        ? parseFloat(deployerRecipient.percentage)
        : 0

      if (
        timeUtils.isValueChanged(
          formValues.deployerShare,
          originalDeployerShare
        )
      ) {
        allChanges.push({
          type: 'replace',
          fieldKey: 'deployerShare',
          value: formValues.deployerShare,
          originalValue: originalDeployerShare,
          section: 'Creator Share',
        })
      }

      // Process additional recipients if needed
      const currentRecipients = formValues.additionalRevenueRecipients || []
      const recipientsChanged = currentRecipients.length > 0

      if (recipientsChanged) {
        // Implementation for additional recipients would go here
        // This would be more complex, comparing arrays of objects
      }
    }
  } catch (e) {
    console.error('Error processing fee recipients:', e)
  }
}

// --- Custom hook for generating change sections ---
const useChangeSections = (changes: ChangeItem[]) => {
  return useMemo(() => {
    const sections: ChangeSection[] = [
      {
        title: 'Mandate',
        icon: (
          <div className="rounded-full bg-muted w-8 h-8 flex items-center justify-center">
            <Crown size={14} />
          </div>
        ),
        fields: ['mandate'],
        changes: changes.filter((c) => c.fieldKey === 'mandate'),
      },
      {
        title: 'Fees',
        icon: (
          <div className="rounded-full bg-muted w-8 h-8 flex items-center justify-center">
            <Percent size={14} />
          </div>
        ),
        fields: [
          'folioFee',
          'mintFee',
          'governanceShare',
          'deployerShare',
          'fixedPlatformFee',
          'additionalRevenueRecipients',
        ],
        changes: changes.filter((c) =>
          [
            'folioFee',
            'mintFee',
            'governanceShare',
            'deployerShare',
            'fixedPlatformFee',
            'additionalRevenueRecipients',
          ].includes(c.fieldKey as string)
        ),
      },
      {
        title: 'Roles',
        icon: (
          <div className="rounded-full bg-muted w-8 h-8 flex items-center justify-center">
            <User size={14} />
          </div>
        ),
        fields: ['brandManagers', 'auctionLaunchers'],
        changes: changes.filter((c) =>
          ['brandManagers', 'auctionLaunchers'].includes(c.fieldKey as string)
        ),
      },
      {
        title: 'Auctions',
        icon: (
          <div className="rounded-full bg-muted w-8 h-8 flex items-center justify-center">
            <GalleryHorizontal size={14} />
          </div>
        ),
        fields: ['auctionLength', 'auctionDelay'],
        changes: changes.filter((c) =>
          ['auctionLength', 'auctionDelay'].includes(c.fieldKey as string)
        ),
      },
    ]

    // Only return sections that have changes
    return sections.filter((section) => section.changes.length > 0)
  }, [changes])
}

// --- Custom hook for handling discard actions ---
const useDiscardHandlers = (indexDTF: any) => {
  const { setValue, getValues } = useFormContext<GovernanceInputs>()

  const handleDiscard = (change: ChangeItem) => {
    if (!indexDTF) return

    // Revert to original value based on the field
    switch (change.fieldKey) {
      case 'mandate':
        setValue('mandate', indexDTF.mandate || '')
        break
      case 'folioFee':
        setValue('folioFee', indexDTF.annualizedTvlFee * 100)
        break
      case 'mintFee':
        setValue('mintFee', indexDTF.mintingFee * 100)
        break
      case 'auctionLength':
        setValue(
          'auctionLength',
          timeUtils.secondsToMinutes(indexDTF.auctionLength)
        )
        break
      case 'auctionDelay':
        setValue(
          'auctionDelay',
          timeUtils.secondsToHours(indexDTF.auctionDelay)
        )
        break
      case 'brandManagers': {
        const formValues = getValues()
        const updatedManagers = [...(formValues.brandManagers || [])]

        if (change.type === 'add') {
          // Remove the added address
          const index = updatedManagers.indexOf(change.value)
          if (index > -1) {
            updatedManagers.splice(index, 1)
          }
        } else if (change.type === 'remove') {
          // Add back the removed address
          updatedManagers.push(change.value)
        }

        setValue('brandManagers', updatedManagers)
        break
      }
      case 'auctionLaunchers': {
        const formValues = getValues()
        const updatedLaunchers = [...(formValues.auctionLaunchers || [])]

        if (change.type === 'add') {
          // Remove the added address
          const index = updatedLaunchers.indexOf(change.value)
          if (index > -1) {
            updatedLaunchers.splice(index, 1)
          }
        } else if (change.type === 'remove') {
          // Add back the removed address
          updatedLaunchers.push(change.value)
        }

        setValue('auctionLaunchers', updatedLaunchers)
        break
      }
      case 'governanceShare': {
        // Calculate governance share from fee recipients
        try {
          if (indexDTF.stToken?.id && indexDTF.feeRecipients) {
            const governanceRecipient = indexDTF.feeRecipients.find(
              (r: any) =>
                r.address &&
                r.address.toLowerCase() === indexDTF.stToken?.id.toLowerCase()
            )
            setValue(
              'governanceShare',
              governanceRecipient
                ? parseFloat(governanceRecipient.percentage)
                : 0
            )
          } else {
            setValue('governanceShare', 0)
          }
        } catch (e) {
          console.error('Error reverting governance share:', e)
          setValue('governanceShare', 0)
        }
        break
      }
      case 'deployerShare': {
        // Calculate deployer share from fee recipients
        try {
          if (indexDTF.deployer && indexDTF.feeRecipients) {
            const deployerRecipient = indexDTF.feeRecipients.find(
              (r: any) =>
                r.address &&
                r.address.toLowerCase() === indexDTF.deployer.toLowerCase()
            )
            setValue(
              'deployerShare',
              deployerRecipient ? parseFloat(deployerRecipient.percentage) : 0
            )
          } else {
            setValue('deployerShare', 0)
          }
        } catch (e) {
          console.error('Error reverting deployer share:', e)
          setValue('deployerShare', 0)
        }
        break
      }
      // Add cases for other fields as needed
    }
  }

  return handleDiscard
}

const ProposalChangesOverview = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const {
    formState: { isValid, isDirty },
    handleSubmit,
  } = useFormContext<GovernanceInputs>()

  // Use custom hooks to manage changes and sections
  const changes = useChangesTracker(indexDTF)
  const changeSections = useChangeSections(changes)
  const handleDiscard = useDiscardHandlers(indexDTF)

  return (
    <div className="border-4 overflow-hidden w-full border-secondary rounded-3xl bg-background h-[fit-content]">
      {changeSections.length > 0 ? (
        <div className="space-y-4 mt-4">
          {changeSections.map((section) => (
            <ChangesList
              key={section.title}
              section={section}
              onDiscard={handleDiscard}
            />
          ))}
        </div>
      ) : (
        <NoChangesMessage />
      )}
    </div>
  )
}

export default ProposalChangesOverview
