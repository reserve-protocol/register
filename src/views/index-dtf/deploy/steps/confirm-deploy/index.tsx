import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { useAtom } from 'jotai'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { DeployInputs } from '../../form-fields'
import { indexDeployFormDataAtom } from './atoms'
import ManualIndexDeploy from './manual'

const mockData: DeployInputs = {
  name: 'test',
  symbol: 'test',
  initialValue: 1,
  tokensDistribution: [
    { address: '0xab36452dbac151be02b16ca17d8919826072f64a', percentage: 50 },
    { address: '0x940181a94a35a4569e4529a3cdfb74e38fd98631', percentage: 50 },
  ],
  governanceERC20address: '0xaB36452DbAC151bE02b16Ca17d8919826072f64a',
  folioFee: 0,
  governanceShare: 100,
  deployerShare: 0,
  fixedPlatformFee: 0,
  additionalRevenueRecipients: [],
  auctionLength: 15,
  auctionDelay: 15,
  auctionLauncher: '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
  customAuctionLength: 0,
  customAuctionDelay: 0,
  additionalAuctionLaunchers: [],
  guardianAddress: '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
  brandManagerAddress: '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
  basketVotingPeriod: 20,
  basketVotingQuorum: 20,
  basketExecutionDelay: 20,
  governanceVotingPeriod: 20,
  governanceVotingQuorum: 20,
  governanceExecutionDelay: 20,
}

const ConfirmIndexDeploy = () => {
  const { handleSubmit } = useFormContext<DeployInputs>()
  const [formData, setFormData] = useAtom(indexDeployFormDataAtom)
  const processForm: SubmitHandler<DeployInputs> = (data) => {
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
        <DrawerTitle className="p-4">Deploy DTF</DrawerTitle>
        <ManualIndexDeploy />
      </DrawerContent>
    </Drawer>
  )
}

export default ConfirmIndexDeploy
