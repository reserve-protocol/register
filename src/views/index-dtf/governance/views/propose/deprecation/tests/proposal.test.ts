import { describe, expect, it } from 'vitest'
import { buildDeprecationCalls } from '../proposal'
import reference from './reference-proposal.json'

describe('deprecation proposal', () => {
  it('matches the executed MVDA25 proposal, retaining admin until the final call', () => {
    expect(
      buildDeprecationCalls(
        '0xd600e748c17ca237fcb5967fa13d688aff17be78',
        ['0x364768c014b312b5ff92ce5d878393f15de3d484'],
        [
          '0xd8b0f4e54a8dac04e0a57392f5a630cedb99c940',
          '0x6f1d6b86d4ad705385e751e6e88b0fdfdbadf298',
          '0x7daaf7bc2ee8bf4c0ac7f37e6b6cfaeb3ed9a868',
        ],
        '0xb396e2bec0e914b8a5ef9c1ed748e8e6be2af135'
      )
    ).toEqual(reference)
  })
})
