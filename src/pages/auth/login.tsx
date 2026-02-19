import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/auth-context'
import { AuthFooter } from '@/components/layout/auth-footer'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  legal: z.boolean().refine((v) => v === true, {
    message: 'You must accept the terms and privacy policy',
  }),
})

type LoginForm = z.infer<typeof loginSchema>
type SignupForm = z.infer<typeof signupSchema>

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, signup, loginWithOAuth } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(
    null
  )
  const defaultTab = location.pathname === '/signup' ? 'signup' : 'login'

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', legal: false },
  })

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Invalid email or password'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const onSignup = async (data: SignupForm) => {
    setIsLoading(true)
    try {
      await signup(data.email, data.password, data.name)
      toast.success('Account created! Check your email to verify.')
      navigate('/verify-email', { state: { email: data.email } })
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create account'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider)
    try {
      await loginWithOAuth(provider)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : `Failed to sign in with ${provider}`
      toast.error(msg)
    } finally {
      setOauthLoading(null)
    }
  }

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
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    className="mt-2"
                    {...loginForm.register('email')}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-accent">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    className="mt-2"
                    {...loginForm.register('password')}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-accent">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Link
                  to="/password-reset"
                  className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forgot password?
                </Link>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Log in'}
                </Button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    type="button"
                    onClick={() => handleOAuth('google')}
                    disabled={oauthLoading !== null}
                  >
                    {oauthLoading === 'google' ? (
                      <span className="h-5 w-5 animate-pulse rounded-full bg-muted" />
                    ) : (
                      <GoogleIcon />
                    )}
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    type="button"
                    onClick={() => handleOAuth('apple')}
                    disabled={oauthLoading !== null}
                  >
                    {oauthLoading === 'apple' ? (
                      <span className="h-5 w-5 animate-pulse rounded-full bg-muted" />
                    ) : (
                      <AppleIcon />
                    )}
                    Apple
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form
                onSubmit={signupForm.handleSubmit(onSignup)}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="Your name"
                    className="mt-2"
                    {...signupForm.register('name')}
                  />
                  {signupForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-accent">
                      {signupForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="mt-2"
                    {...signupForm.register('email')}
                  />
                  {signupForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-accent">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min 8 characters"
                    className="mt-2"
                    {...signupForm.register('password')}
                  />
                  {signupForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-accent">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="legal"
                    checked={signupForm.watch('legal')}
                    onCheckedChange={(checked) =>
                      signupForm.setValue('legal', checked === true)
                    }
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="legal"
                    className="text-sm font-normal leading-relaxed"
                  >
                    I accept the{' '}
                    <Link to="/terms" className="underline hover:no-underline">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="underline hover:no-underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {signupForm.formState.errors.legal && (
                  <p className="text-sm text-accent">
                    {signupForm.formState.errors.legal.message}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Sign up'}
                </Button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    type="button"
                    onClick={() => handleOAuth('google')}
                    disabled={oauthLoading !== null}
                  >
                    {oauthLoading === 'google' ? (
                      <span className="h-5 w-5 animate-pulse rounded-full bg-muted" />
                    ) : (
                      <GoogleIcon />
                    )}
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    type="button"
                    onClick={() => handleOAuth('apple')}
                    disabled={oauthLoading !== null}
                  >
                    {oauthLoading === 'apple' ? (
                      <span className="h-5 w-5 animate-pulse rounded-full bg-muted" />
                    ) : (
                      <AppleIcon />
                    )}
                    Apple
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  )
}
