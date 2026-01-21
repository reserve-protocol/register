import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import SectionWrapper from '@/components/section-navigation/section-wrapper'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import BackingForm from './BackingForm'
import OtherForm from './OtherForm'
import TokenForm from './TokenForm'

interface TokenConfigurationProps {
  className?: string
}

/**
 * View: Deploy -> Token setup
 * Display token forms
 */
const TokenConfiguration = ({ className }: TokenConfigurationProps) => {
  const [advanceConfig, setAdvanceConfig] = useState(false)

  return (
    <SectionWrapper navigationIndex={2}>
      <Card className={`p-4 bg-secondary ${className || ''}`}>
        <TokenForm />
        <Separator className="my-4 -mx-4 border-muted" />
        <div className="flex items-center mt-3">
          <span className="text-xl font-medium">
            <Trans>Advanced config:</Trans>
          </span>
          <span className="mx-2 text-xl font-medium text-legend">
            <Trans>15 params</Trans>
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAdvanceConfig(!advanceConfig)}
            className="ml-auto"
          >
            <div className="flex items-center">
              <Trans>Customize</Trans>
              {advanceConfig ? (
                <ChevronUp className="ml-2" size={14} />
              ) : (
                <ChevronDown className="ml-2" size={14} />
              )}
            </div>
          </Button>
        </div>
        {advanceConfig && (
          <>
            <BackingForm className="my-4" />
            <OtherForm />
          </>
        )}
      </Card>
    </SectionWrapper>
  )
}

export default TokenConfiguration
