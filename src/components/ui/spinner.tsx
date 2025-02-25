import React from 'react'

export interface SpinnerProps
  extends Omit<
    React.ComponentPropsWithRef<'svg'>,
    'opacity' | 'color' | 'css' | 'sx' | 'strokeWidth'
  > {
  size?: number
  strokeWidth?: number
  title?: string
  duration?: number
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  (
    {
      size = 16,
      strokeWidth = 4,
      max = 1,
      title = 'Loading',
      duration = 750,
      ...props
    },
    ref
  ) => {
    const svgProps = {
      strokeWidth,

      viewBox: '0 0 32 32',
      width: size,
      height: size,

      fill: 'none',
      stroke: 'currentColor',
      role: 'img',
    }

    const circleProps = {
      strokeWidth,
      r: 16 - strokeWidth,
      cx: 16,
      cy: 16,
      fill: 'none',
    }

    return (
      <svg ref={ref} {...svgProps} {...props}>
        <circle {...circleProps} opacity={1 / 8} />
        <circle {...circleProps} strokeDasharray="20 110">
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 16 16"
            to="360 16 16"
            dur={`750ms`}
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    )
  }
)

Spinner.displayName = 'Spinner'

export default Spinner
