import { StrictMode } from 'react'
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

import Home from './features/home/Home'
import Woordeboek from './features/woordeboek/Woordeboek'
import FraseView from './features/woordeboek/FraseView'
import Woordjag from './features/collections/Woordjag'
import VoegFotoBy from './features/foto/VoegFotoBy'

import ScanRouter from './features/challenges/ScanRouter'
import DoopDitPage from './features/challenges/DoopDitPage'
import SteelVerbeterPage from './features/challenges/SteelVerbeterPage'
import RaaiWoordPage from './features/challenges/RaaiWoordPage'
import DaagMaatPage from './features/challenges/DaagMaatPage'
import WildcardPage from './features/challenges/WildcardPage'

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

          <Route element={<AppShell />}>
            {/* Keep all your existing routes here */}
          </Route>
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
