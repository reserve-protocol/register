import Spinner from '@/components/ui/spinner'

interface SectionHeaderProps {
  title: string
  count: number
  color?: string
  isLoading?: boolean
}

export const SectionHeader = ({
  title,
  count,
  color = 'base',
  isLoading = false,
}: SectionHeaderProps) => {
  return (
    <div
      className={`flex items-center justify-between mb-6 mx-4 md:mx-6 text-${color}`}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      {isLoading ? (
        <Spinner />
      ) : (
        <span className="text-xl font-semibold">{count}</span>
      )}
    </div>
  )
}
