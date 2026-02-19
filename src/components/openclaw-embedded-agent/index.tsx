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
  PenSquare,
  ShieldCheck,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { openclawEmbeddedAgentService } from '@/services/openclaw-embedded-agentService'
import type {
  OpenClawGeneratedOutput,
  OpenClawResearchJob,
  OpenClawSource,
} from '@/types/database'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const OUTPUT_TYPES = [
  { value: 'article', label: 'Article' },
  { value: 'thread', label: 'Social Thread' },
  { value: 'script', label: 'Script' },
  { value: 'caption', label: 'Caption' },
] as const

export interface OpenClawEmbeddedAgentProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  contentItemId?: string
  /** Pre-fill research job ID when generating from existing research */
  researchJobId?: string
  onInsert?: (text: string, sources?: OpenClawSource[]) => void
  /** Alias for onInsert - called with content when user inserts into editor */
  onInsertContent?: (content: string) => void
  compact?: boolean
  /** Show as dialog trigger button instead of inline content */
  asDialogTrigger?: boolean
}

function normalizeSources(s: unknown): OpenClawSource[] {
  if (Array.isArray(s)) return s as OpenClawSource[]
  return []
}

function formatConfidence(score?: number | null): string {
  if (score == null) return '—'
  return `${Math.round((score ?? 0) * 100)}%`
}

