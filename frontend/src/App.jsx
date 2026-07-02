import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import Map from './pages/Map'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Country from './pages/Country'
import Navbar from './components/Navbar'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import WorldCup from './pages/WorldCup'
import Stats from './pages/Stats'
import Landing from './pages/Landing'

function ProtectedAdmin({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'admin') return <Navigate to="/" />
  return children
}

function AppContent() {
  const location = useLocation()
  const isMapPage = location.pathname === '/map'

  return (
    <>
      <Navbar />

      {/* Mapa siempre montado, solo se oculta visualmente */}
      <div style={{ display: isMapPage ? 'block' : 'none' }}>
        <Map />
      </div>

      {/* Resto de rutas */}
      {!isMapPage && (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/map" element={null} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/country/:code" element={<Country />} />
          <Route path="/worldcup" element={<WorldCup />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={
            <ProtectedAdmin>
              <Admin />
            </ProtectedAdmin>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App