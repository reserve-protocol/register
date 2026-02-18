import { t, Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useAtom, useAtomValue } from 'jotai'
import { cn } from '@/lib/utils'
import {
  autoRegisterBasketAssetsAtom,
  basketChangesAtom,
  isNewBasketProposedAtom,
} from '../atoms'
import ListItemPreview from './ListItemPreview'
import PreviewBox from './PreviewBox'

interface Props {
  className?: string
}

const ProposedBasketPreview = ({ className }: Props) => {
  const [isNewBasketProposed, setProposeNewBasket] = useAtom(
    isNewBasketProposedAtom
  )
  const [autoRegister, setAutoRegister] = useAtom(autoRegisterBasketAssetsAtom)
  const basketChanges = useAtomValue(basketChangesAtom)

  if (!isNewBasketProposed) {
    return null
  }

  return (
    <>
      <div
        className={cn(
          'border border-border rounded-xl p-6',
          className
        )}
      >
        <div className="flex items-center">
          <span className="font-semibold text-warning">
            <Trans>New primary basket</Trans>
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setProposeNewBasket(false)}
            className="ml-auto"
          >
            <Trans>Revert</Trans>
          </Button>
        </div>
        <label>
          <div className="flex items-center mt-2 gap-2">
            <Checkbox
              checked={autoRegister}
              onCheckedChange={() => setAutoRegister(!autoRegister)}
            />
            <span className="font-semibold">Generate Asset Registry calls</span>
          </div>
        </label>
      </div>
      {!!basketChanges.length && (
        <PreviewBox
          className="border border-border rounded-xl p-6 mt-6"
          count={basketChanges.length}
          title={t`Primary basket`}
        >
          {basketChanges.map((change, index) => (
            <ListItemPreview
              className="mt-4"
              isNew={change.isNew}
              label={change.collateral.symbol}
              key={index}
            />
          ))}
        </PreviewBox>
      )}
    </>
  )
}

export default ProposedBasketPreview
