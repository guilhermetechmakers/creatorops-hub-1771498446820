import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { Menu } from 'lucide-react'

const navLinks = [
  { to: '/about', label: 'About' },
  { to: '/help', label: 'Help' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
]

export function PublicNav() {
  const { isAuthenticated } = useAuth()

  return (
    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
      <Link to="/" className="shrink-0 text-xl font-bold text-foreground">
        CreatorOps Hub
      </Link>
      <div className="flex flex-1 items-center justify-end gap-2 md:gap-6">
        <div className="hidden gap-6 md:flex">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {navLinks.map(({ to, label }) => (
              <DropdownMenuItem key={to} asChild>
                <Link to={to}>{label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {isAuthenticated ? (
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
