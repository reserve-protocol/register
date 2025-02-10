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
import { ScrollArea } from '@/components/ui/scroll-area'
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
  const form = useAtomValue(indexDeployFormDataAtom)
  const [initialTokens, setInitialTokens] = useAtom(initialTokensAtom)

  return (
    <div>
      <h4 className="font-bold ml-2">How much do you want to mint?</h4>

      <div className="flex flex-col  mt-2 p-4 bg-muted rounded-3xl">
        <label htmlFor="manual-input">Mint Amount:</label>

        <div className="flex items-center">
          <div className="flex flex-col flex-grow min-w-0">
            <NumericalInput
              value={initialTokens.toString()}
              variant="transparent"
              placeholder="0"
              onChange={(value: string) => setInitialTokens(value)}
              autoFocus
            />
            <div className="w-full overflow-hidden">
              {/* <span className="text-legend mt-1.5 block truncate">{price}</span> */}
            </div>
          </div>
          <span className="text-2xl max-w-52 break-words font-bold">
            {form?.symbol}
          </span>
        </div>
      </div>
    </div>
  )
}

const ManualIndexDeploy = () => (
  <div className="flex flex-col h-full">
    <ScrollArea className="overflow-auto px-4">
      <InitialFolioInput />
      <DeployAssetsApproval />
    </ScrollArea>
    <div className="p-4">
      <ConfirmManualDeployButton />
    </div>
    <AssetAllowanceUpdater />
  </div>
)

export default ManualIndexDeploy
