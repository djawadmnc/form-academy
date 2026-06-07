import ctaBg from '../assets/cta-bg.png'

export default function CTASection({ onEnroll }) {
  return (
    <section id="enrollment" className="bg-[#f6faf7] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#034956] rounded-3xl overflow-hidden relative">
          {/* Subtle background image — 15% visible through teal overlay */}
          <img
            src={ctaBg}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ opacity: 0.68 }}
          />
          {/* Teal overlay — keeps branding dominant while image remains visible */}
          <div className="absolute inset-0 bg-[#034956]/52 rounded-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-stretch">

            {/* Left — CTA text */}
            <div className="flex-1 p-10 md:p-14 flex flex-col justify-center">
              <p className="text-[#f26722] text-xs uppercase tracking-widest font-semibold mb-4">Commencez dès aujourd'hui</p>
              <h2 className="text-white text-3xl sm:text-4xl font-extrabold leading-tight mb-5">
                Prête à créer avec<br />
                <span className="text-[#f26722]">confiance</span> ?
              </h2>
              <p className="text-[#e2f1f2]/70 text-base leading-relaxed mb-8 max-w-md">
                Rejoignez plus de 600 étudiantes qui ont déjà transformé leur passion en compétence avec Form Academy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onEnroll}
                  className="bg-[#f26722] text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-orange-600 transition-colors text-center shadow-lg"
                >
                  S'inscrire maintenant
                </button>
                <a
                  href="#courses"
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold text-base hover:border-white hover:bg-white/10 transition-colors text-center"
                >
                  Voir les cours
                </a>
              </div>
            </div>

            {/* Right — Payment info card */}
            <div className="md:w-80 bg-white/5 border-t md:border-t-0 md:border-l border-white/10 p-10 md:p-12 flex flex-col justify-center gap-6">
              <h3 className="text-white font-bold text-lg">Modes de paiement acceptés</h3>
              <div className="space-y-3">
                {['CCP', 'BaridiMob'].map(method => (
                  <div key={method} className="flex items-center gap-3 bg-white/10 rounded-xl px-5 py-4">
                    <div className="w-2 h-2 bg-[#f26722] rounded-full flex-shrink-0"></div>
                    <span className="text-white font-semibold">{method}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-5">
                <p className="text-[#e2f1f2]/60 text-xs leading-relaxed">
                  Après votre inscription, notre équipe vous contacte sous 24h pour confirmer votre paiement et activer votre accès.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

