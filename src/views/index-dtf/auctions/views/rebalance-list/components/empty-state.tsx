import { Activity } from 'lucide-react'

export const EmptyState = () => {
  return (
    <div className="text-center py-16">
      <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg text-muted-foreground">No rebalances found</p>
    </div>
  )
}