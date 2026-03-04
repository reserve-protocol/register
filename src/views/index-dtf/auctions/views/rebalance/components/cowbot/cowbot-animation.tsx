import { cn } from '@/lib/utils'

interface CowbotAnimationProps {
  isRunning: boolean
  showRainbow?: boolean
  className?: string
}

/**
 * Animated cow for CowBot status.
 * Bounces when the bot is actively running.
 * Optional rainbow trail (nyan cat style) when showRainbow is true.
 */
const CowbotAnimation = ({
  isRunning,
  showRainbow,
  className,
}: CowbotAnimationProps) => {
  if (showRainbow) {
    return (
      <div
        className={cn(
          'flex items-center',
          isRunning && 'animate-bounce',
          className
        )}
        style={{ animationDuration: '0.6s' }}
      >
        {/* Rainbow trail - propelling the cow */}
        <div className="flex flex-col justify-center">
          <div className="w-6 h-[2px] bg-red-400" />
          <div className="w-6 h-[2px] bg-orange-400" />
          <div className="w-6 h-[2px] bg-yellow-400" />
          <div className="w-6 h-[2px] bg-green-400" />
          <div className="w-6 h-[2px] bg-blue-400" />
          <div className="w-6 h-[2px] bg-purple-400" />
        </div>

        {/* Cow facing right (mirrored) */}
        <div className="text-3xl select-none -ml-2 scale-x-[-1]">
          <span role="img" aria-label="cow">
            🐄
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'text-2xl select-none transition-transform',
        isRunning && 'animate-bounce',
        className
      )}
      style={{ animationDuration: '1.5s' }}
    >
      <span role="img" aria-label="cow">
        🐄
      </span>
    </div>
  )
}

export default CowbotAnimation
