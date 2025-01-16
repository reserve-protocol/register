import { ReactNode } from 'react'
import BasicInput, { BasicInputProps } from './basic-input'

type InputWithTitleProps = BasicInputProps & {
  title: string
  description: string
  icon: ReactNode
  children?: ReactNode
}

const InputWithTitle = ({
  title,
  description,
  icon,
  children,
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
    <BasicInput {...props} />
    {children}
  </div>
)

export default InputWithTitle
