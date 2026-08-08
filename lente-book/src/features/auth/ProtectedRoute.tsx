import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import { useAuth } from './AuthContext'
import PageLoader from '../../components/ui/PageLoader'

export default function ProtectedRoute() {
  const {
    user,
    profile,
    loading,
    profileLoading,
  } = useAuth()

  const location = useLocation()

  if (loading || profileLoading) {
    return <PageLoader />
  }

  if (
    !user ||
    !profile?.onboardingComplete
  ) {
    return (
      <Navigate
        to="/welkom"
        state={{
          from: location.pathname,
        }}
        replace
      />
    )
  }

  return <Outlet />
}
