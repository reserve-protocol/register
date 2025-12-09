import { cn } from '@/lib/utils'
import { FC, ReactNode, useEffect, useState } from 'react'
import { formatPercentage } from 'utils'

interface ProgressBarProps {
  percentage: number
  foregroundText?: ReactNode
  backgroundText?: ReactNode
  height?: number
  width?: number | string
}

const ProgressBar: FC<ProgressBarProps> = ({
  percentage,
  foregroundText,
  backgroundText,
  height = 40,
  width = '100%',
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  const shouldPercentageBeOnForeground = percentage <= 8
  const shouldTextBeOnForeground = percentage >= 40
  const hideBackgroundText = percentage >= 70
  const completed = percentage >= 100

  return (
    <div
      className="relative rounded-lg overflow-hidden border bg-white dark:bg-black border-black dark:border-white"
      style={{ height, width }}
    >
      <div
        className={cn(
          'h-full relative transition-[width] duration-500 ease-in-out',
          completed ? '' : 'bg-black dark:bg-white'
        )}
        style={{
          width: `${Math.min(100, percentage)}%`,
          background: completed
            ? isDarkMode
              ? 'linear-gradient(90deg, rgba(9, 85, 172, 0.00) 0%, rgba(9, 85, 172, 0.40) 100%)'
              : 'linear-gradient(90deg, rgba(9, 85, 172, 0.00) 0%, rgba(9, 85, 172, 0.20) 100%)'
            : undefined,
        }}
      >
        {!shouldTextBeOnForeground && !shouldPercentageBeOnForeground && (
          <span className="hidden md:block absolute top-1/2 right-4 -translate-y-1/2 text-white dark:text-black text-sm font-bold">
            {`${formatPercentage(percentage)}`}
          </span>
        )}
      </div>
      {foregroundText && (
        <span
          className={cn(
            'hidden md:block absolute top-1/2 whitespace-nowrap text-sm',
            shouldTextBeOnForeground ? 'pl-2 pr-4' : 'pl-2 pr-2',
            completed
              ? 'text-foreground'
              : shouldTextBeOnForeground
                ? 'text-white dark:text-black'
                : 'text-foreground'
          )}
          style={{
            left: `${Math.min(100, percentage)}%`,
            transform: shouldTextBeOnForeground
              ? 'translate(-100%, -50%)'
              : 'translateY(-50%)',
          }}
        >
          {foregroundText}
          {(shouldTextBeOnForeground || shouldPercentageBeOnForeground) && (
            <>
              <span className="mx-2">|</span>
              <span
                className={cn(
                  'text-sm font-bold',
                  completed
                    ? 'text-primary'
                    : shouldPercentageBeOnForeground
                      ? 'text-black dark:text-white'
                      : 'text-white dark:text-black'
                )}
              >
                {`${formatPercentage(percentage)}`}
              </span>
            </>
          )}
        </span>
      )}
      {backgroundText && !hideBackgroundText && (
        <span className="hidden md:block absolute top-1/2 right-4 -translate-y-1/2 text-black dark:text-white text-sm">
          {backgroundText}
        </span>
      )}
      <span
        className={cn(
          'block md:hidden absolute top-1/2 right-4 -translate-y-1/2 text-sm whitespace-nowrap',
          completed
            ? 'text-foreground mix-blend-normal'
            : 'text-black dark:text-transparent mix-blend-difference'
        )}
      >
        {foregroundText}
        <>
          <span className="mx-2">|</span>
          <span
            className={cn('text-sm font-bold', completed ? 'text-primary' : '')}
          >
            {`${formatPercentage(percentage)}`}
          </span>
        </>
      </span>
    </div>
  )
}

export default ProgressBar
