import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExpectedDecisions } from '../catalog-ui'
import FoundationCandidateDirection from '../foundation-candidate-direction'
import ColorFoundationDefinition from '../color-foundation-definition'
import FoundationReference from '../foundation-reference'

describe('ExpectedDecisions', () => {
  it('shows the accepted content of a defined slot', () => {
    render(
      <ExpectedDecisions
        items={[
          {
            name: 'Control radius',
            status: 'defined',
            detail: 'Interactive controls use the accepted small radius.',
          },
        ]}
      />
    )

    expect(screen.getByText('Defined')).toBeInTheDocument()
    expect(
      screen.getByText('Interactive controls use the accepted small radius.')
    ).toBeInTheDocument()
  })
})

describe('FoundationCandidateDirection', () => {
  it('shows an accepted foundation as the current baseline', () => {
    render(<FoundationCandidateDirection foundationId="typography" />)

    expect(screen.getByText('Accepted direction')).toBeInTheDocument()
    expect(screen.getByText('Current baseline')).toBeInTheDocument()
    expect(screen.getByText('Carry forward')).toBeInTheDocument()
    expect(screen.getByText('Leave behind')).toBeInTheDocument()
    expect(
      screen.getByText(/working authority for subsequent design-system work/)
    ).toBeInTheDocument()
  })

  it('renders the accepted color direction as a structured system', () => {
    render(<FoundationCandidateDirection foundationId="color" />)

    expect(screen.getByText('Accepted direction')).toBeInTheDocument()
    expect(screen.getByText('Grouping surface')).toBeInTheDocument()
    expect(screen.getByText('Performance positive')).toBeInTheDocument()
    expect(screen.getByText('Success feedback')).toBeInTheDocument()
    expect(
      screen.getByText(/^These roles remain technically separate/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Labels use the accepted semantic foreground aliases/)
    ).toBeInTheDocument()
    expect(
      screen.getByText('Smaller V1 performance candidate')
    ).toBeInTheDocument()
    expect(screen.getByText('--data-positive')).toBeInTheDocument()
    expect(
      screen.getByText(/Dot and icon reuse the main value/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Feedback aliases remain technically separate/)
    ).toBeInTheDocument()
  })
})

describe('FoundationReference', () => {
  it('shows the audited secondary wrapper instead of implying container owns that role', () => {
    render(<FoundationReference foundationId="color" />)

    expect(screen.getByText('Secondary')).toBeInTheDocument()
    expect(screen.getByText('--secondary')).toBeInTheDocument()
    expect(screen.getByText('110 uses')).toBeInTheDocument()
    expect(screen.getByText('Container')).toBeInTheDocument()
    expect(screen.getByText('0 uses')).toBeInTheDocument()
    expect(
      screen.getByText('Current performance implementation')
    ).toBeInTheDocument()
    expect(screen.getAllByText('Homepage and overview line')).toHaveLength(2)
    expect(screen.getByText('#55D6A2 → #159C72')).toBeInTheDocument()
    expect(
      screen.getAllByText('Defined dark-surface line · unused')
    ).toHaveLength(2)
    expect(screen.getByText('#6BE4B2 → #24B886')).toBeInTheDocument()
    expect(screen.getAllByText('Home area fill')).toHaveLength(2)
    expect(screen.getAllByText('50% → 0% opacity')).toHaveLength(2)
    expect(screen.getAllByText('Overview area fill')).toHaveLength(2)
    expect(screen.getAllByText('Dark-theme overview fill')).toHaveLength(2)
    expect(screen.getAllByText('48% → 0% opacity')).toHaveLength(4)
    expect(screen.getByText('rgba(229, 238, 250, 0.45)')).toBeInTheDocument()
    expect(screen.getByText('#6F6456 @ 62%')).toBeInTheDocument()
    expect(screen.getByText('#E5EEFA @ 60%')).toBeInTheDocument()
    expect(
      screen.getByText(
        /dark-surface set is defined but has no product consumer/
      )
    ).toBeInTheDocument()
  })
})

describe('ColorFoundationDefinition', () => {
  it('separates the working baseline from real-screen validation', () => {
    render(<ColorFoundationDefinition />)

    expect(screen.getByText('Current baseline')).toBeInTheDocument()
    expect(screen.getByText('Feedback family')).toBeInTheDocument()
    expect(screen.getByText('Financial movement')).toBeInTheDocument()
    expect(
      screen.getByText('Still open in real-screen adoption')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Categorical chart colors when a real multi-series/)
    ).toBeInTheDocument()
  })
})
