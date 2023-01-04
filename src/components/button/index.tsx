import { smallButton } from 'theme'
import { Button as ThemeButton, ButtonProps, Spinner, Text } from 'theme-ui'

const Button = (props: ButtonProps) => <ThemeButton {...props} />

interface LoadingButtonProps extends ButtonProps {
  loading: boolean
  loadingText?: string
  text: string
  small?: boolean
}

export const LoadingButton = ({
  loading,
  text,
  onClick,
  loadingText = 'Pending, Sign in wallet',
  small = false,
  ...props
}: LoadingButtonProps) => {
  const ButtonComponent = small ? SmallButton : Button

  return (
    <ButtonComponent
      variant="accent"
      onClick={(e) => {
        if (!loading && onClick) onClick(e)
      }}
      {...props}
    >
      {loading ? (
        <Text
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spinner sx={{ color: '--theme-ui-colors-text' }} size={14} mr={2} />{' '}
          {loadingText}
        </Text>
      ) : (
        <Text>{text}</Text>
      )}
    </ButtonComponent>
  )
}
export const SmallButton = ({ sx = {}, ...props }: ButtonProps) => (
  <Button {...props} sx={{ ...smallButton, ...sx }} />
)

export default Button
