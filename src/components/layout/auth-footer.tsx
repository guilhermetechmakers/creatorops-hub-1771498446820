import { Link } from 'react-router-dom'

export function AuthFooter() {
  return (
    <footer className="flex shrink-0 flex-wrap justify-center gap-6 border-t border-border py-4 text-center">
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
    </footer>
  )
}
