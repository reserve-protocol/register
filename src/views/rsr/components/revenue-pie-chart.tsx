import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatCurrency } from '@/utils'

interface RevenuePieChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  height?: number
}

const RevenuePieChart = ({ data, height = 300 }: RevenuePieChartProps) => {
  // Filter out zero values
  const filteredData = data.filter(item => item.value > 0)

  if (filteredData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        No revenue data available
      </div>
    )
  }

  const total = filteredData.reduce((sum, item) => sum + item.value, 0)

  const config = filteredData.reduce((acc, item) => {
    acc[item.name] = {
      label: item.name,
      color: item.color
    }
    return acc
  }, {} as any)

  return (
    <ChartContainer config={config} className="w-full" style={{ height }}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={
            <ChartTooltipContent
              formatter={(value: any) => {
                const numValue = Number(value)
                const percentage = ((numValue / total) * 100).toFixed(1)
                return (
                  <div className="flex items-center justify-between gap-2">
                    <span>${formatCurrency(numValue, 0)}</span>
                    <span className="text-muted-foreground">({percentage}%)</span>
                  </div>
                )
              }}
            />
          }
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value, entry: any) => (
            <span className="text-sm">
              {value} (${formatCurrency(entry.payload.value, 0)})
            </span>
          )}
        />
      </PieChart>
    </ChartContainer>
  )
}

export default RevenuePieChart