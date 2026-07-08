import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import useComplianceRestrictions from '@/hooks/use-compliance-restrictions'
import useDtfHasOndoAssets from '@/hooks/use-dtf-has-ondo-assets'
import { trackEligibilityConfirmed } from '@/hooks/useTrackPage'
import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ChevronDown, Scale } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { Address } from 'viem'

const ELIGIBILITY_STORAGE_KEY = 'reserve:index-dtf-eligibility:v3'
// v2 stored one entry per (chainId, dtf, wallet); superseded by wallet-wide
// consent but still read so existing confirmations carry over.
const LEGACY_ELIGIBILITY_STORAGE_KEY = 'reserve:index-dtf-eligibility:v2'
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || ''
const ELIGIBILITY_CONFIRMATION_API = `${STORAGE_URL}confirm-eligibility`
// Version tag of the legal copy the user attests to; bump when the terms or
// the attestation checkboxes change.
const ELIGIBILITY_TERMS_VERSION = '2026-06'
const TERMS_URL = 'https://reserve.org/terms-and-conditions'
const PRIVACY_URL = `${TERMS_URL}#privacy`
const ELIGIBILITY_DOCS_URL =
  'https://docs.ondo.finance/ondo-global-markets/eligibility'

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

// WHY: eligibility is a self-attestation about the person behind the wallet,
// not about any single DTF, so one confirmation per wallet covers every DTF
// (re-prompting per DTF proved to be major friction). It is still per wallet,
// never a device-wide flag.
const buildEligibilityKey = (wallet: Address) => wallet.toLowerCase()

const readStoredKeys = (storageKey: string): string[] => {
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

const readEligibilityConfirmations = (): Set<string> => {
  const wallets = readStoredKeys(ELIGIBILITY_STORAGE_KEY)
  // v2 entries were `chainId:dtf:wallet`; the wallet segment carries over
  const legacyWallets = readStoredKeys(LEGACY_ELIGIBILITY_STORAGE_KEY)
    .map((key) => key.split(':')[2])
    .filter(Boolean)
  return new Set([...wallets, ...legacyWallets])
}

// Fire-and-forget mirror of the confirmation into our own store; localStorage
// is the UX source of truth, so a failed POST never blocks or retries.
const postEligibilityConfirmation = (payload: {
  wallet: Address
  dtf: Address
  chainId: number
  ticker: string
}) => {
  fetch(ELIGIBILITY_CONFIRMATION_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      wallet: payload.wallet.toLowerCase(),
      dtf: payload.dtf.toLowerCase(),
      chainId: payload.chainId,
      ticker: payload.ticker,
      attestations: {
        terms: true,
        jurisdiction: true,
        tokenizedStocks: true,
      },
      termsVersion: ELIGIBILITY_TERMS_VERSION,
    }),
  }).catch(() => {})
}

const writeEligibilityConfirmation = (key: string) => {
  try {
    const confirmations = readEligibilityConfirmations()
    confirmations.add(key)
    localStorage.setItem(
      ELIGIBILITY_STORAGE_KEY,
      JSON.stringify([...confirmations])
    )
  } catch {}
}

const EligibilityCheck = ({
  id,
  checked,
  onCheckedChange,
  trailing,
  children,
}: {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  trailing?: ReactNode
  children: ReactNode
}) => (
  <div className="flex items-center gap-4 p-4 sm:p-5">
    <Checkbox
      id={id}
      aria-labelledby={`${id}-label`}
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      className="h-6 w-6 rounded-full"
    />
    <p id={`${id}-label`} className="text-base leading-snug text-foreground">
      {children}
    </p>
    {trailing}
  </div>
)

