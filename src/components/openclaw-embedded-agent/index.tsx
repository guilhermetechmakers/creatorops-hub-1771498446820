import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Sparkles,
  Search,
  Loader2,
  ExternalLink,
  Check,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/auth-context'
import { openclawEmbeddedAgentService } from '@/services/openclaw-embedded-agentService'
import type { OpenClawResearchJob, OpenClawSource } from '@/types/database'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface OpenClawEmbeddedAgentProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  contentItemId?: string
  onInsert?: (text: string, sources?: OpenClawSource[]) => void
  /** Alias for onInsert - called with content when user inserts into editor */
  onInsertContent?: (content: string) => void
  compact?: boolean
}

export function OpenClawEmbeddedAgent({
  open = false,
  onOpenChange,
  contentItemId,
  onInsert,
  onInsertContent,
  compact = false,
}: OpenClawEmbeddedAgentProps) {
  const { user, session } = useAuth()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    job: OpenClawResearchJob
    sources: OpenClawSource[]
    summary: string
  } | null>(null)

  const normalizeSources = (s: unknown): OpenClawSource[] => {
    if (Array.isArray(s)) return s as OpenClawSource[]
    return []
  }
  const [expandedSources, setExpandedSources] = useState(false)

  const handleResearch = useCallback(async () => {
    if (!query.trim() || !session?.access_token || !user?.id) return
    setIsLoading(true)
    setResult(null)
    try {
      const res = await openclawEmbeddedAgentService.createResearch(
        session.access_token,
        {
          query: query.trim(),
          content_item_id: contentItemId,
          output_type: 'summary',
        }
      )
      setResult({
        job: res.job,
        sources: normalizeSources(res.sources),
        summary: res.summary,
      })
      toast.success('Research completed')
      queryClient.invalidateQueries({ queryKey: ['openclaw-research-jobs'] })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Research failed')
    } finally {
      setIsLoading(false)
    }
  }, [query, session?.access_token, user?.id, contentItemId])

  const handleInsert = useCallback(() => {
    if (!result?.summary) return
    if (onInsert) {
      onInsert(result.summary, result.sources)
    } else if (onInsertContent) {
      onInsertContent(result.summary)
    } else {
      return
    }
    onOpenChange?.(false)
    setQuery('')
    setResult(null)
    toast.success('Inserted into editor')
  }, [result, onInsert, onInsertContent, onOpenChange])

  const handleClose = useCallback(() => {
    onOpenChange?.(false)
    setQuery('')
    setResult(null)
    setIsLoading(false)
  }, [onOpenChange])

  if (!user) return null

  const content = (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="openclaw-query"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Research topic
        </label>
        <div className="flex gap-2">
          <Input
            id="openclaw-query"
            placeholder="e.g. Latest AI trends in content marketing 2025"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleResearch}
            disabled={isLoading || !query.trim()}
            className="shrink-0 transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {!compact && <span className="ml-2">Research</span>}
          </Button>
        </div>
      </div>

      {isLoading && (
        <Card className="overflow-hidden border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/20 p-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">Researching web sources...</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full animate-pulse bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: '60%' }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && !isLoading && (
        <div className="space-y-4 animate-fade-in-up">
          <Card className="overflow-hidden border-primary/20 transition-all duration-300 hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Summary</h3>
                <span className="ml-auto rounded bg-primary/20 px-2 py-0.5 text-xs">
                  {result.sources.length} sources
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {result.summary}
              </p>

              {result.sources.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <button
                    type="button"
                    onClick={() => setExpandedSources((v) => !v)}
                    className="flex w-full items-center justify-between text-left text-sm font-medium transition-colors hover:text-foreground"
                  >
                    <span>Sources & provenance</span>
                    {expandedSources ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSources && (
                    <ul className="mt-3 space-y-2 border-t border-border pt-3">
                      {result.sources.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div className="min-w-0 flex-1">
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 truncate text-primary hover:underline"
                            >
                              {s.title || s.url}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                            {s.snippet && (
                              <p className="mt-0.5 line-clamp-2 text-muted-foreground">
                                {s.snippet}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {(onInsert || onInsertContent) && (
                <Button
                  onClick={handleInsert}
                  className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4" />
                  Insert into editor
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!result && !isLoading && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <Search className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a topic and run research to get AI-generated summaries with
            source links.
          </p>
        </div>
      )}
    </div>
  )

  if (compact && open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-lg"
          onPointerDownOutside={handleClose}
          onEscapeKeyDown={handleClose}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              OpenClaw Research
            </DialogTitle>
            <DialogDescription>
              Research topics on the web and generate structured outputs with
              provenance.
            </DialogDescription>
          </DialogHeader>
          {content}
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300',
        'hover:shadow-card-hover'
      )}
    >
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">OpenClaw Research</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-powered web research with source links and summaries
        </p>
      </CardHeader>
      <CardContent className="p-6">{content}</CardContent>
    </Card>
  )
}