export function OpenClawEmbeddedAgent({
  open = false,
  onOpenChange,
  contentItemId,
  researchJobId,
  onInsert,
  onInsertContent,
  compact = false,
  asDialogTrigger = false,
}: OpenClawEmbeddedAgentProps) {
  const { user, session } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'research' | 'generate'>('research')
  const [dialogOpen, setDialogOpen] = useState(false)

  // Research state
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    job: OpenClawResearchJob
    sources: OpenClawSource[]
    summary: string
    confidence?: number
  } | null>(null)
  const [expandedSources, setExpandedSources] = useState(false)

  // Generate state
  const [prompt, setPrompt] = useState('')
  const [outputType, setOutputType] = useState<string>('article')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateResult, setGenerateResult] = useState<{
    output: OpenClawGeneratedOutput
    confidence_score: number
  } | null>(null)

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
        confidence: res.confidence_score,
      })
      toast.success('Research completed')
      queryClient.invalidateQueries({ queryKey: ['openclaw-research-jobs'] })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Research failed')
    } finally {
      setIsLoading(false)
    }
  }, [query, session?.access_token, user?.id, contentItemId])

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !session?.access_token || !user?.id) return
    setIsGenerating(true)
    setGenerateResult(null)
    try {
      const res = await openclawEmbeddedAgentService.createGenerate(
        session.access_token,
        {
          prompt: prompt.trim(),
          output_type: outputType as 'thread' | 'script' | 'caption' | 'article',
          job_id: researchJobId ?? undefined,
        }
      )
      setGenerateResult({
        output: res.output,
        confidence_score: res.confidence_score,
      })
      toast.success('Content generated')
      queryClient.invalidateQueries({ queryKey: ['openclaw-generated-outputs'] })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, outputType, researchJobId, session?.access_token, user?.id])

  const handleApproveOutput = useCallback(async () => {
    if (!generateResult?.output?.id || !session?.access_token) return
    try {
      await openclawEmbeddedAgentService.approveOutput(
        session.access_token,
        generateResult.output.id
      )
      setGenerateResult((prev) =>
        prev ? { ...prev, output: { ...prev.output, approved: true } } : null
      )
      toast.success('Output approved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approval failed')
    }
  }, [generateResult?.output?.id, session?.access_token])

  const handleInsertResearch = useCallback(() => {
    if (!result?.summary) return
    if (onInsert) {
      onInsert(result.summary, result.sources)
    } else if (onInsertContent) {
      onInsertContent(result.summary)
    } else {
      return
    }
    if (asDialogTrigger) setDialogOpen(false)
    else onOpenChange?.(false)
    setQuery('')
    setResult(null)
    toast.success('Inserted into editor')
  }, [result, onInsert, onInsertContent, onOpenChange, asDialogTrigger])

  const handleInsertGenerate = useCallback(() => {
    if (!generateResult?.output?.content) return
    if (onInsert) {
      onInsert(generateResult.output.content)
    } else if (onInsertContent) {
      onInsertContent(generateResult.output.content)
    } else {
      return
    }
    if (asDialogTrigger) setDialogOpen(false)
    else onOpenChange?.(false)
    setPrompt('')
    setGenerateResult(null)
    toast.success('Inserted into editor')
  }, [generateResult, onInsert, onInsertContent, onOpenChange, asDialogTrigger])

  const handleClose = useCallback(() => {
    if (asDialogTrigger) setDialogOpen(false)
    else onOpenChange?.(false)
    setQuery('')
    setResult(null)
    setPrompt('')
    setGenerateResult(null)
    setIsLoading(false)
    setIsGenerating(false)
  }, [onOpenChange, asDialogTrigger])

  const canInsert = !!(onInsert || onInsertContent)

  if (!user) return null

  const researchContent = (
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
                <span className="ml-auto flex items-center gap-2">
                  {result.confidence != null && (
                    <span
                      className="flex items-center gap-1 rounded bg-primary/20 px-2 py-0.5 text-xs"
                      title="Confidence score"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {formatConfidence(result.confidence)}
                    </span>
                  )}
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-xs">
                    {result.sources.length} sources
                  </span>
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

              {canInsert && (
                <Button
                  onClick={handleInsertResearch}
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

  const generateContent = (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="openclaw-prompt"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          What to generate
        </label>
        <Input
          id="openclaw-prompt"
          placeholder="e.g. A LinkedIn post about sustainable fashion trends"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          disabled={isGenerating}
          className="mb-3"
        />
        <label className="mb-2 block text-sm font-medium text-foreground">
          Output type
        </label>
        <Select
          value={outputType}
          onValueChange={setOutputType}
          disabled={isGenerating}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {OUTPUT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PenSquare className="h-4 w-4" />
        )}
        <span className="ml-2">Generate</span>
      </Button>

      {isGenerating && (
        <Card className="overflow-hidden border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm font-medium">Generating content...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {generateResult && !isGenerating && (
        <div className="space-y-4 animate-fade-in-up">
          <Card className="overflow-hidden border-primary/20 transition-all duration-300 hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">Generated {outputType}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className="flex items-center gap-1 rounded bg-primary/20 px-2 py-0.5 text-xs"
                    title="Confidence score"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {formatConfidence(generateResult.confidence_score)}
                  </span>
                  {!generateResult.output.approved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApproveOutput}
                      className="h-7 text-xs"
                    >
                      <Check className="h-3 w-3" />
                      Approve
                    </Button>
                  )}
                  {generateResult.output.approved && (
                    <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-600 dark:text-green-400">
                      Approved
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {generateResult.output.content}
                </pre>
              </div>
              {canInsert && (
                <Button
                  onClick={handleInsertGenerate}
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

      {!generateResult && !isGenerating && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <PenSquare className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a prompt and choose an output type to generate threads, scripts,
            captions, or articles.
          </p>
        </div>
      )}
    </div>
  )

  const tabbedContent = (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'research' | 'generate')}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="research" className="transition-colors">
          <Search className="h-4 w-4" />
          <span className="ml-2">Research</span>
        </TabsTrigger>
        <TabsTrigger value="generate" className="transition-colors">
          <PenSquare className="h-4 w-4" />
          <span className="ml-2">Generate</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="research" className="mt-4">
        {researchContent}
      </TabsContent>
      <TabsContent value="generate" className="mt-4">
        {generateContent}
      </TabsContent>
    </Tabs>
  )

  const dialogContent = (
    <Dialog
      open={asDialogTrigger ? dialogOpen : open}
      onOpenChange={asDialogTrigger ? setDialogOpen : onOpenChange}
    >
      <DialogContent
        className="max-w-lg"
        onPointerDownOutside={asDialogTrigger ? () => setDialogOpen(false) : handleClose}
        onEscapeKeyDown={asDialogTrigger ? () => setDialogOpen(false) : handleClose}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            OpenClaw AI
          </DialogTitle>
          <DialogDescription>
            Research topics on the web and generate structured outputs with
            provenance. Human-in-the-loop approval for generated content.
          </DialogDescription>
        </DialogHeader>
        {tabbedContent}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => (asDialogTrigger ? setDialogOpen(false) : onOpenChange?.(false))}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  if (asDialogTrigger) {
    return (
      <>
        <Button
          onClick={() => setDialogOpen(true)}
          className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
        >
          <Sparkles className="h-5 w-5" />
          Open AI Panel
        </Button>
        {dialogContent}
      </>
    )
  }

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
              OpenClaw AI
            </DialogTitle>
            <DialogDescription>
              Research topics on the web and generate structured outputs with
              provenance. Human-in-the-loop approval for generated content.
            </DialogDescription>
          </DialogHeader>
          {tabbedContent}
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
          <h3 className="font-semibold">OpenClaw AI</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Research topics and generate content with source links and provenance
        </p>
      </CardHeader>
      <CardContent className="p-6">{tabbedContent}</CardContent>
    </Card>
  )
}
