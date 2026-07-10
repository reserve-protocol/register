import { TableCell } from '@/components/ui/table'

export const MarketCapCell = ({ marketCap }: { marketCap?: string }) => (
  <TableCell
    data-testid="overview-basket-mcap"
    className="hidden w-28 whitespace-nowrap py-3 pl-2 pr-0 text-right text-base font-medium sm:table-cell dark:text-muted-foreground"
  >
    {marketCap ? <span>{marketCap}</span> : <span>—</span>}
  </TableCell>
)
