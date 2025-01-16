import { DrawerFooter } from '@/components/ui/drawer'
import { NumericalInput } from '@/components/ui/input'
import useTokensAllowance from '@/hooks/useTokensAllowance'
import { walletAtom } from '@/state/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  assetsAllowanceAtom,
  basketAllowanceAtom,
  initialTokensAtom,
} from './atoms'
import ConfirmManualDeployButton from './components/confirm-manual-deploy-button'
import DeployAssetsApproval from './components/deploy-assets-approvals'
import { indexDeployFormDataAtom } from '../atoms'

const AssetAllowanceUpdater = () => {
  const basketAssets = useAtomValue(basketAllowanceAtom)
  const wallet = useAtomValue(walletAtom)
  const result = useTokensAllowance(basketAssets, wallet ?? '')
  const setAssetsAllowance = useSetAtom(assetsAllowanceAtom)

  useEffect(() => {
    setAssetsAllowance(result)
  }, [result])

  return null
}

const InitialFolioInput = () => {
  const [initialTokens, setInitialTokens] = useAtom(initialTokensAtom)

  return (
    <div className="p-2">
      <NumericalInput
        placeholder="Enter initial tokens"
        onChange={setInitialTokens}
        value={initialTokens}
      />
    </div>
  )
}

const Preview = () => {
  const formData = useAtomValue(indexDeployFormDataAtom)

  return (
    <details className="p-2 rounded-lg bg-muted/50">
      <summary className="cursor-pointer font-medium">
        Preview Form Data
      </summary>
      <pre className="mt-2 p-4 rounded bg-muted overflow-auto">
        <code>{JSON.stringify(formData, null, 2)}</code>
      </pre>
    </details>
  )
}

const ManualIndexDeploy = () => (
  <>
    <div className="flex-grow">
      <InitialFolioInput />
      <DeployAssetsApproval />
      <Preview />
    </div>
    <DrawerFooter className="p-2">
      <ConfirmManualDeployButton />
    </DrawerFooter>
    <AssetAllowanceUpdater />
  </>
)

export default ManualIndexDeploy
