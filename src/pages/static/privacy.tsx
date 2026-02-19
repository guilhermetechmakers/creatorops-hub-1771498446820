import { PublicNav } from '@/components/layout/public-nav'
import { PublicFooter } from '@/components/layout/public-footer'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <PublicNav />
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-6 text-muted-foreground">
          This privacy policy describes how CreatorOps Hub collects, uses, and
          protects your data. For privacy requests, contact us at
          privacy@creatorops.com.
        </p>
      </main>

      <footer className="border-t border-border">
        <PublicFooter />
      </footer>
    </div>
  )
}
