// Form Academy — Enrollment Page
// 3-step form that writes a lead document to Firestore on submission.
// Design matches the approved visual in preview.html — no changes to layout.

import { useState } from 'react'
import { createLead, emailExistsInLeads } from '../db/leads'
import { emailExistsInUsers } from '../db/users'

const COURSES = [
  { value: 'couture-pret-a-porter', label: 'Couture Prêt-à-Porter' },
  { value: 'couture-pour-enfant',   label: 'Couture Pour Enfant' },
  { value: 'patronage',             label: 'Patronage (bientôt disponible)' },
  { value: 'broderie',              label: 'Broderie (bientôt disponible)' },
]

const COURSE_LABELS = Object.fromEntries(COURSES.map(c => [c.value, c.label]))

const WILAYAS = [
  '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi',
  '05 - Batna', '06 - Béjaïa', '07 - Biskra', '08 - Béchar',
  '09 - Blida', '10 - Bouira', '11 - Tamanrasset', '12 - Tébessa',
  '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou', '16 - Alger',
  '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
  '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma',
  '25 - Constantine', '26 - Médéa', '27 - Mostaganem', "28 - M'Sila",
  '29 - Mascara', '30 - Ouargla', '31 - Oran', '32 - El Bayadh',
  '33 - Illizi', '34 - Bordj Bou Arréridj', '35 - Boumerdès', '36 - El Tarf',
  '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
  '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla',
  '45 - Naâma', '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane',
  '49 - Timimoun', '50 - Bordj Badji Mokhtar', '51 - Ouled Djellal', '52 - Béni Abbès',
  '53 - In Salah', '54 - In Guezzam', '55 - Touggourt', '56 - Djanet',
  "57 - El M'Ghair", '58 - El Meniaa',
]

// ─── Step dots ───────────────────────────────────────────────────────────────
function StepDot({ number, state }) {
  const base = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'
  if (state === 'done')    return <div className={`${base} bg-[#034956] text-white`}>✓</div>
  if (state === 'active')  return <div className={`${base} bg-[#f26722] text-white`}>{number}</div>
  return                          <div className={`${base} bg-[#e2f1f2] text-[#034956]/40`}>{number}</div>
}

function StepLine({ active }) {
  return <div className={`flex-1 h-0.5 transition-colors duration-300 ${active ? 'bg-[#f26722]' : 'bg-[#e2f1f2]'}`} />
}

// ─── Field components ────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-[#034956] text-xs font-semibold mb-1.5">
        {label} {required && <span className="text-[#f26722]">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

const inputCls      = 'w-full border border-[#e2f1f2] rounded-xl px-4 py-3 text-sm text-[#034956] placeholder-[#034956]/30 focus:outline-none focus:border-[#f26722] focus:ring-2 focus:ring-[#f26722]/10 transition-all'
const inputErrorCls = 'w-full border border-red-400 rounded-xl px-4 py-3 text-sm text-[#034956] placeholder-[#034956]/30 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200/60 transition-all'

function cls(hasError) { return hasError ? inputErrorCls : inputCls }

// ─── Validators ───────────────────────────────────────────────────────────────
// Stricter email regex: requires local@domain.tld where tld is 2–6 alpha chars
// Rejects: double @, missing dot in domain, numeric-only TLD, trailing chars after TLD
const RE_EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}$/
const RE_PHONE = /^(05|06|07)\d{8}$/

