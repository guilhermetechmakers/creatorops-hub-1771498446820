import { PublicNav } from '@/components/layout/public-nav'
import { PublicFooter } from '@/components/layout/public-footer'

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <PublicNav />
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
        <p className="mt-6 text-muted-foreground">
          By using CreatorOps Hub, you agree to these terms. Please read them
          carefully. Acknowledgment is required at signup.
        </p>
      </main>

      <footer className="border-t border-border">
        <PublicFooter />
      </footer>
    </div>
  )
}
