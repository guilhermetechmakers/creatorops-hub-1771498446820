import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { QuickCreateModal } from '@/components/quick-create-modal'
import {
  LayoutDashboard,
  FolderKanban,
  FileImage,
  PenSquare,
  Search,
  Calendar,
  Inbox,
  Plug,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/dashboard/library', icon: FileImage, label: 'File Library' },
  { to: '/dashboard/studio', icon: PenSquare, label: 'Content Studio' },
  { to: '/dashboard/research', icon: Search, label: 'Research' },
  { to: '/dashboard/planner', icon: Calendar, label: 'Publishing Planner' },
  { to: '/dashboard/inbox', icon: Inbox, label: 'Inbox' },
  { to: '/dashboard/integrations', icon: Plug, label: 'Integrations' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
]

interface AppSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function AppSidebar({ mobileOpen = false, onMobileClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)

  const handleNavClick = () => {
    onMobileClose?.()
  }

  return (
    <>
      {/* Mobile overlay */}
      {onMobileClose && (
        <div
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
          className={cn(
            'fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden',
            mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
          onClick={onMobileClose}
          onKeyDown={(e) => e.key === 'Escape' && onMobileClose()}
        />
      )}

      <aside
        className={cn(
          'flex flex-col border-r border-border bg-background transition-all duration-300',
          'md:relative md:translate-x-0',
          collapsed ? 'w-[72px]' : 'w-64',
          onMobileClose
            ? cn(
                'fixed inset-y-0 left-0 z-50 md:static',
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
              )
            : ''
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex flex-1 items-center gap-2">
            {!collapsed && (
              <Link
                to="/"
                className="text-lg font-bold text-foreground transition-colors hover:text-muted-foreground"
              >
                CreatorOps
              </Link>
            )}
            {onMobileClose && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden"
                onClick={onMobileClose}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          {onMobileClose ? (
            <Button
              variant="ghost"
              size="icon"
              className="hidden shrink-0 md:flex"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2" onClick={handleNavClick}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          <div className="border-t border-border pt-2">
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              <Settings className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Settings</span>}
            </NavLink>
          </div>
        </nav>

        {!collapsed && (
          <div className="border-t border-border p-4">
            <Button
              className="w-full"
              size="lg"
              onClick={() => setQuickCreateOpen(true)}
            >
              <Plus className="h-5 w-5" />
              New Item
            </Button>
          </div>
        )}
      </aside>
      <QuickCreateModal
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
      />
    </>
  )
}
