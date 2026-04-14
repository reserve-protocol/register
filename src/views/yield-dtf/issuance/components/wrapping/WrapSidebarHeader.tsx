import { wrapSidebarAtom } from '@/views/yield-dtf/issuance/atoms'
import { Trans } from '@lingui/macro'
import { useSetAtom } from 'jotai'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const WrapSidebarHeader = () => {
  const close = useSetAtom(wrapSidebarAtom)

  return (
    <>
      <div className="flex items-center shrink-0 px-4 sm:px-8 pt-4">
        <h2 className="text-xl font-semibold mr-1">
          <Trans>Wrap/Unwrap Tokens</Trans>
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto rounded-full"
          onClick={() => close(false)}
        >
          <X />
        </Button>
      </div>
      <div className="border-t border-border my-4" />
    </>
  )
}

export default WrapSidebarHeader
