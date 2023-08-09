import { gql } from 'graphql-request'

const tradesQuery = gql`
  query Trades($id: String!, $time: Int!) {
    current: trades(
      where: { endAt_gt: $time, rToken: $id, kind: 0 }
      orderBy: startedAt
      orderDirection: desc
    ) {
      id
      amount
      buying
      buyingTokenSymbol
      sellingTokenSymbol
      endAt
      selling
      startedAt
      worstCasePrice
      startBlock
      endBlock
    }
    ended: trades(
      where: { endAt_lte: $time, rToken: $id, kind: 0 }
      orderBy: startedAt
      orderDirection: desc
      first: 50
    ) {
      id
      amount
      buying
      buyingTokenSymbol
      sellingTokenSymbol
      endAt
      selling
      startedAt
      startBlock
      endBlock
      worstCasePrice
    }
  }
`

amount: BigDecimal!
;(' Min buy amount ')
minBuyAmount: BigDecimal!
;(' amount bought (on settle) ')
boughtAmount: BigDecimal
;(' Worst case price ')
worstCasePrice: BigDecimal!
;(' Selling token ')
selling: String!
;(' Buying token ')
buying: String!
;(' Sell tokens symbol ')
sellingTokenSymbol: String!
;(' Buy token symbol ')
buyingTokenSymbol: String!
;(' started At timestamp ')
startedAt: BigInt!
;(' Started block (dutch) ')
startBlock: BigInt
;(' End Block ')
endblock: BigInt
;(' End time timestamp ')
endAt: BigInt!
;(' rToken id ')
rToken: RToken!
;(' is Settled ')
isSettled: Boolean!
;(' Trade kind 0 = dutch 1 = batch ')
kind: Int!

const useDutchTrades = () => {}

export default useDutchTrades
