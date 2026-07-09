import ChainLogo from '@/components/icons/ChainLogo'
import { cn } from '@/lib/utils'
import { useLingui } from '@lingui/react/macro'
import type { Dispatch, SetStateAction } from 'react'
import type { ChainVersion } from './types'

export const ChainTabs = ({
  chainTabs,
  selectedVersionIndex,
  setSelectedVersionIndex,
}: {
  chainTabs: ChainVersion[]
  selectedVersionIndex: number
  setSelectedVersionIndex: Dispatch<SetStateAction<number>>
}) => {
  const { t } = useLingui()

  return (
    <div
      className="absolute right-0 top-0 z-20"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <div className="inline-flex items-center gap-2">
        <div
          role="tablist"
          aria-label={t`Highlighted card chain`}
          className={cn(
            'inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-[2px] py-0.5 transition-colors',
            'dark:border dark:border-foreground dark:bg-secondary dark:group-hover:border-secondary',
            'lg:group-hover lg:group-hover:bg-muted'
          )}
        >
          {chainTabs.map((version, index) => (
            <button
              key={`${version.chainId}-${version.address}-tab`}
              type="button"
              role="tab"
              aria-selected={index === selectedVersionIndex}
              className={cn(
                'inline-flex h-7 items-center justify-center gap-0 whitespace-nowrap rounded-full px-3 text-xs font-medium text-legend transition-[background-color,color,gap,padding]',
                'hover:text-foreground',
                'lg:group-hover:gap-1 lg:group-hover:px-2 lg:group-hover:pr-3',
                index === selectedVersionIndex &&
                  'bg-background text-foreground dark:bg-foreground lg:group-hover:bg-card dark:group-hover:bg-foreground dark:group-hover:text-background',
                index !== selectedVersionIndex && 'hover:bg-background'
              )}
              onClick={() => setSelectedVersionIndex(index)}
            >
              <ChainLogo
                chain={version.chainId}
                width={16}
                height={16}
                className="shrink-0 rounded-md border-2 border-card dark:border-none"
              />
              <span className="max-w-0 overflow-hidden opacity-0 transition-[max-width,opacity] duration-150 ease-out lg:group-hover:max-w-12 lg:group-hover:opacity-100">
                {version.versionLabel}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
