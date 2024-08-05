import { FC, ReactNode } from 'react'
import { Box, Text, useColorMode } from 'theme-ui'
import { formatPercentage } from 'utils'

interface ProgressBarProps {
  percentage: number
  foregroundText?: ReactNode
  backgroundText?: ReactNode
  height?: number
  width?: number | string
}

const ProgressBar: FC<ProgressBarProps> = ({
  percentage,
  foregroundText,
  backgroundText,
  height = 40,
  width = '100%',
}) => {
  const [colorMode] = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const shouldPercentageBeOnForeground = percentage <= 8
  const shouldTextBeOnForeground = percentage >= 40
  const hideBackgroundText = percentage >= 70
  const completed = percentage >= 100

  return (
    <Box
      sx={{
        background: 'progressBar',
        position: 'relative',
        height,
        width,
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'progressBarBackground',
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${Math.min(100, percentage)}%`,
          background: completed
            ? isDarkMode
              ? 'linear-gradient(90deg, rgba(9, 85, 172, 0.00) 0%, rgba(9, 85, 172, 0.40) 100%)'
              : 'linear-gradient(90deg, rgba(9, 85, 172, 0.00)0%, rgba(9, 85, 172, 0.20)100%)'
            : 'progressBarBackground',
          transition: 'width 0.5s ease-in-out',
          position: 'relative',
        }}
      >
        {!shouldTextBeOnForeground && !shouldPercentageBeOnForeground && (
          <Text
            sx={{
              display: ['none', 'none', 'block'],
              position: 'absolute',
              top: '50%',
              right: 3,
              transform: 'translateY(-50%)',
              color: 'progressBar',
              fontSize: 1,
              fontWeight: 'bold',
            }}
          >
            {`${formatPercentage(percentage)}`}
          </Text>
        )}
      </Box>
      {foregroundText && (
        <Text
          sx={{
            display: ['none', 'none', 'block'],
            position: 'absolute',
            top: '50%',
            left: `${Math.min(100, percentage)}%`,
            transform: shouldTextBeOnForeground
              ? 'translate(-100%, -50%)'
              : 'translateY(-50%)',
            color: completed
              ? 'text'
              : shouldTextBeOnForeground
              ? 'progressBar'
              : 'text',
            fontSize: 1,
            paddingLeft: shouldTextBeOnForeground ? 2 : 2,
            paddingRight: shouldTextBeOnForeground ? 3 : 2,
            whiteSpace: 'nowrap',
          }}
        >
          {foregroundText}
          {(shouldTextBeOnForeground || shouldPercentageBeOnForeground) && (
            <>
              <Text sx={{ mx: 2 }}>|</Text>
              <Text
                sx={{
                  color: completed
                    ? 'accentInverted'
                    : shouldPercentageBeOnForeground
                    ? 'progressBarBackground'
                    : 'progressBar',
                  fontSize: 1,
                  fontWeight: 'bold',
                }}
              >
                {`${formatPercentage(percentage)}`}
              </Text>
            </>
          )}
        </Text>
      )}
      {backgroundText && !hideBackgroundText && (
        <Text
          sx={{
            display: ['none', 'none', 'block'],
            position: 'absolute',
            top: '50%',
            right: 3,
            transform: 'translateY(-50%)',
            color: 'progressBarBackground',
            fontSize: 1,
          }}
        >
          {backgroundText}
        </Text>
      )}
      <Text
        sx={{
          display: ['block', 'block', 'none'],
          position: 'absolute',
          top: '50%',
          right: 3,
          transform: 'translateY(-50%)',
          fontSize: 1,
          whiteSpace: 'nowrap',
          color: completed ? 'text' : !isDarkMode ? 'progressBar' : 'none',
          mixBlendMode: completed ? 'normal' : 'difference',
        }}
      >
        {foregroundText}
        <>
          <Text sx={{ mx: 2 }}>|</Text>
          <Text
            sx={{
              fontSize: 1,
              fontWeight: 'bold',
              color: completed ? 'accentInverted' : 'inherit',
            }}
          >
            {`${formatPercentage(percentage)}`}
          </Text>
        </>
      </Text>
    </Box>
  )
}

export default ProgressBar
