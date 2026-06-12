import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import useComplianceRestrictions from '@/hooks/use-compliance-restrictions'
import { cn } from '@/lib/utils'
import { Trans } from '@lingui/react/macro'

const ComplianceAlert = ({ className }: { className?: string }) => {
  const { isLoading, data } = useComplianceRestrictions()

  if (isLoading || !data?.restricted) return null

  return (
    <Alert
      variant="destructive"
      className={cn('rounded-3xl mb-4 text-sm sm:w-[420px] mx-auto', className)}
    >
      <AlertTitle>{data.title}</AlertTitle>
      <AlertDescription>
        {data.description}{' '}
        <Trans>
          For more information, see our{' '}
          <a
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://reserve.org/terms-and-conditions"
          >
            Terms of Use
          </a>
          .
        </Trans>
      </AlertDescription>
    </Alert>
  )
}

export default ComplianceAlert
