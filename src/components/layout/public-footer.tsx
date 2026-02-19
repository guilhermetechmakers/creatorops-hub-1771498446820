import { Link } from 'react-router-dom'

export function PublicFooter() {
  return (
    <footer className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap justify-between gap-6">
          <div>
            <Link to="/" className="font-bold text-foreground">
              CreatorOps Hub
            </Link>
          </div>
          <div className="flex gap-8">
            <Link
              to="/about"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              to="/help"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Help
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
  )
}
