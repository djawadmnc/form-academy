// Form Academy — Admin Leads Page
// Route: /admin/leads
// Reads all leads from Firestore. Admins can update status and activate paid leads.
//
// Activation flow:
//   1. Admin clicks "Activer" on a lead with status "Paid"
//   2. System calls sendSignInLinkToEmail (Firebase) to generate an activation link
//   3. Link + metadata are stored in localStorage for the ActivatePage
//   4. Admin copies the link and sends it manually (WhatsApp / Telegram / etc.)
//   5. Lead status is updated to "Activated"

import { useState, useEffect } from 'react'
import { sendSignInLinkToEmail } from 'firebase/auth'
import { auth } from '../../firebase'
import AdminLayout from './AdminLayout'
import { getAllLeads, updateLeadStatus, LEAD_STATUSES } from '../../db/leads'

const STATUS_COLORS = {
  'New':                'bg-[#f26722] text-white',
  'Contacted':          'bg-[#034956] text-white',
  'Awaiting Payment':   'bg-yellow-100 text-yellow-800',
  'Paid':               'bg-green-100 text-green-800',
  'Pending Activation': 'bg-blue-100 text-blue-800',
  'Activated':          'bg-[#e2f1f2] text-[#034956]',
}

const STATUSES = LEAD_STATUSES

// buildActionCodeSettings
// Constructs Firebase actionCodeSettings with lead metadata embedded in the URL.
// The /activate page reads leadId, email, firstName, lastName from URL params —
// this ensures the student's device has all context even if opened on a different device.
function buildActionCodeSettings(lead) {
  const params = new URLSearchParams({
    leadId:    lead.id,
    email:     lead.email,
    firstName: lead.firstName,
    lastName:  lead.lastName,
  })
  return {
    url: `${window.location.origin}/activate?${params.toString()}`,
    handleCodeInApp: true,
  }
}

