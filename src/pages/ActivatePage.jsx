// Form Academy — Activation Page
// Route: /activate
//
// Handles the student activation link flow:
//   1. Firebase validates the email sign-in link
//   2. Student sets their own password
//   3. Lead document is fetched by leadId to retrieve the course field
//   4. Firestore writes in order:
//      a. users/{uid}              — student profile
//      b. leads/{leadId}           — uid written in, status → Activated
//      c. enrollments/{uid}_{courseId} — student enrolled in purchased course
//   5. Student redirected to /dashboard (course visible immediately)
//
// Metadata (leadId, email, firstName, lastName) is read from URL query params.
// The course field is NOT in the URL — it is read from the lead document (Option B).
// Fallback: prompt for email if URL params are missing (different device edge case).
//
// Failure recovery:
//   If any Firestore write fails AFTER updatePassword() succeeds,
//   the student is shown a retry screen. They are never permanently blocked.
//   Retrying re-attempts all Firestore writes — individual writes are idempotent.
//   Enrollment failure is surfaced explicitly and blocks redirect.

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
} from 'firebase/auth'
import { auth } from '../firebase'
import { createUser, getUser } from '../db/users'
import { getLead, linkLeadToUser } from '../db/leads'
import { enrollStudent } from '../db/enrollments'

function Logo() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-10 h-10">
      <path d="M15 85 L15 45 Q15 15 50 15 Q85 15 85 45 L85 85" stroke="#034956" strokeWidth="9" fill="none"/>
      <path d="M38 75 L38 42 Q38 30 50 30 Q62 30 62 42 L62 75" stroke="#f26722" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <line x1="38" y1="55" x2="62" y2="55" stroke="#f26722" strokeWidth="8" strokeLinecap="round"/>
      <line x1="22" y1="57" x2="38" y2="57" stroke="#f26722" strokeWidth="6" strokeLinecap="round"/>
      <path d="M15 85 L9 96 L19 90 Z" fill="#034956"/>
    </svg>
  )
}

function Spinner({ label = 'Chargement...' }) {
  return (
    <div className="text-center py-8">
      <svg className="w-8 h-8 animate-spin text-[#f26722] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <p className="text-[#034956]/60 text-sm">{label}</p>
    </div>
  )
}

// Read metadata from URL query params (placed there by AdminLeads buildActionCodeSettings)
function readUrlParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    leadId:    params.get('leadId')    || null,
    email:     params.get('email')     || null,
    firstName: params.get('firstName') || '',
    lastName:  params.get('lastName')  || '',
  }
}

function mapError(code) {
  switch (code) {
    case 'auth/expired-action-code':
      return 'Ce lien a expiré. Contactez l\'administrateur pour un nouveau lien d\'activation.'
    case 'auth/invalid-action-code':
      return 'Ce lien est invalide ou a déjà été utilisé.'
    case 'auth/weak-password':
      return 'Mot de passe trop faible. Minimum 8 caractères.'
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé. Contactez l\'administrateur.'
    default:
      return 'Une erreur est survenue. Contactez l\'administrateur.'
  }
}

