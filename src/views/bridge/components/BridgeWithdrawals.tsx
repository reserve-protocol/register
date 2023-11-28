// export const getBaseAddressWithrawals = async (
//   ethProvider: Web3Provider,
//   address: string,
// ) => {
//   const path = `https://api.basescan.org/api?address=${address}&action=txlist&module=account`;
//   try {
//       const res = await fetcher(path);
//       const list = res?.status === "1" ? res?.result : [];

import { useEffect } from 'react'
import { Box, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'

//       const now = Date.now();
//       const filteredList = list.filter(d => d.from.toLowerCase() === address.toLowerCase()
//           && d.isError === '0'
//           && d.to.toLowerCase() === BASE_L2_ERC20_BRIDGE.toLowerCase()
//           // && d.input.includes(l2token.replace(/^0x/, '').toLowerCase())
//           && /^withdraw/.test(d.functionName)
//       ).map(d => {
//           const args = new AbiCoder().decode(FunctionFragment.from(d.functionName).inputs, '0x' + d.input.replace(d.methodId, ''));
//           const timestamp = parseInt(d.timeStamp) * 1000;
//           return {
//               ...d,
//               args,
//               timestamp,
//               canVerifyAfter: timestamp + 3600000,
//               canBeVerified: (now - timestamp) >= 3600000,
//           }
//       });
//       const baseProvider = getBaseProvider()!;
//       const l2tokens = [...new Set(filteredList.map(r => r.args._l2Token))];
//       // TODO: use Base multicall
//       const [
//           decimals,
//           symbols,
//           statuses,
//       ] = await Promise.all([
//           Promise.all(
//               l2tokens.map((l2token) => {
//                   return l2token.toLowerCase() === L2_ETH_TOKEN.toLowerCase() ?
//                       Promise.resolve(18)
//                       : (new Contract(l2token, ERC20_ABI, baseProvider)).decimals();
//               }),
//           ),
//           Promise.all(
//               l2tokens.map((l2token) => {
//                   return l2token.toLowerCase() === L2_ETH_TOKEN.toLowerCase() ?
//                       Promise.resolve('ETH')
//                       : (new Contract(l2token, ERC20_ABI, baseProvider)).symbol();
//               }),
//           ),
//           getTransactionsStatuses(
//               filteredList.map(r => r.hash),
//               ethProvider.getSigner(),
//           ),
//       ]);

//       const results = filteredList.map((d, i) => {
//           const l2tokenIndex = l2tokens.indexOf(d.args._l2Token);
//           return {
//               ...d,
//               token: d.args._l2Token,
//               amount: getBnToNumber(d.args._amount, decimals[l2tokenIndex]),
//               symbol: symbols[l2tokenIndex],
//               statuses: statuses[i],
//               shortDescription: statuses[i][0].shortDescription,
//           }
//       });

//       return { hasError: false, results }
//   } catch (error) {
//       console.log(error)
//       return { hasError: true, results: [], error }
//   }
// }

const useBaseWithdrawals = () => {}

// export function indexerTxToBridgeWithdrawal(tx: WithdrawalItem): BridgeTransaction {
//   if (tx.l1TokenAddress === ETH_TOKEN_ADDRESS) {
//     // ETH Withdrawal (OP)
//     return {
//       type: 'Withdrawal',
//       from: tx.from,
//       to: tx.to,
//       assetSymbol: 'ETH',
//       amount: tx.amount,
//       blockTimestamp: tx.timestamp.toString(),
//       hash: tx.transactionHash as `0x${string}`,
//       priceApiId: 'ethereum',
//       protocol: 'OP',
//     };
//   }

//   const token = assetList.find(
//     (asset) =>
//       asset.L1chainId === parseInt(publicRuntimeConfig.l1ChainID) &&
//       asset.L1contract?.toLowerCase() === tx.l1TokenAddress.toLowerCase() &&
//       asset.L2contract?.toLowerCase() === tx.l2TokenAddress.toLowerCase(),
//   ) as Asset;
//   return {
//     type: 'Withdrawal',
//     from: tx.from,
//     to: tx.to,
//     assetSymbol: token?.L2symbol ?? 'Unlisted',
//     amount: tx.amount,
//     blockTimestamp: tx.timestamp.toString(),
//     hash: tx.transactionHash as `0x${string}`,
//     priceApiId: token?.apiId,
//     protocol: 'OP',
//   };
// }

// function indexerTxToBridgeWithdrawals(transactions: any[]): BridgeTransaction[] {
//   return transactions.map((tx) => indexerTxToBridgeWithdrawal(tx));
// }

// export type BridgeTransaction = {
//   type: TransactionType;
//   from: string;
//   to: string;
//   assetSymbol: string;
//   amount: string;
//   blockTimestamp: string;
//   hash: `0x${string}`;
//   status?: TransactionStatus;
//   priceApiId: string;
//   assetDecimals?: number;
//   protocol: BridgeProtocol;
// };

interface WithdrawalItem {
  amount: string
  claimTransactionHash: string
  from: string
  guid: string
  l1TokenAddress: string
  l2BlockHash: string
  l2TokenAddress: string
  messageHash: string
  proofTransactionHash: string
  timestamp: number
  to: string
  transactionHash: string
}

async function fetchOPWithdrawals(address: string) {
  const response = await fetch('https://bridge-api.base.org/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'indexer_getAllWithdrawalsByAddress',
      params: [address, ChainId.Base],
      id: 0,
    }),
  })

  const { result: withdrawals } = (await response.json()) as {
    result: WithdrawalItem[] | null
  }

  console.log('result', withdrawals)

  // return indexerTxToBridgeWithdrawals(
  //   (withdrawals ?? []).filter((withdrawal) =>
  //     isIndexerTxETHOrERC20Withdrawal(withdrawal)
  //   )
  // )
}

const BridgeWithdrawals = () => {
  useEffect(() => {
    fetchOPWithdrawals('0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4')
  }, [])

  return (
    <Box>
      <Text variant="title">Withdrawal Transactions</Text>
    </Box>
  )
}

export default BridgeWithdrawals
