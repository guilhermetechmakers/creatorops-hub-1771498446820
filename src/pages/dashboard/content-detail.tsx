import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  Tag,
  PenSquare,
  Copy,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'
import { projectContentListService } from '@/services/project-content-list-service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString()
}

function formatDueDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-muted text-muted-foreground'
    case 'in_review':
      return 'bg-amber-500/20 text-amber-400'
    case 'scheduled':
      return 'bg-blue-500/20 text-blue-400'
    case 'published':
      return 'bg-emerald-500/20 text-emerald-400'
    case 'archived':
      return 'bg-muted text-muted-foreground'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function ContentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: item, isLoading } = useQuery({
    queryKey: ['content-item', id, user?.id],
    queryFn: () => projectContentListService.getContentItem(id!, user!.id),
    enabled: !!id && !!user?.id,
  })

  const handleDuplicate = async () => {
    if (!item || !user) return
    try {
      const duplicated = await projectContentListService.duplicateContentItem(
        item.id,
        user.id
      )
      toast.success('Content duplicated')
      navigate(`/dashboard/content/${duplicated.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Duplicate failed')
    }
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-6">
              <Skeleton className="h-32 w-32 rounded-lg" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Content not found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The requested content may have been deleted or you don&apos;t have
              access to it.
            </p>
            <Button asChild className="mt-6">
              <Link to="/dashboard/projects">Back to Projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" asChild>
          <Link to="/dashboard/projects" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/dashboard/studio?edit=${item.id}`}>
              <PenSquare className="h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
          <Button asChild>
            <Link to={`/dashboard/studio?schedule=${item.id}`}>
              <Calendar className="h-4 w-4" />
              Schedule
            </Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{item.title}</h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.channel && (
                    <span className="inline-flex items-center rounded-md bg-primary/50 px-2 py-0.5 text-sm font-medium">
                      {item.channel}
                    </span>
                  )}
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md px-2 py-0.5 text-sm font-medium',
                      getStatusColor(item.status)
                    )}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-muted-foreground">Due date</dt>
                  <dd>{formatDueDate(item.due_date)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Created</dt>
                  <dd>{formatDate(item.created_at)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Updated</dt>
                  <dd>{formatDate(item.updated_at)}</dd>
                </div>
              </dl>
              {item.tags?.length > 0 && (
                <div>
                  <dt className="mb-2 flex items-center gap-1 font-medium text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    Tags
                  </dt>
                  <dd className="flex flex-wrap gap-2">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-muted px-3 py-1 text-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
