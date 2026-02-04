import { ArrowDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import ZapOperationDetails from './ZapOperationDetails'
import ZapRedeemDisabled from './ZapRedeemDisabled'
import ZapTabs from './ZapTabs'
import ZapInputContainer from './input/ZapInputContainer'
import ZapOutputContainer from './output/ZapOutputContainer'
import ZapSubmit from './submit/ZapSubmit'

const InputOutputSeparator = () => (
  <div className="flex items-center">
    <hr className="flex-grow border-secondary" />
    <div className="h-8 w-8 flex items-center justify-center mx-4 my-2 border border-secondary rounded-lg">
      <ArrowDown size={16} color="#666666" />
    </div>
    <hr className="flex-grow border-secondary" />
  </div>
)

const RTokenZapIssuance = ({ disableRedeem }: { disableRedeem: boolean }) => {
  return (
    <Card className="lg:mr-6 rounded-3xl bg-card shadow-lg h-fit">
      <div className="flex items-center border-b border-border p-6">
        <ZapTabs />
      </div>
      <div className="p-4 flex flex-col relative">
        <ZapRedeemDisabled disableRedeem={disableRedeem} />
        <ZapInputContainer />
        <InputOutputSeparator />
        <ZapOutputContainer />
        <ZapOperationDetails />
        <ZapSubmit />
      </div>
    </Card>
  )
}

export default RTokenZapIssuance
