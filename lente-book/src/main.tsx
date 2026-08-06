import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/index.css'
import AppShell from './components/layout/AppShell'
import Home from './features/home/Home'
import Woordeboek from './features/woordeboek/Woordeboek'
import FraseView from './features/woordeboek/FraseView'
import Woordjag from './features/collections/Woordjag'
import VoegFotoBy from './features/foto/VoegFotoBy'
import Placeholder from './components/ui/Placeholder'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/woordeboek" element={<Woordeboek />} />
          <Route path="/woordeboek/:id" element={<FraseView />} />
          <Route path="/foto" element={<VoegFotoBy />} />
          <Route path="/woordjag" element={<Woordjag />} />
          <Route path="*" element={<Placeholder titel="Kom binnekort" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)