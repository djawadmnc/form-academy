// Form Academy — Course Detail Page
// Route: /course/:courseId
// Protected — student must be enrolled in this course.
//
// Shows:
//   - Course title + description
//   - Lesson list ordered by lesson.order
//   - Progress bar
//   - Each lesson row: title, duration, complete indicator, navigate to lesson

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCourse } from '../db/courses'
import { getLessonsForCourse } from '../db/lessons'
import { getEnrollment } from '../db/enrollments'
import { getProgress } from '../db/progress'

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-[#034956]/60 hover:text-[#034956] text-sm mb-6 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
      </svg>
      Retour au tableau de bord
    </button>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center">
      <svg className="w-8 h-8 animate-spin text-[#f26722]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )
}

export default function CoursePage() {
  const { courseId }      = useParams()
  const navigate          = useNavigate()
  const { currentUser }   = useAuth()

  const [course, setCourse]     = useState(null)
  const [lessons, setLessons]   = useState([])
  const [progress, setProgress] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [notEnrolled, setNotEnrolled] = useState(false)

  useEffect(() => {
    if (!currentUser || !courseId) return

    async function load() {
      try {
        // Verify enrollment
        const enrollment = await getEnrollment(currentUser.uid, courseId)
        if (!enrollment) {
          setNotEnrolled(true)
          setLoading(false)
          return
        }

        const [courseData, lessonData, progressData] = await Promise.all([
          getCourse(courseId),
          getLessonsForCourse(courseId),
          getProgress(currentUser.uid, courseId),
        ])

        if (!courseData) {
          setError('Ce cours est introuvable.')
          setLoading(false)
          return
        }

        setCourse(courseData)
        setLessons(lessonData)
        setProgress(progressData)
      } catch (err) {
        console.error('CoursePage load error:', err)
        setError('Erreur lors du chargement. Réessayez.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [currentUser, courseId])

  if (loading) return <LoadingScreen />

  if (notEnrolled) {
    return (
      <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-[#034956]/5 p-10 text-center max-w-sm">
          <p className="text-[#034956] font-bold mb-2">Accès non autorisé</p>
          <p className="text-[#034956]/55 text-sm mb-6">Vous n'êtes pas inscrit(e) à ce cours.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-[#034956] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-teal-900 transition-colors">
            Retour au tableau de bord
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="text-[#034956] text-sm underline">Retour au tableau de bord</button>
        </div>
      </div>
    )
  }

  const completedIds   = progress?.completedLessons || []
  const progressPct    = progress?.progressPercent  || 0
  const publishedLessons = lessons.filter(l => l.isPublished !== false)

  return (
    <div className="min-h-screen bg-[#f6faf7]">
      {/* Top bar */}
      <div className="bg-[#034956] px-4 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-[#e2f1f2]/70 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </button>
        <span className="text-white font-bold text-sm truncate">{course.title}</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Course header */}
        <div className="bg-[#034956] rounded-2xl p-6 sm:p-8 mb-6 text-white">
          <p className="text-[#f26722] text-xs font-semibold uppercase tracking-wider mb-2">{course.level}</p>
          <h1 className="text-2xl font-extrabold mb-3">{course.title}</h1>
          {course.description && (
            <p className="text-[#e2f1f2]/70 text-sm leading-relaxed mb-5">{course.description}</p>
          )}
          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-[#e2f1f2]/60 mb-2">
              <span>Progression</span>
              <span className="font-bold text-[#f26722]">{progressPct}%</span>
            </div>
            <div className="bg-white/20 rounded-full h-2">
              <div
                className="bg-[#f26722] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
            <p className="text-[#e2f1f2]/50 text-xs mt-2">
              {completedIds.length} / {publishedLessons.length} leçons terminées
            </p>
          </div>
        </div>

        {/* Lesson list */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#034956]/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f6faf7]">
            <h2 className="text-[#034956] font-bold">Leçons</h2>
          </div>

          {publishedLessons.length === 0 && (
            <div className="px-6 py-10 text-center">
              <p className="text-[#034956]/40 text-sm">Aucune leçon disponible pour le moment.</p>
            </div>
          )}

          <div className="divide-y divide-[#f6faf7]">
            {publishedLessons.map((lesson, index) => {
              const done = completedIds.includes(lesson.id)
              const isNext = !done && completedIds.length === index // first incomplete

              return (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/course/${courseId}/lesson/${lesson.id}`)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#f6faf7] transition-colors text-left group"
                >
                  {/* Status indicator */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    done
                      ? 'bg-[#f26722]'
                      : isNext
                        ? 'bg-[#034956]'
                        : 'bg-[#e2f1f2]'
                  }`}>
                    {done ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                      </svg>
                    ) : isNext ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                      </svg>
                    ) : (
                      <span className="text-[#034956]/40 text-xs font-bold">{lesson.order}</span>
                    )}
                  </div>

                  {/* Lesson info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${done ? 'text-[#034956]/50 line-through' : 'text-[#034956]'}`}>
                      {lesson.title}
                    </p>
                    {lesson.duration && (
                      <p className="text-[#034956]/40 text-xs mt-0.5">{lesson.duration}</p>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg className="w-4 h-4 text-[#034956]/30 group-hover:text-[#f26722] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              )
            })}
          </div>
        </div>

        {/* Completion banner */}
        {progress?.isCompleted && (
          <div className="mt-5 bg-[#f26722]/10 border border-[#f26722]/20 rounded-2xl px-6 py-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#f26722] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <p className="text-[#034956] font-bold text-sm">Cours terminé !</p>
              <p className="text-[#034956]/60 text-xs mt-0.5">Vous avez complété toutes les leçons. Votre certificat sera disponible après validation.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
