import { Upload, Folder, Image, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const mockAssets = [
  { id: '1', name: 'hero-banner.png', type: 'image', size: '2.4 MB' },
  { id: '2', name: 'thumbnail-v2.jpg', type: 'image', size: '890 KB' },
  { id: '3', name: 'script-draft.docx', type: 'doc', size: '45 KB' },
  { id: '4', name: 'intro-music.mp3', type: 'audio', size: '1.2 MB' },
]

export function FileLibraryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">File Library</h1>
          <p className="text-muted-foreground">
            Central asset repository for your content
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6">
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Drag and drop files</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            or click to browse. Supports images, videos, and documents.
          </p>
          <Button className="mt-4">Select files</Button>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" size="sm">
          <Folder className="h-4 w-4" />
          All folders
        </Button>
        <Button variant="outline" size="sm">
          All tags
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {mockAssets.map((asset) => (
          <Card
            key={asset.id}
            className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-card-hover"
          >
            <div className="flex aspect-square items-center justify-center bg-muted">
              {asset.type === 'image' ? (
                <Image className="h-16 w-16 text-muted-foreground" />
              ) : (
                <FileText className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            <CardContent className="p-3">
              <p className="truncate text-sm font-medium">{asset.name}</p>
              <p className="text-xs text-muted-foreground">{asset.size}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
