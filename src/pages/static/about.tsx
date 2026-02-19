import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="text-xl font-bold text-foreground">
            CreatorOps Hub
          </Link>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground">About CreatorOps Hub</h1>
        <p className="mt-6 text-muted-foreground">
          CreatorOps Hub is an integrated workspace that centralizes assets,
          planning, research, and AI-assisted execution for creators and teams.
        </p>
      </main>
    </div>
  )
}
