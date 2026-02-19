import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, Image, FileText, Video, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'
import { fileUploadManagementService } from '@/services/file-upload-management-service'
import { toast } from 'sonner'

function getFileIcon(contentType: string) {
  if (contentType.startsWith('image/')) return Image
  if (contentType.startsWith('video/')) return Video
  if (contentType.startsWith('audio/')) return Music
  return FileText
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString()
}

export function LibraryAssetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, session } = useAuth()

  const { data: asset, isLoading } = useQuery({
    queryKey: ['file-asset', id, user?.id],
    queryFn: () => fileUploadManagementService.getAssetById(id!, user!.id),
    enabled: !!id && !!user?.id,
  })

  const handleDownload = async () => {
    if (!asset || !session?.access_token) return
    try {
      const url = await fileUploadManagementService.getPresignedDownloadUrl(
        session.access_token,
        asset.storage_path
      )
      window.open(url, '_blank')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed')
    }
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-6">
              <Skeleton className="h-32 w-32 rounded-lg" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/dashboard/library">
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Link>
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Asset not found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The requested file may have been deleted or you don&apos;t have
              access to it.
            </p>
            <Button asChild className="mt-6">
              <Link to="/dashboard/library">Back to Library</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const Icon = getFileIcon(asset.content_type)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" asChild>
          <Link to="/dashboard/library" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Link>
        </Button>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{asset.filename}</h1>
                <p className="text-muted-foreground">
                  {asset.content_type} • {formatSize(asset.size_bytes)}
                </p>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-muted-foreground">Version</dt>
                  <dd>v{asset.version}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Uploaded</dt>
                  <dd>{formatDate(asset.created_at)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Updated</dt>
                  <dd>{formatDate(asset.updated_at)}</dd>
                </div>
              </dl>
              {asset.tags?.length > 0 && (
                <div>
                  <dt className="mb-2 font-medium text-muted-foreground">
                    Tags
                  </dt>
                  <dd className="flex flex-wrap gap-2">
                    {asset.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-muted px-3 py-1 text-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
