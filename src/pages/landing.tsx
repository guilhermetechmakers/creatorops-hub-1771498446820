import { Link } from 'react-router-dom'
import { FileImage, Search, Calendar, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,59,48,0.08)_0%,_transparent_50%)]" />
        <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="text-xl font-bold text-foreground">
            CreatorOps Hub
          </Link>
          <div className="flex items-center gap-4">
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
                  <Button>Get started</Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Your unified workspace for{' '}
              <span className="bg-gradient-to-r from-white to-muted-foreground bg-clip-text text-transparent">
                creator operations
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Centralize assets, research, and AI-assisted execution. Reduce
              time-to-publish with traceable research-to-publish workflows.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="h-12 px-8 text-base">
                  Start free trial
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Value Props */}
      <section className="border-b border-border py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold text-foreground">
            Everything you need in one place
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            File library, OpenClaw research, publishing planner, and Google
            integration—all in a single dashboard.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: FileImage,
                title: 'File Library',
                desc: 'Upload, version, and tag assets. Fast CDN delivery and attachment to content.',
              },
              {
                icon: Search,
                title: 'OpenClaw Research',
                desc: 'Live web research with captured sources and summaries. Provenance and versioning.',
              },
              {
                icon: Calendar,
                title: 'Publishing Planner',
                desc: 'Editorial calendar, Kanban pipeline, approvals, and multi-channel scheduling.',
              },
              {
                icon: Mail,
                title: 'Google Integration',
                desc: 'Gmail briefs and Calendar deadlines surfaced inside your workflow.',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-card-hover"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <item.icon className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap justify-between gap-6">
            <div>
              <span className="font-bold text-foreground">CreatorOps Hub</span>
            </div>
            <div className="flex gap-8">
              <Link
                to="/about"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                About
              </Link>
              <Link
                to="/help"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Help
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms
              </Link>
            </div>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            © {new Date().getFullYear()} CreatorOps Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
