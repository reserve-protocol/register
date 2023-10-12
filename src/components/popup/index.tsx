import { Box } from 'theme-ui'
import Popover, { PopoverProps } from 'components/popover'

const Popup = ({ content, containerProps = {}, ...props }: PopoverProps) => {
  return (
    <Popover
      {...props}
      content={
        <Box
          {...containerProps}
          sx={{
            backgroundCcolor: 'contentBackground',
            border: '1px solid',
            borderColor: 'invertedText',
            borderRadius: '14px',
            boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.2)',
            ...(containerProps.sx || {}),
          }}
        >
          {content}
        </Box>
      }
    />
  )
}

export default Popup
