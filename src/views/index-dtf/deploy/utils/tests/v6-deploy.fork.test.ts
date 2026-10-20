import {
  extractIndexDtfDeployedAddress,
  extractIndexDtfDeployedStakingVault,
  folioDeployerV6Abi,
  INDEX_DTF_V6_DEPLOYER_ADDRESS,
  prepareIndexDtfDeploy,
  prepareIndexDtfDeployGoverned,
  prepareIndexDtfDeployStakingVault,
  type IndexDtfCall,
} from '@reserve-protocol/react-sdk'
import {
  createPublicClient,
  createWalletClient,
  custom,
  encodeAbiParameters,
  erc20Abi,
  getAddress,
  keccak256,
  pad,
  parseAbi,
  parseEther,
  parseEventLogs,
  toHex,
  type Address,
  zeroAddress,
} from 'viem'
import { base } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { dtfDeployDefaultValues, type DeployInputs } from '../../form-fields'
import { buildV6DeployParams, buildV6Governance } from '../v6-deploy-params'

// Opt-in: FORK_RPC_URL_8453=http://127.0.0.1:8546 pnpm vitest run src/views/index-dtf/deploy/utils/tests/v6-deploy.fork.test.ts
const rpcUrl = process.env.FORK_RPC_URL_8453

const DEPLOYER = '0x00000000000000000000000000000000d3910e60' as Address
const OWNER = '0x00000000000000000000000000000000000a11ce' as Address
const PERMANENT = '0x000000000000000000000000000000000000beef' as Address
const WETH = '0x4200000000000000000000000000000000000006' as Address
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address
const RSR = '0xaB36452DbAC151bE02b16Ca17d8919826072f64a' as Address
const VLRSR = '0x2F0D6538807a77d4AdDCd4b4DAf214Ea2E818E3D' as Address
const V6 = INDEX_DTF_V6_DEPLOYER_ADDRESS[8453]

const folioAbi = parseAbi([
  'function version() view returns (string)',
  'function maxAuctionLength() view returns (uint256)',
  'function mintFee() view returns (uint256)',
  'function folioFeeForSelf() view returns (uint256)',
  'function feeRecipients(uint256) view returns (address recipient, uint96 portion)',
  'function immutableFeeRecipients(uint256) view returns (address recipient, uint96 portion)',
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function mandate() view returns (string)',
])
const governorAbi = parseAbi([
  'function votingDelay() view returns (uint256)',
  'function votingPeriod() view returns (uint256)',
  'function lateQuorumVoteExtension() view returns (uint48)',
  'function proposalThrottleCapacity() view returns (uint256)',
  'function optimisticParams() view returns (uint48 vetoDelay, uint32 vetoPeriod, uint256 vetoThreshold)',
  'function timelock() view returns (address)',
])
const vaultAbi = parseAbi([
  'function tokenJar() view returns (address)',
  'function asset() view returns (address)',
  'function unstakingDelay() view returns (uint256)',
  'function CLOCK_MODE() view returns (string)',
])
const wethAbi = parseAbi(['function deposit() payable'])

const inputs = (patch: Partial<DeployInputs> = {}): DeployInputs => ({
  ...dtfDeployDefaultValues,
  tokenName: 'Fork Six',
  symbol: 'FSIX',
  mandate: 'Fork-tested 6.0.0 deploy',
  folioFee: 1,
  mintFee: 0.3,
  fixedPlatformFee: 50,
  holderShare: 10,
  governanceShare: 20,
  deployerShare: 10,
  permanentRevenueRecipients: [{ address: PERMANENT, share: 10 }],
  maxAuctionLength: 45,
  optimisticActions: ['startRebalance'],
  ...patch,
})

const basicDetails = (name: string) => ({
  name,
  symbol: name.toUpperCase().slice(0, 6),
  assets: [USDC, WETH],
  amounts: [1_000_000n, parseEther('0.001')],
  initialShares: parseEther('1'),
})

