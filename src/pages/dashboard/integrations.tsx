import { Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const integrations = [
  { id: 'google', name: 'Google', desc: 'Gmail & Calendar', connected: true },
  { id: 'youtube', name: 'YouTube', desc: 'Analytics & publishing', connected: false },
  { id: 'instagram', name: 'Instagram', desc: 'Content & insights', connected: false },
  { id: 'dropbox', name: 'Dropbox', desc: 'File sync', connected: false },
]

export function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground">
          Manage third-party connections
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((int) => (
          <Card key={int.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{int.name}</CardTitle>
                <CardDescription>{int.desc}</CardDescription>
              </div>
              {int.connected ? (
                <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                  <Check className="h-3 w-3" />
                  Connected
                </span>
              ) : null}
            </CardHeader>
            <CardContent>
              <Button
                variant={int.connected ? 'outline' : 'default'}
                size="sm"
              >
                {int.connected ? (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Manage
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
