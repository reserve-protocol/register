import { Buffer } from 'buffer'
import { Address } from 'viem'

window.global = window.global ?? window
window.Buffer = window.Buffer ?? Buffer
window.process = window.process ?? { env: {} } // Minimal process polyfill

// TODO: Typing for coinbase wallet integration?
declare global {
  interface Window {
    CBWSubscribe: any
    e2e: { rpc: string; chainId: number; privateKey: Address }
  }
}

export {}
