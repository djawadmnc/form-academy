// Form Academy — Admin Layout V4
// Sidebar matches student dashboard exactly: hover-expand, icon pills when collapsed.

import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUser } from '../../db/users'
import logo     from '../../assets/logo.png'
import logoIcon from '../../../images/logo icon.jpg'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconDashboard({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}
function IconUsers({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconGraduate({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  )
}
function IconBook({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}
function IconBadge({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  )
}
function IconSettings({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconLogout({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}
function IconMenu({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Tableau de bord', path: '/admin',          Icon: IconDashboard },
  { label: 'Leads',           path: '/admin/leads',    Icon: IconUsers     },
  { label: 'Étudiants',       path: '/admin/students', Icon: IconGraduate  },
  { label: 'Cours',           path: '/admin/courses',  Icon: IconBook      },
]
const NAV_FUTURE = [
  { label: 'Certificats', Icon: IconBadge    },
  { label: 'Paramètres',  Icon: IconSettings },
]

// ── Nav item — same pattern as student dashboard ───────────────────────────────
function NavItem({ icon, label, active, to, onClick, expanded }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      title={!expanded ? label : undefined}
      className={`w-full flex items-center rounded-xl transition-all duration-200 ${
        expanded ? 'gap-3 px-4 py-3' : 'justify-center px-2 py-3'
      } ${active
        ? 'bg-white/10 text-white'
        : 'text-[#e2f1f2]/60 hover:bg-white/5 hover:text-white'
      }`}
    >
      {/* Icon — white pill when collapsed, bare when expanded */}
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
      {expanded && (
        <>
          <span className="flex-1 text-sm font-medium whitespace-nowrap overflow-hidden">{label}</span>
          {active && <span className="w-1.5 h-1.5 rounded-full bg-[#f26722] flex-shrink-0" />}
        </>
      )}
    </Link>
  )
}

// ── Future nav item (disabled) ────────────────────────────────────────────────
function NavFutureItem({ icon, label, expanded }) {
  return (
    <div
      title={!expanded ? label : undefined}
      className={`w-full flex items-center rounded-xl cursor-not-allowed select-none transition-all duration-200 ${
        expanded ? 'gap-3 px-4 py-3' : 'justify-center px-2 py-3'
      } text-[#e2f1f2]/20`}
    >
      {!expanded
        ? (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5">
            {icon}
          </div>
        )
        : icon
      }
      {expanded && (
        <>
          <span className="flex-1 text-sm font-medium whitespace-nowrap overflow-hidden">{label}</span>
          <span className="text-[9px] font-bold bg-white/8 text-[#e2f1f2]/30 px-2 py-0.5 rounded-full tracking-wider flex-shrink-0">
            Bientôt
          </span>
        </>
      )}
    </div>
  )
}

// ── Profile dropdown — matches student dashboard ───────────────────────────────
function ProfileDropdown({ profile, profileLoading, initials, onLogout, expanded }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div
      ref={ref}
      className={`relative border-t border-white/10 ${expanded ? 'px-3 pb-4 pt-3' : 'px-2 pb-3 pt-2'}`}
    >
      {/* Dropdown — opens upward */}
      <div className={`absolute bottom-full mb-2 bg-[#02363f] border border-white/10 rounded-2xl shadow-xl overflow-hidden
        transition-all duration-200 origin-bottom z-50
        ${expanded ? 'left-3 right-3' : 'left-1 right-1'}
        ${open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-0 pointer-events-none'}
      `}>
        {/* Disabled: Profil */}
        <div className="flex items-center gap-3 px-4 py-3 text-sm text-[#e2f1f2]/25 cursor-not-allowed select-none border-b border-white/8">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Profil</span>
          <span className="ml-auto text-[9px] font-bold bg-white/8 text-[#e2f1f2]/25 px-2 py-0.5 rounded-full tracking-wider">Bientôt</span>
        </div>
        {/* Logout */}
        <button
          onClick={() => { setOpen(false); onLogout() }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#e2f1f2]/60 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150"
        >
          <IconLogout className="w-4 h-4 flex-shrink-0" />
          <span className="whitespace-nowrap">Déconnexion</span>
        </button>
      </div>

      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        title={!expanded ? (profile ? `${profile.firstName} ${profile.lastName}` : 'Administrateur') : undefined}
        className={`w-full flex items-center rounded-xl hover:bg-white/5 transition-colors ${
          expanded ? 'gap-3 px-2 py-2' : 'justify-center p-1.5'
        }`}
      >
        {profileLoading ? (
          <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#f26722]/15 border border-[#f26722]/25 flex items-center justify-center flex-shrink-0">
            <span className="text-[#f26722] text-xs font-bold">{initials}</span>
          </div>
        )}
        {expanded && !profileLoading && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white text-sm font-semibold truncate leading-snug">
                {profile ? `${profile.firstName} ${profile.lastName}` : 'Administrateur'}
              </p>
              <p className="text-[#e2f1f2]/35 text-xs leading-snug">Administrateur</p>
            </div>
            <svg
              className={`w-3.5 h-3.5 text-white/25 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
        {expanded && profileLoading && (
          <div className="flex-1 space-y-1.5 text-left">
            <div className="h-3 bg-white/10 rounded animate-pulse w-20" />
            <div className="h-2 bg-white/8 rounded animate-pulse w-14" />
          </div>
        )}
      </button>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function AdminLayout({ children }) {
  const { currentUser: user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile]         = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [hovered, setHovered]         = useState(false)

  // Desktop sidebar is always visible and always "compact" (hover-expand pattern)
  // — same as student dashboard on non-overview tabs
  const expanded = hovered || mobileOpen

  useEffect(() => {
    if (!user?.uid) { setProfileLoading(false); return }
    getUser(user.uid)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false))
  }, [user])

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  function isActive(path) {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  const initials = profile
    ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase()
    : 'A'

  return (
    <div className="min-h-screen bg-[#f6faf7] flex">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — matches student sidebar exactly */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`
          bg-[#034956] flex flex-col fixed top-0 left-0 h-screen z-40
          transition-all duration-250 overflow-hidden
          ${expanded ? 'w-60' : 'w-16'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`border-b border-white/10 flex items-center flex-shrink-0 overflow-hidden ${
          expanded ? 'px-5 py-4' : 'justify-center px-2 py-4'
        }`}>
          <button
            onClick={() => { navigate('/admin'); setMobileOpen(false); setHovered(false) }}
            className="hover:opacity-80 transition-opacity flex-shrink-0"
            title="Tableau de bord"
          >
            {expanded
              ? <img src={logo} alt="Form Academy" className="h-9 w-auto object-contain" />
              : <img src={logoIcon} alt="Form Academy" className="w-8 h-8 rounded-lg object-contain" />
            }
          </button>
          {expanded && (
            <span className="ml-3 text-[#e2f1f2]/40 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">Admin</span>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 space-y-1 overflow-hidden ${expanded ? 'px-3' : 'px-2'}`}>
          {NAV_ITEMS.map(({ label, path, Icon }) => (
            <NavItem
              key={path}
              to={path}
              label={label}
              icon={<Icon className="w-5 h-5 flex-shrink-0" />}
              active={isActive(path)}
              expanded={expanded}
              onClick={() => setMobileOpen(false)}
            />
          ))}

          {/* Future section */}
          {expanded && (
            <div className="pt-5 pb-2 px-3">
              <span className="text-[#e2f1f2]/20 text-[9px] font-bold tracking-widest uppercase">À venir</span>
            </div>
          )}
          {!expanded && <div className="pt-3" />}
          {NAV_FUTURE.map(({ label, Icon }) => (
            <NavFutureItem
              key={label}
              label={label}
              icon={<Icon className="w-5 h-5 flex-shrink-0" />}
              expanded={expanded}
            />
          ))}
        </nav>

        {/* Profile */}
        <ProfileDropdown
          profile={profile}
          profileLoading={profileLoading}
          initials={initials}
          onLogout={handleLogout}
          expanded={expanded}
        />
      </aside>

      {/* Main content — offset fixed to collapsed width (w-16) on desktop, no layout jump on hover */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-16">

        {/* Mobile top bar */}
        <div className="lg:hidden bg-[#034956] px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Ouvrir le menu"
          >
            <IconMenu className="w-6 h-6" />
          </button>
          <img src={logo} alt="Form Academy" className="h-7 w-auto object-contain" />
        </div>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
