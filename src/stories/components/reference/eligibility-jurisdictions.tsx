import { useId } from 'react'

import { v1Typography } from '@/components/design-system-v1/typography'
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

export const EligibilityJurisdictions = () => {
  const headingId = useId()

  return (
    <div className="pt-4">
      <p id={headingId} className={cn('mb-2', v1Typography.label)}>
        Jurisdiction-Based Prohibitions:
      </p>
      <ul
        role="list"
        aria-labelledby={headingId}
        className={cn('text-muted-foreground', v1Typography.supporting)}
      >
        {PROHIBITED_JURISDICTIONS.map((jurisdiction, index) => (
          <li key={jurisdiction} className="inline">
            {jurisdiction}
            {index < PROHIBITED_JURISDICTIONS.length - 1 ? '; ' : ''}
          </li>
        ))}
      </ul>
    </div>
  )
}
