import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ServerErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
          <AlertTriangle className="h-10 w-10 text-accent" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted-foreground">
          We're sorry, but something went wrong on our end. Please try again
          later.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button onClick={() => window.location.reload()}>Retry</Button>
          <Button variant="outline" asChild>
            <Link to="/">Go home</Link>
          </Button>
          <Link
            to="/help"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  )
}
