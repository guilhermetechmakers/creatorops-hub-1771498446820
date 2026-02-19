import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ArrowLeft, ExternalLink, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'
import { openclawEmbeddedAgentService } from '@/services/openclaw-embedded-agentService'
import type { OpenClawSource } from '@/types/database'
import { cn } from '@/lib/utils'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString()
}

export function ResearchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, session } = useAuth()

  const { data, isLoading, error } = useQuery({
    queryKey: ['openclaw-job', id, session?.access_token],
    queryFn: () =>
      openclawEmbeddedAgentService.getJob(session!.access_token!, id!),
    enabled: !!id && !!session?.access_token,
  })

  const job = data?.job
  const sources = (job?.sources ?? []) as OpenClawSource[]

  if (!user) return null

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="space-y-6">
        <Link to="/dashboard/research">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Research
          </Button>
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">Research job not found</p>
            <Button asChild className="mt-4">
              <Link to="/dashboard/research">Back to Research</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard/research">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">{job.query}</h1>
            </div>
            <span
              className={cn(
                'shrink-0 rounded px-2 py-1 text-xs font-medium',
                job.status === 'completed' && 'bg-primary/20 text-primary',
                job.status === 'failed' && 'bg-accent/20 text-accent',
                job.status === 'running' && 'bg-muted',
                job.status === 'cancelled' && 'bg-muted text-muted-foreground'
              )}
            >
              {job.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Created {formatDate(job.created_at)}
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {job.output_text && (
            <div>
              <h3 className="mb-2 font-semibold">Summary</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {job.output_text}
              </p>
            </div>
          )}

          {sources.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold">Sources</h3>
              <ul className="space-y-3">
                {sources.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        {s.title || s.url}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                      {s.snippet && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {s.snippet}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
