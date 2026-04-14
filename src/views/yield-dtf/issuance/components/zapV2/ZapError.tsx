import { ReactNode } from 'react'

export type ZapErrorType = {
  title: string
  message: ReactNode
  color: string
  secondaryColor: string
  submitButtonTitle?: string
  disableSubmit?: boolean
}

const ZapError = ({ error }: { error?: ZapErrorType }) => {
  if (!error) return null

  return (
    <div
      className="flex flex-col gap-3 rounded-lg border w-full p-4"
      style={{ borderColor: error.secondaryColor }}
    >
      <span className="font-bold" style={{ color: error.color }}>
        {error.title}
      </span>
      <span className="text-sm">{error.message}</span>
    </div>
  )
}

export default ZapError
