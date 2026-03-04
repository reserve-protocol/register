import { useAtom, useSetAtom } from 'jotai'
import {
  dateFilterAtom,
  chainFilterAtom,
  currentPageAtom,
  searchFilterAtom,
} from '../atoms'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChainId } from '@/utils/chains'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calendar, Globe, Search } from 'lucide-react'

const DTFDateChainFilters = () => {
  const [dateFilter, setDateFilter] = useAtom(dateFilterAtom)
  const [chainFilter, setChainFilter] = useAtom(chainFilterAtom)
  const [search, setSearch] = useAtom(searchFilterAtom)
  const setCurrentPage = useSetAtom(currentPageAtom)

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value as typeof dateFilter)
    setCurrentPage(0) // Reset to first page
  }

  const handleChainFilterChange = (value: string) => {
    setChainFilter(value === 'all' ? 'all' : Number(value))
    setCurrentPage(0) // Reset to first page
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(0) // Reset to first page
  }

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or symbol"
              value={search}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4" />
            <span>Created</span>
          </div>
          <Select value={dateFilter} onValueChange={handleDateFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="15d">Last 15 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Globe className="h-4 w-4" />
            <span>Chain</span>
          </div>
          <Select
            value={chainFilter.toString()}
            onValueChange={handleChainFilterChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chains</SelectItem>
              <SelectItem value={ChainId.Mainnet.toString()}>
                Ethereum
              </SelectItem>
              <SelectItem value={ChainId.Base.toString()}>Base</SelectItem>
              <SelectItem value={ChainId.BSC.toString()}>BSC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}

export default DTFDateChainFilters