import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { AuthFooter } from '@/components/layout/auth-footer'
import { toast } from 'sonner'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function PasswordUpdatePage() {
  const navigate = useNavigate()
  const { updatePassword, session } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await updatePassword(data.password)
      toast.success('Password updated successfully')
      navigate('/login')
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update password'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const hasValidSession = !!session?.user

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center p-4">
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
            Set new password
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter your new password below. Make sure it's at least 8 characters.
          </p>

          {hasValidSession ? (
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-6 space-y-4"
            >
              <div>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 8 characters"
                  className="mt-2"
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="mt-1 text-sm text-accent">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="mt-2"
                  {...form.register('confirmPassword')}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-accent">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Your reset link may have expired. Please request a new password
                reset.
              </p>
              <Button asChild className="w-full">
                <Link to="/password-reset">Request new reset link</Link>
              </Button>
            </div>
          )}

          <Link
            to="/login"
            className="mt-4 block text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to login
          </Link>
        </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  )
}
