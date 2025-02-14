import useMediaQuery from '@/hooks/useMediaQuery'
import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()
  const isDesktop = useMediaQuery('(min-width: 1400px)')

  return (
    <Sonner
      closeButton
      duration={6000}
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
      theme={theme as ToasterProps['theme']}
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
