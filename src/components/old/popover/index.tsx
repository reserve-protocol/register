import { Options, Placement } from '@popperjs/core'
import useOnClickOutside from 'hooks/useOnClickOutside'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePopper } from 'react-popper'
import { createPortal } from 'react-dom'
import { StringMap } from 'types'
import { Box, BoxProps } from 'theme-ui'
import useInterval from '@/hooks/useInterval'

const PopoverContainer = React.forwardRef<
  HTMLDivElement,
  BoxProps & { show: boolean }
>(({ show, sx, ...props }, ref) => (
  <Box
    ref={ref}
    sx={{
      zIndex: 100010,
      visibility: show ? 'visible' : 'hidden',
      opacity: show ? 1 : 0,
      transition: 'visibility 150ms linear, opacity 150ms linear',
      ...sx,
    }}
    {...props}
  />
))

const Arrow = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ sx, ...props }, ref) => (
    <Box
      ref={ref}
      sx={{
        width: '8px',
        height: '8px',
        zIndex: 100010,
        '&::before': {
          position: 'absolute',
          width: '8px',
          height: '8px',
          zIndex: 9998,
          content: '""',
          border: '1px solid black',
          transform: 'rotate(45deg)',
          background: 'white',
        },
        '&.arrow-top': {
          bottom: '-5px',
          '&::before': {
            borderTop: 'none',
            borderLeft: 'none',
          },
        },
        '&.arrow-bottom': {
          top: '-5px',
          '&::before': {
            borderBottom: 'none',
            borderRight: 'none',
          },
        },
        '&.arrow-left': {
          right: '-5px',
          '&::before': {
            borderBottom: 'none',
            borderLeft: 'none',
          },
        },
        '&.arrow-right': {
          left: '-5px',
          '&::before': {
            borderRight: 'none',
            borderTop: 'none',
          },
        },
      }}
      {...props}
    />
  )
)

export interface PopoverProps {
  content: React.ReactNode
  zIndex?: number
  show: boolean
  children: React.ReactNode
  placement?: Placement
  arrow?: boolean
  onDismiss?: () => void
  containerProps?: StringMap
}

export default function Popover({
  zIndex = 100010,
  content,
  show,
  children,
  placement = 'auto',
  arrow = false,
  onDismiss = undefined,
}: PopoverProps) {
  const [referenceElement, setReferenceElement] =
    useState<HTMLDivElement | null>(null)
  const popperElement = useRef<HTMLDivElement>(null)
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)

  const options = useMemo(
    (): Options => ({
      placement,
      strategy: 'fixed',
      modifiers: [
        { name: 'offset', options: { offset: [8, 8] } },
        { name: 'arrow', options: { element: arrowElement } },
        { name: 'preventOverflow', options: { padding: 8 } },
      ],
    }),
    [arrowElement, placement]
  )

  const handleDismiss = (event: TouchEvent | MouseEvent) => {
    if (referenceElement?.contains(event.target as Node)) {
      return
    }

    return onDismiss && onDismiss()
  }

  // Only applicable if onDismiss is send
  useOnClickOutside(popperElement, handleDismiss)

  const { styles, update, attributes } = usePopper(
    referenceElement,
    popperElement.current,
    options
  )

  const updateCallback = useCallback(() => {
    if (update) {
      update()
    }
  }, [update])
  useInterval(updateCallback, show ? 200 : null)

  useEffect(() => {
    if (show) {
      updateCallback()
    }
  }, [show])

  return (
    <>
      <Box ref={(element: HTMLDivElement) => setReferenceElement(element)}>
        {children}
      </Box>
      {createPortal(
        <PopoverContainer
          show={show}
          ref={popperElement}
          style={{ ...styles.popper, zIndex }}
          {...attributes.popper}
        >
          {content}
          {arrow && (
            <Arrow
              className={`arrow-${
                attributes.popper?.['data-popper-placement'] ?? ''
              }`}
              ref={setArrowElement as any}
              style={styles.arrow}
              {...attributes.arrow}
            />
          )}
        </PopoverContainer>,
        document.body
      )}
    </>
  )
}
