import heroBg from '../assets/hero-bg.png'

export default function Hero({ onEnroll }) {
  return (
    <section className="relative overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center">

      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover object-center md:object-[60%_center]"
        />
        {/* Subtle dark overlay — left side heavier for text readability, fades right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#034956]/80 via-[#034956]/50 to-[#034956]/10" />
        {/* Bottom fade for clean section transition */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f6faf7]/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 w-full">
        <div className="max-w-xl">

          {/* Badge */}
          <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase border border-white/20">
            Formation en ligne · Algérie
          </span>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-sm">
            Apprenez.
            <br />
            <span className="text-[#f26722]">Créez.</span>
            <br />
            Évoluez.
          </h1>

          {/* Subheadline */}
          <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
            Une plateforme de formation pensée pour vous accompagner dans l'acquisition de nouvelles compétences, à votre rythme.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onEnroll}
              className="bg-[#f26722] text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-[#d9561a] transition-colors shadow-lg text-center"
            >
              S'inscrire maintenant
            </button>
            <a
              href="#experience"
              className="border-2 border-white/60 text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-white/10 hover:border-white transition-colors text-center backdrop-blur-sm"
            >
              Comment ça marche
            </a>
          </div>

          {/* Trust badge */}
          <div className="mt-10" style={{ animation: 'fadeIn 1s ease 0.3s both' }}>
            <div
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm text-white font-medium"
              style={{
                background: 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.20)',
              }}
            >
              <svg className="w-4 h-4 text-[#f26722] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><span className="font-bold">600+</span> étudiantes nous font confiance</span>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

        </div>
      </div>
    </section>
  )
}
