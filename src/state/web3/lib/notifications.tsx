import toast from 'react-hot-toast'
import Notification from 'components/notification'
import { AlertCircle, Check } from 'react-feather'

export const success = (title: string, subtitle: string) => {
  toast((t) => (
    <Notification
      title={title}
      subtitle={subtitle}
      toastId={t.id}
      icon={<Check />}
    />
  ))
}

export const error = (title: string, subtitle: string) => {
  toast((t) => (
    <Notification
      title={title}
      subtitle={subtitle}
      toastId={t.id}
      icon={<AlertCircle />}
    />
  ))
}
