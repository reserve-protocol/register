interface SectionHeaderProps {
  title: string
  count: number
  color?: string
}

export const SectionHeader = ({
  title,
  count,
  color = 'base',
}: SectionHeaderProps) => {
  return (
    <div
      className={`flex items-center justify-between mb-6 mx-4 md:mx-6 text-${color}`}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <span className="text-xl font-semibold">{count}</span>
    </div>
  )
}
