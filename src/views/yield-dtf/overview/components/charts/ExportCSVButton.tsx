import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import useExportCSV, { UseExportCSVProps } from './useExportCSV'
import { FileDown } from 'lucide-react'

interface ExportCSVButtonProps extends UseExportCSVProps {}

const ExportCSVButton = ({ headers, rows, filename }: ExportCSVButtonProps) => {
  const exportToCSV = useExportCSV({ headers, rows, filename })

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="muted"
            size="sm"
            onClick={exportToCSV}
            className="h-8 px-2 gap-1"
          >
            <FileDown size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download CSV</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ExportCSVButton
