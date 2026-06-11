import useMediaQuery from '@/hooks/useMediaQuery'
import useIsDarkMode from '@/hooks/use-is-dark-mode'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const isDarkMode = useIsDarkMode()
  const isDesktop = useMediaQuery('(min-width: 1400px)')

  return (
    <Sonner
      closeButton
      position="top-center"
      style={{
        ...(isDesktop
          ? {
              maxWidth: '1400',
              position: 'fixed',
              left: '50%',
              marginLeft: '516px',
              marginTop: '46px',
            }
          : {}),
      }}
      theme={isDarkMode ? 'dark' : 'light'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
