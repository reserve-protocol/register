import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { mediumButton, smallButton } from 'theme'
import {
  Button as ThemeButton,
  ButtonProps as _ButtonProps,
  Spinner,
  Text,
} from 'theme-ui'

export interface ButtonProps extends _ButtonProps {
  small?: boolean
  medium?: boolean
  fullWidth?: boolean
}

const Button = ({
  sx = {},
  small,
  medium,
  fullWidth,
  ...props
}: ButtonProps) => {
  let styles = sx

  if (small) {
    styles = { ...sx, ...smallButton }
  } else if (medium) {
    styles = { ...sx, ...mediumButton }
  }

  if (fullWidth) {
    styles = { ...styles, width: '100%' }
  }

  return <ThemeButton {...props} sx={styles} />
}

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
  text: ReactNode
}

export const LoadingButton = ({
  loading,
  text,
  onClick,
  loadingText = 'Pending, Sign in wallet',
  ...props
}: LoadingButtonProps) => (
  <Button
    variant="primary"
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
        <Spinner
          sx={{
            color:
              props.variant === undefined || props.variant === 'primary'
                ? 'white'
                : '--theme-ui-colors-text',
          }}
          size={14}
          mr={2}
        />{' '}
        {loadingText}
      </Text>
    ) : (
      <Text>{text}</Text>
    )}
  </Button>
)

export const SmallButton = ({ sx = {}, ...props }: ButtonProps) => (
  <Button {...props} sx={{ ...smallButton, ...sx }} />
)

export const Closebutton = (props: ButtonProps) => (
  <Button variant="circle">
    <X />
  </Button>
)

export default Button
