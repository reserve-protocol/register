import { ReactNode } from 'react'
import BasicInputWithAdditional, {
  BasicInputWithAdditionalProps,
} from './basic-input-with-additionals'
import { useAtomValue } from 'jotai'
import { walletAtom } from '@/state/atoms'
import { Button } from '@/components/ui/button'
import { useFormContext } from 'react-hook-form'

type InputWithTitleProps = BasicInputWithAdditionalProps & {
  title: string
  description: ReactNode
  icon: ReactNode
}

const InputWithTitle = ({
  title,
  description,
  icon,
  ...props
}: InputWithTitleProps) => {
  const wallet = useAtomValue(walletAtom)
  const { setValue } = useFormContext()
  const onUseConnected = () => {
    if (!wallet) return
    return setValue(props.fieldName + '[0]', wallet)
  }
  return (
    <div
      className="w-full rounded-xl flex flex-col gap-2 justify-between p-4 bg-muted/70"
      key={title}
    >
      <div className="flex items-center gap-2">
        <div className="p-2 border border-foreground rounded-full">{icon}</div>

        <div className="flex flex-col">
          <div className="text-base font-bold">{title}</div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <div>
              {description}{' '}
              {wallet ? (
                <Button
                  variant="link"
                  className="text-primary p-0 h-auto inline-block"
                  onClick={onUseConnected}
                >
                  Use connected wallet.
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <BasicInputWithAdditional {...props} />
    </div>
  )
}

export default InputWithTitle
