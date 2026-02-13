import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import {
  basketDerivedSharesAtom,
  basketInputTypeAtom,
  daoTokenAddressAtom,
  deployedDTFAtom,
} from '../../atoms'
import { DeployInputs } from '../../form-fields'
import { indexDeployFormDataAtom, triggerDeployDrawerAtom } from './atoms'
import ManualIndexDeploy from './manual'
import { initialTokensAtom } from './manual/atoms'
import SimpleIndexDeploy from './simple'
import { inputAmountAtom } from './simple/atoms'
import SuccessView from './success'
import Ticker from '../../utils/ticker'
import { TransactionButtonContainer } from '@/components/ui/transaction-button'
import { Address } from 'viem'

const Header = () => {
  const form = useAtomValue(indexDeployFormDataAtom)

  return (
    <div className="p-6 py-2">
      <h1 className="text-primary text-2xl font-bold">
        Create the genesis token
      </h1>
      <p className="mt-1">
        You need to mint at least $1 worth of {form?.symbol} in order to create
        your new Index DTF.
      </p>
    </div>
  )
}

const ConfirmIndexDeploy = ({ isActive }: { isActive: boolean }) => {
  const { handleSubmit, watch } = useFormContext<DeployInputs>()
  const deployedDTF = useAtomValue(deployedDTFAtom)
  const setFormData = useSetAtom(indexDeployFormDataAtom)
  const setStTokenAddress = useSetAtom(daoTokenAddressAtom)
  const resetInitialTokens = useResetAtom(initialTokensAtom)
  const resetInput = useResetAtom(inputAmountAtom)
  const formChainId = watch('chain')
  // for input type case
  const derivedShares = useAtomValue(basketDerivedSharesAtom)
  const inputType = useAtomValue(basketInputTypeAtom)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [triggerDeploy, setTriggerDeploy] = useAtom(triggerDeployDrawerAtom)

  const processForm: SubmitHandler<DeployInputs> = (data) => {
    // Apply unit basket transformation regardless of DAO type
    const processedData = {
      ...data,
      tokensDistribution:
        inputType === 'unit' && derivedShares
          ? Object.keys(derivedShares).map((address) => ({
              address: address as Address,
              percentage: Number(derivedShares[address]),
            }))
          : data.tokensDistribution,
    }

    setFormData(processedData)

    if (data.governanceVoteLock) {
      setStTokenAddress(data.governanceVoteLock)
    }
  }

  const submitForm = () => {
    handleSubmit(processForm)()
  }

  // Open drawer programmatically (e.g. from NextButton in permissionless flow)
  useEffect(() => {
    if (triggerDeploy && isActive) {
      submitForm()
      setDrawerOpen(true)
      setTriggerDeploy(false)
    }
  }, [triggerDeploy, isActive])

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <TransactionButtonContainer chain={formChainId}>
        <DrawerTrigger disabled={!isActive} asChild>
          <Button
            className="w-full"
            disabled={!isActive}
            onClick={() => {
              submitForm()
              setDrawerOpen(true)
            }}
          >
            <span>
              Create <Ticker defaultSymbol="" />
            </span>
          </Button>
        </DrawerTrigger>
      </TransactionButtonContainer>

      {deployedDTF ? (
        <DrawerContent className="text-white max-h-[900px]">
          <SuccessView />
        </DrawerContent>
      ) : (
        <DrawerContent>
          <Tabs
            defaultValue="simple"
            className="flex flex-col flex-grow overflow-hidden relative"
          >
            <DrawerTitle className="p-4">
              <TabsList className="h-9">
                <TabsTrigger
                  value="simple"
                  className="w-max h-7"
                  onClick={() => {
                    resetInitialTokens()
                    resetInput()
                  }}
                >
                  Simple deploy
                </TabsTrigger>
                <TabsTrigger
                  value="manual"
                  className="w-max h-7"
                  onClick={resetInitialTokens}
                >
                  Manual deploy
                </TabsTrigger>
              </TabsList>
            </DrawerTitle>
            <Header />
            <TabsContent
              value="simple"
              className="flex-grow overflow-auto relative"
              // Prevent the drawer from closing when clicking on the content
              onPointerDown={(e) => e.stopPropagation()}
            >
              <SimpleIndexDeploy />
            </TabsContent>
            <TabsContent
              value="manual"
              className="flex-grow overflow-auto relative"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <ManualIndexDeploy />
            </TabsContent>
          </Tabs>
        </DrawerContent>
      )}
    </Drawer>
  )
}

export default ConfirmIndexDeploy
