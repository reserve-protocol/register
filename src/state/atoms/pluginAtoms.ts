import { atom } from 'jotai'
import { CVX_ADDRESS, STAKE_AAVE_ADDRESS } from 'utils/addresses'
import collateralPlugins from 'utils/plugins'
import { chainIdAtom } from './chainAtoms'

export const pluginsAtom = atom((get) => collateralPlugins[get(chainIdAtom)])

export const aavePluginsAtom = atom((get) =>
  get(pluginsAtom).filter(
    (p) => p.rewardToken.indexOf(STAKE_AAVE_ADDRESS[get(chainIdAtom)]) !== -1
  )
)

export const convexPluginsAtom = atom((get) =>
  get(pluginsAtom).filter((p) =>
    p.rewardToken.includes(CVX_ADDRESS[get(chainIdAtom)])
  )
)
