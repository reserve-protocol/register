import { describe, expect, it } from 'vitest'
import { fitAxisWidth, measureDisplayedAxisWidth } from '../axis-geometry'

describe('next-family Y-axis geometry', () => {
  it('reserves the widest formatted label plus endpoint-ring clearance', () => {
    const widths = new Map([
      ['$1.13', 31.2],
      ['$1.1385', 40.9],
      ['$1.2', 24.1],
    ])

    expect(
      fitAxisWidth([...widths.keys()], (label) => widths.get(label) ?? 0)
    ).toBe(Math.ceil(40.9 + 16))
  })

  it('keeps a compact minimum for unusually short labels', () => {
    expect(fitAxisWidth(['0%'], () => 13.1)).toBe(32)
  })

  it('fits only the tick labels rendered by Recharts', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <svg>
        <g class="recharts-yAxis">
          <text>60K</text><text>40K</text><text>20K</text><text>0</text>
        </g>
      </svg>
    `
    const widths = new Map([
      ['60K', 22.4],
      ['40K', 21.8],
      ['20K', 21.7],
      ['0', 7.2],
    ])
    for (const label of root.querySelectorAll<SVGTextElement>('text')) {
      label.getBBox = () =>
        ({ width: widths.get(label.textContent ?? '') ?? 0 }) as DOMRect
    }

    expect(measureDisplayedAxisWidth(root)).toBe(Math.ceil(22.4 + 16))
  })
})
