import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="text-xl font-bold text-foreground">
            CreatorOps Hub
          </Link>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="mt-4 text-muted-foreground">
          Knowledge base, tutorials, and contact support
        </p>

        <Card className="mt-8">
          <CardHeader>
            <h2 className="font-semibold">Contact support</h2>
          </CardHeader>
          <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    className="mt-2 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
                    rows={4}
                    placeholder="Describe your issue..."
                  />
                </div>
                <Button type="submit">Send</Button>
              </form>
            </CardContent>
        </Card>
      </main>
    </div>
  )
}
