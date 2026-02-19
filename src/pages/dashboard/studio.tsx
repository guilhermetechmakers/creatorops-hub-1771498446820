import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Image, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { OpenClawEmbeddedAgent } from '@/components/openclaw-embedded-agent'
import type { OpenClawSource } from '@/types/database'

export function ContentStudioPage() {
  const location = useLocation()
  const [documentTitle, setDocumentTitle] = useState('')
  const [editorContent, setEditorContent] = useState('')

  useEffect(() => {
    const state = location.state as { insertContent?: string; sources?: OpenClawSource[] } | null
    if (state?.insertContent) {
      const sourceBlock =
        state.sources && state.sources.length > 0
          ? `\n\n---\nSources:\n${state.sources.map((s) => `- ${s.title || s.url}: ${s.url}`).join('\n')}`
          : ''
      setEditorContent((prev) =>
        prev ? `${prev}\n\n${state.insertContent}${sourceBlock}` : `${state.insertContent}${sourceBlock}`
      )
      window.history.replaceState({}, '', location.pathname)
    }
  }, [location.state, location.pathname])

  const handleInsert = (text: string, sources?: OpenClawSource[]) => {
    const sourceBlock =
      sources && sources.length > 0
        ? `\n\n---\nSources:\n${sources.map((s) => `- ${s.title || s.url}: ${s.url}`).join('\n')}`
        : ''
    setEditorContent((prev) => (prev ? `${prev}\n\n${text}${sourceBlock}` : `${text}${sourceBlock}`))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Studio</h1>
          <p className="text-muted-foreground">
            Drafting, iteration, and AI-assisted generation
          </p>
        </div>
        <OpenClawEmbeddedAgent asDialogTrigger onInsert={handleInsert} />
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
