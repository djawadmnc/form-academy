import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Navbar({ onEnroll, onLogin }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[#034956] shadow-md">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-[76px]">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src={logo}
              alt="Form Academy"
              className="h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            <Link to="/" className="text-[#e2f1f2] hover:text-[#f26722] text-sm font-medium transition-colors duration-200">Accueil</Link>
            <a href="#courses" className="text-[#e2f1f2] hover:text-[#f26722] text-sm font-medium transition-colors duration-200">Formations</a>
            <a href="#experience" className="text-[#e2f1f2] hover:text-[#f26722] text-sm font-medium transition-colors duration-200">Expérience</a>
            <a href="#about" className="text-[#e2f1f2] hover:text-[#f26722] text-sm font-medium transition-colors duration-200">À Propos</a>
            {/* Connexion — secondary outline button */}
            <button
              onClick={onLogin}
              className="border border-[#e2f1f2]/50 text-[#e2f1f2] px-5 py-2 rounded-full text-sm font-medium hover:border-[#f26722] hover:text-[#f26722] transition-colors duration-200"
            >
              Connexion
            </button>
            {/* S'inscrire — primary CTA */}
            <button
              onClick={onEnroll}
              className="bg-[#f26722] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#d9561a] transition-colors duration-200 shadow-sm"
            >
              S'inscrire
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2 rounded-md focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-1">
              <Link to="/" onClick={() => setMenuOpen(false)} className="text-[#e2f1f2] text-sm font-medium px-2 py-3 rounded-lg hover:text-[#f26722] hover:bg-white/5 transition-colors duration-200">Accueil</Link>
              <a href="#courses" onClick={() => setMenuOpen(false)} className="text-[#e2f1f2] text-sm font-medium px-2 py-3 rounded-lg hover:text-[#f26722] hover:bg-white/5 transition-colors duration-200">Formations</a>
              <a href="#experience" onClick={() => setMenuOpen(false)} className="text-[#e2f1f2] text-sm font-medium px-2 py-3 rounded-lg hover:text-[#f26722] hover:bg-white/5 transition-colors duration-200">Expérience</a>
              <a href="#about" onClick={() => setMenuOpen(false)} className="text-[#e2f1f2] text-sm font-medium px-2 py-3 rounded-lg hover:text-[#f26722] hover:bg-white/5 transition-colors duration-200">À Propos</a>
              <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-white/10">
                {/* Connexion — secondary outline */}
                <button
                  onClick={() => { setMenuOpen(false); onLogin?.() }}
                  className="border border-[#e2f1f2]/50 text-[#e2f1f2] px-5 py-3 rounded-full text-sm font-medium text-center hover:border-[#f26722] hover:text-[#f26722] transition-colors duration-200"
                >
                  Connexion
                </button>
                {/* S'inscrire — primary CTA */}
                <button
                  onClick={() => { setMenuOpen(false); onEnroll?.() }}
                  className="bg-[#f26722] text-white px-5 py-3 rounded-full text-sm font-semibold text-center hover:bg-[#d9561a] transition-colors duration-200"
                >
                  S'inscrire
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
