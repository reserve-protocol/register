import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { Pagination } from '@/components/design-system-v1/pagination'
const meta = {
  title: 'Components/Navigation and disclosure/Pagination',
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
    onPageSizeChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          '`@/components/design-system-v1/pagination` · Table-independent paging with 1-based callbacks, an optional page-size Select, and a seven-item desktop or five-item mobile page window. Every control is 32px. Previous and Next stay fixed-width quiet actions; the current page is a non-clickable neutral selection.',
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
        onPageSizeChange={
          args.pageSizeOptions
            ? (pageSize) => updateArgs({ pageSize, currentPage: 1 })
            : undefined
        }
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
export const WithPageSize: Story = {
  name: 'With page size',
  args: { pageSize: 20, pageSizeOptions: [10, 20, 50] },
  parameters: {
    docs: {
      description: {
        story:
          'The optional page-size Select shares the 32px compact height. It sits with the summary, which shows from 768px.',
      },
    },
  },
}
