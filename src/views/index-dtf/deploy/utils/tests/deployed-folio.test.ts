import {
  type Address,
  type Log,
  encodeAbiParameters,
  encodeEventTopics,
} from 'viem'
import { describe, expect, it } from 'vitest'
import dtfIndexDeployerAbi from '@/abis/dtf-index-deployer-abi'
import { getDeployedFolio, getReserveDeployers } from '../deployed-folio'

const DEPLOYER = '0x4D201a6e5BF975E2CEE9e5cbDfc803C0Ff122073' as Address
const ATTACKER_TOKEN = '0x00000000000000000000000000000000000BAD01' as Address
const REAL_FOLIO = '0x1111111111111111111111111111111111111111' as Address
const FORGED_FOLIO = '0x2222222222222222222222222222222222222222' as Address
const OWNER = '0x3333333333333333333333333333333333333333' as Address
const ADMIN = '0x4444444444444444444444444444444444444444' as Address

const folioDeployedLog = (emitter: Address, folio: Address, logIndex: number): Log =>
  ({
    address: emitter,
    topics: encodeEventTopics({
      abi: dtfIndexDeployerAbi,
      eventName: 'FolioDeployed',
      args: { folioOwner: OWNER, folio },
    }),
    data: encodeAbiParameters([{ type: 'address' }], [ADMIN]),
    blockHash: '0x01',
    blockNumber: 1n,
    logIndex,
    transactionHash: '0x02',
    transactionIndex: 0,
    removed: false,
  }) as unknown as Log

describe('getDeployedFolio', () => {
  it('reads the folio from the deployer that was called', () => {
    const logs = [folioDeployedLog(DEPLOYER, REAL_FOLIO, 0)]
    expect(getDeployedFolio(logs, 'FolioDeployed', [DEPLOYER])).toBe(REAL_FOLIO)
  })

  it('ignores a look-alike event emitted earlier by another contract', () => {
    // A basket token can emit a forged FolioDeployed inside transferFrom, before the deployer's own log.
    const logs = [
      folioDeployedLog(ATTACKER_TOKEN, FORGED_FOLIO, 0),
      folioDeployedLog(DEPLOYER, REAL_FOLIO, 1),
    ]
    expect(getDeployedFolio(logs, 'FolioDeployed', [DEPLOYER])).toBe(REAL_FOLIO)
  })

  it('returns nothing when only another contract emitted the event', () => {
    const logs = [folioDeployedLog(ATTACKER_TOKEN, FORGED_FOLIO, 0)]
    expect(getDeployedFolio(logs, 'FolioDeployed', [DEPLOYER])).toBeUndefined()
  })

  it('refuses an ambiguous receipt with two deploy events from the deployer', () => {
    const logs = [
      folioDeployedLog(DEPLOYER, REAL_FOLIO, 0),
      folioDeployedLog(DEPLOYER, FORGED_FOLIO, 1),
    ]
    expect(getDeployedFolio(logs, 'FolioDeployed', [DEPLOYER])).toBeUndefined()
  })
})

describe('getReserveDeployers', () => {
  it('accepts no emitter on a chain without a Reserve deployer', () => {
    expect(getReserveDeployers(42161)).toEqual([])
  })
})
