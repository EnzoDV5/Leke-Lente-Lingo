import { lazy } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import './styles/index.css'

import {
  AuthProvider,
} from './features/auth/AuthContext'

import ProtectedRoute from './features/auth/ProtectedRoute'
import Onboarding from './features/onboarding/Onboarding'
import OnboardingBackground from './components/decor/OnboardingBackground'

import AppShell from './components/layout/AppShell'
import Placeholder from './components/ui/Placeholder'

import ScanRouter from './features/challenges/ScanRouter'
import { CampaignProvider } from './features/campaign/CampaignProvider'

// Onboarding and the QR scan handler are the two entry points people land
// on directly (from a link or a scanned poster), so they stay eagerly
// bundled. Everything reached only via in-app navigation (rendered inside
// AppShell) is lazy-loaded; AppShell wraps its own Suspense boundary around
// just the routed content, so the header/footer never unmount for it.
const CampaignHome = lazy(() => import('./features/campaign/CampaignHome'))
const Woordeboek = lazy(() => import('./features/woordeboek/Woordeboek'))
const FraseView = lazy(() => import('./features/woordeboek/FraseView'))
const CollectionsPage = lazy(() => import('./features/collections/CollectionsPage'))
const FotoDoopPage = lazy(() => import('./features/foto/FotoDoopPage'))
const MerkDitPage = lazy(() => import('./features/challenges/MerkDitPage'))
const SteelEnVerbeterPage = lazy(() => import('./features/challenges/SteelEnVerbeterPage'))
const RaaiDieLingoPage = lazy(() => import('./features/challenges/RaaiDieLingoPage'))
const StemPage = lazy(() => import('./features/challenges/StemPage'))
const ChallengeNChommiePage = lazy(() => import('./features/challenges/ChallengeNChommiePage'))
const DieWildcardPage = lazy(() => import('./features/challenges/DieWildcardPage'))

function LegacyCollectionsRedirect() {
  const location = useLocation()
  return <Navigate to={`/collections${location.search}${location.hash}`} replace />
}

createRoot(
  document.getElementById('root')!,
).render(
  <CampaignProvider>
    <AuthProvider>
      <BrowserRouter>
      <OnboardingBackground />

        <Routes>
          <Route
            path="/welkom"
            element={<Onboarding />}
          />
          <Route element={<ProtectedRoute />}>
          <Route
            path="/scan/:challengeId"
            element={<ScanRouter />}
          />
        </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route
                path="/"
                element={<CampaignHome />}
              />

              <Route
                path="/woordeboek"
                element={<Woordeboek />}
              />

              <Route
                path="/woordeboek/:id"
                element={<FraseView />}
              />

              <Route
                path="/foto"
                element={<FotoDoopPage />}
              />

              <Route
                path="/collections"
                element={<CollectionsPage />}
              />

              <Route path="/woordjag" element={<LegacyCollectionsRedirect />} />

              <Route
                path="/challenge/doop/:phraseId"
                element={<MerkDitPage />}
              />

              <Route
                path="/challenge/remix/:phraseId"
                element={<SteelEnVerbeterPage />}
              />

              <Route
                path="/challenge/raai"
                element={<RaaiDieLingoPage />}
              />

              <Route
                path="/challenge/stem"
                element={<StemPage />}
              />

              <Route
                path="/challenge/foto"
                element={<FotoDoopPage challengeMode />}
              />

              <Route path="/challenge/maat" element={<ChallengeNChommiePage />} />
              <Route path="/challenge/maat/invite/:inviteId" element={<ChallengeNChommiePage />} />
              <Route path="/challenge/wildcard" element={<DieWildcardPage />} />

              <Route
                path="*"
                element={
                  <Placeholder
                    titel="Kom binnekort"
                  />
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </CampaignProvider>,
)
