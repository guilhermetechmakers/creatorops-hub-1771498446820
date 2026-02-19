import { PublicNav } from '@/components/layout/public-nav'
import { PublicFooter } from '@/components/layout/public-footer'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <PublicNav />
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

      <footer className="border-t border-border">
        <PublicFooter />
      </footer>
    </div>
  )
}
