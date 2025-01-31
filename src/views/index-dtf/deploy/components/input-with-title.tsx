import { ReactNode } from 'react'
import BasicInputWithAdditional, {
  BasicInputWithAdditionalProps,
} from './basic-input-with-additionals'

type InputWithTitleProps = BasicInputWithAdditionalProps & {
  title: string
  description: string
  icon: ReactNode
}

const InputWithTitle = ({
  title,
  description,
  icon,
  ...props
}: InputWithTitleProps) => (
  <div
    className="w-full rounded-xl flex flex-col gap-2 justify-between p-4 bg-muted/70"
    key={title}
  >
    <div className="flex items-center gap-2">
      <div className="bg-muted-foreground/10 rounded-full">{icon}</div>

      <div className="flex flex-col">
        <div className="text-base font-bold">{title}</div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {description}
        </div>
      </div>
    </div>
    <BasicInputWithAdditional {...props} />
  </div>
)

export default InputWithTitle
