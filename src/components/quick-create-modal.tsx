import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FolderKanban, FileImage, PenSquare, Search } from 'lucide-react'

interface QuickCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const createOptions = [
  { icon: FolderKanban, label: 'New Project', path: '/dashboard/projects' },
  { icon: PenSquare, label: 'New Content', path: '/dashboard/studio' },
  { icon: FileImage, label: 'Upload Asset', path: '/dashboard/library' },
  { icon: Search, label: 'Run Research', path: '/dashboard/research' },
]

export function QuickCreateModal({ open, onOpenChange }: QuickCreateModalProps) {
  const navigate = useNavigate()

  const handleSelect = (path: string) => {
    onOpenChange(false)
    navigate(path)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={true}>
        <DialogHeader>
          <DialogTitle>Quick create</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {createOptions.map((opt) => (
            <button
              key={opt.path}
              type="button"
              onClick={() => handleSelect(opt.path)}
              className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted"
            >
              <opt.icon className="h-8 w-8 text-muted-foreground" />
              <span className="font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
