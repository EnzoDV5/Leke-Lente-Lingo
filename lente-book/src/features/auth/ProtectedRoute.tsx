import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import { useAuth } from './AuthContext'
import PageLoader from '../../components/ui/PageLoader'
import { useCampaign } from '../campaign/CampaignProvider'

export default function ProtectedRoute() {
  const {
    user,
    profile,
    loading,
    profileLoading,
  } = useAuth()

  const location = useLocation()
  const { phase } = useCampaign()
  const isPublicPostRoute = phase === 'post' && (
    location.pathname === '/' ||
    location.pathname === '/woordeboek' ||
    location.pathname.startsWith('/woordeboek/')
  )

  if (isPublicPostRoute) return <Outlet />

  if (phase === 'post') {
    return <Navigate to="/" replace />
  }

  if (loading || profileLoading) {
    return <PageLoader />
  }

  if (
    !user ||
    !profile?.onboardingComplete
  ) {
    const returnPath = `${location.pathname}${location.search}${location.hash}`
    window.sessionStorage.setItem('lente-auth-return', returnPath)
    return (
      <Navigate
        to="/welkom"
        state={{
          from: returnPath,
        }}
        replace
      />
    )
  }

  return <Outlet />
}
