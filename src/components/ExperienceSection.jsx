const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Leçons vidéo HD',
    description: 'Accédez à des cours vidéo professionnels, disponibles à tout moment. Revoyez chaque leçon autant de fois que nécessaire.',
    color: 'text-[#f26722]',
    bg: 'bg-[#f26722]/10',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
    title: 'Communauté Telegram',
    description: 'Rejoignez notre groupe exclusif. Échangez avec d\'autres étudiantes, partagez vos créations et obtenez du soutien.',
    color: 'text-[#034956]',
    bg: 'bg-[#034956]/10',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'Évaluation & Suivi',
    description: 'Soumettez vos travaux et recevez un retour personnalisé. Votre progression est suivie et validée à chaque étape.',
    color: 'text-[#f26722]',
    bg: 'bg-[#f26722]/10',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Certificat officiel',
    description: 'Obtenez votre certificat Form Academy à la fin de votre formation. Une reconnaissance concrète de vos compétences.',
    color: 'text-[#034956]',
    bg: 'bg-[#034956]/10',
  },
]

function Divider() {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className="w-16 h-px bg-[#034956]/12" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#f26722]" />
      <div className="w-16 h-px bg-[#034956]/12" />
    </div>
  )
}

export default function ExperienceSection() {
  return (
    <>
      {/* Top divider */}
      <div className="bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <Divider />
        </div>
      </div>

      <section id="experience" className="bg-white py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-[#f26722] text-xs uppercase tracking-widest font-semibold mb-3">Comment ça marche</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#034956] mb-4">L'expérience Form Academy</h2>
            <p className="text-[#034956]/60 text-base max-w-xl mx-auto leading-relaxed">
              Une expérience d'apprentissage complète, pensée pour vous accompagner du premier cours jusqu'au certificat.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative flex gap-5 bg-white border border-[#034956]/8 rounded-2xl p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-250"
              >
                {/* Orange left accent on hover */}
                <div className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full bg-[#f26722] opacity-0 group-hover:opacity-100 transition-opacity duration-250" />

                {/* Icon container */}
                <div className={`${f.bg} ${f.color} w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#f26722]/15 transition-colors duration-250 [&_svg]:w-9 [&_svg]:h-9`}>
                  {f.icon}
                </div>

                {/* Text */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-[#034956] font-extrabold text-lg mb-1.5 group-hover:text-[#f26722] transition-colors duration-250">{f.title}</h3>
                  <p className="text-[#034956]/55 text-sm leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Bottom divider */}
      <div className="bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <Divider />
        </div>
      </div>
    </>
  )
}
