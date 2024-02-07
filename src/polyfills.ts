import { Buffer } from 'buffer'

window.global = window.global ?? window
window.Buffer = window.Buffer ?? Buffer
window.process = window.process ?? { env: {} } // Minimal process polyfill

// TODO: Typing for coinbase wallet integration?
declare global {
  interface Window {
    CBWSubscribe: any
  }
}

export {}
