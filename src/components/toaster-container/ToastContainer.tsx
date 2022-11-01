import { Toaster } from 'react-hot-toast'

const ToastContainer = () => (
  <Toaster
    gutter={20}
    toastOptions={{
      position: 'bottom-right',
      style: {
        width: 300,
        background: 'var(--theme-ui-colors-contentBackground)',
      },
    }}
    containerStyle={{
      top: 40,
      left: 40,
      bottom: 40,
      right: 40,
    }}
  />
)

export default ToastContainer
