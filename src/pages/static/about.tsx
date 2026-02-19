import { PublicNav } from '@/components/layout/public-nav'
import { PublicFooter } from '@/components/layout/public-footer'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <PublicNav />
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground">About CreatorOps Hub</h1>
        <p className="mt-6 text-muted-foreground">
          CreatorOps Hub is an integrated workspace that centralizes assets,
          planning, research, and AI-assisted execution for creators and teams.
        </p>
      </main>

      <footer className="border-t border-border">
        <PublicFooter />
      </footer>
    </div>
  )
}
