import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

type FormData = z.infer<typeof schema>

export function PasswordResetPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword } = useAuth()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await resetPassword(data.email)
      setSubmitted(true)
      toast.success('Reset link sent to your email')
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to send reset link'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md animate-fade-in-up rounded-2xl border border-border bg-card p-6 shadow-card">
          <h1 className="text-xl font-bold text-foreground">
            Check your email
          </h1>
          <p className="mt-2 text-muted-foreground">
            We've sent a password reset link to {form.getValues('email')}. Click
            the link to reset your password.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link to="/login">Back to login</Link>
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Didn't receive the email?{' '}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-foreground underline transition-colors hover:no-underline"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="text-xl font-bold text-foreground transition-colors hover:text-primary"
          >
            CreatorOps Hub
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <h1 className="text-xl font-bold text-foreground">
            Reset your password
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="mt-2"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-accent">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>

          <Link
            to="/login"
            className="mt-4 block text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
