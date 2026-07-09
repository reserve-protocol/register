import { useTrackIndexDTF } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { useAtomValue } from 'jotai'
import { operationAtom } from '../atoms'

export const useTrackAsyncZap = () => {
  const { track } = useTrackIndexDTF(
    'index-dtf-async-zap',
    'issuance',
    'mint-async-wizard'
  )
  const operation = useAtomValue(operationAtom)

  return {
    track: (action: string, props?: Record<string, unknown>) =>
      track(action, { operation, action, ...props }),
  }
}
