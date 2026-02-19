import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  MoreVertical,
  ExternalLink,
  Copy,
  Calendar,
  Tag,
  Loader2,
  FileText,
  Trash2,
  Bookmark,
  Download,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'
import { projectContentListService } from '@/services/project-content-list-service'
import type { ContentItem, ContentItemFilters } from '@/types/database'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 12
const CHANNELS = ['Instagram', 'YouTube', 'X', 'TikTok', 'Email', 'LinkedIn']
const STATUSES: { value: ContentItem['status']; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In Review' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

function formatDueDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0) return `Overdue (${Math.abs(days)}d)`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `In ${days} days`
  return d.toLocaleDateString()
}

function getStatusColor(status: ContentItem['status']): string {
  switch (status) {
    case 'draft':
      return 'bg-muted text-muted-foreground'
    case 'in_review':
      return 'bg-amber-500/20 text-amber-400'
    case 'scheduled':
      return 'bg-blue-500/20 text-blue-400'
    case 'published':
      return 'bg-emerald-500/20 text-emerald-400'
    case 'archived':
      return 'bg-muted text-muted-foreground'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function ContentItemCard({
  item,
  selected,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  item: ContentItem
  selected: boolean
  onSelect: (checked: boolean) => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  return (
    <Card
      className={cn(
        'group transition-all duration-300 hover:shadow-card-hover',
        selected && 'ring-2 ring-accent'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={(c) => onSelect(c === true)}
            className="mt-1"
            aria-label={`Select ${item.title}`}
          />
          <div className="min-w-0 flex-1">
            <Link
              to={`/dashboard/content/${item.id}`}
              className="font-semibold hover:underline line-clamp-2 block"
            >
              {item.title}
            </Link>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.channel && (
                <span className="inline-flex items-center rounded-md bg-primary/50 px-2 py-0.5 text-xs font-medium">
                  {item.channel}
                </span>
              )}
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                  getStatusColor(item.status)
                )}
              >
                {item.status.replace('_', ' ')}
              </span>
            </div>
            {item.due_date && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatDueDate(item.due_date)}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-0">
        {item.tags?.length > 0 && (
          <div className="flex gap-1">
            {item.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded px-1.5 py-0.5 text-xs bg-muted"
              >
                <Tag className="h-3 w-3 mr-0.5" />
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/content/${item.id}`} aria-label="Open">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDuplicate}
            aria-label="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/studio?schedule=${item.id}`} aria-label="Schedule">
              <Calendar className="h-4 w-4" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/studio?schedule=${item.id}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-accent hover:bg-accent/10 hover:text-accent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectContentList() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<ContentItemFilters>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false)
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false)
  const [saveViewOpen, setSaveViewOpen] = useState(false)
  const [savedViewName, setSavedViewName] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: [
      'project-content-list',
      user?.id,
      searchDebounced,
      page,
      filters,
    ],
    queryFn: () =>
      projectContentListService.listContentItems(user!.id, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        search: searchDebounced || undefined,
        filters: Object.keys(filters).length ? filters : undefined,
      }),
    enabled: !!user?.id,
  })

  const { data: savedViews } = useQuery({
    queryKey: ['saved-views', user?.id],
    queryFn: () => projectContentListService.listSavedViews(user!.id),
    enabled: !!user?.id,
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) =>
      projectContentListService.duplicateContentItem(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-content-list', user?.id] })
      toast.success('Content duplicated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Duplicate failed')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      projectContentListService.deleteContentItem(id, user!.id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['project-content-list', user?.id] })
      setDeleteId(null)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      toast.success('Content deleted')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    },
  })

  const bulkStatusMutation = useMutation({
    mutationFn: (status: ContentItem['status']) =>
      projectContentListService.bulkUpdateStatus(
        Array.from(selectedIds),
        user!.id,
        status
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-content-list', user?.id] })
      setSelectedIds(new Set())
      setBulkStatusOpen(false)
      toast.success('Status updated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Bulk update failed')
    },
  })

  const saveViewMutation = useMutation({
    mutationFn: (name: string) =>
      projectContentListService.createSavedView(user!.id, {
        name,
        filters: filters as Record<string, unknown>,
        sort_by: 'updated_at',
        sort_order: 'desc',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-views', user?.id] })
      setSaveViewOpen(false)
      setSavedViewName('')
      toast.success('View saved')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    },
  })

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!data?.items) return
      setSelectedIds(
        checked ? new Set(data.items.map((i) => i.id)) : new Set()
      )
    },
    [data?.items]
  )

  const handleExport = useCallback(() => {
    if (selectedIds.size === 0) return
    const items = data?.items.filter((i) => selectedIds.has(i.id)) ?? []
    const csv = [
      ['Title', 'Channel', 'Status', 'Due Date', 'Tags'].join(','),
      ...items.map((i) =>
        [
          `"${i.title.replace(/"/g, '""')}"`,
          i.channel ?? '',
          i.status,
          i.due_date ?? '',
          (i.tags ?? []).join(';'),
        ].join(',')
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `content-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export downloaded')
  }, [selectedIds, data?.items])

  if (!user) return null

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const allSelected = items.length > 0 && selectedIds.size === items.length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSaveViewOpen(true)}
          >
            <Bookmark className="h-4 w-4" />
            Save view
          </Button>
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('grid')}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('list')}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="animate-fade-in">
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <Select
                  value={filters.status ?? 'all'}
                  onValueChange={(v) =>
                    setFilters((f) => ({
                      ...f,
                      status: v === 'all' ? undefined : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Channel
                </label>
                <Select
                  value={filters.channel ?? 'all'}
                  onValueChange={(v) =>
                    setFilters((f) => ({
                      ...f,
                      channel: v === 'all' ? undefined : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All channels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All channels</SelectItem>
                    {CHANNELS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Date from
                </label>
                <Input
                  type="date"
                  value={filters.date_from ?? ''}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      date_from: e.target.value || undefined,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Date to
                </label>
                <Input
                  type="date"
                  value={filters.date_to ?? ''}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      date_to: e.target.value || undefined,
                    }))
                  }
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({})}
                >
                  Clear filters
                </Button>
              </div>
            </div>
            {savedViews?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Saved:</span>
                {savedViews.map((sv) => (
                  <Button
                    key={sv.id}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters((sv.filters as ContentItemFilters) ?? {})
                    }
                  >
                    {sv.name}
                  </Button>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {selectedIds.size > 0 && (
        <Card className="border-accent/50 bg-accent/5">
          <CardContent className="flex items-center justify-between py-3">
            <span className="text-sm font-medium">
              {selectedIds.size} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkStatusOpen(true)}
              >
                Move status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkAssignOpen(true)}
              >
                <User className="h-4 w-4" />
                Assign
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        {isLoading ? (
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        ) : !items.length ? (
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No content yet</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Create content in Content Studio or add items to a project to see them
              here.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/dashboard/studio">
                <FileText className="h-4 w-4" />
                Create content
              </Link>
            </Button>
          </CardContent>
        ) : view === 'grid' ? (
          <>
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ContentItemCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  onSelect={(c) =>
                    setSelectedIds((prev) => {
                      const next = new Set(prev)
                      if (c) next.add(item.id)
                      else next.delete(item.id)
                      return next
                    })
                  }
                  onDuplicate={() => duplicateMutation.mutate(item.id)}
                  onDelete={() => setDeleteId(item.id)}
                />
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {total} item{total !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={items.length < PAGE_SIZE || (page + 1) * PAGE_SIZE >= total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Channel</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Due date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      key={item.id}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={(c) =>
                            setSelectedIds((prev) => {
                              const next = new Set(prev)
                              if (c) next.add(item.id)
                              else next.delete(item.id)
                              return next
                            })
                          }
                          aria-label={`Select ${item.title}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/dashboard/content/${item.id}`}
                          className="font-medium hover:underline"
                        >
                          {item.title}
                        </Link>
                        {item.tags?.length > 0 && (
                          <div className="mt-1 flex gap-1">
                            {item.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center rounded px-1.5 py-0.5 text-xs bg-muted"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.channel ? (
                          <span className="rounded-md bg-primary/50 px-2 py-0.5 text-xs">
                            {item.channel}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span
                          className={cn(
                            'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                            getStatusColor(item.status)
                          )}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDueDate(item.due_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              to={`/dashboard/content/${item.id}`}
                              aria-label="Open"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateMutation.mutate(item.id)}
                            aria-label="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              to={`/dashboard/studio?schedule=${item.id}`}
                              aria-label="Schedule"
                            >
                              <Calendar className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(item.id)}
                            aria-label="Delete"
                            className="text-accent hover:bg-accent/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {total} item{total !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={items.length < PAGE_SIZE || (page + 1) * PAGE_SIZE >= total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete content?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this content item. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="bg-accent text-white hover:bg-accent/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {STATUSES.map((s) => (
              <Button
                key={s.value}
                variant="outline"
                className="justify-start"
                onClick={() => bulkStatusMutation.mutate(s.value)}
                disabled={bulkStatusMutation.isPending}
              >
                {bulkStatusMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {s.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkAssignOpen} onOpenChange={setBulkAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Assignee selection would integrate with your team members. For now,
              clearing assignment is available.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                projectContentListService
                  .bulkAssign(Array.from(selectedIds), user.id, null)
                  .then(() => {
                    queryClient.invalidateQueries({
                      queryKey: ['project-content-list', user?.id],
                    })
                    setSelectedIds(new Set())
                    setBulkAssignOpen(false)
                    toast.success('Assignment cleared')
                  })
                  .catch((err) =>
                    toast.error(err instanceof Error ? err.message : 'Failed')
                  )
              }}
            >
              Clear assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={saveViewOpen} onOpenChange={setSaveViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save current view</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="View name"
              value={savedViewName}
              onChange={(e) => setSavedViewName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveViewOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveViewMutation.mutate(savedViewName)}
              disabled={!savedViewName.trim() || saveViewMutation.isPending}
            >
              {saveViewMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
