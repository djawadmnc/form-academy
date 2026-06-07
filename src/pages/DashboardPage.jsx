// Form Academy — Student Dashboard Page
// Route: /dashboard (protected — any authenticated user)
//
// Sprint #5: Loads real enrolled courses + progress from Firestore.
// Visual design unchanged from approved Sprint #2 mockup.

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getStudentEnrollments } from '../db/enrollments'
import { getCourse } from '../db/courses'
import { getProgress } from '../db/progress'
import logo from '../assets/logo.png'
import logoIcon from '../../images/logo icon.jpg'

function NavItem({ icon, label, active, onClick, compact, hovered }) {
  // visually expanded = full sidebar tab OR hovered in compact mode
  const expanded = !compact || hovered
  return (
    <button
      onClick={onClick}
      title={!expanded ? label : undefined}
      className={`w-full flex items-center rounded-xl text-left transition-all duration-200 ${
        expanded ? 'gap-3 px-4 py-3' : 'justify-center px-2 py-3'
      } ${active ? 'bg-white/10 text-white' : 'text-[#e2f1f2]/60 hover:bg-white/5 hover:text-white'}`}
    >
      {/* Icon — wrapped in white pill when collapsed */}
      {!expanded
        ? (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            active ? 'bg-white/15' : 'bg-white/10'
          }`}>
            {icon}
          </div>
        )
        : icon
      }
      {expanded && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{label}</span>}
    </button>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-[#034956]/5 text-center">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2">{icon}</div>
      <p className="text-[#034956] font-extrabold text-2xl">{value}</p>
      <p className="text-[#034956]/45 text-xs mt-0.5">{label}</p>
    </div>
  )
}

// ─── Course progress card ────────────────────────────────────────────────────
function CourseCard({ course, progress, onOpen }) {
  const pct      = progress?.progressPercent || 0
  const completed = progress?.isCompleted || false

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#034956]/5 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[#034956] font-bold">{course.title}</p>
          <p className="text-[#034956]/50 text-xs mt-0.5">{course.level}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
          completed
            ? 'bg-green-100 text-green-700'
            : pct > 0
              ? 'bg-[#f26722]/10 text-[#f26722]'
              : 'bg-[#e2f1f2] text-[#034956]'
        }`}>
          {completed ? '✓ Terminé' : `${pct}%`}
        </span>
      </div>
      <div className="mb-4">
        <div className="bg-[#f6faf7] rounded-full h-2">
          <div
            className="bg-[#f26722] h-2 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          ></div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[#034956]/40 text-xs">
          {completed ? 'Toutes les leçons terminées' : pct === 0 ? 'Non commencé' : 'En cours'}
        </span>
        <button
          onClick={() => onOpen(course.id)}
          className="bg-[#f26722] text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-orange-600 transition-colors"
        >
          {pct === 0 ? 'Commencer →' : 'Continuer →'}
        </button>
      </div>
    </div>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const icons = {
  home:   <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  book:   <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
  cert:   <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>,
  chat:   <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>,
  back:   <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>,
  logout: <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
  inProg: <svg className="w-5 h-5 text-[#f26722]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>,
  done:   <svg className="w-5 h-5 text-[#034956]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  award:  <svg className="w-5 h-5 text-[#f26722]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>,
}

// ─── Profile Dropdown ────────────────────────────────────────────────────────
function ProfileDropdown({ displayName, initials, onLogout, compact }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div ref={ref} className={`relative border-t border-white/10 ${compact ? 'px-2 pb-3 pt-2' : 'px-3 pb-4 pt-3'}`}>
      {/* Dropdown menu — opens upward */}
      <div className={`absolute bottom-full mb-2 bg-[#023d48] rounded-xl border border-white/10 shadow-xl overflow-hidden transition-all duration-200 origin-bottom z-50 ${
        compact ? 'left-1 right-1' : 'left-3 right-3'
      } ${open ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
        {!compact && (
          <div className="px-4 py-2.5 text-[#e2f1f2]/40 text-xs font-medium border-b border-white/10 cursor-default select-none">
            Mon compte
          </div>
        )}
        <button
          onClick={() => { setOpen(false); onLogout() }}
          className="w-full flex items-center gap-3 px-4 py-3 text-[#e2f1f2]/70 hover:bg-white/5 hover:text-red-300 transition-colors text-left"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          <span className="text-sm">Déconnexion</span>
        </button>
      </div>

      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        title={compact ? displayName : undefined}
        className={`w-full flex items-center rounded-xl hover:bg-white/5 transition-colors ${compact ? 'justify-center p-1.5' : 'gap-3 px-2 py-2'}`}
      >
        <div className="w-9 h-9 bg-[#f26722] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {initials}
        </div>
        {!compact && (
          <>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-white text-sm font-semibold truncate">{displayName}</p>
              <p className="text-[#e2f1f2]/40 text-xs">Étudiante</p>
            </div>
            <svg
              className={`w-4 h-4 text-[#e2f1f2]/40 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
            </svg>
          </>
        )}
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate              = useNavigate()
  const { currentUser, userDoc, signOut } = useAuth()

  const [tab, setTab]             = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)

  // Real Firestore data
  const [courseData, setCourseData] = useState([])  // [{ course, progress }]
  const [dataLoading, setDataLoading] = useState(true)

  // Display name from Firestore
  const displayName  = userDoc ? `${userDoc.firstName} ${userDoc.lastName}`.trim() : '...'
  const displayFirst = userDoc?.firstName || 'Étudiante'
  const initials     = displayName.split(' ').map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || 'E'

  // Load enrollments + course details + progress in parallel
  useEffect(() => {
    if (!currentUser) return

    async function loadData() {
      try {
        const enrollments = await getStudentEnrollments(currentUser.uid)

        const pairs = await Promise.all(
          enrollments.map(async (enroll) => {
            const [course, progress] = await Promise.all([
              getCourse(enroll.courseId),
              getProgress(currentUser.uid, enroll.courseId),
            ])
            return course ? { course, progress } : null
          })
        )

        setCourseData(pairs.filter(Boolean))
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setDataLoading(false)
      }
    }

    loadData()
  }, [currentUser])

  // Derived stats
  const inProgress  = courseData.filter(d => (d.progress?.progressPercent || 0) > 0 && !d.progress?.isCompleted)
  const completed   = courseData.filter(d => d.progress?.isCompleted)
  const notStarted  = courseData.filter(d => !d.progress || d.progress.progressPercent === 0)

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  // Compact mode: all tabs except overview
  const compact = tab !== 'overview'

  // Visual expansion: full sidebar tab OR hovering compact sidebar
  const sidebarExpanded = !compact || sidebarHovered

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  const sidebar = (
    <aside
      onMouseEnter={() => compact && setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
      className={`bg-[#034956] flex flex-col flex-shrink-0 fixed top-0 left-0 h-screen z-50 transition-all duration-250 md:z-30
        ${sidebarExpanded ? 'w-60' : 'w-16'}
        ${sidebarOpen ? 'flex' : 'hidden md:flex'}
      `}
    >
      {/* Logo */}
      <div className={`border-b border-white/10 flex items-center overflow-hidden ${sidebarExpanded ? 'px-5 py-4' : 'justify-center px-2 py-4'}`}>
        <button
          onClick={() => { setTab('overview'); setSidebarOpen(false); setSidebarHovered(false) }}
          className="hover:opacity-80 transition-opacity flex-shrink-0"
          title="Tableau de bord"
        >
          {sidebarExpanded
            ? <img src={logo} alt="Form Academy" className="h-9 w-auto object-contain" />
            : <img src={logoIcon} alt="Form Academy" className="w-8 h-8 rounded-lg object-contain" />
          }
        </button>
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-4 space-y-1 overflow-hidden ${sidebarExpanded ? 'px-3' : 'px-2'}`}>
        <NavItem compact={compact} hovered={sidebarHovered} icon={icons.home} label="Tableau de bord" active={tab === 'overview'}     onClick={() => { setTab('overview');     setSidebarOpen(false); setSidebarHovered(false) }} />
        <NavItem compact={compact} hovered={sidebarHovered} icon={icons.book} label="Mes Cours"        active={tab === 'courses'}      onClick={() => { setTab('courses');      setSidebarOpen(false); setSidebarHovered(false) }} />
        {/* Certificats — future feature */}
        <div
          title={!sidebarExpanded ? 'Certificats' : undefined}
          className={`w-full flex items-center rounded-xl cursor-not-allowed select-none transition-all duration-200 text-[#e2f1f2]/30
            ${sidebarExpanded ? 'gap-3 px-4 py-3' : 'justify-center px-2 py-3'}
          `}
        >
          {!sidebarExpanded
            ? <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5">{icons.cert}</div>
            : icons.cert
          }
          {sidebarExpanded && (
            <>
              <span className="flex-1 text-sm font-medium whitespace-nowrap overflow-hidden">Certificats</span>
              <span className="text-[9px] font-bold bg-white/8 text-[#e2f1f2]/30 px-2 py-0.5 rounded-full tracking-wider flex-shrink-0">Bientôt</span>
            </>
          )}
        </div>
        <NavItem compact={compact} hovered={sidebarHovered} icon={icons.chat} label="Communauté"       active={tab === 'community'}    onClick={() => { setTab('community');    setSidebarOpen(false); setSidebarHovered(false) }} />
      </nav>

      {/* Profile dropdown — bottom */}
      <ProfileDropdown
        compact={!sidebarExpanded}
        displayName={displayName}
        initials={initials}
        onLogout={handleLogout}
      />
    </aside>
  )

  // ── Overview tab ─────────────────────────────────────────────────────────────
  // Source of truth: enrollments → courses (Firestore) + progress.
  // UI structure is fixed — only values update when Google Classroom integrates.
  const firstCourse   = courseData[0] || null
  const pct           = firstCourse?.progress?.progressPercent || 0
  const lessonsTotal  = firstCourse?.course?.lessonsTotal  || 0
  const lessonsDone   = firstCourse?.progress?.lessonsCompleted || 0
  const exercisesTotal = firstCourse?.course?.exercisesTotal || 0
  const exercisesDone  = firstCourse?.progress?.exercisesCompleted || 0
  const isCertLocked  = !firstCourse?.progress?.isCompleted

  // Format enrollment date from Firestore Timestamp or ISO string
  const enrollDate = userDoc?.createdAt
    ? (() => {
        const d = userDoc.createdAt.toDate ? userDoc.createdAt.toDate() : new Date(userDoc.createdAt)
        return d.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'long', year: 'numeric' })
      })()
    : '—'

  // Formation name — read directly from userDoc.courseName (copied from lead at activation).
  // Never queries leads collection. Falls back gracefully with a console warning.
  const formationName = (() => {
    if (userDoc?.courseName) return userDoc.courseName
    if (!dataLoading) {
      console.warn('[Dashboard] courseName missing on userDoc for uid:', currentUser?.uid)
    }
    return 'Formation non attribuée'
  })()

  const overviewTab = (
    <div className="p-5 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#034956]">Bonjour, {displayFirst} 👋</h1>
        <p className="text-[#034956]/50 text-sm mt-1">Voici l'état de votre formation.</p>
      </div>

      {/* Loading skeleton */}
      {dataLoading && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#034956]/5 p-6 animate-pulse space-y-3">
            <div className="h-4 bg-[#e2f1f2] rounded w-1/3" />
            <div className="h-8 bg-[#e2f1f2] rounded w-1/2" />
            <div className="h-3 bg-[#e2f1f2] rounded w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-[#034956]/5 p-5 animate-pulse">
                <div className="h-3 bg-[#e2f1f2] rounded w-1/2 mb-2" />
                <div className="h-5 bg-[#e2f1f2] rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!dataLoading && (
        <div className="space-y-4">

          {/* Formation card — hero */}
          <div className="bg-white rounded-2xl border border-[#034956]/5 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#034956] to-[#f26722]" />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-[#034956]/40 text-xs font-semibold uppercase tracking-widest mb-1">Formation achetée</p>
                  <p className="text-[#034956] font-extrabold text-lg leading-tight">{formationName}</p>
                  <p className="text-[#034956]/40 text-xs mt-1">Inscrit le {enrollDate}</p>
                </div>
                <span className="flex-shrink-0 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
                  ● Actif
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[#034956]/50 text-xs">Progression globale</span>
                <span className="text-[#034956] text-xs font-bold">{pct}%</span>
              </div>
              <div className="bg-[#f0f7f8] rounded-full h-2.5 mb-1">
                <div
                  className="bg-[#f26722] h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {pct === 0 && (
                <p className="text-[#034956]/35 text-xs mt-1.5">Les leçons seront mises à jour dès le démarrage du cours.</p>
              )}
            </div>
          </div>

          {/* Stats grid — 2×2 */}
          <div className="grid grid-cols-2 gap-4">

            {/* Leçons */}
            <div className="bg-white rounded-2xl border border-[#034956]/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-[#034956]/6 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#034956]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
                </div>
                <span className="text-[#034956]/50 text-xs font-medium">Leçons complétées</span>
              </div>
              <p className="text-[#034956] font-extrabold text-2xl">{lessonsDone}<span className="text-[#034956]/30 font-normal text-base"> / {lessonsTotal || '—'}</span></p>
            </div>

            {/* Exercices */}
            <div className="bg-white rounded-2xl border border-[#034956]/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-[#f26722]/8 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#f26722]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                </div>
                <span className="text-[#034956]/50 text-xs font-medium">Exercices validés</span>
              </div>
              <p className="text-[#034956] font-extrabold text-2xl">{exercisesDone}<span className="text-[#034956]/30 font-normal text-base"> / {exercisesTotal || '—'}</span></p>
            </div>

            {/* Statut */}
            <div className="bg-white rounded-2xl border border-[#034956]/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <span className="text-[#034956]/50 text-xs font-medium">Statut</span>
              </div>
              <p className="text-green-700 font-bold text-sm">Active</p>
            </div>

            {/* Certificat */}
            <div className="bg-white rounded-2xl border border-[#034956]/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-[#034956]/6 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#034956]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                </div>
                <span className="text-[#034956]/50 text-xs font-medium">Certificat</span>
              </div>
              {isCertLocked
                ? <p className="text-[#034956]/40 font-bold text-sm flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    Verrouillé
                  </p>
                : <p className="text-[#f26722] font-bold text-sm">Disponible →</p>
              }
            </div>

          </div>

          {/* Course action — only when course data exists */}
          {firstCourse && (
            <div className="bg-white rounded-2xl border border-[#034956]/5 p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[#034956] font-semibold text-sm">{firstCourse.course.title}</p>
                <p className="text-[#034956]/40 text-xs mt-0.5">{pct === 0 ? 'Prêt à commencer' : 'En cours'}</p>
              </div>
              <button
                onClick={() => navigate(`/course/${firstCourse.course.id}`)}
                className="flex-shrink-0 bg-[#f26722] text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors"
              >
                {pct === 0 ? 'Commencer →' : 'Continuer →'}
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  )

  // ── Courses tab — LMS player layout ─────────────────────────────────────────
  const coursesTab = (
    <div className="h-full min-h-screen bg-[#f6faf7]">

      {/* Loading skeleton */}
      {dataLoading && (
        <div className="p-6 md:p-8 space-y-4 animate-pulse">
          <div className="h-6 bg-white rounded w-40" />
          <div className="aspect-video bg-white rounded-2xl" />
        </div>
      )}

      {/* Real course content — when Google Classroom connected */}
      {!dataLoading && courseData.length > 0 && (
        <div className="flex flex-col md:flex-row h-full">
          <div className="flex-1 p-5 md:p-8 space-y-4">
            {courseData.map(({ course, progress }) => (
              <CourseCard key={course.id} course={course} progress={progress} onOpen={(id) => navigate(`/course/${id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* LMS placeholder — pre-Google Classroom sync */}
      {!dataLoading && courseData.length === 0 && (
        <div className="flex flex-col lg:flex-row min-h-screen">

          {/* ── LEFT: 80% — Learning player area ─────────────────────────────── */}
          <div className="flex-1 p-5 md:p-8 space-y-5 min-w-0">

            {/* Page title */}
            <div>
              <h1 className="text-xl font-extrabold text-[#034956]">Mes Cours</h1>
              <p className="text-[#034956]/45 text-sm mt-0.5">Retrouvez ici toutes vos formations et votre progression.</p>
            </div>

            {/* Video player placeholder — 16:9 */}
            <div className="w-full bg-[#034956] rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9', position: 'relative' }}>
              {/* Subtle texture */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#034956] via-[#045666] to-[#023d48]" />
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
                {/* Play button */}
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm">
                  <svg className="w-7 h-7 text-white/60 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white/80 font-semibold text-base md:text-lg mb-2">Aperçu de votre formation</p>
                  <p className="text-white/40 text-xs md:text-sm leading-relaxed max-w-md">
                    Les vidéos, leçons et contenus pédagogiques apparaîtront ici après synchronisation de votre espace d'apprentissage.
                  </p>
                </div>
                {/* Sync badge */}
                <div className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-4 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f26722] animate-pulse" />
                  <span className="text-white/50 text-xs font-medium">Synchronisation pédagogique en attente</span>
                </div>
              </div>
            </div>

            {/* Course info strip — under player */}
            <div className="bg-white rounded-2xl border border-[#034956]/5 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-[#034956] font-extrabold text-base">{formationName}</h2>
                  <p className="text-[#034956]/40 text-xs mt-0.5">Inscrit le {enrollDate}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">● Actif</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[#034956]/40 text-xs">Progression globale</span>
                  <span className="text-[#034956]/35 text-xs">En attente de synchronisation</span>
                </div>
                <div className="bg-[#f0f7f8] rounded-full h-2">
                  <div className="bg-[#034956]/10 h-2 rounded-full w-0" />
                </div>
              </div>
            </div>

            {/* Info card */}
            <div className="bg-[#034956]/3 border border-[#034956]/8 rounded-2xl p-5 flex gap-4">
              <div className="w-7 h-7 bg-[#034956]/8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-[#034956]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-[#034956] text-sm font-semibold mb-0.5">Contenu pédagogique à venir</p>
                <p className="text-[#034956]/50 text-xs leading-relaxed">
                  Votre contenu pédagogique sera automatiquement synchronisé après l'intégration de Google Classroom. Les cours, leçons, exercices et progression apparaîtront ici.
                </p>
              </div>
            </div>

          </div>

          {/* ── RIGHT: 20% — Course structure panel ──────────────────────────── */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-[#034956]/8 bg-white">

            {/* Panel header */}
            <div className="px-5 py-4 border-b border-[#034956]/5">
              <p className="text-[#034956] font-bold text-sm">Structure du cours</p>
              <p className="text-[#034956]/35 text-xs mt-0.5">Modules verrouillés jusqu'à la synchronisation</p>
            </div>

            {/* Modules */}
            <div className="divide-y divide-[#034956]/5">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="px-5 py-4 flex items-center gap-3 opacity-50">
                  <div className="w-8 h-8 bg-[#034956]/6 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#034956]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#034956]/60 text-sm font-medium">Module {num}</p>
                    <p className="text-[#034956]/30 text-xs mt-0.5">Contenu en attente</p>
                  </div>
                  <svg className="w-4 h-4 text-[#034956]/20 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              ))}
            </div>

            {/* Panel footer */}
            <div className="px-5 py-4 border-t border-[#034956]/5 mt-auto">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f26722] animate-pulse" />
                <p className="text-[#034956]/35 text-xs">Synchronisation en attente</p>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  )

  // ── Certificates tab ─────────────────────────────────────────────────────────
  const certificatesTab = (
    <div className="p-5 md:p-8">
      <h1 className="text-2xl font-extrabold text-[#034956] mb-2">Mes Certificats</h1>
      <p className="text-[#034956]/55 text-sm mb-8">Les certificats sont délivrés après validation complète de votre formation.</p>
      {completed.length > 0 ? (
        <div className="space-y-4">
          {completed.map(({ course }) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-[#034956]/5 p-5 flex items-center justify-between">
              <div>
                <p className="text-[#034956] font-bold">{course.title}</p>
                <p className="text-[#034956]/50 text-xs mt-0.5">Cours complété — en attente de validation</p>
              </div>
              <span className="bg-[#e2f1f2] text-[#034956] text-xs font-semibold px-3 py-1.5 rounded-full">En attente</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#034956]/5 p-10 text-center max-w-md">
          <p className="text-[#034956]/40 text-sm">Terminez un cours pour obtenir votre certificat.</p>
        </div>
      )}
    </div>
  )

  // ── Community tab ─────────────────────────────────────────────────────────────
  const communityTab = (
    <div className="p-5 md:p-8">
      <h1 className="text-2xl font-extrabold text-[#034956] mb-2">Communauté</h1>
      <p className="text-[#034956]/55 text-sm mb-8">Rejoignez notre groupe Telegram exclusif.</p>
      <div className="bg-white rounded-2xl shadow-sm border border-[#034956]/5 p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-[#034956] rounded-2xl flex items-center justify-center mx-auto mb-4">
          {/* Telegram icon */}
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </div>
        <h3 className="text-[#034956] font-bold text-lg mb-2">Groupe Telegram Form Academy</h3>
        <p className="text-[#034956]/55 text-sm leading-relaxed mb-6">Partagez vos créations, posez vos questions et obtenez du soutien.</p>
        <a href="#" className="inline-block bg-[#f26722] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-orange-600 transition-colors">
          Rejoindre le groupe →
        </a>
      </div>
    </div>
  )

  const tabContent = { overview: overviewTab, courses: coursesTab, certificates: certificatesTab, community: communityTab }

  return (
    <div className="flex min-h-screen">
      {sidebar}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className={`flex-1 bg-[#f6faf7] overflow-y-auto min-w-0 transition-all duration-200 ${compact ? 'md:ml-16' : 'md:ml-60'}`}>
        {/* Mobile top bar */}
        <div className="md:hidden bg-[#034956] px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <button onClick={() => { setTab('overview'); setSidebarOpen(false) }} className="hover:opacity-80 transition-opacity">
            <img src={logo} alt="Form Academy" className="h-8 w-auto object-contain" />
          </button>
          <div className="w-10" />
        </div>

        {tabContent[tab]}
      </main>
    </div>
  )
}
