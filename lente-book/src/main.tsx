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

import AppShell from './components/layout/AppShell'
import Placeholder from './components/ui/Placeholder'

import Home from './features/home/Home'
import Woordeboek from './features/woordeboek/Woordeboek'
import FraseView from './features/woordeboek/FraseView'
import Woordjag from './features/collections/Woordjag'
import VoegFotoBy from './features/foto/VoegFotoBy'

import ScanRouter from './features/challenges/ScanRouter'

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
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