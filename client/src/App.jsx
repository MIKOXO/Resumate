import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { clearError } from './store/slices/authSlice.js'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'

const AuthGate = ({ children, requireAuth }) => {
  const { isAuthenticated, authReady } = useSelector((s) => s.auth)
  if (!authReady) return <div className="min-h-svh bg-base" />
  if (requireAuth) return isAuthenticated ? children : <Navigate to="/login" replace />
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

const RootRedirect = () => {
  const { isAuthenticated, authReady } = useSelector((s) => s.auth)
  if (!authReady) return <div className="min-h-svh bg-base" />
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

const AppRoutes = () => {
  const location = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch, location.pathname])

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<AuthGate><Login /></AuthGate>} />
        <Route path="/signup" element={<AuthGate><Signup /></AuthGate>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<AuthGate requireAuth><Dashboard /></AuthGate>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
