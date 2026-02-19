import { useState } from 'react'
import { Plus, LayoutGrid, List, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const mockProjects = [
  { id: '1', name: 'Q1 Campaign', status: 'active', channel: 'Instagram', items: 12 },
  { id: '2', name: 'Product Launch', status: 'draft', channel: 'X', items: 8 },
  { id: '3', name: 'Tutorial Series', status: 'active', channel: 'YouTube', items: 5 },
  { id: '4', name: 'Newsletter Batch', status: 'scheduled', channel: 'Email', items: 4 },
]

export function ProjectsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">
            Organize and browse projects and content
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Input placeholder="Search projects..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockProjects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-card-hover"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{project.name}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {project.channel} · {project.items} items
                </p>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  Open
                </Button>
              </CardContent>
            </Card>
          ))}
          <Card className="flex cursor-pointer items-center justify-center border-dashed transition-colors hover:bg-muted/50">
            <div className="p-8 text-center">
              <Plus className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 font-medium">Create project</p>
              <p className="text-sm text-muted-foreground">
                Start a new content project
              </p>
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {mockProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
              >
                <div>
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {project.channel} · {project.items} items
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {project.status}
                  </span>
                  <Button variant="outline" size="sm">
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
