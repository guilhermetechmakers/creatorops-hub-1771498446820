/**
 * Route-to-breadcrumb mapping for dashboard and app navigation.
 * Keys are path patterns; :id matches any segment.
 */
const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/projects': 'Projects',
  '/dashboard/library': 'File Library',
  '/dashboard/library/:id': 'Asset',
  '/dashboard/studio': 'Content Studio',
  '/dashboard/research': 'Research',
  '/dashboard/research/:id': 'Research Detail',
  '/dashboard/planner': 'Publishing Planner',
  '/dashboard/inbox': 'Inbox',
  '/dashboard/integrations': 'Integrations',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
  '/dashboard/profile': 'Profile',
  '/dashboard/billing': 'Billing',
  '/dashboard/content/:id': 'Content',
}

function matchRoute(pathname: string): string | null {
  const pathSegments = pathname.split('/').filter(Boolean)
  let bestMatch: string | null = null
  let bestLength = 0

  for (const routeKey of Object.keys(ROUTE_LABELS)) {
    const keySegments = routeKey.split('/').filter(Boolean)
    if (keySegments.length > pathSegments.length) continue
    const matches = keySegments.every(
      (part, idx) => part === pathSegments[idx] || part.startsWith(':')
    )
    if (matches && keySegments.length >= bestLength) {
      bestMatch = routeKey
      bestLength = keySegments.length
    }
  }
  return bestMatch
}

/**
 * Resolve breadcrumb path from current location.
 * Returns array of { label, path } for each breadcrumb level.
 */
export function getBreadcrumbPath(pathname: string): { label: string; path: string }[] {
  const segments = pathname.split('/').filter(Boolean)
  const result: { label: string; path: string }[] = []
  let accumulatedPath = ''

  for (let i = 0; i < segments.length; i++) {
    accumulatedPath += `/${segments[i]}`
    const routeKey = matchRoute(accumulatedPath)
    const label = routeKey ? ROUTE_LABELS[routeKey] : formatSegment(segments[i])
    result.push({ label, path: accumulatedPath })
  }

  return result
}

function formatSegment(segment: string): string {
  if (/^[a-f0-9-]{36}$/i.test(segment) || /^[a-zA-Z0-9_-]+$/.test(segment)) {
    return 'Detail'
  }
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
}
