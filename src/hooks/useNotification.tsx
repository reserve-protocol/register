import Notification from 'components/notification'
import { AlertCircle, Check } from 'lucide-react'
import { ReactNode, useCallback } from 'react'
import { toast } from 'sonner'

export const notifySuccess = (title: string, subtitle: string) =>
  toast.success(title, {
    description: subtitle,
  })

export const notifyError = (title: string, subtitle: string) =>
  toast.error(title, {
    description: subtitle,
  })

const useNotification = () => {
  return useCallback(
    (
      title: string,
      subtitle: string,
      type?: 'success' | 'error',
      icon?: ReactNode
    ) => {
      let _icon: ReactNode | undefined = icon

      if (type && !_icon) {
        const props = { stroke: 'var(--theme-ui-colors-text' }
        _icon =
          type === 'success' ? <Check {...props} /> : <AlertCircle {...props} />
      }

      toast(<Notification title={title} subtitle={subtitle} icon={_icon} />)
    },
    []
  )
}

export default useNotification
