import useMediaQuery from '@/hooks/useMediaQuery'
import useIsDarkMode from '@/hooks/use-is-dark-mode'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography } from '@/components/design-system-v1/typography'
import { BRIEF_TOAST_DURATION_MS, VISIBLE_TOAST_LIMIT } from './toast-policy'
import { cn } from '@/lib/utils'
import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({
  className,
  icons,
  style,
  toastOptions,
  ...props
}: ToasterProps) => {
  const isDarkMode = useIsDarkMode()
  const isDesktop = useMediaQuery('(min-width: 1400px)')

  return (
    <Sonner
      closeButton
      duration={BRIEF_TOAST_DURATION_MS}
      visibleToasts={VISIBLE_TOAST_LIMIT}
      pauseWhenPageIsHidden
      position="top-center"
      style={{
        ...(isDesktop
          ? {
              position: 'fixed',
              left: '50%',
              marginLeft: '516px',
              marginTop: '46px',
            }
          : {}),
        ...style,
      }}
      theme={isDarkMode ? 'dark' : 'light'}
      icons={{
        success: (
          <span className="flex size-8 items-center justify-center rounded-full bg-feedback-success-border text-feedback-success-foreground">
            <CircleCheck className="size-4 stroke-[1.5]" />
          </span>
        ),
        error: (
          <span className="flex size-8 items-center justify-center rounded-full bg-feedback-danger-border text-feedback-danger-foreground">
            <CircleAlert className="size-4 stroke-[1.5]" />
          </span>
        ),
        close: <X className="size-4" />,
        ...icons,
      }}
      className={cn(
        'toaster group w-80 max-w-[calc(100vw-2rem)] [&_[data-sonner-toast][data-visible=false]]:invisible',
        className
      )}
      toastOptions={{
        ...toastOptions,
        unstyled: toastOptions?.unstyled ?? true,
        classNames: {
          toast:
            'group toast relative flex min-h-14 w-full items-center gap-2 rounded-lg p-3 pr-12 text-foreground shadow-sm ring-1 ring-inset',
          success: cn(
            roles.feedback.success.surface,
            roles.feedback.success.border
          ),
          error: cn(
            roles.feedback.danger.surface,
            roles.feedback.danger.border
          ),
          info: cn(
            roles.feedback.information.surface,
            roles.feedback.information.border
          ),
          warning: cn(
            roles.feedback.warning.surface,
            roles.feedback.warning.border
          ),
          loading: 'bg-card ring-border',
          default: 'bg-card ring-border',
          icon: 'flex size-8 shrink-0 items-center justify-center !m-0 [&_svg]:m-0',
          content: 'flex min-w-0 flex-1 flex-col gap-1',
          title: v1Typography.label,
          description: cn(v1Typography.supporting, roles.text.supporting),
          closeButton: cn(
            'absolute !left-auto !right-0.5 !top-1/2 !size-11 !-translate-y-1/2 !rounded-full !border-0 !bg-transparent text-foreground hover:!bg-transparent active:!bg-transparent [&>svg]:size-4',
            roles.focus.visibleInset
          ),
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
