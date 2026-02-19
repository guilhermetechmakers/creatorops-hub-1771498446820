import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'
import { openclawEmbeddedAgentService } from '@/services/openclaw-embedded-agentService'
import { OpenClawEmbeddedAgent } from '@/components/openclaw-embedded-agent'
import { cn } from '@/lib/utils'


export function ResearchPage() {
  const { user, session } = useAuth()

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['openclaw-research-jobs', user?.id, session?.access_token],
    queryFn: () =>
      openclawEmbeddedAgentService.listJobs(session!.access_token!, {
        limit: 20,
      }),
    enabled: !!user?.id && !!session?.access_token,
  })

  const jobs = jobsData?.jobs ?? []

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Research Workspace</h1>
          <p className="text-muted-foreground">
            Store and manage OpenClaw research outputs
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : !jobs?.length ? (
            <Card className="flex cursor-pointer items-center justify-center border-dashed transition-colors hover:bg-muted/50">
              <CardContent className="p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 font-medium">Run OpenClaw research</p>
                <p className="text-sm text-muted-foreground">
                  Capture sources and generate summaries
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Use the panel on the right to start your first research.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {jobs.map((job) => (
                <Link key={job.id} to={`/dashboard/research/${job.id}`}>
                  <Card
                    className={cn(
                      'h-full cursor-pointer transition-all duration-300',
                      'hover:shadow-card-hover hover:scale-[1.01]'
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Search className="h-8 w-8 shrink-0 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {job.status === 'completed' ? 'Completed' : job.status}
                        </span>
                      </div>
                      <h3 className="font-semibold line-clamp-2">{job.query}</h3>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        View details
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <h3 className="font-semibold">OpenClaw AI Agent</h3>
              <p className="text-sm text-muted-foreground">
                Research topics and generate content
              </p>
            </CardHeader>
            <CardContent>
              <OpenClawEmbeddedAgent />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
