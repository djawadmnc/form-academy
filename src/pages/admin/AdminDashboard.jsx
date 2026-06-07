// Form Academy — Admin Dashboard V3
// Route: /admin
// Owner-first operational dashboard. All data from real Firestore queries.
// No fake numbers. No decorative charts. Every metric answers a real question.
//
// Firestore status values (from src/db/leads.js — LEAD_STATUSES):
//   'New' | 'Contacted' | 'Awaiting Payment' | 'Paid' | 'Pending Activation' | 'Activated'

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import AdminLayout from './AdminLayout'

// ── Course name normaliser ────────────────────────────────────────────────────
// Maps raw enrollment form values to proper display labels.
// Matches the COURSES array in EnrollmentPage.jsx exactly.
const COURSE_DISPLAY = {
  'couture-pret-a-porter': 'Couture Prêt-à-Porter',
  'couture-pour-enfant':   'Couture Pour Enfant',
  'patronage':             'Patronage',
  'broderie':              'Broderie',
}

function displayCourseName(raw) {
  if (!raw) return '—'
  // Already a proper label (legacy or manually entered)
  if (COURSE_DISPLAY[raw]) return COURSE_DISPLAY[raw]
  // Capitalise first letter of each word as last-resort fallback
  return raw.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ── Firestore helpers ─────────────────────────────────────────────────────────

async function fetchLeads() {
  const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function fetchCourses() {
  const snap = await getDocs(collection(db, 'courses'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function startOfMonth() {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  if (val instanceof Date) return val
  return null
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function Ico({ d, className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  users:    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  phone:    'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  check:    'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  activate: 'M13 10V3L4 14h7v7l9-11h-7z',
  graduate: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  book:     'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  arrow:    'M17 8l4 4m0 0l-4 4m4-4H3',
  alert:    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
}

// ── Pipeline Card ─────────────────────────────────────────────────────────────
// priority: 'high' → orange alert style (requires immediate action)
//           'normal' → teal tracking style (informational stage)
function PipelineCard({ label, count, iconKey, priority = 'normal', loading }) {
  const isHigh   = priority === 'high'
  const active   = count > 0

  // Colours
  const accent   = isHigh ? '#f26722' : '#034956'
  const badgeBg  = isHigh ? 'bg-[#f26722]/10 text-[#f26722]' : 'bg-[#034956]/8 text-[#034956]/60'
  const badgeTxt = isHigh ? 'Action requise' : 'En cours'
  const numColor = active && isHigh ? 'text-[#f26722]' : 'text-[#034956]'
  const border   = active && isHigh
    ? 'border-[#f26722]/25 hover:shadow-md hover:-translate-y-0.5'
    : 'border-[#034956]/6'

  const content = (
    <div className={`bg-white rounded-2xl border p-5 flex flex-col gap-3 shadow-sm transition-all duration-200 ${border} ${active ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}12` }}>
          <Ico d={ICONS[iconKey]} className="w-5 h-5" style={{ color: accent }} />
        </div>
        {active && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeBg}`}>
            {badgeTxt}
          </span>
        )}
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-16 bg-[#f6faf7] rounded-lg animate-pulse" />
        ) : (
          <p className={`text-3xl font-extrabold leading-none ${numColor}`}>{count}</p>
        )}
        <p className="text-[#034956]/50 text-xs mt-1.5 font-medium">{label}</p>
      </div>
    </div>
  )

  // All pipeline cards link to leads — clickable regardless of priority
  return <Link to="/admin/leads">{content}</Link>
}

// ── Health Card ───────────────────────────────────────────────────────────────
function HealthCard({ label, description, count, iconKey, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-[#034956]/6 p-5 flex flex-col gap-3 shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-[#f6faf7] flex items-center justify-center text-[#034956]">
        <Ico d={ICONS[iconKey]} className="w-5 h-5" />
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-16 bg-[#f6faf7] rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-extrabold text-[#034956] leading-none">{count}</p>
        )}
        <p className="text-[#034956]/55 text-xs mt-1.5 font-semibold">{label}</p>
        {description && (
          <p className="text-[#034956]/30 text-[10px] mt-0.5 font-medium">{description}</p>
        )}
      </div>
    </div>
  )
}

// ── Formation Donut Chart ─────────────────────────────────────────────────────
const COURSE_COLORS = ['#034956', '#f26722', '#0a7a8f', '#e8894a', '#1a5f6e', '#c4622a']

function FormationDonut({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-24 gap-2">
        <Ico d={ICONS.book} className="w-8 h-8 text-[#034956]/20" />
        <p className="text-[#034956]/35 text-xs text-center">Aucune donnée de formation</p>
      </div>
    )
  }

  const R = 40, cx = 55, cy = 55, strokeW = 14
  const total = data.reduce((s, d) => s + d.count, 0)
  const circ = 2 * Math.PI * R
  let offset = 0

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 110 110" className="w-28 h-28 flex-shrink-0">
        {data.map((d, i) => {
          const dash = (d.count / total) * circ
          const seg = (
            <circle key={i} cx={cx} cy={cy} r={R}
              fill="none"
              stroke={COURSE_COLORS[i % COURSE_COLORS.length]}
              strokeWidth={strokeW}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          )
          offset += dash
          return seg
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="#034956">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7" fill="#034956" opacity="0.45">leads</text>
      </svg>
      <div className="flex flex-col gap-2.5 min-w-0 flex-1">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 min-w-0">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COURSE_COLORS[i % COURSE_COLORS.length] }} />
            <div className="min-w-0">
              <p className="text-[#034956] text-[10px] font-semibold leading-tight truncate">{d.name}</p>
              <p className="text-[#034956]/45 text-[9px]">{d.count} leads</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Priority Feed ─────────────────────────────────────────────────────────────
function PriorityFeed({ counts }) {
  const items = [
    {
      condition: counts.new > 0,
      label: `${counts.new} nouveau${counts.new > 1 ? 'x' : ''} lead${counts.new > 1 ? 's' : ''} à contacter`,
      sub: 'Leads avec statut "New"',
      color: '#f26722',
      iconKey: 'users',
    },
    {
      condition: counts.pendingActivation > 0,
      label: `${counts.pendingActivation} étudiant${counts.pendingActivation > 1 ? 's' : ''} à activer`,
      sub: 'Paiement confirmé — accès non encore envoyé',
      color: '#0a7a8f',
      iconKey: 'activate',
    },
    {
      condition: counts.awaitingPayment > 0,
      label: `${counts.awaitingPayment} lead${counts.awaitingPayment > 1 ? 's' : ''} en attente de paiement`,
      sub: 'Relancer pour confirmer le virement',
      color: '#e8893a',
      iconKey: 'clock',
    },
    {
      condition: counts.contacted > 0,
      label: `${counts.contacted} lead${counts.contacted > 1 ? 's' : ''} contacté${counts.contacted > 1 ? 's' : ''} — suivi à faire`,
      sub: 'En attente de réponse',
      color: '#034956',
      iconKey: 'phone',
    },
  ].filter(i => i.condition)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
          <Ico d={ICONS.check} className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="text-center">
          <p className="text-[#034956] text-sm font-semibold">Aucune action requise aujourd'hui</p>
          <p className="text-[#034956]/35 text-xs mt-0.5">Tous les leads sont à jour</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-[#034956]/5">
      {items.map((item, i) => (
        <Link to="/admin/leads" key={i}
          className="flex items-center gap-4 py-3.5 hover:bg-[#f6faf7]/60 -mx-2 px-2 rounded-xl transition-colors group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${item.color}15` }}>
            <Ico d={ICONS[item.iconKey]} className="w-4 h-4" style={{ color: item.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#034956] text-sm font-semibold leading-tight">{item.label}</p>
            <p className="text-[#034956]/45 text-xs mt-0.5">{item.sub}</p>
          </div>
          <Ico d={ICONS.arrow} className="w-4 h-4 text-[#034956]/25 group-hover:text-[#f26722] transition-colors flex-shrink-0" />
        </Link>
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // Raw data
  const [leads, setLeads]     = useState([])
  const [courses, setCourses] = useState([])

  // Derived counts
  const [counts, setCounts]   = useState({
    new: 0, contacted: 0, awaitingPayment: 0, paid: 0,
    pendingActivation: 0, activated: 0, thisMonth: 0,
  })
  const [publishedCourses, setPublishedCourses] = useState(0)
  const [formationDist, setFormationDist]       = useState([])

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  useEffect(() => {
    async function load() {
      try {
        const [allLeads, allCourses] = await Promise.all([fetchLeads(), fetchCourses()])
        setLeads(allLeads)
        setCourses(allCourses)

        // ── Pipeline counts ───────────────────────────────────────────────
        const monthStart = startOfMonth()
        const c = {
          new: 0, contacted: 0, awaitingPayment: 0, paid: 0,
          pendingActivation: 0, activated: 0, thisMonth: 0,
        }
        for (const l of allLeads) {
          switch (l.status) {
            case 'New':                c.new++;               break
            case 'Contacted':          c.contacted++;         break
            case 'Awaiting Payment':   c.awaitingPayment++;   break
            case 'Paid':               c.paid++;              break
            case 'Pending Activation': c.pendingActivation++; break
            case 'Activated':          c.activated++;         break
          }
          const d = toDate(l.createdAt)
          if (d && d >= monthStart) c.thisMonth++
        }
        setCounts(c)

        // ── Published courses ─────────────────────────────────────────────
        const pub = allCourses.filter(c => c.isActive === true || c.isActive === undefined).length
        setPublishedCourses(pub)

        // ── Formation distribution (from leads.course field) ──────────────
        const dist = {}
        for (const l of allLeads) {
          if (!l.course) continue
          dist[l.course] = (dist[l.course] || 0) + 1
        }
        const distArr = Object.entries(dist)
          .map(([raw, count]) => ({ name: displayCourseName(raw), count }))
          .sort((a, b) => b.count - a.count)
        setFormationDist(distArr)

      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-extrabold text-[#034956]">Tableau de bord</h1>
          <p className="text-[#034956]/40 text-sm mt-0.5 capitalize">{today}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-3.5 rounded-2xl flex items-center gap-3">
            <Ico d={ICONS.alert} className="w-5 h-5 flex-shrink-0 text-red-500" />
            Erreur lors du chargement des données : {error}
          </div>
        )}

        {/* ── Section 1 — Action Pipeline ──────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[#034956] font-bold text-sm">Pipeline d'action</p>
            <Link to="/admin/leads" className="text-xs text-[#f26722] font-semibold hover:underline">
              Voir tous les leads →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            <PipelineCard label="Nouveaux Leads"      count={counts.new}              iconKey="users"    priority="high"   loading={loading} />
            <PipelineCard label="Leads Contactés"     count={counts.contacted}         iconKey="phone"    priority="normal" loading={loading} />
            <PipelineCard label="Attente de Paiement" count={counts.awaitingPayment}   iconKey="clock"    priority="normal" loading={loading} />
            <PipelineCard label="Étudiants Payés"     count={counts.paid}              iconKey="check"    priority="normal" loading={loading} />
            <PipelineCard label="À Activer"           count={counts.pendingActivation} iconKey="activate" priority="high"   loading={loading} />
          </div>
        </div>

        {/* ── Section 2 — School Health ─────────────────────────────────── */}
        <div>
          <p className="text-[#034956] font-bold text-sm mb-2.5">État de l'école</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <HealthCard label="Étudiants Activés" description="Ont accès à la plateforme" count={counts.activated} iconKey="graduate" loading={loading} />
            <HealthCard label="Cours Publiés"      description="Disponibles aux étudiants" count={publishedCourses} iconKey="book"     loading={loading} />
            <HealthCard label="Leads Ce Mois"      description="Nouvelles inscriptions"    count={counts.thisMonth} iconKey="calendar" loading={loading} />
          </div>
        </div>

        {/* ── Section 3 — Actions + Répartition ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Actions Prioritaires — 2/3 width */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#034956]/6 p-6 shadow-sm flex flex-col">
            <div className="mb-4">
              <p className="text-[#034956] font-bold text-sm">Actions Prioritaires</p>
              <p className="text-[#034956]/40 text-xs mt-0.5">Ce qui requiert votre attention maintenant</p>
            </div>
            {loading ? (
              <div className="space-y-3 flex-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f6faf7] animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-[#f6faf7] rounded animate-pulse w-3/4" />
                      <div className="h-2.5 bg-[#f6faf7] rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1">
                <PriorityFeed counts={counts} />
              </div>
            )}
          </div>

          {/* Répartition des Formations — 1/3 width */}
          <div className="bg-white rounded-2xl border border-[#034956]/6 p-6 shadow-sm flex flex-col">
            <div className="mb-4">
              <p className="text-[#034956] font-bold text-sm">Répartition des Formations</p>
              <p className="text-[#034956]/40 text-xs mt-0.5">Par nombre de leads</p>
            </div>
            {loading ? (
              <div className="h-24 flex items-center justify-center flex-1">
                <div className="w-8 h-8 border-2 border-[#034956]/20 border-t-[#034956] rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex-1 flex items-center">
                <FormationDonut data={formationDist} />
              </div>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  )
}
