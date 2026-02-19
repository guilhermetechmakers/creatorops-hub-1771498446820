import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectContentList } from '@/components/project-content-list'

export function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">
            Organize and browse projects and content
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/studio">
            <Plus className="h-4 w-4" />
            New Content
          </Link>
        </Button>
      </div>

      <ProjectContentList />
    </div>
  )
}
