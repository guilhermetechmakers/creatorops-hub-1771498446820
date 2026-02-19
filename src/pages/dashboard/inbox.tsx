import { Mail, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const mockThreads = [
  { id: '1', subject: 'Campaign brief - Q1 deliverables', from: 'client@agency.com', excerpt: 'Please review the attached brief for the Q1 campaign...', date: '2h ago' },
  { id: '2', subject: 'Re: Content approval needed', from: 'team@company.com', excerpt: 'The Instagram carousel is ready for your approval...', date: '5h ago' },
]

export function InboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
        <p className="text-muted-foreground">
          Gmail threads surfaced in your workspace
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Prioritized threads</h3>
              <p className="text-sm text-muted-foreground">
                AI-flagged for action
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockThreads.map((t) => (
                <div
                  key={t.id}
                  className="cursor-pointer rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <p className="font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{t.from}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {t.excerpt}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-24">
              <Mail className="h-16 w-16 text-muted-foreground" />
              <p className="mt-4 font-medium">Select a thread</p>
              <p className="text-sm text-muted-foreground">
                Choose a thread from the list to view details
              </p>
              <Button variant="outline" className="mt-4">
                <ExternalLink className="h-4 w-4" />
                Open in Gmail
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
