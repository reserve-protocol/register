import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

const Layout = ({ children, className }: LayoutProps) => (
  <div
    id="rtoken-setup-container"
    className={cn(
      'grid h-full relative content-start items-start gap-8 px-2 sm:px-6 lg:px-8',
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[200px_1fr_440px]',
      '[&>div:first-of-type]:hidden xl:[&>div:first-of-type]:block',
      className
    )}
  >
    {children}
  </div>
)

export default Layout
