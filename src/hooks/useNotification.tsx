import { useCallback } from 'react'
import toast from 'react-hot-toast'
import Notification from 'components/notification'
import { AlertCircle, Check } from 'lucide-react'

export const notifySuccess = (title: string, subtitle: string) =>
  toast((t) => (
    <Notification
      title={title}
      subtitle={subtitle}
      toastId={t.id}
      icon={<Check stroke="var(--theme-ui-colors-text" />}
    />
  ))

export const notifyError = (title: string, subtitle: string) =>
  toast((t) => (
    <Notification
      title={title}
      subtitle={subtitle}
      toastId={t.id}
      icon={<AlertCircle stroke="var(--theme-ui-colors-text" />}
    />
  ))

const useNotification = () => {
  return useCallback(
    (title: string, subtitle: string, type?: 'success' | 'error') => {
      let icon: React.ReactNode | undefined = undefined

      if (type) {
        const props = { stroke: 'var(--theme-ui-colors-text' }
        icon =
          type === 'success' ? <Check {...props} /> : <AlertCircle {...props} />
      }

      toast((t) => (
        <Notification
          title={title}
          subtitle={subtitle}
          toastId={t.id}
          icon={icon}
        />
      ))
    },
    []
  )
}

export default useNotification
