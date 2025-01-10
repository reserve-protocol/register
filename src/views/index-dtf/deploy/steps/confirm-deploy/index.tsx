import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { useAtom } from 'jotai'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { DeployInputs } from '../../form-fields'
import { indexDeployFormDataAtom } from './atoms'
import ManualIndexDeploy from './manual'
import DaoToken from './components/dao-token'

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
        <DrawerTitle className="p-4">Deploy DTF</DrawerTitle>
        <DaoToken />
        <ManualIndexDeploy />
      </DrawerContent>
    </Drawer>
  )
}

export default ConfirmIndexDeploy