function validatePhone(v) {
  const digits = v.replace(/\s/g, '')
  if (!digits) return 'Veuillez saisir votre numéro de téléphone'
  if (!RE_PHONE.test(digits)) return 'Le numéro doit contenir 10 chiffres et commencer par 05, 06 ou 07'
  return null
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EnrollmentPage({ onBack }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    wilaya: '', course: '', paymentMethod: '', notes: '',
  })

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (field) => (e) => {
    const val = e.target.value
    setForm(f => ({ ...f, [field]: val }))
    // Clear error as user types/changes
    if (fieldErrors[field]) {
      setFieldErrors(fe => ({ ...fe, [field]: null }))
    }
  }

  const setBlurError = (field, msg) => {
    if (msg) setFieldErrors(fe => ({ ...fe, [field]: msg }))
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  function validateStep(n) {
    const errors = {}

    if (n === 1) {
      if (!form.firstName.trim())                  errors.firstName     = 'Veuillez renseigner votre prénom'
      if (!form.lastName.trim())                   errors.lastName      = 'Veuillez renseigner votre nom'
      const phoneErr = validatePhone(form.phone)
      if (phoneErr)                                errors.phone         = phoneErr
      if (!form.email.trim())                      errors.email         = "Veuillez saisir une adresse e-mail"
      else if (!RE_EMAIL.test(form.email.trim()))  errors.email         = "Veuillez saisir une adresse e-mail valide"
    }

    if (n === 2) {
      if (!form.wilaya)        errors.wilaya        = 'Veuillez sélectionner votre wilaya'
      if (!form.course)        errors.course        = 'Veuillez choisir une formation'
      if (!form.paymentMethod) errors.paymentMethod = 'Veuillez choisir un mode de paiement'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Fields that belong to each step — used to route errors to the right step
  const STEP1_FIELDS = ['firstName', 'lastName', 'phone', 'email']
  const STEP2_FIELDS = ['wilaya', 'course', 'paymentMethod']

  // Full validation across all steps. Returns errors object (empty = valid).
  // If errors exist, navigates to the first step containing an error.
  function validateAllAndNavigate(extraErrors = {}) {
    const s1 = {}
    const s2 = {}

    if (!form.firstName.trim())                  s1.firstName     = 'Veuillez renseigner votre prénom'
    if (!form.lastName.trim())                   s1.lastName      = 'Veuillez renseigner votre nom'
    const phoneErr = validatePhone(form.phone)
    if (phoneErr)                                s1.phone         = phoneErr
    if (!form.email.trim())                      s1.email         = 'Veuillez saisir une adresse e-mail'
    else if (!RE_EMAIL.test(form.email.trim()))  s1.email         = 'Veuillez saisir une adresse e-mail valide'

    if (!form.wilaya)        s2.wilaya        = 'Veuillez sélectionner votre wilaya'
    if (!form.course)        s2.course        = 'Veuillez choisir une formation'
    if (!form.paymentMethod) s2.paymentMethod = 'Veuillez choisir un mode de paiement'

    // Merge any extra errors (e.g. duplicate email from server check)
    const step1Errors = { ...s1, ...Object.fromEntries(Object.entries(extraErrors).filter(([k]) => STEP1_FIELDS.includes(k))) }
    const step2Errors = { ...s2, ...Object.fromEntries(Object.entries(extraErrors).filter(([k]) => STEP2_FIELDS.includes(k))) }
    const allErrors   = { ...step1Errors, ...step2Errors }

    if (Object.keys(allErrors).length === 0) return {}

    setFieldErrors(allErrors)

    // Navigate to first step that has an error
    if (Object.keys(step1Errors).length > 0) {
      setStep(1)
    } else if (Object.keys(step2Errors).length > 0) {
      setStep(2)
    }
    window.scrollTo(0, 0)
    return allErrors
  }

  function next() {
    if (!validateStep(step)) return
    setStep(s => s + 1)
    window.scrollTo(0, 0)
  }

  function back() {
    setFieldErrors({})
    setStep(s => s - 1)
    window.scrollTo(0, 0)
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    // 1. Final sync validation pass — catches anything missed between steps
    const syncErrors = validateAllAndNavigate()
    if (Object.keys(syncErrors).length > 0) return

    setLoading(true)
    setSubmitError(null)
    try {
      // 2. Async duplicate email check — wrapped separately so a Firestore rules
      //    denial on the users collection doesn't swallow the real error message.
      const normalizedEmail = form.email.trim().toLowerCase()
      let inLeads = false
      let inUsers = false
      try {
        ;[inLeads, inUsers] = await Promise.all([
          emailExistsInLeads(normalizedEmail),
          emailExistsInUsers(normalizedEmail),
        ])
      } catch (dupErr) {
        // Firestore rules may deny unauthenticated reads — treat as "not duplicate"
        // and let the lead creation attempt proceed. This is a safe fallback.
        console.warn('[FA:enroll] duplicate check failed (rules?):', dupErr.code, dupErr.message)
      }

      if (inLeads || inUsers) {
        setFieldErrors(fe => ({
          ...fe,
          email: 'Cette adresse e-mail est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.',
        }))
        setStep(1)
        window.scrollTo(0, 0)
        setLoading(false)
        return
      }

      // 3. All validation passed — write to Firestore
      await createLead(form)
      setSuccess(true)
      window.scrollTo(0, 0)
    } catch (err) {
      // Only genuine system errors reach here (Firestore write failed, network down)
      console.error('Firestore write failed:', err)
      setSubmitError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#f6faf7] py-10 px-4">
        <div className="max-w-xl mx-auto text-center py-12">
          <div className="w-20 h-20 bg-[#034956] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-[#034956] mb-3">Inscription envoyée !</h2>
          <p className="text-[#034956]/60 text-base leading-relaxed mb-8 max-w-sm mx-auto">
            Notre équipe vous contactera dans les <strong>24 heures</strong> pour confirmer votre paiement et activer votre accès.
          </p>
          <div className="bg-[#e2f1f2] rounded-2xl p-5 max-w-xs mx-auto mb-8">
            <p className="text-[#034956] text-sm font-semibold mb-1">Prochaine étape</p>
            <p className="text-[#034956]/65 text-sm">Préparez votre preuve de paiement ({form.paymentMethod}) pour l'envoyer à notre équipe.</p>
          </div>
          <button
            onClick={onBack}
            className="bg-[#034956] text-white px-8 py-4 rounded-full font-semibold hover:bg-teal-900 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6faf7] py-10 px-4">
      <div className="max-w-xl mx-auto">

        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-2 text-[#034956]/60 hover:text-[#034956] text-sm mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Retour à l'accueil
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#034956] mb-2">Formulaire d'inscription</h1>
          <p className="text-[#034956]/55 text-sm">Remplissez le formulaire — nous vous contacterons sous 24h</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-3">
          <StepDot number={1} state={step > 1 ? 'done' : step === 1 ? 'active' : 'pending'} />
          <StepLine active={step > 1} />
          <StepDot number={2} state={step > 2 ? 'done' : step === 2 ? 'active' : 'pending'} />
          <StepLine active={step > 2} />
          <StepDot number={3} state={step === 3 ? 'active' : 'pending'} />
        </div>
        <div className="flex justify-between text-xs text-[#034956]/45 mb-8 px-1">
          <span>Informations</span>
          <span>Localisation</span>
          <span>Récapitulatif</span>
        </div>

        {/* Submit error banner (Firestore errors only) */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {submitError}
          </div>
        )}

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#034956]/5 p-6 sm:p-8">
            <h2 className="text-[#034956] font-bold text-lg mb-6">Vos informations personnelles</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prénom" required error={fieldErrors.firstName}>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={set('firstName')}
                    onBlur={() => !form.firstName.trim() && setBlurError('firstName', 'Veuillez renseigner votre prénom')}
                    placeholder="Samira"
                    className={cls(fieldErrors.firstName)}
                  />
                </Field>
                <Field label="Nom" required error={fieldErrors.lastName}>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={set('lastName')}
                    onBlur={() => !form.lastName.trim() && setBlurError('lastName', 'Veuillez renseigner votre nom')}
                    placeholder="Benali"
                    className={cls(fieldErrors.lastName)}
                  />
                </Field>
              </div>
              <Field label="Numéro de téléphone" required error={fieldErrors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  onBlur={() => setBlurError('phone', validatePhone(form.phone))}
                  placeholder="05 XX XX XX XX"
                  className={cls(fieldErrors.phone)}
                />
              </Field>
              <Field label="Adresse e-mail" required error={fieldErrors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  onBlur={() => {
                    const v = form.email.trim()
                    if (!v) setBlurError('email', 'Veuillez saisir une adresse e-mail')
                    else if (!RE_EMAIL.test(v)) setBlurError('email', 'Veuillez saisir une adresse e-mail valide')
                  }}
                  placeholder="samira@email.com"
                  className={cls(fieldErrors.email)}
                />
              </Field>
            </div>
            <button onClick={next} className="w-full mt-6 bg-[#f26722] text-white py-4 rounded-full font-semibold hover:bg-orange-600 transition-colors">
              Continuer →
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#034956]/5 p-6 sm:p-8">
            <h2 className="text-[#034956] font-bold text-lg mb-6">Votre localisation et formation</h2>
            <div className="space-y-4">
              <Field label="Wilaya" required error={fieldErrors.wilaya}>
                <select
                  value={form.wilaya}
                  onChange={set('wilaya')}
                  onBlur={() => !form.wilaya && setBlurError('wilaya', 'Veuillez sélectionner votre wilaya')}
                  className={cls(fieldErrors.wilaya) + ' bg-white'}
                >
                  <option value="">Sélectionnez votre wilaya</option>
                  {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </Field>
              <Field label="Formation souhaitée" required error={fieldErrors.course}>
                <select
                  value={form.course}
                  onChange={set('course')}
                  onBlur={() => !form.course && setBlurError('course', 'Veuillez choisir une formation')}
                  className={cls(fieldErrors.course) + ' bg-white'}
                >
                  <option value="">Choisissez une formation</option>
                  {COURSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Mode de paiement" required error={fieldErrors.paymentMethod}>
                <div className="grid grid-cols-2 gap-3">
                  {['CCP', 'BaridiMob'].map(method => (
                    <label
                      key={method}
                      className={`flex items-center gap-3 border rounded-xl px-4 py-3.5 cursor-pointer transition-all ${
                        form.paymentMethod === method
                          ? 'border-[#f26722] bg-[#f26722]/5'
                          : fieldErrors.paymentMethod
                          ? 'border-red-400 hover:border-red-500'
                          : 'border-[#e2f1f2] hover:border-[#034956]/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={form.paymentMethod === method}
                        onChange={set('paymentMethod')}
                        className="accent-[#f26722]"
                      />
                      <span className="text-sm font-semibold text-[#034956]">{method}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={back} className="flex-1 border-2 border-[#034956]/20 text-[#034956] py-4 rounded-full font-semibold hover:border-[#034956] transition-colors">← Retour</button>
              <button onClick={next} className="flex-1 bg-[#f26722] text-white py-4 rounded-full font-semibold hover:bg-orange-600 transition-colors">Continuer →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#034956]/5 p-6 sm:p-8">
            <h2 className="text-[#034956] font-bold text-lg mb-6">Récapitulatif de votre inscription</h2>

            {/* Summary */}
            <div className="bg-[#f6faf7] rounded-2xl p-5 mb-6 space-y-2">
              {[
                { label: 'Prénom',     value: form.firstName },
                { label: 'Nom',        value: form.lastName },
                { label: 'Téléphone',  value: form.phone },
                { label: 'Email',      value: form.email },
                { label: 'Wilaya',     value: form.wilaya || '—' },
                { label: 'Formation',  value: COURSE_LABELS[form.course] || form.course },
                { label: 'Paiement',   value: form.paymentMethod },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-[#e2f1f2] last:border-0">
                  <span className="text-[#034956]/50 text-xs">{row.label}</span>
                  <span className="text-[#034956] text-sm font-semibold">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Notes */}
            <Field label="Notes ou questions (optionnel)">
              <textarea
                value={form.notes}
                onChange={set('notes')}
                rows={3}
                placeholder="Posez vos questions ou ajoutez des informations supplémentaires..."
                className={inputCls + ' resize-none'}
              />
            </Field>

            {/* Info box */}
            <div className="bg-[#e2f1f2] rounded-xl p-4 mt-4 flex gap-3">
              <svg className="w-5 h-5 text-[#034956] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <p className="text-[#034956] text-xs leading-relaxed">
                Notre équipe vous contactera dans les <strong>24 heures</strong> pour confirmer votre inscription et vous guider pour le paiement.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={back} disabled={loading} className="flex-1 border-2 border-[#034956]/20 text-[#034956] py-4 rounded-full font-semibold hover:border-[#034956] transition-colors disabled:opacity-50">
                ← Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-[#f26722] text-white py-4 rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Envoi en cours...
                  </>
                ) : "Envoyer l'inscription ✓"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
