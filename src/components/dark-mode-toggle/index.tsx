import { animated, useSpring } from '@react-spring/web'
import { useEffect } from 'react'

export const MODES = {
  LIGHT: 'light',
  DARK: 'dark',
}

const properties: { [x: string]: any } = {
  light: {
    r: 9,
    transform: 'rotate(40deg)',
    cx: 12,
    cy: 4,
    opacity: 0,
  },
  dark: {
    r: 5,
    transform: 'rotate(90deg)',
    cx: 30,
    cy: 0,
    opacity: 1,
  },
  springConfig: { mass: 4, tension: 250, friction: 35 },
}

const DarkModeToggle = ({
  mode,
  onToggle,
}: {
  mode: string
  onToggle(colorMode: string): void
}) => {
  const { r, transform, cx, cy, opacity } = properties[mode]

  const svgContainerProps = useSpring({
    transform,
    config: properties.springConfig,
  })
  const centerCircleProps = useSpring({ r, config: properties.springConfig })
  const maskedCircleProps = useSpring({
    cx,
    cy,
    config: properties.springConfig,
  })
  const linesProps = useSpring({ opacity, config: properties.springConfig })

  const handleToggle = () => {
    document.documentElement.setAttribute(
      'data-color-mode',
      mode === MODES.LIGHT ? 'dark' : 'light'
    )
    onToggle(mode === MODES.LIGHT ? MODES.DARK : MODES.LIGHT)
  }

  useEffect(() => {
    if (mode !== document.documentElement.getAttribute('data-color-mode')) {
      document.documentElement.setAttribute('data-color-mode', mode)
    }
  }, [])

  return (
    <animated.svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      // stroke="currentColor"
      onClick={handleToggle}
      style={{
        cursor: 'pointer',
        ...svgContainerProps,
      }}
    >
      <mask id="themeMode">
        <rect x="0" y="0" width="100%" height="100%" fill="white" />
        <animated.circle style={maskedCircleProps as any} r="10" fill="black" />
      </mask>

      <animated.circle
        cx="12"
        cy="12"
        style={centerCircleProps as any}
        fill="currentColor"
        mask="url(#themeMode)"
      />
    <animated.g stroke="currentColor" style={linesProps}>
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </animated.g>
    </animated.svg>
  )
}

export default DarkModeToggle
