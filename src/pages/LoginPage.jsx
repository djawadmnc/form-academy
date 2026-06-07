// Form Academy — Login Page
// Route: /login
// Email/password authentication via Firebase Auth.
// Redirects to /dashboard (student) or /admin (admin) after login.
// Redirects away if already logged in.

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

export default function LoginPage() {
  const navigate             = useNavigate()
  const { loading } = useAuth()

  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      // Navigate to /dashboard — DashboardRouter reads userDoc from AuthContext
      // and redirects to /admin if role === 'admin'. Do NOT call getUser() here:
      // the auth token may not have propagated to Firestore yet, causing a silent
      // permission-denied that returns snap.exists() === false.
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(mapFirebaseError(err.code))
    } finally {
      setSubmitting(false)
    }
  }

  function mapFirebaseError(code) {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email ou mot de passe incorrect.'
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Réessayez dans quelques minutes.'
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé. Contactez l\'administrateur.'
      default:
        return 'Une erreur est survenue. Veuillez réessayer.'
    }
  }

  const inputCls = 'w-full border border-[#e2f1f2] rounded-xl px-4 py-3 text-sm text-[#034956] placeholder-[#034956]/30 focus:outline-none focus:border-[#f26722] focus:ring-2 focus:ring-[#f26722]/10 transition-all'

  return (
    <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo + header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#034956] rounded-2xl px-5 py-3 inline-flex">
              <img src={logo} alt="Form Academy" className="h-12 w-auto object-contain" />
            </div>
          </div>
          <p className="text-[#034956]/55 text-sm mt-1">Connectez-vous à votre espace</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#034956]/5 p-7">
          <h2 className="text-[#034956] font-bold text-lg mb-6">Connexion</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[#034956] text-xs font-semibold mb-1.5">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="samira@email.com"
                required
                autoComplete="email"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[#034956] text-xs font-semibold mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#f26722] text-white py-3.5 rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Connexion...
                </>
              ) : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <Link to="/" className="text-[#034956]/50 hover:text-[#034956] text-sm transition-colors">
            ← Retour au site public
          </Link>
        </div>

        {/* Info for new students */}
        <div className="bg-[#e2f1f2] rounded-2xl p-4 mt-6 text-center">
          <p className="text-[#034956] text-xs leading-relaxed">
            Première connexion ? Utilisez le lien d'activation envoyé par notre équipe via WhatsApp ou Telegram.
          </p>
        </div>

      </div>
    </div>
  )
}
