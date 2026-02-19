import { createBrowserRouter } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/auth/login'
import { PasswordResetPage } from '@/pages/auth/password-reset'
import { EmailVerificationPage } from '@/pages/auth/email-verification'
import { DashboardOverview } from '@/pages/dashboard/overview'
import { ProjectsPage } from '@/pages/dashboard/projects'
import { FileLibraryPage } from '@/pages/dashboard/library'
import { ContentStudioPage } from '@/pages/dashboard/studio'
import { ResearchPage } from '@/pages/dashboard/research'
import { PlannerPage } from '@/pages/dashboard/planner'
import { InboxPage } from '@/pages/dashboard/inbox'
import { IntegrationsPage } from '@/pages/dashboard/integrations'
import { AnalyticsPage } from '@/pages/dashboard/analytics'
import { SettingsPage } from '@/pages/dashboard/settings'
import { ProfilePage } from '@/pages/dashboard/profile'
import { BillingPage } from '@/pages/dashboard/billing'
import { AboutPage } from '@/pages/static/about'
import { HelpPage } from '@/pages/static/help'
import { PrivacyPage } from '@/pages/static/privacy'
import { TermsPage } from '@/pages/static/terms'
import { NotFoundPage } from '@/pages/not-found'
import { ServerErrorPage } from '@/pages/server-error'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <LoginPage /> },
  { path: '/password-reset', element: <PasswordResetPage /> },
  { path: '/verify-email', element: <EmailVerificationPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/help', element: <HelpPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/terms', element: <TermsPage /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardOverview /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'library', element: <FileLibraryPage /> },
      { path: 'studio', element: <ContentStudioPage /> },
      { path: 'research', element: <ResearchPage /> },
      { path: 'planner', element: <PlannerPage /> },
      { path: 'inbox', element: <InboxPage /> },
      { path: 'integrations', element: <IntegrationsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'billing', element: <BillingPage /> },
    ],
  },
  { path: '/500', element: <ServerErrorPage /> },
  { path: '*', element: <NotFoundPage /> },
])
