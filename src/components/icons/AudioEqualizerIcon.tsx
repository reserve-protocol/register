import { SVGProps } from 'react'

const AudioEqualizerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <style>
      {`
        @keyframes audio-equalizer-bar {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }

        @media (prefers-reduced-motion: no-preference) {
          .group:hover .audio-equalizer-bar-1 {
            animation: audio-equalizer-bar 900ms ease-in-out infinite;
          }

          .group:hover .audio-equalizer-bar-2 {
            animation: audio-equalizer-bar 900ms ease-in-out 150ms infinite;
          }

          .group:hover .audio-equalizer-bar-3 {
            animation: audio-equalizer-bar 900ms ease-in-out 300ms infinite;
          }
        }
      `}
    </style>
    <rect
      className="audio-equalizer-bar-1 origin-center [transform-box:fill-box]"
      x="1"
      y="3"
      width="2"
      height="6"
      rx="1"
      fill="currentColor"
    />
    <rect
      className="audio-equalizer-bar-2 origin-center [transform-box:fill-box]"
      x="5"
      y="1.5"
      width="2"
      height="7.5"
      rx="1"
      fill="currentColor"
    />
    <rect
      className="audio-equalizer-bar-3 origin-center [transform-box:fill-box]"
      x="9"
      y="4"
      width="2"
      height="5"
      rx="1"
      fill="currentColor"
    />
  </svg>
)

export default AudioEqualizerIcon
