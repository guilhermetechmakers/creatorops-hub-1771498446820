import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Mail,
  Calendar,
  ExternalLink,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/contexts/auth-context'
import { googleIntegrationService } from '@/services/google-integration-gmail-calendar-service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const GMAIL_DEEP_LINK_BASE = 'https://mail.google.com/mail/u/0/#inbox'

export function GoogleIntegrationGmailCalendar() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [connectLoading, setConnectLoading] = useState(false)

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['google-integration-gmail-calendar', user?.id],
    queryFn: () => googleIntegrationService.list(user!.id),
    enabled: !!user?.id,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      googleIntegrationService.delete(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['google-integration-gmail-calendar', user?.id],
      })
      setDeleteId(null)
      toast.success('Integration removed')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove')
    },
  })

  const handleConnect = async () => {
    if (!user) return
    setConnectLoading(true)
    try {
      await googleIntegrationService.create(user.id, {
        title: 'Gmail + Calendar',
        description: 'Surface Gmail threads and Calendar events for deadlines and briefs',
      })
      queryClient.invalidateQueries({
        queryKey: ['google-integration-gmail-calendar', user.id],
      })
      toast.success('Google integration connected')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setConnectLoading(false)
    }
  }

  const handleOpenGmail = (threadId?: string) => {
    const url = threadId
      ? `${GMAIL_DEEP_LINK_BASE}/${threadId}`
      : GMAIL_DEEP_LINK_BASE
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 w-32 rounded bg-muted" />
              <div className="mt-2 h-4 w-48 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-9 w-24 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const hasIntegration = integrations && integrations.length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Google (Gmail + Calendar)
          </h2>
          <p className="text-sm text-muted-foreground">
            OAuth-based connection to surface Gmail threads and Calendar events
            for deadlines, briefs, and contextual inbox items.
          </p>
        </div>
        {!hasIntegration && (
          <Button
            onClick={handleConnect}
            disabled={connectLoading}
            className="shrink-0"
          >
            {connectLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Connect
          </Button>
        )}
      </div>

      {hasIntegration ? (
        <div className="grid gap-4 md:grid-cols-2">
          {integrations!.map((int) => (
            <Card
              key={int.id}
              className="transition-all duration-300 hover:shadow-card-hover"
            >
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{int.title}</CardTitle>
                    <CardDescription>
                      {int.description ?? 'Gmail & Calendar'}
                    </CardDescription>
                  </div>
                </div>
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-1 text-xs',
                    int.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {int.status === 'active' ? 'Connected' : int.status}
                </span>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenGmail()}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Gmail
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenGmail()}
                >
                  <Calendar className="h-4 w-4" />
                  Calendar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-accent hover:bg-accent/10 hover:text-accent"
                  onClick={() => setDeleteId(int.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Disconnect
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">
              Connect Google (Gmail + Calendar)
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Surface Gmail threads and Calendar events in-app for deadlines,
              briefs, and contextual inbox items. Uses OAuth2 with granular
              scopes (Gmail.readonly, Calendar.events.readonly).
            </p>
            <Button
              onClick={handleConnect}
              disabled={connectLoading}
              className="mt-6"
            >
              {connectLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Connect Google
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Google Integration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the Gmail + Calendar connection. You can
              reconnect at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="bg-accent text-white hover:bg-accent/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Disconnect'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