const EligibilityDialog = ({ onConfirm }: { onConfirm: () => void }) => {
  const { t } = useLingui()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [confirmedJurisdiction, setConfirmedJurisdiction] = useState(false)
  const [confirmedTokenizedStocks, setConfirmedTokenizedStocks] =
    useState(false)

  const canConfirm =
    acceptedTerms && confirmedJurisdiction && confirmedTokenizedStocks

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm()
  }

  return (
    <Dialog open>
      <DialogContent className="p-2 rounded-4xl" restrict showClose={false}>
        <DialogTitle className="sr-only">
          <Trans>Verify your eligibility</Trans>
        </DialogTitle>
        <DialogDescription className="sr-only">
          <Trans>Before continuing, please confirm the following.</Trans>
        </DialogDescription>

        <div className="p-4 pb-2">
          <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-foreground">
            <Scale className="h-5 w-5" strokeWidth={1.5} />
          </div>

          <div className="text-primary mb-2">
            <Trans>Verify your eligibility</Trans>
          </div>
          <h2 className="text-xl font-semibold leading-tight max-w-[320px]">
            <Trans>Before continuing, please confirm the following</Trans>
          </h2>
        </div>

        <div className="rounded-3xl border border-border bg-background">
          <EligibilityCheck
            id="eligibility-terms"
            checked={acceptedTerms}
            onCheckedChange={setAcceptedTerms}
          >
            <Trans>
              I have read and agree to the{' '}
              <a
                className="text-primary underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
                href={TERMS_URL}
              >
                Terms of Use
              </a>
              .
            </Trans>
          </EligibilityCheck>

          <div className="border-t border-border" />

          <Collapsible>
            <EligibilityCheck
              id="eligibility-jurisdiction"
              checked={confirmedJurisdiction}
              onCheckedChange={setConfirmedJurisdiction}
              trailing={
                <CollapsibleTrigger
                  className="group ml-auto shrink-0"
                  aria-label={t`Show restricted jurisdictions`}
                >
                  <ChevronDown className="h-5 w-5 rounded-full bg-muted p-1 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
              }
            >
              <Trans>
                I confirm I am not located in, a resident of, or a citizen of a{' '}
                <a
                  className="text-primary underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={ELIGIBILITY_DOCS_URL}
                >
                  restricted jurisdiction
                </a>
                .
              </Trans>
            </EligibilityCheck>
            <CollapsibleContent className="px-4 pb-4 sm:px-5">
              <p className="mb-2 text-sm font-medium text-foreground">
                <Trans>Jurisdiction-Based Prohibitions:</Trans>
              </p>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {PROHIBITED_JURISDICTIONS.map((jurisdiction) => (
                  <li key={jurisdiction}>{jurisdiction}</li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>

          <div className="border-t border-border" />

          <EligibilityCheck
            id="eligibility-tokenized-stocks"
            checked={confirmedTokenizedStocks}
            onCheckedChange={setConfirmedTokenizedStocks}
          >
            <Trans>
              I confirm that I am allowed to purchase tokenized stocks under the
              laws of my country of residence.
            </Trans>
          </EligibilityCheck>
        </div>

        <Button
          className="w-full rounded-2xl"
          size="lg"
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          <Trans>Confirm</Trans>
        </Button>

        <p className="mt-2 text-sm  text-legend px-4 pb-4">
          <Trans>
            Your privacy is protected. This confirmation is only ever associated
            with your wallet address - never your personal information.{' '}
            <a
              className="underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
              href={PRIVACY_URL}
            >
              Privacy Policy
            </a>
          </Trans>
        </p>
      </DialogContent>
    </Dialog>
  )
}

const ConfirmEligibilityModal = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const wallet = useAtomValue(walletAtom)
  const compliance = useComplianceRestrictions()
  const ondo = useDtfHasOndoAssets()
  const [confirmedKeys, setConfirmedKeys] = useState(
    readEligibilityConfirmations
  )

  const eligibilityKey = wallet ? buildEligibilityKey(wallet) : undefined

  // WHY: this is a self-attestation gate for users who can actually trade the
  // DTF, so it reads the same compliance source that enables the Buy/Sell
  // CTAs — including the shouldSkipRestrictions (allowlisted wallet) bypass.
  // Hard-blocked users never see it; they are stopped elsewhere instead.
  const shouldShow =
    !!eligibilityKey &&
    !confirmedKeys.has(eligibilityKey) &&
    !compliance.isLoading &&
    compliance.data?.restricted === false &&
    !ondo.isLoading &&
    ondo.hasOndoAssets

  if (!shouldShow || !eligibilityKey) return null

  const handleConfirm = () => {
    writeEligibilityConfirmation(eligibilityKey)
    setConfirmedKeys((prev) => new Set(prev).add(eligibilityKey))
    if (wallet && dtf) {
      trackEligibilityConfirmed({
        wa: wallet,
        ca: dtf.id,
        ticker: dtf.token.symbol,
        chain: dtf.chainId,
      })
      postEligibilityConfirmation({
        wallet,
        dtf: dtf.id,
        chainId: dtf.chainId,
        ticker: dtf.token.symbol,
      })
    }
  }

  // WHY: key by wallet so switching wallets remounts the dialog with fresh,
  // unchecked attestations.
  return <EligibilityDialog key={eligibilityKey} onConfirm={handleConfirm} />
}

export default ConfirmEligibilityModal
