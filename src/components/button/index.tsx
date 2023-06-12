import useTransaction from 'hooks/useTransaction'
import { smallButton } from 'theme'
import { Button as ThemeButton, ButtonProps, Spinner, Text } from 'theme-ui'
import { TransactionState } from 'types'

const Button = (props: ButtonProps) => <ThemeButton {...props} />

export interface LoadingButtonProps extends ButtonProps {
  loading: boolean
  loadingText?: string
  text: string
  small?: boolean
}

export interface ExecuteButtonProps
  extends Omit<LoadingButtonProps, 'loading'> {
  tx: TransactionState | null
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
          <Spinner
            sx={{
              color:
                props.variant === 'primary'
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
    </ButtonComponent>
  )
}

export const ExecuteButton = ({
  tx,
  disabled,
  ...props
}: ExecuteButtonProps) => {
  const { execute, canExecute, isExecuting } = useTransaction(tx)

  return (
    <LoadingButton
      loading={isExecuting}
      disabled={!canExecute || disabled}
      onClick={execute}
      {...props}
    />
  )
}

export const SmallButton = ({ sx = {}, ...props }: ButtonProps) => (
  <Button {...props} sx={{ ...smallButton, ...sx }} />
)

export default Button
