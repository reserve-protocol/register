import { useCallback } from 'react'
import toast from 'react-hot-toast'
import Notification from 'components/notification'
import { AlertCircle, Check } from 'react-feather'

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
