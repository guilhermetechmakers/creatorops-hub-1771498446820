import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Upload,
  Folder,
  Image,
  FileText,
  Video,
  Music,
  Trash2,
  Download,
  Loader2,
  Tag,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'
import { fileUploadManagementService } from '@/services/file-upload-management-service'
import type { FileAsset } from '@/types/database'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(contentType: string) {
  if (contentType.startsWith('image/')) return Image
  if (contentType.startsWith('video/')) return Video
  if (contentType.startsWith('audio/')) return Music
  return FileText
}

export function FileUploadManagement() {
  const { user, session } = useAuth()
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [folderFilter, setFolderFilter] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const { data: assets, isLoading } = useQuery({
    queryKey: [
      'file-assets',
      user?.id,
      folderFilter,
      search,
      page,
    ],
    queryFn: () =>
      fileUploadManagementService.listAssets(user!.id, {
        folder_id: folderFilter ?? undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        search: search || undefined,
      }),
    enabled: !!user?.id,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fileUploadManagementService.deleteAsset(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file-assets', user?.id] })
      setDeleteId(null)
      toast.success('File deleted')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    },
  })

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files?.length || !user || !session?.access_token) return
      setUploading(true)
      try {
        for (let i = 0; i < files.length; i++) {
          await fileUploadManagementService.uploadFile(
            session.access_token,
            files[i],
            folderFilter ?? undefined
          )
        }
        queryClient.invalidateQueries({ queryKey: ['file-assets', user.id] })
        toast.success(
          files.length === 1
            ? 'File uploaded successfully'
            : `${files.length} files uploaded`
        )
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [user, session?.access_token, folderFilter, queryClient]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleUpload(e.dataTransfer.files)
    },
    [handleUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleUpload(e.target.files)
      e.target.value = ''
    },
    [handleUpload]
  )

  const handleDownload = useCallback(
    async (asset: FileAsset) => {
      if (!session?.access_token) return
      try {
        const url = await fileUploadManagementService.getPresignedDownloadUrl(
          session.access_token,
          asset.storage_path
        )
        window.open(url, '_blank')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Download failed')
      }
    },
    [session?.access_token]
  )

  if (!user) return null

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            File Upload & Management
          </h1>
          <p className="text-muted-foreground">
            Upload, organize, and manage your media assets with versioning
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              document.getElementById('file-upload-input')?.click()
            }
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload
          </Button>
          <input
            id="file-upload-input"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      <Card
        className={cn(
          'border-dashed transition-all duration-300',
          isDragging && 'border-primary bg-primary/5'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div
            className={cn(
              'rounded-full p-6 transition-colors',
              isDragging ? 'bg-primary/20' : 'bg-muted'
            )}
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Drag and drop files</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            or click Upload. Supports images, videos, documents, and audio.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() =>
              document.getElementById('file-upload-input')?.click()
            }
            disabled={uploading}
          >
            Select files
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4">
        <Button
          variant={folderFilter === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFolderFilter(null)}
        >
          <Folder className="h-4 w-4" />
          All folders
        </Button>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
          />
        </div>
      </div>

      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        {isLoading ? (
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        ) : !assets?.length ? (
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No files yet</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Upload your first file by dragging and dropping or clicking the
              Upload button above.
            </p>
            <Button
              className="mt-6"
              onClick={() =>
                document.getElementById('file-upload-input')?.click()
              }
              disabled={uploading}
            >
              <Upload className="h-4 w-4" />
              Upload files
            </Button>
          </CardContent>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Size</TableHead>
                    <TableHead className="hidden lg:table-cell">Version</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => {
                    const Icon = getFileIcon(asset.content_type)
                    return (
                      <TableRow
                        key={asset.id}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <TableCell>
                          <Link
                            to={`/dashboard/library/${asset.id}`}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                          >
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/dashboard/library/${asset.id}`}
                            className="font-medium truncate max-w-[200px] block hover:underline"
                          >
                            {asset.filename}
                          </Link>
                          {asset.tags?.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {asset.tags.slice(0, 3).map((t) => (
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
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {formatSize(asset.size_bytes)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          v{asset.version}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(asset)}
                              aria-label="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(asset.id)}
                              aria-label="Delete"
                              className="text-accent hover:bg-accent/10 hover:text-accent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {assets.length} file{assets.length !== 1 ? 's' : ''}
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
                  disabled={assets.length < PAGE_SIZE}
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
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the file. This action cannot be
              undone.
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
    </div>
  )
}
