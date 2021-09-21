import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge'

const NETWORK_ADDRESS = 'http://127.0.0.1:8545/'
const TEST_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
// address of the above key
export const TEST_ADDRESS_NEVER_USE = new Wallet(TEST_PRIVATE_KEY).address

export const TEST_ADDRESS_NEVER_USE_SHORTENED = `${TEST_ADDRESS_NEVER_USE.substr(
  0,
  6
)}...${TEST_ADDRESS_NEVER_USE.substr(-4, 4)}`

class CustomizedBridge extends Eip1193Bridge {
  async sendAsync(...args) {
    console.debug('sendAsync called', ...args)
    return this.send(...args)
  }

  async send(...args) {
    console.debug('send called', ...args)
    const isCallbackForm =
      typeof args[0] === 'object' && typeof args[1] === 'function'
    let callback
    let method
    let params
    if (isCallbackForm) {
      callback = args[1]
      // eslint-disable-next-line prefer-destructuring
      method = args[0].method
      // eslint-disable-next-line prefer-destructuring
      params = args[0].params
    } else {
      method = args[0]
      params = args[1]
    }
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
      console.log('result asdasdsadasdsadasdas', [TEST_ADDRESS_NEVER_USE])
      if (isCallbackForm) {
        return callback({ result: [TEST_ADDRESS_NEVER_USE] })
      }
      return Promise.resolve([TEST_ADDRESS_NEVER_USE])
    }
    if (method === 'eth_chainId') {
      if (isCallbackForm) {
        return callback(null, { result: '0x7A69' })
      }
      return Promise.resolve('0x7A69')
    }
    try {
      const result = await super.send(method, params)
      console.debug('result received', method, params, result)
      if (isCallbackForm) {
        return callback(null, { result })
      }
      return result
    } catch (error) {
      if (isCallbackForm) {
        return callback(error, null)
      }
      throw error
    }
  }
}

// sets up the injected provider to be a mock ethereum provider with the given mnemonic/index
Cypress.Commands.overwrite('visit', (original, url, options) => {
  return original(url, {
    ...options,
    onBeforeLoad(win) {
      if (options && options.onBeforeLoad) {
        options.onBeforeLoad(win)
      }
      // const provider = new PrivateKeyProvider(TEST_PRIVATE_KEY, NETWORK_ADDRESS)
      // win.web3 = new Web3(provider)
      // win.localStorage.clear()
      const provider = new JsonRpcProvider(NETWORK_ADDRESS, 31337)
      const signer = new Wallet(TEST_PRIVATE_KEY, provider)
      // eslint-disable-next-line no-param-reassign
      win.ethereum = new CustomizedBridge(signer, provider)
      console.log('ethereum', win.ethereum)
    },
  })
})
