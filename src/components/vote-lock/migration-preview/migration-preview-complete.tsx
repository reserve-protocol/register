import { Button } from '@/components/ui/button'

type Props = {
  tokenSymbol: string
  receivedRsrAmount: string
  onDone: () => void
}

export function MigrationPreviewComplete({
  tokenSymbol,
  receivedRsrAmount,
  onDone,
}: Props) {
  return (
    <>
      <div className="mx-4 mt-1 border-t border-border pb-2 pt-4">
        <p className="text-sm text-legend">Amount locked</p>
        <p className="mt-1 text-2xl font-medium tabular-nums text-foreground">
          {receivedRsrAmount}{' '}
          <span className="text-xl font-normal text-legend">{tokenSymbol}</span>
        </p>
      </div>
      <Button className="mt-2 h-[49px] w-full rounded-xl" onClick={onDone}>
        Done
      </Button>
    </>
  )
}
