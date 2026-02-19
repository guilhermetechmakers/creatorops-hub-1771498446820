import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Image, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { OpenClawEmbeddedAgent } from '@/components/openclaw-embedded-agent'

export function ContentStudioPage() {
  const [documentTitle, setDocumentTitle] = useState('')
  const [editorContent, setEditorContent] = useState('')

  const handleInsert = (text: string) => {
    setEditorContent((prev) => (prev ? `${prev}\n\n${text}` : text))
  }

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
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                />
                <span className="rounded bg-muted px-2 py-0.5 text-xs">
                  Draft
                </span>
              </div>
            </CardHeader>
            <CardContent className="min-h-[400px] p-6">
              <div className="prose prose-invert max-w-none">
                {editorContent ? (
                  <div className="rounded-lg border border-border bg-card p-6">
                    <pre className="whitespace-pre-wrap text-sm">{editorContent}</pre>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                    <p>Start typing or use OpenClaw to generate content...</p>
                    <p className="mt-2 text-sm">
                      Use the AI panel on the right to research topics and generate drafts.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">OpenClaw AI</h3>
              <p className="text-sm text-muted-foreground">
                Research and generate content
              </p>
            </CardHeader>
            <CardContent>
              <OpenClawEmbeddedAgent
                compact
                onInsert={handleInsert}
              />
            </CardContent>
          </Card>

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
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/research">Add research</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
