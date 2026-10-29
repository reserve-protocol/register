import { ReactNode, useCallback } from 'react'
import { toast } from 'sonner'
import { DETAILED_ERROR_TOAST_DURATION_MS } from '@/components/ui/toast-policy'

export const notifySuccess = (title: string, subtitle: string) =>
  toast.success(title, {
    description: subtitle,
  })

export const notifyError = (title: string, subtitle: string) =>
  toast.error(title, {
    description: subtitle,
    duration: DETAILED_ERROR_TOAST_DURATION_MS,
  })

const useNotification = () => {
  return useCallback(
    (
      title: string,
      subtitle: string,
      type?: 'success' | 'error',
      icon?: ReactNode
    ) => {
      const options = { description: subtitle, icon }
      if (type === 'error') {
        toast.error(title, {
          ...options,
          duration: DETAILED_ERROR_TOAST_DURATION_MS,
        })
        return
      }
      if (type === 'success') {
        toast.success(title, options)
        return
      }
      toast(title, options)
    },
    []
  )
}

export default useNotification
