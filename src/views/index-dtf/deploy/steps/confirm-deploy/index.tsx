import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { useAtom, useAtomValue } from 'jotai'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { DeployInputs } from '../../form-fields'
import { indexDeployFormDataAtom } from './atoms'
import ManualIndexDeploy from './manual'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SimpleIndexDeploy from './simple'
import { deployedDTFAtom, formReadyForSubmitAtom } from '../../atoms'
import SuccessView from './success'

const Header = () => {
  const form = useAtomValue(indexDeployFormDataAtom)

  return (
    <div className="p-6 py-2">
      <h1 className="text-primary text-2xl font-bold">
        Create the genesis token
      </h1>
      <p className="mt-1">
        You need mint at least ${form?.initialValue} worth of {form?.symbol} in
        order to create your new Index DTF.
      </p>
    </div>
  )
}

const ConfirmIndexDeploy = () => {
  const { handleSubmit } = useFormContext<DeployInputs>()
  const [formData, setFormData] = useAtom(indexDeployFormDataAtom)
  const formReadyForSubmit = useAtomValue(formReadyForSubmitAtom)
  const deployedDTF = useAtomValue(deployedDTFAtom)

  const processForm: SubmitHandler<DeployInputs> = (data) => {
    setFormData(data)
  }

  const submitForm = () => {
    handleSubmit(processForm)()
  }

  return (
    <Drawer open={!!formData}>
      <Button
        className="w-full"
        disabled={!formReadyForSubmit}
        onClick={submitForm}
      >
        Deploy
      </Button>

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
                <TabsTrigger value="simple" className="w-max h-7">
                  Simple deploy
                </TabsTrigger>
                <TabsTrigger value="manual" className="w-max h-7">
                  Manual deploy
                </TabsTrigger>
              </TabsList>
            </DrawerTitle>
            <Header />
            <TabsContent
              value="simple"
              className="flex-grow overflow-auto relative"
            >
              <SimpleIndexDeploy />
            </TabsContent>
            <TabsContent
              value="manual"
              className="flex-grow overflow-auto relative"
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
