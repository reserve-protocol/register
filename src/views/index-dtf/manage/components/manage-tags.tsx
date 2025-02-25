import { MultiSelect } from '@/components/ui/multiselect'
import { Controller, useFormContext } from 'react-hook-form'

const options = [
  { value: 'AI', label: 'AI' },
  { value: 'Memes', label: 'Memes' },
  { value: 'L1', label: 'L1' },
  { value: 'L2', label: 'L2' },
  { value: 'DeFi', label: 'DeFi' },
  { value: 'DeSci', label: 'DeSci' },
  { value: 'DePin', label: 'DePin' },
  { value: 'RWA', label: 'RWA' },
  { value: 'SocialFi', label: 'SocialFi' },
  { value: 'GameFi', label: 'GameFi' },
  { value: 'Majors', label: 'Majors' },
  { value: 'Stablecoins', label: 'Stablecoins' },
  { value: 'Metaverse', label: 'Metaverse' },
  { value: 'Privacy', label: 'Privacy' },
  { value: 'Oracles', label: 'Oracles' },
  { value: 'LST', label: 'LST' },
  { value: 'LRT', label: 'LRT' },
  { value: 'Perps', label: 'Perps' },
  { value: 'Derivatives', label: 'Derivatives' },
  { value: 'ZK', label: 'ZK' },
  { value: 'Ecosystem', label: 'Ecosystem' },
  { value: 'Bitcoin', label: 'Bitcoin' },
  { value: 'Dogs', label: 'Dogs' },
  { value: 'Cats', label: 'Cats' },
]

export default function MultiSelectTags() {
  const { control, watch } = useFormContext()

  return (
    <div className="w-full">
      <label htmlFor="dtf.tags" className="ml-3 mb-1 block">
        DTF Category Tags
      </label>
      <Controller
        name="dtf.tags"
        control={control}
        render={({ field }) => (
          <MultiSelect
            {...field}
            isMulti
            options={options}
            className="w-full"
            classNamePrefix="select"
            placeholder="Choose tags..."
          />
        )}
      />
    </div>
  )
}
