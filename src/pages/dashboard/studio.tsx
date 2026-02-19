import { Sparkles, Image, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function ContentStudioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Content Studio</h1>
        <p className="text-muted-foreground">
          Drafting, iteration, and AI-assisted generation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Untitled document"
                  className="border-0 bg-transparent text-lg font-semibold focus-visible:ring-0"
                />
                <span className="rounded bg-muted px-2 py-0.5 text-xs">
                  Draft
                </span>
              </div>
            </CardHeader>
            <CardContent className="min-h-[400px] p-6">
              <div className="prose prose-invert max-w-none">
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                  <p>Start typing or use OpenClaw to generate content...</p>
                  <Button variant="outline" className="mt-4">
                    <Sparkles className="h-4 w-4" />
                    Generate with OpenClaw
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Linked Assets</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <Image className="h-10 w-10" />
                <p className="text-sm">No assets linked</p>
                <Button variant="outline" size="sm">
                  Attach
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Research</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10" />
                <p className="text-sm">No research linked</p>
                <Button variant="outline" size="sm">
                  Add research
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
