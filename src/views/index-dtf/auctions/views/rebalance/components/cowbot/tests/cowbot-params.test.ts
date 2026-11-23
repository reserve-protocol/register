import type { ProcessError } from '@reserve-protocol/trusted-fillers-sdk'
import type { PublicClient } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  COWBOT_MIN_TRADE_VALUE,
  getCowbotParams,
  getReportableCowbotErrors,
} from '../cowbot-params'

const FOLIO = '0x1111111111111111111111111111111111111111'
const client = {} as PublicClient

const error = (type: ProcessError['type']): ProcessError => ({
  type,
  sellToken: '0x2222222222222222222222222222222222222222',
  buyToken: '0x3333333333333333333333333333333333333333',
  message: type,
  cowswapDeploymentId: 'base',
  order: null,
})

describe('getCowbotParams', () => {
  it('submits real orders down to a $1 trade so small DTFs still fill', () => {
    expect(
      getCowbotParams({
        chainId: 8453,
        client,
        folioAddress: FOLIO,
        validityDuration: 120,
      })
    ).toEqual({
      chainId: 8453,
      client,
      folioAddress: FOLIO,
      validityDuration: 120,
      minTradeValue: 1,
      dryRun: false,
    })
    expect(COWBOT_MIN_TRADE_VALUE).toBe(1)
  })
})

describe('getReportableCowbotErrors', () => {
  it('drops trades below the minimum, which retry on the next poll, and keeps real failures', () => {
    expect(
      getReportableCowbotErrors([
        error('below_min_trade_value'),
        error('submit_failed'),
        error('quote_failed'),
      ]).map((e) => e.type)
    ).toEqual(['submit_failed', 'quote_failed'])
  })
})
