"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface ChartDataPoint {
  date: string
  orders: number
}

interface OrdersChartProps {
  data: ChartDataPoint[]
}

export function OrdersChart({ data }: OrdersChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickLine={false}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          className="fill-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="hsl(38, 92%, 50%)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "hsl(38, 92%, 50%)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