describe.skipIf(!rpcUrl)('Folio 6.0.0 deploy on a Base fork', () => {
  // jsdom's AbortSignal is not the one Node's fetch accepts, so viem's http transport can't run here.
  let id = 0
  const transport = custom({
    request: async ({ method, params }) => {
      const res = await fetch(rpcUrl!, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
      })
      const json = await res.json()
      if (json.error) throw Object.assign(new Error(json.error.message), json.error)
      return json.result
    },
  })
  const client = createPublicClient({ chain: base, transport })
  const wallet = createWalletClient({ chain: base, transport, account: DEPLOYER })
  const rpc = (method: string, params: unknown[]) =>
    client.request({ method: method as never, params: params as never })

  const send = async (call: Pick<IndexDtfCall, 'to' | 'data' | 'value'>) => {
    const hash = await wallet.sendTransaction({ to: call.to, data: call.data, value: call.value, gas: 30_000_000n })
    const receipt = await client.waitForTransactionReceipt({ hash })
    expect(receipt.status).toBe('success')
    return receipt
  }

  const fund = async () => {
    await rpc('anvil_impersonateAccount', [DEPLOYER])
    await rpc('anvil_setBalance', [DEPLOYER, toHex(parseEther('10'))])
    // FiatToken keeps balances in slot 9.
    await rpc('anvil_setStorageAt', [
      USDC,
      keccak256(encodeAbiParameters([{ type: 'address' }, { type: 'uint256' }], [DEPLOYER, 9n])),
      pad(toHex(1_000_000_000n)),
    ])
    await send({ to: WETH, data: '0xd0e30db0', value: parseEther('1') })
    for (const token of [USDC, WETH]) {
      await wallet.writeContract({ address: token, abi: erc20Abi, functionName: 'approve', args: [V6, 2n ** 255n] })
    }
  }

  const readFolio = async (folio: Address) => {
    const read = <T>(functionName: string, args: unknown[] = []) =>
      client.readContract({ address: folio, abi: folioAbi, functionName: functionName as never, args: args as never }) as Promise<T>
    return {
      version: await read<string>('version'),
      maxAuctionLength: await read<bigint>('maxAuctionLength'),
      mintFee: await read<bigint>('mintFee'),
      selfFee: await read<bigint>('folioFeeForSelf'),
      mandate: await read<string>('mandate'),
      immutable0: await read<readonly [Address, bigint]>('immutableFeeRecipients', [0n]),
      read,
    }
  }

  it(
    'deploys an ungoverned Folio with both fee tables and the holder share',
    async () => {
      await fund()
      const form = inputs({ governanceWalletAddress: OWNER, governanceShare: 0, deployerShare: 30 })
      const params = buildV6DeployParams(form, { deployer: DEPLOYER })
      const receipt = await send(
        prepareIndexDtfDeploy({
          chainId: 8453,
          version: '6.0.0',
          basicDetails: basicDetails('Fork Ungoverned'),
          additionalDetails: params.additionalDetails,
          flags: params.flags,
          owner: OWNER,
          auctionLaunchers: params.roles.auctionLaunchers,
          brandManagers: params.roles.brandManagers,
        })
      )
      const folio = extractIndexDtfDeployedAddress(receipt.logs, { chainId: 8453, version: '6.0.0' })
      const state = await readFolio(folio)

      expect(state.version).toBe('6.0.0')
      expect(state.maxAuctionLength).toBe(45n * 60n)
      expect(state.mintFee).toBe(parseEther('0.003'))
      // Holders 10 of the non-platform 50.
      expect(state.selfFee).toBe(parseEther('0.2'))
      expect(state.mandate).toBe('Fork-tested 6.0.0 deploy')
      // Creator 30 and permanent 10 split the 40 the holders leave.
      expect(state.immutable0).toEqual([getAddress(PERMANENT), parseEther('0.25')])
      expect(await state.read('feeRecipients', [0n])).toEqual([getAddress(DEPLOYER), parseEther('0.75')])
      expect(await state.read('hasRole', [pad('0x00'), OWNER])).toBe(true)
    },
    300_000
  )

  it(
    'deploys a Folio governed by the existing vlRSR, paying governance fees to its token jar',
    async () => {
      expect(await client.readContract({ address: VLRSR, abi: vaultAbi, functionName: 'CLOCK_MODE' })).toBe(
        'mode=timestamp'
      )
      const tokenJar = await client.readContract({ address: VLRSR, abi: vaultAbi, functionName: 'tokenJar' })
      const form = inputs({ governanceVoteLock: VLRSR })
      const params = buildV6DeployParams(form, { deployer: DEPLOYER, governanceRecipient: tokenJar })
      const receipt = await send(
        prepareIndexDtfDeployGoverned({
          chainId: 8453,
          version: '6.0.0',
          stToken: VLRSR,
          basicDetails: basicDetails('Fork vlRSR'),
          additionalDetails: params.additionalDetails,
          flags: params.flags,
          governance: params.governance,
          roles: params.roles,
        })
      )
      const folio = extractIndexDtfDeployedAddress(receipt.logs, { chainId: 8453, version: '6.0.0' })
      const [event] = parseEventLogs({ abi: folioDeployerV6Abi, logs: receipt.logs, eventName: 'GovernedFolioDeployed' })
      const { ownerGovernor, ownerTimelock, tradingGovernor } = event.args
      const governor = <T>(functionName: string) =>
        client.readContract({ address: ownerGovernor, abi: governorAbi, functionName: functionName as never }) as Promise<T>

      expect(tradingGovernor).toBe(ownerGovernor)
      const state = await readFolio(folio)
      expect(state.version).toBe('6.0.0')
      expect(await state.read('hasRole', [pad('0x00'), ownerTimelock])).toBe(true)
      // Governance 20 + creator 10 of the 40 the holders leave; the permanent 10 is immutable.
      expect(await state.read('feeRecipients', [0n])).toEqual([getAddress(DEPLOYER), parseEther('0.25')])
      expect(await state.read('feeRecipients', [1n])).toEqual([tokenJar, parseEther('0.5')])
      expect(state.immutable0).toEqual([getAddress(PERMANENT), parseEther('0.25')])

      expect(await governor<bigint>('votingDelay')).toBe(2n * 86_400n)
      expect(await governor<bigint>('votingPeriod')).toBe(3n * 86_400n)
      expect(await governor<number>('lateQuorumVoteExtension')).toBe(2 * 86_400)
      expect(await governor<bigint>('proposalThrottleCapacity')).toBe(3n)
      expect(await governor<readonly [number, number, bigint]>('optimisticParams')).toEqual([
        4 * 3_600,
        20 * 3_600,
        parseEther('0.01'),
      ])
      expect(await governor<Address>('timelock')).toBe(ownerTimelock)
    },
    300_000
  )

  it(
    'creates a new vlRSR-style vault with its own DAO, then deploys a Folio governed by it',
    async () => {
      const form = inputs({ governanceERC20address: RSR, vaultUnstakingDelay: 3, vaultRewardHalfLife: 2 })
      const { optimisticSelectors: _, ...vaultGovernance } = buildV6Governance(form)
      const vaultReceipt = await send(
        prepareIndexDtfDeployStakingVault({
          chainId: 8453,
          underlying: RSR,
          rewardHalfLife: 2n * 86_400n,
          unstakingDelay: 3n * 86_400n,
          governance: vaultGovernance,
        })
      )
      const { stakingVault } = extractIndexDtfDeployedStakingVault(vaultReceipt.logs, { chainId: 8453 })
      const vault = <T>(functionName: string) =>
        client.readContract({ address: stakingVault, abi: vaultAbi, functionName: functionName as never }) as Promise<T>

      expect(await vault<Address>('asset')).toBe(RSR)
      expect(await vault<bigint>('unstakingDelay')).toBe(3n * 86_400n)
      const tokenJar = await vault<Address>('tokenJar')
      expect(tokenJar).not.toBe(zeroAddress)

      const params = buildV6DeployParams(form, { deployer: DEPLOYER, governanceRecipient: tokenJar })
      const receipt = await send(
        prepareIndexDtfDeployGoverned({
          chainId: 8453,
          version: '6.0.0',
          stToken: stakingVault,
          basicDetails: basicDetails('Fork New Vault'),
          additionalDetails: params.additionalDetails,
          flags: params.flags,
          governance: params.governance,
          roles: params.roles,
        })
      )
      const folio = extractIndexDtfDeployedAddress(receipt.logs, { chainId: 8453, version: '6.0.0' })
      expect((await readFolio(folio)).version).toBe('6.0.0')
    },
    300_000
  )
})
