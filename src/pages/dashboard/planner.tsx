import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const pipelineStages = [
  { id: 'ideas', title: 'Ideas', count: 3 },
  { id: 'drafting', title: 'Drafting', count: 5 },
  { id: 'review', title: 'In Review', count: 2 },
  { id: 'scheduled', title: 'Scheduled', count: 4 },
  { id: 'published', title: 'Published', count: 8 },
]

export function PlannerPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Publishing Planner
          </h1>
          <p className="text-muted-foreground">
            Schedule and approve multi-channel content
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[180px] text-center font-medium">
            February 2025
          </span>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Week</Button>
          <Button size="sm">Month</Button>
          <Button variant="outline" size="sm">Day</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-lg border border-border bg-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="bg-background p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="min-h-[80px] bg-background p-2 text-sm text-muted-foreground"
          >
            {i < 2 || i > 32 ? '' : i - 1}
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Pipeline</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => (
            <Card
              key={stage.id}
              className="min-w-[200px] flex-shrink-0"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{stage.title}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {stage.count}
                  </span>
                </div>
                <div className="mt-4 min-h-[120px] rounded border border-dashed border-border" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
