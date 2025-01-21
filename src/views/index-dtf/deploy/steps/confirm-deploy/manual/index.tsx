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
        placeholder="Enter initial amount of tokens"
        onChange={setInitialTokens}
        value={initialTokens}
      />
    </div>
  )
}

const ManualIndexDeploy = () => (
  <>
    <div className="flex-grow px-4">
      <InitialFolioInput />
      <DeployAssetsApproval />
    </div>
    <DrawerFooter className="p-4">
      <ConfirmManualDeployButton />
    </DrawerFooter>
    <AssetAllowanceUpdater />
  </>
)

export default ManualIndexDeploy
