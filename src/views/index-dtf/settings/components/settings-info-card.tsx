import CopyValue from '@/components/old/button/CopyValue'
import { Card } from '@/components/ui/card'
import Copy from '@/components/ui/copy'
import { Skeleton } from '@/components/ui/skeleton'
import useScrollTo from '@/hooks/useScrollTo'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const IconWrapper = ({ Component }: { Component: React.ElementType }) => (
  <div className="border rounded-full border-foreground p-2">
    <Component size={14} />
  </div>
)

// TODO: Worth to make re-usable
const InfoCard = ({
  title,
  action,
  children,
  secondary = false,
  className,
  id,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  secondary?: boolean
  className?: string
  id?: string
}) => {
  const scrollTo = useScrollTo(id || '')

  useEffect(() => {
    const section = window.location.hash.slice(1)
    if (section && section === id) {
      scrollTo()
    }
  }, [id, scrollTo])

  return (
    <Card
      id={id}
      className={cn(
        'rounded-4xl flex flex-col bg-secondary',
        secondary && 'bg-muted'
      )}
    >
      <div className="py-4 px-5 flex items-center gap-2">
        <h1 className="font-semibold text-xl text-primary mr-auto">{title}</h1>
        {action}
      </div>
      <div
        className={cn(
          'bg-card mx-1 mb-1 rounded-3xl',
          secondary && 'bg-background',
          className
        )}
      >
        {children}
      </div>
    </Card>
  )
}

const InfoCardItem = ({
  label,
  icon,
  value,
  className,
  address,
  bold = true,
  border = true,
}: {
  label: string
  icon: React.ReactNode
  value?: React.ReactNode
  className?: string
  bold?: boolean
  address?: string
  border?: boolean
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div
      className={cn('flex items-center p-4', className, border && 'border-t')}
    >
      {icon}
      <div className="ml-3 mr-auto">
        <div className="flex items-center">
          <span className="text-legend text-sm">{label}</span>
        </div>
        {!value ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <span className={cn(bold && 'font-bold')}>{value}</span>
        )}
      </div>
      {!!address && (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center bg-muted rounded-full p-1.5">
            <Copy value={address} size={10} />
          </div>
          <Link
            to={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
            target="_blank"
            className="p-1 bg-muted rounded-full"
          >
            <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}

export { InfoCard, InfoCardItem, IconWrapper }
