import { Component } from 'react'
import RpayFeed from './rpay/RpayFeed'
import RTokenUpdater from './rtoken/updater'
import CollateralYieldUpdater from './updaters/CollateralYieldUpdater'
import PricesUpdater from './updaters/PriceUpdater'
import AccountUpdater from './wallet/updaters/AccountUpdater'
import { TokenBalancesUpdater } from './wallet/updaters/TokenBalancesUpdater'
import { useChainId } from 'wagmi'

class CatchErrors extends Component<{ children: any }> {
  state = {
    hasError: false,
  }
  constructor(props: any) {
    super(props)
  }
  componentDidCatch() {
    this.setState({ hasError: true })
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return <>{this.props.children}</>
  }
}
/**
 * Updater
 */
const Updater = () => {
  const id = useChainId()

  return (
    <CatchErrors key={id}>
      <PricesUpdater />
      <AccountUpdater />
      <RpayFeed />
      <RTokenUpdater />
      <CollateralYieldUpdater />
      <TokenBalancesUpdater />
    </CatchErrors>
  )
}

export default Updater
