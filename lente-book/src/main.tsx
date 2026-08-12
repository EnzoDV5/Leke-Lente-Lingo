import { lazy, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  Route,
  Routes,
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

// Onboarding and the QR scan handler are the two entry points people land
// on directly (from a link or a scanned poster), so they stay eagerly
// bundled. Everything reached only via in-app navigation (rendered inside
// AppShell) is lazy-loaded; AppShell wraps its own Suspense boundary around
// just the routed content, so the header/footer never unmount for it.
const Home = lazy(() => import('./features/home/Home'))
const Woordeboek = lazy(() => import('./features/woordeboek/Woordeboek'))
const FraseView = lazy(() => import('./features/woordeboek/FraseView'))
const Woordjag = lazy(() => import('./features/collections/Woordjag'))
const VoegFotoBy = lazy(() => import('./features/foto/VoegFotoBy'))
const DoopDitPage = lazy(() => import('./features/challenges/DoopDitPage'))
const SteelVerbeterPage = lazy(() => import('./features/challenges/SteelVerbeterPage'))
const RaaiWoordPage = lazy(() => import('./features/challenges/RaaiWoordPage'))
const DaagMaatPage = lazy(() => import('./features/challenges/DaagMaatPage'))
const WildcardPage = lazy(() => import('./features/challenges/WildcardPage'))

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
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
                element={<Home />}
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
                element={<VoegFotoBy />}
              />

              <Route
                path="/woordjag"
                element={<Woordjag />}
              />

              <Route
                path="/challenge/doop/:phraseId"
                element={<DoopDitPage />}
              />

              <Route
                path="/challenge/remix/:phraseId"
                element={<SteelVerbeterPage />}
              />

              <Route
                path="/challenge/raai"
                element={<RaaiWoordPage />}
              />

              <Route
                path="/challenge/foto"
                element={<VoegFotoBy challengeMode />}
              />

              <Route path="/challenge/maat" element={<DaagMaatPage />} />
              <Route path="/challenge/maat/invite/:inviteId" element={<DaagMaatPage />} />
              <Route path="/challenge/wildcard" element={<WildcardPage />} />

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
  </StrictMode>,
)
