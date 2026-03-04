import { t } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface SettingItemProps {
  icon?: string
  title: string
  subtitle: string
  value?: string | JSX.Element
  action?: string
  actionVariant?: 'muted' | 'danger'
  loading?: boolean
  onAction?(): void
  className?: string
}

const SettingItem = ({
  icon,
  title,
  subtitle,
  value,
  action,
  actionVariant = 'muted',
  loading = false,
  onAction,
  className,
}: SettingItemProps) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center">
        {!!icon ? (
          <img src={`/svgs/${icon}.svg`} height={16} width={16} alt="" />
        ) : (
          <div className="mx-[7px] h-[3px] w-[3px] rounded-full bg-[#808080]" />
        )}
        <div className="ml-3">
          <span>{title}</span>
          <div className="flex items-center text-xs">
            <span className="text-legend">{subtitle}</span>
            {!!value && <span className="ml-1">{value}</span>}
          </div>
        </div>
      </div>
      <div className="ml-4 mt-2">
        {!!action && (
          <Button
            size="sm"
            variant={
              loading
                ? 'default'
                : actionVariant === 'danger'
                  ? 'destructive'
                  : 'muted'
            }
            onClick={onAction}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? t`Loading...` : action}
          </Button>
        )}
      </div>
    </div>
  )
}

export default SettingItem
