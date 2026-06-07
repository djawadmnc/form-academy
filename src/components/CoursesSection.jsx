const courses = [
  {
    title: 'Couture Prêt-à-Porter',
    description: 'Maîtrisez la création de vêtements modernes et tendance pour adultes. Du patron à la finition professionnelle.',
    modules: 8,
    level: 'Tous niveaux',
    tag: '⭐ Populaire',
    tagStyle: 'bg-[#f26722] text-white',
  },
  {
    title: 'Couture Pour Enfant',
    description: 'Créez des vêtements adorables et pratiques pour les enfants. Techniques adaptées aux petites tailles.',
    modules: 6,
    level: 'Débutant',
    tag: 'Nouveau',
    tagStyle: 'bg-[#e2f1f2] text-[#034956]',
  },
  {
    title: 'Patronage',
    description: 'Apprenez à créer et modifier vos propres patrons. La base indispensable pour toute couturière autonome.',
    modules: 5,
    level: 'Intermédiaire',
    tag: 'Disponible',
    tagStyle: 'bg-[#e2f1f2] text-[#034956]',
  },
  {
    title: 'Broderie',
    description: 'Découvrez l\'art de la broderie traditionnelle et moderne. Techniques de base aux motifs avancés.',
    modules: 7,
    level: 'Tous niveaux',
    tag: 'Bientôt disponible',
    tagStyle: 'bg-white border border-[#034956]/20 text-[#034956]/60',
    comingSoon: true,
  },
]

function CourseCard({ course, onEnroll }) {
  if (course.comingSoon) {
    return (
      <div
        className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
        style={{
          background: 'linear-gradient(135deg, rgba(3,73,86,0.92) 0%, rgba(3,73,86,0.78) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px rgba(3,73,86,0.25), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        {/* Card header */}
        <div
          className="p-6 flex flex-col gap-3 min-h-[120px] justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-bold text-lg leading-snug">{course.title}</h3>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0"
              style={{
                background: 'rgba(242,103,34,0.20)',
                border: '1px solid rgba(242,103,34,0.40)',
                color: '#f9a87c',
              }}
            >
              {course.tag}
            </span>
          </div>
          {course.modules && (
            <p className="text-white/70 text-sm">{course.modules} modules</p>
          )}
        </div>

        {/* Card body */}
        <div className="p-5 flex flex-col flex-1 gap-4">
          <p className="text-white/75 text-sm leading-relaxed flex-1">{course.description}</p>
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.80)',
              }}
            >
              {course.level}
            </span>
            <span
              className="text-xs font-semibold px-4 py-2 rounded-full"
              style={{
                background: 'rgba(242,103,34,0.15)',
                border: '1px solid rgba(242,103,34,0.30)',
                color: '#f9a87c',
              }}
            >
              Bientôt disponible
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#034956]/8 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Card header */}
      <div className="bg-[#034956] p-6 flex flex-col gap-3 min-h-[120px] justify-between">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-bold text-lg leading-snug">{course.title}</h3>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${course.tagStyle}`}>
            {course.tag}
          </span>
        </div>
        {course.modules && (
          <p className="text-[#e2f1f2]/70 text-sm">{course.modules} modules</p>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        <p className="text-[#034956]/70 text-sm leading-relaxed flex-1">{course.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#034956]/50 font-medium bg-[#f6faf7] px-3 py-1.5 rounded-full">
            {course.level}
          </span>
          <button
            onClick={onEnroll}
            className="bg-[#f26722] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            S'inscrire
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CoursesSection({ onEnroll }) {
  return (
    <section id="courses" className="bg-[#f6faf7] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#f26722] text-xs uppercase tracking-widest font-semibold mb-3">Nos formations</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#034956] mb-4">Cours populaires</h2>
          <p className="text-[#034956]/60 text-base max-w-xl mx-auto leading-relaxed">
            Des formations pratiques et complètes pour vous permettre de créer avec confiance et professionnalisme.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {courses.map((course) => (
            <CourseCard key={course.title} course={course} onEnroll={onEnroll} />
          ))}
        </div>

      </div>
    </section>
  )
}
