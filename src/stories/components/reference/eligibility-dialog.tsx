import { useState } from 'react'
import { EligibilityJurisdictions } from './eligibility-jurisdictions'
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

export const EligibilityDialogCandidate = ({
  idPrefix = 'candidate',
  jurisdictionsDefaultOpen = false,
  onConfirm,
}: {
  idPrefix?: string
  jurisdictionsDefaultOpen?: boolean
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
      <DialogHeader leading={<PassiveLeadingIcon />}>
        <DialogTitle className="mt-4">Verify your eligibility</DialogTitle>
        <DialogDescription>
          Before continuing, please confirm the following.
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="space-y-5 py-3">
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
        <Collapsible defaultOpen={jurisdictionsDefaultOpen}>
          <AttestationRow
            id={`${idPrefix}-jurisdiction`}
            checked={confirmedJurisdiction}
            onCheckedChange={setConfirmedJurisdiction}
            trailing={
              <CollapsibleTrigger asChild>
                <IconButton
                  label="Show restricted jurisdictions"
                  icon={
                    <ChevronDown className="transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
                  }
                  tone="quiet"
                  className="group ml-auto self-center text-muted-foreground hover:text-foreground focus-visible:text-foreground"
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
          <CollapsibleContent className="pl-10">
            <EligibilityJurisdictions />
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

const PassiveLeadingIcon = () => (
  <span
    data-testid="eligibility-passive-icon"
    className="flex size-8 items-center justify-center"
  >
    <Scale className="size-5" strokeWidth={1.5} />
  </span>
)

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
  <div className="flex items-start gap-3">
    <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
    <label htmlFor={id} className="pt-0.5 text-base font-light leading-6">
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