export default function AdminLeads() {
  const [leads, setLeads]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  // Activation modal state
  const [activating, setActivating] = useState(null)   // lead object being activated
  const [activationLink, setActivationLink] = useState(null) // generated link to copy
  const [activationError, setActivationError] = useState(null)
  const [activationLoading, setActivationLoading] = useState(false)
  const [copied, setCopied]         = useState(false)

  useEffect(() => {
    getAllLeads()
      .then(setLeads)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // ── Status dropdown update ────────────────────────────────────────────────
  async function handleStatus(leadId, newStatus) {
    try {
      await updateLeadStatus(leadId, newStatus)
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    } catch (e) {
      alert('Erreur: ' + e.message)
    }
  }

  // ── Open activation modal ────────────────────────────────────────────────
  function openActivation(lead) {
    setActivating(lead)
    setActivationLink(null)
    setActivationError(null)
    setCopied(false)
  }

  function closeActivation() {
    setActivating(null)
    setActivationLink(null)
    setActivationError(null)
    setCopied(false)
  }

  // ── Generate activation link ─────────────────────────────────────────────
  async function generateActivationLink() {
    if (!activating) return
    setActivationLoading(true)
    setActivationError(null)

    try {
      const settings = buildActionCodeSettings(activating)

      // ── DIAGNOSTIC LOGS — remove after Firebase is confirmed working ──────
      console.log('[FA:activation] Attempting sendSignInLinkToEmail')
      console.log('[FA:activation] email:', activating.email)
      console.log('[FA:activation] actionCodeSettings:', JSON.stringify(settings, null, 2))
      // ─────────────────────────────────────────────────────────────────────

      await sendSignInLinkToEmail(auth, activating.email, settings)

      // ── DIAGNOSTIC LOGS ───────────────────────────────────────────────────
      console.log('[FA:activation] SUCCESS — sendSignInLinkToEmail resolved without error')
      console.log('[FA:activation] Firebase accepted the request for:', activating.email)
      console.log('[FA:activation] NOTE: success here only means Firebase queued the email, not that it was delivered')
      // ─────────────────────────────────────────────────────────────────────

      setActivationLink(`${window.location.origin}/activate`)

      await updateLeadStatus(activating.id, 'Pending Activation')
      setLeads(prev => prev.map(l =>
        l.id === activating.id ? { ...l, status: 'Pending Activation' } : l
      ))

    } catch (err) {
      // ── DIAGNOSTIC LOGS ───────────────────────────────────────────────────
      console.error('[FA:activation] FAILED — sendSignInLinkToEmail threw an error')
      console.error('[FA:activation] err.code:', err.code)
      console.error('[FA:activation] err.message:', err.message)
      console.error('[FA:activation] err.stack:', err.stack)
      console.error('[FA:activation] full error object:', err)
      // ─────────────────────────────────────────────────────────────────────

      if (err.code === 'auth/invalid-email') {
        setActivationError('Adresse e-mail invalide.')
      } else if (err.code === 'auth/user-not-found') {
        setActivationError('Utilisateur non trouvé.')
      } else {
        setActivationError('Erreur lors de la génération du lien. Vérifiez la configuration Firebase (Email Link sign-in doit être activé).')
      }
    } finally {
      setActivationLoading(false)
    }
  }

  // ── Copy link to clipboard ────────────────────────────────────────────────
  async function copyLink() {
    if (!activationLink) return
    try {
      await navigator.clipboard.writeText(activationLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea')
      el.value = activationLink
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <AdminLayout currentPage="leads">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#034956]">Leads</h1>
            <p className="text-[#034956]/55 text-sm mt-0.5">{leads.length} inscriptions reçues</p>
          </div>
        </div>

        {loading && <p className="text-[#034956]/50 text-sm">Chargement...</p>}
        {error   && <p className="text-red-600 text-sm">Erreur: {error}</p>}

        {!loading && !error && leads.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#034956]/5 p-10 text-center">
            <p className="text-[#034956]/40 text-sm">Aucune inscription pour le moment.</p>
          </div>
        )}

        {!loading && leads.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#034956]/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f6faf7] border-b border-[#034956]/5">
                  <tr>
                    {['Nom', 'Téléphone', 'Email', 'Formation', 'Paiement', 'Wilaya', 'Statut', 'Date', 'Action'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-[#034956]/50 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f6faf7]">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-[#f6faf7]/60 transition-colors">
                      <td className="px-5 py-4 font-semibold text-[#034956] whitespace-nowrap">{lead.firstName} {lead.lastName}</td>
                      <td className="px-5 py-4 text-[#034956]/70">{lead.phone}</td>
                      <td className="px-5 py-4 text-[#034956]/70 text-xs">{lead.email}</td>
                      <td className="px-5 py-4 text-[#034956]/70 text-xs">{lead.course}</td>
                      <td className="px-5 py-4 text-[#034956]/70">{lead.paymentMethod}</td>
                      <td className="px-5 py-4 text-[#034956]/70">{lead.wilaya || '—'}</td>
                      <td className="px-5 py-4">
                        <select
                          value={lead.status}
                          onChange={e => handleStatus(lead.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-[#034956]/40 text-xs whitespace-nowrap">
                        {lead.createdAt?.toDate
                          ? lead.createdAt.toDate().toLocaleDateString('fr-DZ')
                          : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {(lead.status === 'Paid' || lead.status === 'Pending Activation') && (
                          <button
                            onClick={() => openActivation(lead)}
                            className="bg-[#034956] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-teal-900 transition-colors whitespace-nowrap"
                          >
                            {lead.status === 'Pending Activation' ? 'Renvoyer →' : 'Activer →'}
                          </button>
                        )}
                        {lead.status === 'Activated' && (
                          <span className="text-[#034956]/30 text-xs">Activé ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── ACTIVATION MODAL ─────────────────────────────────────────────────── */}
      {activating && (
        <div className="fixed inset-0 bg-[#034956]/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-7">

            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-[#034956] font-bold text-lg">Activer le compte</h3>
                <p className="text-[#034956]/55 text-sm mt-0.5">
                  {activating.firstName} {activating.lastName}
                </p>
              </div>
              <button onClick={closeActivation} className="text-[#034956]/30 hover:text-[#034956] transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Lead summary */}
            <div className="bg-[#f6faf7] rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#034956]/50">Email</span>
                <span className="text-[#034956] font-medium text-xs">{activating.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#034956]/50">Formation</span>
                <span className="text-[#034956] font-medium text-xs">{activating.course}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#034956]/50">Paiement</span>
                <span className="text-[#034956] font-medium text-xs">{activating.paymentMethod}</span>
              </div>
            </div>

            {activationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
                {activationError}
              </div>
            )}

            {/* Before link is generated */}
            {!activationLink && (
              <>
                <div className="bg-[#e2f1f2] rounded-xl p-4 mb-5">
                  <p className="text-[#034956] text-xs leading-relaxed">
                    Firebase enverra un lien d'activation à <strong>{activating.email}</strong>. L'étudiant(e) cliquera sur ce lien pour créer son mot de passe et accéder à ses cours.
                  </p>
                </div>
                <button
                  onClick={generateActivationLink}
                  disabled={activationLoading}
                  className="w-full bg-[#f26722] text-white py-3.5 rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {activationLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Génération du lien...
                    </>
                  ) : 'Générer le lien d\'activation'}
                </button>
              </>
            )}

            {/* After link is generated */}
            {activationLink && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    <p className="text-green-800 text-xs font-semibold">Lien d'activation envoyé à {activating.email}</p>
                  </div>
                  <p className="text-green-700 text-xs leading-relaxed">
                    Le statut du lead a été mis à jour : <strong>Activated</strong>. Vous pouvez aussi envoyer manuellement le lien ci-dessous via WhatsApp, Telegram ou tout autre canal.
                  </p>
                </div>

                {/* Copiable link */}
                <div className="flex items-center gap-2 bg-[#f6faf7] border border-[#e2f1f2] rounded-xl px-4 py-3 mb-5">
                  <span className="text-[#034956] text-xs flex-1 truncate font-mono">{activationLink}</span>
                  <button
                    onClick={copyLink}
                    className="flex-shrink-0 bg-[#034956] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-teal-900 transition-colors flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                        Copié !
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        Copier
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={closeActivation}
                  className="w-full border-2 border-[#034956]/20 text-[#034956] py-3 rounded-full font-semibold hover:border-[#034956] transition-colors"
                >
                  Fermer
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
