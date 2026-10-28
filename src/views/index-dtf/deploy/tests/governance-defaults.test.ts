import { describe, it, expect } from 'vitest'
import { presets } from '../components/toggle-group-preset'
import { dtfDeployDefaultValues } from '../form-fields'

const sections = ['basket', 'governance'] as const

describe('deploy governance defaults', () => {
  it('defaults both governors to a 2% proposal threshold', () => {
    expect(dtfDeployDefaultValues.basketVotingThreshold).toBe(2)
    expect(dtfDeployDefaultValues.governanceVotingThreshold).toBe(2)
  })

  it('keeps a 2% proposal threshold on every speed preset', () => {
    for (const section of sections) {
      for (const preset of Object.values(presets[section])) {
        expect(preset.VotingThreshold).toBe(2)
      }
    }
  })

  it('opens on the slow preset', () => {
    for (const section of sections) {
      for (const [field, value] of Object.entries(presets[section].slow)) {
        expect(
          dtfDeployDefaultValues[
            `${section}${field}` as keyof typeof dtfDeployDefaultValues
          ]
        ).toBe(value)
      }
    }
  })
})
