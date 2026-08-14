import { useState } from 'react'
import { ChevronDown, Scale } from 'lucide-react'

import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import {
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/dialog'
import { IconButton } from '@/components/icon-button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

const PROHIBITED_JURISDICTIONS = [
  'Afghanistan',
  'Belarus',
  'Canada',
  'Crimea, Donetsk People’s Republic (DNR), Luhansk People’s Republic (LNR), Kherson and Zaporizhzhia regions (Ukraine), the city of Sevastopol',
  'Cuba',
  'Democratic Republic of Korea',
  'Iran',
  'Libya',
  'Myanmar',
  'Russia',
  'Somalia',
  'South Sudan',
  'Sudan',
  'Syria',
  'United States, or any of its states, possessions, territories or federal districts*',
]

export const EligibilityDialogCandidate = ({
  idPrefix = 'candidate',
  onConfirm,
}: {
  idPrefix?: string
  onConfirm?: () => void
}) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [confirmedJurisdiction, setConfirmedJurisdiction] = useState(false)
  const [confirmedTokenizedStocks, setConfirmedTokenizedStocks] =
    useState(false)
  const canConfirm =
    acceptedTerms && confirmedJurisdiction && confirmedTokenizedStocks

  return (
    <>
      <DialogHeader>
        <span className="flex size-8 items-center justify-center rounded-full border border-border">
          <Scale className="size-4" strokeWidth={1.5} />
        </span>
        <DialogTitle className="mt-5">Verify your eligibility</DialogTitle>
        <DialogDescription>
          Before continuing, please confirm the following.
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="divide-y divide-border">
        <AttestationRow
          id={`${idPrefix}-terms`}
          checked={acceptedTerms}
          onCheckedChange={setAcceptedTerms}
        >
          I have read and agree to the{' '}
          <InlineLink href="https://reserve.org/terms-and-conditions">
            Terms of Use
          </InlineLink>
          .
        </AttestationRow>
        <Collapsible>
          <AttestationRow
            id={`${idPrefix}-jurisdiction`}
            checked={confirmedJurisdiction}
            onCheckedChange={setConfirmedJurisdiction}
            trailing={
              <CollapsibleTrigger asChild>
                <IconButton
                  label="Show restricted jurisdictions"
                  icon={
                    <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
                  }
                  tone="quiet"
                  className="group ml-auto"
                />
              </CollapsibleTrigger>
            }
          >
            I confirm I am not located in, a resident of, or a citizen of a{' '}
            <InlineLink href="https://docs.ondo.finance/ondo-global-markets/eligibility">
              restricted jurisdiction
            </InlineLink>
            .
          </AttestationRow>
          <CollapsibleContent className="border-t border-border py-4">
            <div className="max-h-44 overflow-y-auto pr-3">
              <p className="mb-2 text-sm font-medium">
                Jurisdiction-Based Prohibitions:
              </p>
              <ul className="space-y-1 text-sm font-light leading-5 text-muted-foreground">
                {PROHIBITED_JURISDICTIONS.map((jurisdiction) => (
                  <li key={jurisdiction}>{jurisdiction}</li>
                ))}
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <AttestationRow
          id={`${idPrefix}-tokenized-stocks`}
          checked={confirmedTokenizedStocks}
          onCheckedChange={setConfirmedTokenizedStocks}
        >
          I confirm that I am allowed to purchase tokenized stocks under the
          laws of my country of residence.
        </AttestationRow>
      </DialogBody>

      <DialogFooter>
        <Button className="w-full" disabled={!canConfirm} onClick={onConfirm}>
          Confirm
        </Button>
        <PrivacyNote className="mt-4" />
      </DialogFooter>
    </>
  )
}

const AttestationRow = ({
  id,
  checked,
  onCheckedChange,
  trailing,
  children,
}: {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  trailing?: React.ReactNode
  children: React.ReactNode
}) => (
  <div className="flex min-h-16 items-center gap-4 py-3">
    <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
    <label htmlFor={id} className="text-base font-light leading-6">
      {children}
    </label>
    {trailing}
  </div>
)

const InlineLink = ({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-primary underline underline-offset-2"
  >
    {children}
  </a>
)

const PrivacyNote = ({ className }: { className?: string }) => (
  <p
    className={cn(
      'text-sm font-light leading-5 text-muted-foreground',
      className
    )}
  >
    Your privacy is protected. This confirmation is only ever associated with
    your wallet address — never your personal information.{' '}
    <InlineLink href="https://reserve.org/terms-and-conditions#privacy">
      Privacy Policy
    </InlineLink>
  </p>
)
