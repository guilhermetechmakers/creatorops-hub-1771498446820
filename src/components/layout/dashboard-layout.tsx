import { Outlet, Link, useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { Search, Bell, User, LogOut } from 'lucide-react'

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative w-96 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets, content, research..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="gap-2" asChild>
              <Link to="/dashboard/profile">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">{user?.name ?? 'User'}</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Log out"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
