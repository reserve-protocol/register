import OptimismPortal from 'abis/OptimismPortal'
import { useEffect, useState } from 'react'
import { ChainId } from 'utils/chains'
import {
  encodeAbiParameters,
  keccak256,
  pad,
  parseAbiParameters,
  PublicClient,
} from 'viem'
import {
  usePublicClient,
  useSimulateContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { L2_L1_MESSAGE_PASSER_ADDRESS, OP_PORTAL } from '../utils/constants'
import { getWithdrawalMessage } from '../utils/getWithdrawalMessage'
import { hashWithdrawal } from '../utils/hashWithdrawal'
import { WithdrawalMessage } from '../utils/types'
import { useL2OutputProposal } from './useL2OutputProposal'
import { useWithdrawalL2OutputIndex } from './useWithdrawalL2OutputIndex'

async function makeStateTrieProof(
  client: PublicClient,
  blockNumber: bigint,
  address: `0x${string}`,
  slot: `0x${string}`
): Promise<{
  accountProof: string[]
  storageProof: `0x${string}`[]
  storageValue: bigint
  storageRoot: `0x${string}`
}> {
  const proof = await client.getProof({
    address,
    storageKeys: [slot],
    blockNumber,
  })

  return {
    accountProof: proof.accountProof,
    storageProof: proof.storageProof[0].proof,
    storageValue: proof.storageProof[0].value,
    storageRoot: proof.storageHash,
  }
}

type BedrockCrossChainMessageProof = {
  l2OutputIndex: bigint
  outputRootProof: {
    version: `0x${string}`
    stateRoot: `0x${string}`
    messagePasserStorageRoot: `0x${string}`
    latestBlockhash: `0x${string}`
  }
  withdrawalProof: `0x${string}`[]
}

export function usePrepareProveWithdrawal(
  withdrawalTx: `0x${string}`,
  blockNumberOfLatestL2OutputProposal?: bigint
) {
  const [withdrawalForTx, setWithdrawalForTx] =
    useState<WithdrawalMessage | null>(null)
  const [proofForTx, setProofForTx] =
    useState<BedrockCrossChainMessageProof | null>(null)

  const { data: withdrawalReceipt } = useWaitForTransactionReceipt({
    hash: withdrawalTx,
    chainId: ChainId.Base,
  })
  const withdrawalL2OutputIndex = useWithdrawalL2OutputIndex(
    blockNumberOfLatestL2OutputProposal
  )
  const l2OutputProposal = useL2OutputProposal(withdrawalL2OutputIndex)
  const l2PublicClient = usePublicClient({
    chainId: ChainId.Base,
  })

  const shouldPrepare = withdrawalForTx && proofForTx

  const { data } = useSimulateContract({
    address: shouldPrepare ? OP_PORTAL : undefined,
    abi: OptimismPortal,
    functionName: 'proveWithdrawalTransaction',
    chainId: ChainId.Mainnet,
    args:
      withdrawalForTx && proofForTx
        ? [
            {
              nonce: withdrawalForTx.nonce,
              sender: withdrawalForTx.sender,
              target: withdrawalForTx.target,
              value: withdrawalForTx.value,
              gasLimit: withdrawalForTx.gasLimit,
              data: withdrawalForTx.data,
            },
            BigInt(proofForTx.l2OutputIndex),
            {
              version: proofForTx.outputRootProof.version,
              stateRoot: proofForTx.outputRootProof.stateRoot,
              messagePasserStorageRoot:
                proofForTx.outputRootProof.messagePasserStorageRoot,
              latestBlockhash: proofForTx.outputRootProof.latestBlockhash,
            },
            proofForTx.withdrawalProof,
          ]
        : undefined,
    // TODO: not sure about adding TOS for indexer API
    // dataSuffix: '0x01,
  })

  useEffect(() => {
    void (async () => {
      if (
        withdrawalReceipt &&
        withdrawalL2OutputIndex &&
        l2OutputProposal &&
        l2PublicClient &&
        blockNumberOfLatestL2OutputProposal
      ) {
        const withdrawalMessage = getWithdrawalMessage(withdrawalReceipt)

        const messageBedrockOutput = {
          outputRoot: l2OutputProposal.outputRoot,
          l1Timestamp: l2OutputProposal.timestamp,
          l2BlockNumber: l2OutputProposal.l2BlockNumber,
          l2OutputIndex: withdrawalL2OutputIndex,
        }

        const hashedWithdrawal = hashWithdrawal(withdrawalMessage)

        const messageSlot = keccak256(
          encodeAbiParameters(parseAbiParameters('bytes32, uint256'), [
            hashedWithdrawal,
            BigInt(pad('0x0')),
          ])
        )

        const stateTrieProof = await makeStateTrieProof(
          l2PublicClient,
          blockNumberOfLatestL2OutputProposal,
          L2_L1_MESSAGE_PASSER_ADDRESS,
          messageSlot
        )

        const block = await l2PublicClient.getBlock({
          blockNumber: messageBedrockOutput.l2BlockNumber,
        })

        const bedrockProof: BedrockCrossChainMessageProof = {
          outputRootProof: {
            version: pad('0x0'),
            stateRoot: block.stateRoot,
            messagePasserStorageRoot: stateTrieProof.storageRoot,
            latestBlockhash: block.hash,
          },
          withdrawalProof: stateTrieProof.storageProof,
          l2OutputIndex: messageBedrockOutput.l2OutputIndex,
        }

        setWithdrawalForTx(withdrawalMessage)
        setProofForTx(bedrockProof)
      }
    })()
  }, [
    withdrawalReceipt,
    withdrawalL2OutputIndex,
    l2OutputProposal,
    blockNumberOfLatestL2OutputProposal,
    l2PublicClient,
  ])

  return data
}
