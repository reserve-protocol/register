import { atom } from 'jotai'
import { CHAIN_ID } from 'utils/chains'
/**
 * This file contains application level atoms
 * At some point this file is expected to be divided into multiple files per atom type
 */
import { providers } from 'ethers'

/**
 * #########################
 * Chain state related atoms
 * #########################
 */
export const chainIdAtom = atom<number | undefined>(CHAIN_ID)
export const blockAtom = atom<number | undefined>(undefined)
export const blockTimestampAtom = atom<number>(0)
export const walletAtom = atom('')
export const providerAtom = atom(
  undefined as undefined | providers.Web3Provider
)
