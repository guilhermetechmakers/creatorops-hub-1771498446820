import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { DashboardBreadcrumb } from '@/components/layout/dashboard-breadcrumb'
import { Search, Bell, User, LogOut, ChevronLeft, ChevronRight, Menu } from 'lucide-react'

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden shrink-0 items-center gap-1 md:flex">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Go back"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Go forward"
                onClick={() => navigate(1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative hidden min-w-0 flex-1 md:block md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets, content, research..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 md:gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
              <Link to="/dashboard/inbox">
                <Bell className="h-5 w-5" />
              </Link>
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

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2 md:px-6">
          <DashboardBreadcrumb />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
