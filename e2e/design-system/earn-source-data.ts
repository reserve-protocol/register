/// <reference types="vite/client" />
import { readFileSync } from 'node:fs'
import type { VoteLockPosition } from '../../src/views/earn/views/index-dtf/hooks/use-vote-lock-positions'
import type { MockOverrides } from '../helpers/overrides'

const daos: VoteLockPosition[] = JSON.parse(
  readFileSync(new URL('./fixtures/earn-daos.json', import.meta.url), 'utf8')
)

export const sourceDaos = daos.filter(
  (row) =>
    ['vlSQUILL-OPEN', 'vlRSR-LCAP', 'vlRSR-CMCindex'].includes(
      row.token.symbol
    ) ||
    (row.chainId === 56 && row.token.symbol === 'vlRSR')
)

export const sourceLcap = sourceDaos.find(
  (row) => row.token.symbol === 'vlRSR-LCAP'
)!
export const sourceSharedVault = sourceDaos.find(
  (row) => row.chainId === 56 && row.token.symbol === 'vlRSR'
)!

export function seedIndexEarn(overrides: MockOverrides) {
  if (sourceDaos.length !== 4 || !sourceLcap || !sourceSharedVault)
    throw new Error('Earn source fixture identities changed')
  overrides.api({ pathname: '/dtf/daos' }, sourceDaos)
}
