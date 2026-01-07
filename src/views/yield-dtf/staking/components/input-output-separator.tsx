import { ArrowDown } from 'lucide-react'

const InputOutputSeparator = () => (
  <div className="flex items-center">
    <hr className="flex-grow border-secondary" />
    <div className="h-8 w-8 flex items-center justify-center mx-4 my-2 border border-secondary rounded-lg">
      <ArrowDown size={16} color="#666666" />
    </div>
    <hr className="flex-grow border-secondary" />
  </div>
)

export default InputOutputSeparator
