import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import {
  isGovernorFilterAtom,
  isGuardianFilterAtom,
  isCreatorFilterAtom,
  currentPageAtom,
  dateFilterAtom,
  chainFilterAtom
} from '../atoms'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

const DTFFilters = () => {
  const [isGovernorFilter, setIsGovernorFilter] = useAtom(isGovernorFilterAtom)
  const [isGuardianFilter, setIsGuardianFilter] = useAtom(isGuardianFilterAtom)
  const [isCreatorFilter, setIsCreatorFilter] = useAtom(isCreatorFilterAtom)
  const setCurrentPage = useSetAtom(currentPageAtom)
  const setDateFilter = useSetAtom(dateFilterAtom)
  const setChainFilter = useSetAtom(chainFilterAtom)
  
  const hasActiveFilters = isGovernorFilter || isGuardianFilter || isCreatorFilter
  
  const handleFilterChange = (
    setter: (value: boolean) => void
  ) => (checked: boolean) => {
    setter(checked)
    setCurrentPage(0) // Reset to first page when filter changes
  }
  
  const handleResetFilters = () => {
    setIsGovernorFilter(false)
    setIsGuardianFilter(false)
    setIsCreatorFilter(false)
    setCurrentPage(0)
  }
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Filter by Role</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-8 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="governor-filter"
            checked={isGovernorFilter}
            onCheckedChange={handleFilterChange(setIsGovernorFilter)}
          />
          <Label
            htmlFor="governor-filter"
            className="text-sm font-normal cursor-pointer"
          >
            DTFs where I'm a Governor
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="guardian-filter"
            checked={isGuardianFilter}
            onCheckedChange={handleFilterChange(setIsGuardianFilter)}
          />
          <Label
            htmlFor="guardian-filter"
            className="text-sm font-normal cursor-pointer"
          >
            DTFs where I'm a Guardian
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="creator-filter"
            checked={isCreatorFilter}
            onCheckedChange={handleFilterChange(setIsCreatorFilter)}
          />
          <Label
            htmlFor="creator-filter"
            className="text-sm font-normal cursor-pointer"
          >
            DTFs I created
          </Label>
        </div>
      </div>
      
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Showing DTFs matching your selected filters
          </p>
        </div>
      )}
    </Card>
  )
}

export default DTFFilters