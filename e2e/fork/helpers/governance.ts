import { expect, type Page } from '@playwright/test'
import {
  type Address,
  type Hex,
  type PublicClient,
  encodeFunctionData,
  keccak256,
  parseAbi,
  toHex,
} from 'viem'

export const governorAbi = parseAbi([
  'event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)',
  'function castVote(uint256 proposalId, uint8 support) returns (uint256)',
  'function queue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)',
  'function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) payable returns (uint256)',
  'function state(uint256 proposalId) view returns (uint8)',
  'function timelock() view returns (address)',
  'function token() view returns (address)',
])
const timelockAbi = parseAbi(['function getMinDelay() view returns (uint256)'])

export type Proposal = {
  proposalId: bigint
  proposer: Address
  targets: Address[]
  values: bigint[]
  calldatas: Hex[]
  voteStart: bigint
  voteEnd: bigint
  description: string
  transactionHash: Hex
}

// Drives real governance on an Anvil fork: impersonated sends (labelled as such by the caller) and time travel.
export const forkGovernance = (client: PublicClient) => {
  const rpc = (method: string, params: unknown[]) =>
    client.request({ method: method as never, params: params as never })

  const send = async (from: Address, to: Address, data: Hex) => {
    await rpc('anvil_impersonateAccount', [from])
    await rpc('anvil_setBalance', [from, toHex(10n ** 18n)])
    // Anvil's estimate is exact for the outer call and starves nested calls (63/64 rule).
    const gas = ((await client.estimateGas({ account: from, to, data })) * 3n) / 2n
    const hash = (await rpc('eth_sendTransaction', [
      { from, to, data, gas: toHex(gas) },
    ])) as Hex
    const receipt = await client.waitForTransactionReceipt({ hash })
    expect(receipt.status, `${to} ${data.slice(0, 10)}`).toBe('success')
    return receipt
  }

  const warpTo = async (timestamp: bigint) => {
    await rpc('evm_setNextBlockTimestamp', [toHex(timestamp)])
    await rpc('evm_mine', [])
  }

  // The fork clock jumps past voting windows; the browser must agree with the chain.
  const syncBrowserClock = async (page: Page) => {
    const { timestamp } = await client.getBlock()
    await page.clock.setSystemTime(Number(timestamp + 30n) * 1000)
  }

  const proposeFromBanner = async (
    page: Page,
    governor: Address,
    button: string,
    screenshot?: string
  ): Promise<Proposal> => {
    const fromBlock = await client.getBlockNumber()
    const action = page.getByTestId(button)
    await expect(action).toBeEnabled({ timeout: 120_000 })
    if (screenshot) await page.screenshot({ path: screenshot, fullPage: true })
    await action.click()
    const created = () =>
      client.getContractEvents({
        address: governor,
        abi: governorAbi,
        eventName: 'ProposalCreated',
        fromBlock: fromBlock + 1n,
      })
    await expect
      .poll(async () => (await created()).length, { timeout: 120_000 })
      .toBe(1)
    const [log] = await created()
    return {
      ...(log.args as Omit<Proposal, 'transactionHash'>),
      transactionHash: log.transactionHash,
    }
  }

  const passProposal = async (
    governor: Address,
    voter: Address,
    proposal: Proposal
  ) => {
    await warpTo(proposal.voteStart + 1n)
    await send(
      voter,
      governor,
      encodeFunctionData({
        abi: governorAbi,
        functionName: 'castVote',
        args: [proposal.proposalId, 1],
      })
    )
    await warpTo(proposal.voteEnd + 1n)
    const state = await client.readContract({
      address: governor,
      abi: governorAbi,
      functionName: 'state',
      args: [proposal.proposalId],
    })
    expect(state, 'proposal succeeded').toBe(4)
    const args = [
      proposal.targets,
      proposal.values,
      proposal.calldatas,
      keccak256(toHex(proposal.description)),
    ] as const
    await send(
      voter,
      governor,
      encodeFunctionData({ abi: governorAbi, functionName: 'queue', args })
    )
    const timelock = await client.readContract({
      address: governor,
      abi: governorAbi,
      functionName: 'timelock',
    })
    const delay = await client.readContract({
      address: timelock,
      abi: timelockAbi,
      functionName: 'getMinDelay',
    })
    await warpTo((await client.getBlock()).timestamp + delay + 1n)
    return send(
      voter,
      governor,
      encodeFunctionData({ abi: governorAbi, functionName: 'execute', args })
    )
  }

  return { send, warpTo, syncBrowserClock, proposeFromBanner, passProposal }
}
