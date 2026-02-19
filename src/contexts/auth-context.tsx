import * as React from 'react'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

export type TeamRole = 'owner' | 'admin' | 'member'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  teamRole: TeamRole | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  loginWithOAuth: (provider: 'google' | 'apple') => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  resendVerificationEmail: (email: string) => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const AUTH_TOKEN_KEY = 'auth_token'

function syncTokenToStorage(session: Session | null) {
  if (session?.access_token) {
    localStorage.setItem(AUTH_TOKEN_KEY, session.access_token)
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

function mapSupabaseUser(u: SupabaseUser | null): User | null {
  if (!u) return null
  const meta = u.user_metadata
  return {
    id: u.id,
    email: u.email ?? '',
    name: meta?.full_name ?? meta?.name ?? u.email?.split('@')[0] ?? 'User',
    avatar: meta?.avatar_url ?? meta?.picture,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [teamRole, setTeamRole] = React.useState<TeamRole | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(mapSupabaseUser(s?.user ?? null))
      syncTokenToStorage(s)
      if (s?.user) {
        fetchTeamRole(s.user.id).then(setTeamRole)
      } else {
        setTeamRole(null)
      }
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(mapSupabaseUser(s?.user ?? null))
      syncTokenToStorage(s)
      if (s?.user) {
        fetchTeamRole(s.user.id).then(setTeamRole)
      } else {
        setTeamRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchTeamRole = React.useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('team_members')
        .select('role')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle()
      const role = (data as { role?: string } | null)?.role
      return (role === 'owner' || role === 'admin' || role === 'member'
        ? role
        : null) as TeamRole | null
    } catch {
      return null
    }
  }, [])

  const login = React.useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    setSession(data.session)
    setUser(mapSupabaseUser(data.user))
    syncTokenToStorage(data.session)
    if (data.user) {
      const role = await fetchTeamRole(data.user.id)
      setTeamRole(role)
    }
  }, [fetchTeamRole])

  const signup = React.useCallback(
    async (email: string, password: string, name: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      if (data.session) {
        setSession(data.session)
        setUser(mapSupabaseUser(data.user))
        syncTokenToStorage(data.session)
      }
    },
    []
  )

  const loginWithOAuth = React.useCallback(
    async (provider: 'google' | 'apple') => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes:
            provider === 'google'
              ? 'email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.events.readonly'
              : undefined,
        },
      })
      if (error) throw error
    },
    []
  )

  const logout = React.useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setTeamRole(null)
    syncTokenToStorage(null)
  }, [])

  const resetPassword = React.useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    if (error) throw error
  }, [])

  const updatePassword = React.useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }, [])

  const resendVerificationEmail = React.useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    if (error) throw error
  }, [])

  const value: AuthContextValue = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    teamRole,
    login,
    signup,
    loginWithOAuth,
    logout,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
