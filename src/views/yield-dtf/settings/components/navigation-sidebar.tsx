import { t } from '@lingui/macro'
import Navigation from '@/components/section-navigation/section-navigation'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

const NavigationSidebar = ({ className }: { className?: string }) => {
  const sections = useMemo(
    () => [
      t`Roles & Controls`,
      t`Token details`,
      t`Primary basket`,
      t`Emergency basket`,
      t`Revenue share`,
      t`Backing config`,
      t`Other config`,
      t`Governance`,
      t`Contract Addresses`,
    ],
    []
  )

  return (
    <div className={cn('sticky top-0 py-5', className)}>
      <Navigation sections={sections} />
    </div>
  )
}

export default NavigationSidebar
