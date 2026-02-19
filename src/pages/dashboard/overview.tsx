import { Calendar, FileText, Search, TrendingUp } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const chartData = [
  { name: 'Mon', posts: 4, research: 2 },
  { name: 'Tue', posts: 3, research: 5 },
  { name: 'Wed', posts: 5, research: 3 },
  { name: 'Thu', posts: 2, research: 4 },
  { name: 'Fri', posts: 6, research: 6 },
  { name: 'Sat', posts: 1, research: 1 },
  { name: 'Sun', posts: 0, research: 2 },
]

const todayEvents = [
  { time: '10:00', title: 'Instagram post review' },
  { time: '14:00', title: 'YouTube script draft due' },
  { time: '18:00', title: 'X thread scheduled' },
]

const recentDrafts = [
  { title: 'Q1 Campaign - Instagram Carousel', channel: 'Instagram', updated: '2h ago' },
  { title: 'Product Launch Thread', channel: 'X', updated: '5h ago' },
  { title: 'Tutorial Script v2', channel: 'YouTube', updated: '1d ago' },
]

const recentResearch = [
  { title: 'Competitor analysis - Tech trends', sources: 8 },
  { title: 'Audience insights 2025', sources: 12 },
]

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Your operational overview and quick actions
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Posts This Week',
            value: '21',
            change: '+12%',
            icon: FileText,
            trend: 'up',
          },
          {
            title: 'Research Items',
            value: '34',
            change: '+8%',
            icon: Search,
            trend: 'up',
          },
          {
            title: 'Scheduled',
            value: '15',
            change: '-2%',
            icon: Calendar,
            trend: 'down',
          },
          {
            title: 'Time to Publish',
            value: '2.4d',
            change: '-15%',
            icon: TrendingUp,
            trend: 'up',
          },
        ].map((item) => (
          <Card key={item.title} className="transition-all duration-300 hover:shadow-card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p
                className={`text-xs ${
                  item.trend === 'up' ? 'text-green-500' : 'text-accent'
                }`}
              >
                {item.change} from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today & Upcoming */}
        <Card>
          <CardHeader>
            <CardTitle>Today & Upcoming</CardTitle>
            <CardDescription>Calendar and deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayEvents.map((ev) => (
              <div
                key={ev.title}
                className="flex items-center gap-4 rounded-lg border border-border p-3"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {ev.time}
                </span>
                <span className="text-sm">{ev.title}</span>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View full calendar
            </Button>
          </CardContent>
        </Card>

        {/* Recent Drafts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Drafts</CardTitle>
            <CardDescription>Continue where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentDrafts.map((d) => (
              <div
                key={d.title}
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.channel} · {d.updated}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Research */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Research</CardTitle>
            <CardDescription>OpenClaw outputs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentResearch.map((r) => (
              <div
                key={r.title}
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.sources} sources
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Activity chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Posts published vs research items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
                <Area
                  type="monotone"
                  dataKey="posts"
                  stroke="rgb(255,59,48)"
                  fill="rgba(255,59,48,0.2)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="research"
                  stroke="rgb(90,90,90)"
                  fill="rgba(90,90,90,0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
