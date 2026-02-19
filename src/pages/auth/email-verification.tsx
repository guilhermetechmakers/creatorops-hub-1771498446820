import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function EmailVerificationPage() {
  const handleResend = () => {
    toast.success('Verification email sent')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-xl font-bold text-foreground">
            CreatorOps Hub
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-card text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Mail className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="mt-6 text-xl font-bold text-foreground">
            Verify your email
          </h1>
          <p className="mt-2 text-muted-foreground">
            We've sent a verification link to your email. Click the link to
            confirm your account.
          </p>
          <Button onClick={handleResend} className="mt-6" variant="outline">
            Resend verification email
          </Button>
          <p className="mt-6 text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or{' '}
            <Link to="/help" className="text-foreground underline">
              contact support
            </Link>
            .
          </p>
          <Link to="/login">
            <Button variant="ghost" className="mt-4">
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
