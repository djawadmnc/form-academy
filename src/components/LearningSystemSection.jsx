import dashboardMockup from '../../images/3.png'

const steps = [
  {
    number: '01',
    title: 'Choisissez votre formation',
    description: 'Sélectionnez la formation qui correspond à vos objectifs et inscrivez-vous en quelques minutes.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Accédez à votre espace étudiant',
    description: 'Recevez votre accès et commencez votre apprentissage depuis votre tableau de bord personnel.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Réalisez vos exercices et projets',
    description: 'Complétez les exercices demandés et soumettez vos travaux pour validation.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Obtenez votre certificat',
    description: 'Après validation de vos travaux, recevez votre certificat Form Academy et valorisez vos nouvelles compétences.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
]

export default function LearningSystemSection() {
  return (
    <section className="bg-white py-12 md:py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header — compact */}
        <div className="text-center mb-10">
          <p className="text-[#f26722] text-xs uppercase tracking-widest font-semibold mb-2">Votre parcours d'apprentissage</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#034956] mb-3">
            Plus qu'une simple formation en ligne
          </h2>
          <p className="text-[#034956]/60 text-sm max-w-xl mx-auto leading-relaxed">
            Form Academy vous accompagne à chaque étape — apprendre, pratiquer, progresser et obtenir votre certification.
          </p>
        </div>

        {/* Two-column layout — 45 / 55 */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* Left — Steps (45%) */}
          <div className="w-full lg:w-[45%] flex flex-col">
            {steps.map((step, i) => (
              <div key={step.number} className="flex gap-4">
                {/* Step indicator */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#034956] flex items-center justify-center text-white flex-shrink-0">
                    {step.icon}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="w-px flex-1 my-1 min-h-[20px]"
                      style={{ background: 'linear-gradient(to bottom, rgba(3,73,86,0.2), rgba(3,73,86,0.04))' }}
                    />
                  )}
                </div>

                {/* Text */}
                <div className={`pb-5 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
                  <span className="text-[#f26722] text-[10px] font-bold tracking-widest block mb-0.5">{step.number}</span>
                  <h3 className="text-[#034956] font-bold text-base mb-1">{step.title}</h3>
                  <p className="text-[#034956]/55 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right — Image showcase (55%) */}
          <div className="w-full lg:w-[55%] relative">

            {/* Ambient glow */}
            <div
              className="absolute -inset-4 rounded-3xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(3,73,86,0.07) 0%, transparent 70%)' }}
            />

            {/* Main image card — no overflow:hidden, no fixed height */}
            <div
              className="relative w-full rounded-2xl"
              style={{
                boxShadow: '0 20px 60px rgba(3,73,86,0.20), 0 4px 16px rgba(3,73,86,0.08)',
              }}
            >
              <img
                src={dashboardMockup}
                alt="Étudiante sur la plateforme Form Academy"
                className="w-full h-auto block rounded-2xl"
                style={{ display: 'block', maxWidth: '100%' }}
              />
            </div>

            {/* Floating badge — Travail validé */}
            <div
              className="absolute -left-3 bottom-8 flex items-center gap-2 px-3.5 py-2 rounded-full shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(3,73,86,0.08)',
                boxShadow: '0 8px 20px rgba(3,73,86,0.14)',
              }}
            >
              <div className="w-6 h-6 rounded-full bg-[#034956] flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-[#034956] text-xs font-bold leading-none mb-0.5">Travail validé</p>
                <p className="text-[#034956]/45 text-[10px] leading-none">Par votre formateur</p>
              </div>
            </div>

            {/* Floating badge — Progression */}
            <div
              className="absolute -right-3 top-8 flex items-center gap-2 px-3.5 py-2 rounded-full shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(3,73,86,0.08)',
                boxShadow: '0 8px 20px rgba(3,73,86,0.14)',
              }}
            >
              <div className="w-6 h-6 rounded-full bg-[#f26722] flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-[#034956] text-xs font-bold leading-none mb-0.5">85% complété</p>
                <p className="text-[#034956]/45 text-[10px] leading-none">Couture Prêt-à-Porter</p>
              </div>
            </div>

            {/* Floating badge — Certificat */}
            <div
              className="absolute right-4 -bottom-3 flex items-center gap-2 px-3.5 py-2 rounded-xl shadow-lg"
              style={{
                background: 'rgba(3,73,86,0.97)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 8px 20px rgba(3,73,86,0.28)',
              }}
            >
              <svg className="w-3.5 h-3.5 text-[#f26722] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p className="text-white text-xs font-semibold">Certificat délivré</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
