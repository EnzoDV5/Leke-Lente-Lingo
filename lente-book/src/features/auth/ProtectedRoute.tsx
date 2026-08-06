import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import { useAuth } from './AuthContext'

export default function ProtectedRoute() {
  const {
    user,
    profile,
    loading,
    profileLoading,
  } = useAuth()

  const location = useLocation()

  if (loading || profileLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#0a8af0',
          color: '#ffffff',
          fontSize: '1.2rem',
          fontWeight: 800,
        }}
      >
        Lente Book groei...
      </div>
    )
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