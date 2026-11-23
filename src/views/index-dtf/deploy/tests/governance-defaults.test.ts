import { describe, it, expect } from 'vitest'
import { presets } from '../components/toggle-group-preset'
import { dtfDeployDefaultValues } from '../form-fields'

const sections = ['basket', 'governance'] as const

describe('deploy governance defaults', () => {
  // Folio 6.0.0 deploys one governor, so only the governance section seeds the form.
  it('defaults the governor to a 1% proposal threshold', () => {
    expect(dtfDeployDefaultValues.governanceVotingThreshold).toBe(1)
  })

  it('keeps a 1% proposal threshold on every speed preset', () => {
    for (const section of sections) {
      for (const preset of Object.values(presets[section])) {
        expect(preset.VotingThreshold).toBe(1)
      }
    }
  })

  it('opens on the slow preset', () => {
    for (const [field, value] of Object.entries(presets.governance.slow)) {
      expect(
        dtfDeployDefaultValues[
          `governance${field}` as keyof typeof dtfDeployDefaultValues
        ]
      ).toBe(value)
    }
  })
})
