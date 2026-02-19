import { Link } from 'react-router-dom'
import { Bell, Plug, Zap, Globe, Palette } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Settings & Preferences
        </h1>
        <p className="text-muted-foreground">
          Configure notifications, integrations, and more
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notif">Email notifications</Label>
              <Switch id="email-notif" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="in-app-notif">In-app notifications</Label>
              <Switch id="in-app-notif" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-5 w-5" />
              Integrations
            </CardTitle>
            <CardDescription>
              Google OAuth and connection controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link to="/dashboard/integrations">Manage integrations</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI & Research Credits
            </CardTitle>
            <CardDescription>
              OpenClaw usage and quota
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">
                Credits used this month: 120 / 500
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: '24%' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Publishing Defaults
            </CardTitle>
            <CardDescription>
              Default channels and timezone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Configure defaults</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Accessibility
            </CardTitle>
            <CardDescription>
              Display and interaction preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion">Reduce motion</Label>
              <Switch id="reduced-motion" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
