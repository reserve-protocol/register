import { atom } from 'jotai'
import { DEPLOY_SECTIONS, DeploySection } from './components/deploy-accordion'

export const deploySectionAtom = atom<DeploySection['title']>('')