// Phases:
//   validating    → checking the Firebase link on mount
//   set-password  → link valid, student enters password
//   saving        → writing to Firestore (after password set)
//   retry         → Firestore write failed, password is already set — allow retry
//   done          → all complete, redirecting
//   error         → link invalid/expired — unrecoverable without new link
export default function ActivatePage() {
  const navigate = useNavigate()

  const [phase, setPhase]           = useState('validating')
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [meta, setMeta]             = useState(null)   // { leadId, email, firstName, lastName }
  const [retryError, setRetryError] = useState(null)   // error shown on retry screen

  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [formError, setFormError]   = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // ── Step 1: validate link on mount ─────────────────────────────────────────
  useEffect(() => {
    async function validateLink() {
      const url = window.location.href

      if (!isSignInWithEmailLink(auth, url)) {
        setPhase('error')
        return
      }

      // Read metadata from URL params (set by admin during link generation)
      const urlMeta = readUrlParams()

      // Email is required by Firebase to complete sign-in with email link
      let email = urlMeta.email
      if (!email) {
        // Fallback: prompt student if URL param missing (shouldn't happen normally)
        email = window.prompt(
          'Veuillez entrer votre adresse e-mail pour confirmer votre identité :'
        )
      }

      if (!email) {
        setPhase('error')
        return
      }

      // Ensure meta has the resolved email even if it came from prompt
      const resolvedMeta = { ...urlMeta, email }
      setMeta(resolvedMeta)

      try {
        const cred = await signInWithEmailLink(auth, email, url)
        setFirebaseUser(cred.user)
        setPhase('set-password')
      } catch (err) {
        console.error('Activation link error:', err.code, err.message)
        setPhase('error')
      }
    }

    validateLink()
  }, [])

  // ── Step 2: student submits password form ───────────────────────────────────
  async function handleSetPassword(e) {
    e.preventDefault()
    setFormError(null)

    if (password.length < 8) {
      setFormError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setFormError('Les mots de passe ne correspondent pas.')
      return
    }

    setSubmitting(true)
    try {
      // 1. Set the password — this is the auth-critical step
      await updatePassword(firebaseUser, password)

      // 2. Write Firestore records (separate from auth — recoverable if it fails)
      await writeFirestoreRecords(firebaseUser, meta)

    } catch (err) {
      console.error('Password set error:', err.code, err.message)
      if (err.code === 'auth/weak-password') {
        setFormError(mapError(err.code))
        setSubmitting(false)
      } else if (err.code === 'FIRESTORE_FAIL') {
        // Password succeeded, Firestore failed — go to retry screen
        setRetryError(err.message)
        setPhase('retry')
        setSubmitting(false)
      } else {
        setFormError(mapError(err.code))
        setSubmitting(false)
      }
    }
  }

  // ── Firestore writes — 3 ordered writes, all retryable ──────────────────────
  // Order is strict per spec:
  //   a. users/{uid}                  — student profile
  //   b. leads/{leadId}               — link uid, mark Activated
  //   c. enrollments/{uid}_{courseId} — enroll in purchased course
  //
  // The course field is NOT in the URL. It is read from the lead document
  // at write time (Option B — Firestore fetch, no URL manipulation possible).
  //
  // All three writes are idempotent — safe to retry on the same user.
  // Enrollment failure is treated as a hard failure: it is logged, surfaced
  // to the student, and blocks the redirect. The student is not silently
  // dropped into a dashboard with no courses.
  async function writeFirestoreRecords(user, metadata) {
    try {
      console.log('[FA:activate] writeFirestoreRecords START — uid:', user.uid, '| metadata:', JSON.stringify(metadata))

      // ── Fetch lead to get the course field ──────────────────────────────────
      let courseId = null
      if (metadata?.leadId) {
        console.log('[FA:activate] FETCH lead START — leadId:', metadata.leadId)
        try {
          const lead = await getLead(metadata.leadId)
          console.log('[FA:activate] FETCH lead SUCCESS — lead:', JSON.stringify(lead))
          if (lead?.course) {
            courseId = lead.course
            console.log('[FA:activate] courseId resolved:', courseId)
          } else {
            console.warn('[FA:activate] lead.course is missing — lead:', lead)
          }
        } catch (err) {
          console.error('[FA:activate] FETCH lead THREW:', err.code, err.message, err)
        }
      } else {
        console.warn('[FA:activate] metadata.leadId is null — skipping lead fetch')
      }

      // ── Write a: users/{uid} ─────────────────────────────────────────────────
      console.log('[FA:activate] READ users/', user.uid, 'START')
      const existing = await getUser(user.uid)
      console.log('[FA:activate] READ users/', user.uid, 'result:', existing)
      if (!existing) {
        const userData = {
          email:      user.email,
          firstName:  metadata?.firstName || '',
          lastName:   metadata?.lastName  || '',
          role:       'student',
          status:     'active',
          leadId:     metadata?.leadId || null,
          courseName: courseId || null,
        }
        console.log('[FA:activate] WRITE a (createUser) START — uid:', user.uid, '| userData:', JSON.stringify(userData))
        try {
          await createUser(user.uid, userData)
          console.log('[FA:activate] WRITE a (createUser) SUCCESS — uid:', user.uid)
        } catch (err) {
          console.error('[FA:activate] WRITE a (createUser) ERROR — code:', err.code, '| message:', err.message, '| stack:', err.stack)
          throw err
        }
      } else {
        console.log('[FA:activate] WRITE a SKIPPED — users/', user.uid, 'already exists — existing doc:', JSON.stringify(existing))
      }

      // ── Write b: leads/{leadId} ──────────────────────────────────────────────
      if (metadata?.leadId) {
        console.log('[FA:activate] WRITE b (linkLeadToUser) START — leadId:', metadata.leadId, '| uid:', user.uid)
        try {
          await linkLeadToUser(metadata.leadId, user.uid)
          console.log('[FA:activate] WRITE b (linkLeadToUser) SUCCESS — leadId:', metadata.leadId)
        } catch (err) {
          console.error('[FA:activate] WRITE b (linkLeadToUser) ERROR — code:', err.code, '| message:', err.message, '| stack:', err.stack)
          throw err
        }
      } else {
        console.warn('[FA:activate] WRITE b SKIPPED — no leadId')
      }

      // ── Write c: enrollments/{uid}_{courseId} ────────────────────────────────
      if (courseId) {
        console.log('[FA:activate] WRITE c (enrollStudent) START — uid:', user.uid, '| courseId:', courseId)
        try {
          await enrollStudent(user.uid, courseId)
          console.log('[FA:activate] WRITE c (enrollStudent) SUCCESS — uid:', user.uid, '| courseId:', courseId)
        } catch (err) {
          console.error('[FA:activate] WRITE c (enrollStudent) ERROR — code:', err.code, '| message:', err.message, '| stack:', err.stack)
          throw err
        }
      } else {
        console.error('[FA:activate] WRITE c SKIPPED — courseId is null. leadId:', metadata?.leadId, '| uid:', user.uid)
        const enrollErr = new Error(
          'Votre compte a été créé mais votre inscription au cours n\'a pas pu être finalisée. Contactez l\'administrateur.'
        )
        enrollErr.code = 'FIRESTORE_FAIL'
        throw enrollErr
      }

      // ── All 3 writes succeeded ───────────────────────────────────────────────
      console.log('[FA:activate] ALL WRITES COMPLETE — uid:', user.uid, '| courseName:', courseId)
      setPhase('done')
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000)

    } catch (err) {
      if (err.code === 'FIRESTORE_FAIL') throw err
      console.error('[FA:activate] UNEXPECTED ERROR — code:', err.code, '| message:', err.message, '| stack:', err.stack, '| full:', err)
      const firestoreErr = new Error(
        'Votre compte a été créé mais une erreur s\'est produite lors de l\'enregistrement. Veuillez réessayer.'
      )
      firestoreErr.code = 'FIRESTORE_FAIL'
      throw firestoreErr
    }
  }

  // ── Retry handler — password already set, only Firestore writes retry ────────
  async function handleRetry() {
    if (!firebaseUser || !meta) return
    setRetryError(null)
    setPhase('saving')
    try {
      await writeFirestoreRecords(firebaseUser, meta)
    } catch (err) {
      setRetryError(err.message)
      setPhase('retry')
    }
  }

  const inputCls = 'w-full border border-[#e2f1f2] rounded-xl px-4 py-3 text-sm text-[#034956] placeholder-[#034956]/30 focus:outline-none focus:border-[#f26722] focus:ring-2 focus:ring-[#f26722]/10 transition-all'

  return (
    <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><Logo /></div>
          <h1 className="text-2xl font-extrabold text-[#034956]">Form Academy</h1>
          <p className="text-[#034956]/55 text-sm mt-1">Activation de votre compte</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#034956]/5 p-7">

          {/* ── Validating ── */}
          {phase === 'validating' && (
            <Spinner label="Validation du lien en cours..." />
          )}

          {/* ── Saving ── */}
          {phase === 'saving' && (
            <Spinner label="Enregistrement en cours..." />
          )}

          {/* ── Error — unrecoverable (bad/expired link) ── */}
          {phase === 'error' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p className="text-[#034956] font-semibold mb-2">Lien invalide</p>
              <p className="text-[#034956]/60 text-sm leading-relaxed mb-6">
                Ce lien d'activation est invalide, expiré ou a déjà été utilisé. Contactez l'administrateur pour recevoir un nouveau lien.
              </p>
              <Link to="/" className="text-[#f26722] text-sm font-semibold hover:underline">← Retour à l'accueil</Link>
            </div>
          )}

          {/* ── Set password ── */}
          {phase === 'set-password' && (
            <>
              <h2 className="text-[#034956] font-bold text-lg mb-2">Créez votre mot de passe</h2>
              <p className="text-[#034956]/55 text-sm mb-6">
                Bienvenue{meta?.firstName ? `, ${meta.firstName}` : ''} ! Choisissez un mot de passe pour accéder à vos cours.
              </p>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {formError}
                </div>
              )}

              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label className="block text-[#034956] text-xs font-semibold mb-1.5">Mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    required
                    autoComplete="new-password"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[#034956] text-xs font-semibold mb-1.5">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    required
                    autoComplete="new-password"
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
                      Activation en cours...
                    </>
                  ) : 'Activer mon compte'}
                </button>
              </form>
            </>
          )}

          {/* ── Retry — password set, Firestore write failed ── */}
          {phase === 'retry' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p className="text-[#034956] font-semibold mb-2">Presque terminé</p>
              <p className="text-[#034956]/60 text-sm leading-relaxed mb-2">
                Votre mot de passe a été créé avec succès. Une erreur s'est produite lors de l'enregistrement de votre profil.
              </p>
              {retryError && (
                <p className="text-red-600 text-xs mb-4 bg-red-50 rounded-xl px-4 py-2">{retryError}</p>
              )}
              <p className="text-[#034956]/50 text-xs mb-6">
                Cliquez sur "Réessayer" — votre mot de passe n'est pas affecté.
              </p>
              <button
                onClick={handleRetry}
                className="w-full bg-[#f26722] text-white py-3.5 rounded-full font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                Réessayer →
              </button>
              <p className="text-[#034956]/40 text-xs mt-4">
                Si le problème persiste, contactez l'administrateur en mentionnant votre adresse e-mail.
              </p>
            </div>
          )}

          {/* ── Done ── */}
          {phase === 'done' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#034956] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p className="text-[#034956] font-bold text-lg mb-2">Compte activé !</p>
              <p className="text-[#034956]/60 text-sm">Redirection vers votre dashboard...</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
