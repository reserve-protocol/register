import {
  INDEX_DTF_DEPLOYER_ADDRESS,
  INDEX_DTF_V6_DEPLOYER_ADDRESS,
  folioDeployerV6Abi,
} from '@reserve-protocol/react-sdk'
import {
  type Address,
  type Log,
  encodeAbiParameters,
  encodeEventTopics,
} from 'viem'
import { describe, expect, it } from 'vitest'
import { readDeployedFolio } from '../deployed-folio'

const V6 = INDEX_DTF_V6_DEPLOYER_ADDRESS[8453]
const V5 = INDEX_DTF_DEPLOYER_ADDRESS[8453]
const ATTACKER_TOKEN = '0x00000000000000000000000000000000000BAD01' as Address
const FOLIO = '0x1111111111111111111111111111111111111111' as Address
const FORGED = '0x2222222222222222222222222222222222222222' as Address
const OWNER = '0x3333333333333333333333333333333333333333' as Address
const VAULT = '0x5555555555555555555555555555555555555555' as Address
const GOVERNOR = '0x6666666666666666666666666666666666666666' as Address
const TIMELOCK = '0x7777777777777777777777777777777777777777' as Address

const log = (address: Address, topics: unknown, data: `0x${string}`): Log =>
  ({ address, topics, data, logIndex: 0, removed: false }) as unknown as Log

const folioDeployed = (
  emitter: Address,
  folio: Address,
  owner: Address = OWNER
) =>
  log(
    emitter,
    encodeEventTopics({
      abi: folioDeployerV6Abi,
      eventName: 'FolioDeployed',
      args: { folioOwner: owner, folio },
    }),
    encodeAbiParameters([{ type: 'address' }], [OWNER])
  )

const governedDeployed = (emitter: Address, folio: Address) =>
  log(
    emitter,
    encodeEventTopics({
      abi: folioDeployerV6Abi,
      eventName: 'GovernedFolioDeployed',
      args: { stToken: VAULT, folio },
    }),
    encodeAbiParameters(
      [
        { type: 'address' },
        { type: 'address' },
        { type: 'address' },
        { type: 'address' },
      ],
      [GOVERNOR, TIMELOCK, GOVERNOR, TIMELOCK]
    )
  )

describe('readDeployedFolio', () => {
  it('reads an ungoverned deploy from the 6.0.0 deployer', () => {
    expect(readDeployedFolio([folioDeployed(V6, FOLIO)], 8453)).toEqual({
      folio: FOLIO,
    })
  })

  it('reads a governed deploy, including its inner FolioDeployed, as one Folio', () => {
    expect(
      readDeployedFolio(
        [folioDeployed(V6, FOLIO, V6), governedDeployed(V6, FOLIO)],
        8453
      )
    ).toEqual({
      folio: FOLIO,
    })
  })

  it('ignores look-alike events from other contracts and the 5.0.0 deployer', () => {
    const logs = [
      folioDeployed(ATTACKER_TOKEN, FORGED),
      folioDeployed(V5, FORGED),
      governedDeployed(V6, FOLIO),
    ]
    expect(readDeployedFolio(logs, 8453)).toEqual({ folio: FOLIO })
  })

  it('reports a receipt without a deployer event instead of silently doing nothing', () => {
    const result = readDeployedFolio(
      [folioDeployed(ATTACKER_TOKEN, FORGED)],
      8453
    )
    expect(result.folio).toBeUndefined()
    expect(result.error).toMatch(/Could not find/)
  })
})
