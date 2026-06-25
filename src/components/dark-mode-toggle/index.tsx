import { useLingui } from '@lingui/react/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { themeModeAtom, toggleThemeAtom } from './atoms'

const properties = {
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
}

const TRANSITION = 'all 400ms cubic-bezier(0.5, 0, 0.2, 1)'

const DarkModeToggle = () => {
  const mode = useAtomValue(themeModeAtom)
  const toggleTheme = useSetAtom(toggleThemeAtom)
  const { t } = useLingui()

  const { r, transform, cx, cy, opacity } = properties[mode]

  return (
    <button
      type="button"
      aria-label={t`Toggle theme`}
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform,
          transition: TRANSITION,
        }}
      >
        <mask id="themeMode">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <circle
            cx={cx}
            cy={cy}
            r="10"
            fill="black"
            style={{ transition: TRANSITION }}
          />
        </mask>

        <circle
          cx="12"
          cy="12"
          r={r}
          fill="currentColor"
          mask="url(#themeMode)"
          style={{ transition: TRANSITION }}
        />
        <g stroke="currentColor" style={{ opacity, transition: TRANSITION }}>
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </button>
  )
}

export default DarkModeToggle
