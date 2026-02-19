import { Search, Plus, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const mockResearch = [
  { id: '1', title: 'Competitor analysis - Tech trends 2025', sources: 8, tags: ['market', 'tech'] },
  { id: '2', title: 'Audience insights - Gen Z preferences', sources: 12, tags: ['audience'] },
  { id: '3', title: 'Content format benchmarks', sources: 5, tags: ['benchmarks'] },
]

export function ResearchPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Research Workspace</h1>
          <p className="text-muted-foreground">
            Store and manage OpenClaw research outputs
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Research
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockResearch.map((r) => (
          <Card
            key={r.id}
            className="cursor-pointer transition-all duration-300 hover:shadow-card-hover"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <Search className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {r.sources} sources
                </span>
              </div>
              <h3 className="font-semibold">{r.title}</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {r.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                View details
              </Button>
            </CardContent>
          </Card>
        ))}
        <Card className="flex cursor-pointer items-center justify-center border-dashed transition-colors hover:bg-muted/50">
          <div className="p-8 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 font-medium">Run OpenClaw research</p>
            <p className="text-sm text-muted-foreground">
              Capture sources and generate summaries
            </p>
            <Button className="mt-4">Start research</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
