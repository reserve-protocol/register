import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { Pagination } from '@/components/design-system-v1/pagination'
const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  args: {
    currentPage: 2,
    pageCount: 8,
    totalCount: 156,
    visibleCount: 20,
    onPageChange: () => {},
  },
  argTypes: {
    currentPage: { control: { type: 'number', min: 1, max: 8 } },
    onPageChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Import Pagination from @/components/design-system-v1/pagination. The caller owns page data; first/last boundaries disable the corresponding action.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[min(48rem,90vw)]">
        <Story />
      </div>
    ),
  ],
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <Pagination
        {...args}
        onPageChange={(currentPage) => updateArgs({ currentPage })}
      />
    )
  },
} satisfies Meta<typeof Pagination>
export default meta
type Story = StoryObj<typeof meta>
export const Middle: Story = {}
export const First: Story = { args: { currentPage: 1 } }
export const Last: Story = { args: { currentPage: 8, visibleCount: 16 } }
export const Narrow: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
