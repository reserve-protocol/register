import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import useDTFRestricted from '@/hooks/use-dtf-restricted'
import useGeolocation from '@/hooks/use-geolocation'
import { Trans } from '@lingui/react/macro'
import { ChevronDown, Scale } from 'lucide-react'
import { ReactNode, useState } from 'react'

const ELIGIBILITY_STORAGE_KEY = 'reserve:index-dtf-eligibility:v1'
const TERMS_URL = 'https://reserve.org/terms-and-conditions'
const PRIVACY_URL = `${TERMS_URL}#privacy`

const readEligibilityConfirmation = () => {
  try {
    return localStorage.getItem(ELIGIBILITY_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

const writeEligibilityConfirmation = () => {
  try {
    localStorage.setItem(ELIGIBILITY_STORAGE_KEY, '1')
  } catch { }
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
      className="h-8 w-8 rounded-full"
    />
    <p id={`${id}-label`} className="text-base leading-snug text-foreground">
      {children}
    </p>
    {trailing}
  </div>
)

const ConfirmEligibilityModal = () => {
  const dtfRestriction = useDTFRestricted()
  const geolocation = useGeolocation()
  const [isConfirmed, setIsConfirmed] = useState(readEligibilityConfirmation)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [confirmedJurisdiction, setConfirmedJurisdiction] = useState(false)
  const [confirmedTokenizedStocks, setConfirmedTokenizedStocks] =
    useState(false)

  const isUserRestricted =
    geolocation.isError ||
    geolocation.data?.restricted === true ||
    geolocation.data?.isVPN === true
  const shouldShow =
    !isConfirmed &&
    !geolocation.isLoading &&
    !isUserRestricted &&
    !dtfRestriction.isLoading &&
    !dtfRestriction.isError &&
    dtfRestriction.data?.restricted === true
  const canConfirm =
    acceptedTerms && confirmedJurisdiction && confirmedTokenizedStocks

  if (!shouldShow) return null

  const handleConfirm = () => {
    if (!canConfirm) return

    writeEligibilityConfirmation()
    setIsConfirmed(true)
  }

  return (
    <Dialog open>
      <DialogContent
        className='p-2 rounded-4xl'
        restrict
        showClose={false}
      >
        <DialogTitle className="sr-only">
          <Trans>Verify your eligibility</Trans>
        </DialogTitle>
        <DialogDescription className="sr-only">
          <Trans>Before continuing, please confirm the following.</Trans>
        </DialogDescription>

        <div className='p-4 pb-2'>
          <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-foreground">
            <Scale className="h-5 w-5" strokeWidth={1.5} />
          </div>

          <div className="text-primary">
            <Trans>Verify your eligibility</Trans>
          </div>
          <h2 className="text-xl font-semibold leading-tight">
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

          <EligibilityCheck
            id="eligibility-jurisdiction"
            checked={confirmedJurisdiction}
            onCheckedChange={setConfirmedJurisdiction}
            trailing={
              <ChevronDown className="ml-auto h-5 w-5 shrink-0 rounded-full bg-muted p-1 text-muted-foreground" />
            }
          >
            <Trans>
              I confirm I am not located in, a resident of, or a citizen of a{' '}
              <a
                className="text-primary underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
                href={TERMS_URL}
              >
                restricted jurisdiction
              </a>
              .
            </Trans>
          </EligibilityCheck>

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

export default ConfirmEligibilityModal
