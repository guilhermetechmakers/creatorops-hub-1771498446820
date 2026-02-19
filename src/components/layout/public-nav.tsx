import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export function PublicNav() {
  const { isAuthenticated } = useAuth()

  return (
    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
      <Link to="/" className="text-xl font-bold text-foreground">
        CreatorOps Hub
      </Link>
      <div className="flex gap-4">
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
