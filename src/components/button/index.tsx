import { smallButton } from 'theme'
import { Button as ThemeButton, ButtonProps, Spinner, Text } from 'theme-ui'

const Button = (props: ButtonProps) => <ThemeButton {...props} />

interface LoadingButtonProps extends ButtonProps {
  loading: boolean
  loadingText?: string
  text: string
}

export const LoadingButton = ({
  loading,
  text,
  onClick,
  loadingText = 'Pending, Sign in wallet',
  ...props
}: LoadingButtonProps) => (
  <Button
    variant="accentAction"
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
        <Spinner sx={{ color: '#fff' }} size={14} mr={2} /> {loadingText}
      </Text>
    ) : (
      <Text>{text}</Text>
    )}
  </Button>
)

export const SmallButton = ({ sx = {}, ...props }: ButtonProps) => (
  <Button {...props} sx={{ ...smallButton, ...sx }} />
)

export default Button
