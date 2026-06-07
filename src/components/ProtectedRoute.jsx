// Form Academy — Protected Route
// Wraps any route that requires authentication or a specific role.
//
// Usage:
//   <ProtectedRoute>              — requires any authenticated user
//   <ProtectedRoute role="admin"> — requires role === 'admin'
//
// Behavior:
//   loading          → render nothing (avoids flash of wrong page)
//   not logged in    → redirect to /login
//   wrong role       → redirect to /dashboard (students hitting /admin)
//   correct          → render children

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { currentUser, userDoc, loading } = useAuth()

  // Wait for auth state to resolve before making any routing decision
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-[#f26722]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-[#034956]/50 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  // Not logged in → login page
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Logged in but user document not yet loaded — wait
  // (Handles edge case where auth resolved but Firestore fetch is still pending)
  if (!userDoc) {
    return (
      <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center">
        <p className="text-[#034956]/50 text-sm">Chargement du profil...</p>
      </div>
    )
  }

  // Role check: if a specific role is required and user doesn't have it
  if (role && userDoc.role !== role) {
    // Students trying to access admin → send to their dashboard
    return <Navigate to="/dashboard" replace />
  }

  return children
}
