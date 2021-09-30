import { Card } from 'theme-ui'

// const RTokenContract = new ethers.Contract(RTOKEN_ADDRESS, RTokenAbi)

const RToken = () => (
  // const { account } = useEthers()
  // const [symbol] =
  //   useContractCall({
  //     abi: RTokenContract.interface,
  //     address: RTOKEN_ADDRESS,
  //     method: 'symbol',
  //     args: [],
  //   }) ?? []
  // const balance = useTokenBalance(RTOKEN_ADDRESS, account)
  // const [basket] = useRTokenBasket(RTokenContract)

  // console.log('basket', basket)

  <Card title="Rtoken">
    {/* <Text>
        <b>Symbol: </b> {symbol}
      </Text>
      <Text>
        <b>Balance: </b> {!!balance && ethers.utils.formatEther(balance)}
      </Text>
      <Text my={1}>
        <b>Basket Tokens</b>
      </Text> */}
  </Card>
)

export default RToken
