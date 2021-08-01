import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge'

const NETWORK_ADDRESS = 'https://ropsten.infura.io/v3/19deb2b36da947f493d2db11ce04be63'
const TEST_PRIVATE_KEY = '0xe580410d7c37d26c6ad1a837bbae46bc27f9066a466fb3a66e770523b4666d19'
// address of the above key
export const TEST_ADDRESS_NEVER_USE = new Wallet(TEST_PRIVATE_KEY).address

// export const TEST_ADDRESS_NEVER_USE_SHORTENED = `${TEST_ADDRESS_NEVER_USE.substr(
//   0,
//   6,
// )}...${TEST_ADDRESS_NEVER_USE.substr(-4, 4)}`

class CustomizedBridge extends Eip1193Bridge {
  constructor() {
    super()
    this.chainId = 4
  }

  async sendAsync(...args) {
    console.debug('sendAsync called', ...args)
    return this.send(...args)
  }

  // eslint-disable-next-line consistent-return
  async send(...args) {
    console.debug('send called', ...args)
    const isCallbackForm = typeof args[0] === 'object' && typeof args[1] === 'function'
    let callback
    let method
    let params
    if (isCallbackForm) {
      // eslint-disable-next-line prefer-destructuring
      callback = args[1]
      method = args[0].method
      params = args[0].params
    } else {
      // eslint-disable-next-line prefer-destructuring
      method = args[0]
      // eslint-disable-next-line prefer-destructuring
      params = args[1]
    }
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
      if (isCallbackForm) {
        callback({ result: [TEST_ADDRESS_NEVER_USE] })
      } else {
        return Promise.resolve([TEST_ADDRESS_NEVER_USE])
      }
    }
    if (method === 'eth_chainId') {
      if (isCallbackForm) {
        callback(null, { result: '0x4' })
      } else {
        return Promise.resolve('0x4')
      }
    }
    try {
      const result = await super.send(method, params)
      console.debug('result received', method, params, result)
      if (isCallbackForm) {
        callback(null, { result })
      } else {
        return result
      }
    } catch (error) {
      if (isCallbackForm) {
        callback(error, null)
      } else {
        throw error
      }
    }
  }
}

// sets up the injected provider to be a mock ethereum provider with the given mnemonic/index
// eslint-disable-next-line no-undef
Cypress.Commands.overwrite('visit', (original, url, options) => (
  original(url.startsWith('/') && url.length > 2 && !url.startsWith('/#') ? `/#${url}` : url, {
    ...options,
    onBeforeLoad(win) {
    // eslint-disable-next-line no-unused-expressions
      options && options.onBeforeLoad && options.onBeforeLoad(win)
      win.localStorage.clear()
      const provider = new JsonRpcProvider(NETWORK_ADDRESS, 4)
      const signer = new Wallet(TEST_PRIVATE_KEY, provider)
      // eslint-disable-next-line no-param-reassign
      win.ethereum = new CustomizedBridge(signer, provider)
    },
  })))
