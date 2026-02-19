import { useLocation, Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { getBreadcrumbPath } from '@/lib/navigation'

export function DashboardBreadcrumb() {
  const location = useLocation()
  const pathname = location.pathname

  if (!pathname.startsWith('/dashboard')) return null

  const pathParts = getBreadcrumbPath(pathname)
  if (pathParts.length === 0) return null

  return (
    <Breadcrumb className="animate-fade-in">
      <BreadcrumbList>
        {pathParts.flatMap((part, index) => {
          const isLast = index === pathParts.length - 1
          return [
            ...(index > 0 ? [<BreadcrumbSeparator key={`sep-${part.path}`} />] : []),
            <BreadcrumbItem key={part.path}>
              {isLast ? (
                <BreadcrumbPage>{part.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={part.path}>{part.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>,
          ]
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
