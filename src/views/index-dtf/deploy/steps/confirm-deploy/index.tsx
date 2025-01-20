import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { useAtom } from 'jotai'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { DeployInputs } from '../../form-fields'
import { indexDeployFormDataAtom } from './atoms'
import ManualIndexDeploy from './manual'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SimpleIndexDeploy from './simple'

const mockData: DeployInputs = {
  name: 'test',
  symbol: 'test',
  initialValue: 1,
  tokensDistribution: [
    { address: '0xab36452dbac151be02b16ca17d8919826072f64a', percentage: 100 },
  ],
  governanceERC20address: '0xaB36452DbAC151bE02b16Ca17d8919826072f64a',
  folioFee: 0,
  mintFee: 0.05,
  governanceShare: 60,
  deployerShare: 20,
  fixedPlatformFee: 20,
  additionalRevenueRecipients: [],
  auctionLength: 15,
  auctionDelay: 15,
  auctionLauncher: '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
  additionalAuctionLaunchers: [],
  guardianAddress: '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
  brandManagerAddress: '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
  basketVotingDelay: 20,
  basketVotingPeriod: 20,
  basketVotingQuorum: 20,
  basketVotingThreshold: 0.01,
  basketExecutionDelay: 20,
  governanceVotingDelay: 20,
  governanceVotingPeriod: 20,
  governanceVotingQuorum: 20,
  governanceExecutionDelay: 20,
  governanceVotingThreshold: 0.01,
}

const Header = () => {
  const { watch } = useFormContext<DeployInputs>()

  return (
    <div className="p-6">
      <h1 className="text-primary text-2xl font-bold">
        Create the genesis token
      </h1>
      <p className="mt-1">
        You need mint at least $1 worth of {watch('symbol')} in order to create
        your new Index DTF.
      </p>
    </div>
  )
}

const ConfirmIndexDeploy = () => {
  const { handleSubmit } = useFormContext<DeployInputs>()
  const [formData, setFormData] = useAtom(indexDeployFormDataAtom)
  const processForm: SubmitHandler<DeployInputs> = (data) => {
    console.log('data', JSON.stringify(data))
    setFormData(data)
  }

  const submitForm = () => {
    handleSubmit(processForm)()
  }

  return (
    <Drawer open={!!formData} onClose={() => setFormData(undefined)}>
      <Button
        className="w-full"
        // disabled={!formReadyForSubmit}
        // onClick={submitForm}
        onClick={() => setFormData(mockData)}
      >
        Deploy
      </Button>

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
    </Drawer>
  )
}

export default ConfirmIndexDeploy
