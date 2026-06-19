import {
  COLLATERAL_GAP,
  COLLATERAL_SCROLL_RAMP_DISTANCE_PERCENT,
  COLLATERAL_SCROLL_RAMP_GAP_OFFSET,
  COLLATERAL_SCROLL_RAMP_PERCENT,
} from './constants'

export const CollateralAssetAnimationStyles = () => (
  <style>
    {`
      @keyframes collateral-assets-scroll {
        0% {
          animation-timing-function: cubic-bezier(0.5, 0, 1, 1);
          transform: translate3d(0, 0, 0);
        }
        ${COLLATERAL_SCROLL_RAMP_PERCENT}% {
          animation-timing-function: linear;
          transform: translate3d(calc(-${COLLATERAL_SCROLL_RAMP_DISTANCE_PERCENT}% - ${COLLATERAL_SCROLL_RAMP_GAP_OFFSET}px), 0, 0);
        }
        100% {
          transform: translate3d(calc(-50% - ${COLLATERAL_GAP / 2}px), 0, 0);
        }
      }
      @keyframes collateral-assets-chain-exit {
        from { opacity: 1; transform: translate3d(0, 0, 0); }
        to { opacity: 0; transform: translate3d(-48px, 0, 0); }
      }
      @keyframes collateral-assets-chain-enter {
        from { opacity: 0; transform: translate3d(18px, 0, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }
    `}
  </style>
)
