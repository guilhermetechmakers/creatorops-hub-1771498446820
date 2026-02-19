import { BarChart3, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const barData = [
  { name: 'Instagram', posts: 24, engagement: 3200 },
  { name: 'X', posts: 18, engagement: 4100 },
  { name: 'YouTube', posts: 6, engagement: 8900 },
]

const pieData = [
  { name: 'Published', value: 48, color: 'rgb(255,59,48)' },
  { name: 'Scheduled', value: 15, color: 'rgb(90,90,90)' },
  { name: 'Draft', value: 22, color: 'rgb(49,49,52)' },
]

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Analytics & Reports
        </h1>
        <p className="text-muted-foreground">
          Measure content impact and operational metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Posts Published', value: '48', change: '+12%', icon: BarChart3 },
          { title: 'Avg Time to Publish', value: '2.4d', change: '-15%', icon: TrendingUp },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <item.icon className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">{item.title}</p>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-green-500">{item.change} vs last month</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold">Posts by Channel</h3>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(49,49,52)" />
                <XAxis dataKey="name" stroke="rgb(179,179,179)" />
                <YAxis stroke="rgb(179,179,179)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(24,24,26)',
                    border: '1px solid rgb(49,49,52)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="posts" fill="rgb(255,59,48)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold">Content Status</h3>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
