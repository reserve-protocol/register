import L2ToL1MessagePasser from 'abis/L2ToL1MessagePasser'
import { Log, TransactionReceipt, decodeEventLog } from 'viem'
import { WithdrawalMessage } from './types'
import { L2_L1_MESSAGE_PASSER_ADDRESS } from './constants'

export function getWithdrawalMessage(
  withdrawalReceipt: TransactionReceipt
): WithdrawalMessage {
  let parsedWithdrawalLog: { args: WithdrawalMessage }
  const messageLog = withdrawalReceipt.logs.find((log) => {
    if (log.address === L2_L1_MESSAGE_PASSER_ADDRESS) {
      const parsed = decodeEventLog({
        abi: L2ToL1MessagePasser,
        data: log.data,
        topics: log.topics,
      })
      return parsed.eventName === 'MessagePassed'
    }
    return false
  }) as Log
  parsedWithdrawalLog = decodeEventLog({
    abi: L2ToL1MessagePasser,
    data: messageLog.data,
    topics: messageLog.topics,
  }) as { args: WithdrawalMessage }

  const withdrawalMessage = {
    nonce: parsedWithdrawalLog.args.nonce,
    sender: parsedWithdrawalLog.args.sender,
    target: parsedWithdrawalLog.args.target,
    value: parsedWithdrawalLog.args.value,
    gasLimit: parsedWithdrawalLog.args.gasLimit,
    data: parsedWithdrawalLog.args.data,
  }

  return withdrawalMessage
}
