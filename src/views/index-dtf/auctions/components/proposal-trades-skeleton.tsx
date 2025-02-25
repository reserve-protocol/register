import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Spinner from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2 ml-2 lg:ml-0 mr-2 mb-5">
    <div className="flex flex-col gap-4 text-primary items-center justify-center rounded-3xl bg-secondary h-[620px] max-h-[calc(100vh-166px)] lg:max-h-[calc(100vh-92px)]">
      <Spinner size={24} />
      <h2 className="font-semibold">Loading trades...</h2>
    </div>
    <div className="flex flex-col gap-1 rounded-3xl p-1 bg-secondary h-fit">
      <div className="rounded-3xl bg-background p-2">
        <Button disabled className="w-full">
          No trades selected
        </Button>
      </div>
      <div className="rounded-3xl bg-background">
        <div className="p-4">
          <span className="font-bold text-primary">Simulated Basket</span>
        </div>
        <div className="bg-card p-1 rounded-3xl">
          <Table className="[&_td]:text-center [&_th]:text-center  [&_th:first-child]:rounded-tl-3xl [&_th:last-child]:rounded-tr-3xl [&_tr:last-child_td:first-child]:rounded-bl-3xl [&_tr:last-child_td:last-child]:rounded-br-3xl">
            <TableHeader>
              <TableRow>
                <TableHead className="border-r"></TableHead>
                <TableHead>Current</TableHead>
                <TableHead className="bg-primary/10">Expected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="border-r">
                    <div className="h-6 w-6 rounded-full bg-foreground" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-full h-6" />
                  </TableCell>
                  <TableCell className="bg-primary/10">
                    <Skeleton className="w-full h-6 bg-primary" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  </div>
)

const ProposalTradesSkeleton = ({ loading }: { loading: boolean }) => {
  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="flex h-[calc(100vh-180px)] lg:h-[calc(100vh-72px)] w-full">
      <div className="flex flex-col items-center justify-center m-4 flex-grow border-none lg:border-dashed border-2 border-foreground/40 rounded-3xl">
        <h1 className="font-bold text-xl mt-2">
          No available/upcoming auctions
        </h1>
        <p className="text-center text-legend max-w-96">
          New auctions show up here as soon as they are approved by governance
        </p>
      </div>
    </div>
  )
}

export default ProposalTradesSkeleton
