import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Footer({ onEnroll }) {
  return (
    <footer id="contact" className="bg-[#034956] text-[#e2f1f2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-5">
              <img src={logo} alt="Form Academy" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-[#e2f1f2]/60 text-sm leading-relaxed mb-6 max-w-xs">
              Formation en ligne en couture et broderie. Apprenez à votre rythme, obtenez votre certificat.
            </p>
            <p className="text-[#e2f1f2]/40 text-xs">
              En ligne depuis 2021 · Algérie
            </p>
          </div>

          {/* Links column */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Formations</h4>
            <ul className="space-y-3">
              {[
                'Couture Prêt-à-Porter',
                'Couture Pour Enfant',
                'Patronage',
                'Broderie',
              ].map(link => (
                <li key={link}>
                  <a href="#courses" className="text-[#e2f1f2]/60 hover:text-white text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 text-[#f26722] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <span className="text-[#e2f1f2]/60 text-sm">Contactez-nous pour vous inscrire</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 text-[#f26722] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-[#e2f1f2]/60 text-sm">Paiement via CCP ou BaridiMob</span>
              </li>
            </ul>

            <button
              onClick={onEnroll}
              className="inline-block mt-8 bg-[#f26722] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              S'inscrire maintenant
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#e2f1f2]/40 text-xs">
            © {new Date().getFullYear()} Form Academy. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-[#e2f1f2]/40 text-xs">
              Formation en ligne · Algérie
            </p>
            {/* Connexion — entry point for existing students who reach the footer */}
            <Link
              to="/login"
              className="text-[#e2f1f2]/50 hover:text-white text-xs transition-colors border border-white/20 hover:border-white/50 px-3 py-1.5 rounded-full"
            >
              Connexion
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
