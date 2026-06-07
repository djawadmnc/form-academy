// Form Academy — Lesson Page
// Route: /course/:courseId/lesson/:lessonId
// Protected — student must be enrolled in the course.
//
// Shows:
//   - Google Drive video embedded via /preview URL (no Google branding)
//   - Lesson title
//   - Previous / Next lesson navigation
//   - Mark as complete button
//   - Progress updates instantly in the sidebar/header

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getLesson, getLessonsForCourse, convertDriveUrl } from '../db/lessons'
import { getCourse } from '../db/courses'
import { getEnrollment } from '../db/enrollments'
import { markLessonComplete, isLessonComplete } from '../db/progress'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#034956] flex items-center justify-center">
      <svg className="w-8 h-8 animate-spin text-[#f26722]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams()
  const navigate               = useNavigate()
  const { currentUser }        = useAuth()

  const [course, setCourse]     = useState(null)
  const [lesson, setLesson]     = useState(null)
  const [lessons, setLessons]   = useState([])   // all published lessons for nav
  const [done, setDone]         = useState(false) // is this lesson complete?
  const [marking, setMarking]   = useState(false) // marking in progress
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [notEnrolled, setNotEnrolled] = useState(false)

  useEffect(() => {
    if (!currentUser || !courseId || !lessonId) return

    async function load() {
      try {
        // Verify enrollment
        const enrollment = await getEnrollment(currentUser.uid, courseId)
        if (!enrollment) {
          setNotEnrolled(true)
          setLoading(false)
          return
        }

        const [courseData, lessonData, allLessons, completed] = await Promise.all([
          getCourse(courseId),
          getLesson(lessonId),
          getLessonsForCourse(courseId),
          isLessonComplete(currentUser.uid, courseId, lessonId),
        ])

        if (!lessonData || !courseData) {
          setError('Leçon introuvable.')
          setLoading(false)
          return
        }

        setCourse(courseData)
        setLesson(lessonData)
        setLessons(allLessons.filter(l => l.isPublished !== false))
        setDone(completed)
      } catch (err) {
        console.error('LessonPage load error:', err)
        setError('Erreur lors du chargement.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [currentUser, courseId, lessonId])

  const handleMarkComplete = useCallback(async () => {
    if (done || marking || !currentUser) return
    setMarking(true)
    try {
      await markLessonComplete(currentUser.uid, courseId, lessonId, lessons.length)
      setDone(true)
    } catch (err) {
      console.error('markLessonComplete error:', err)
      alert('Erreur lors de l\'enregistrement. Réessayez.')
    } finally {
      setMarking(false)
    }
  }, [done, marking, currentUser, courseId, lessonId, lessons.length])

  if (loading) return <LoadingScreen />

  if (notEnrolled || error) {
    return (
      <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#034956] font-bold mb-2">{notEnrolled ? 'Accès non autorisé' : 'Erreur'}</p>
          <p className="text-[#034956]/55 text-sm mb-6">{notEnrolled ? 'Vous n\'êtes pas inscrit(e) à ce cours.' : error}</p>
          <button onClick={() => navigate('/dashboard')} className="bg-[#034956] text-white px-6 py-3 rounded-full text-sm font-semibold">Retour au tableau de bord</button>
        </div>
      </div>
    )
  }

  // Lesson navigation
  const currentIndex = lessons.findIndex(l => l.id === lessonId)
  const prevLesson   = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson   = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null

  const embedUrl = convertDriveUrl(lesson.videoUrl)

  return (
    <div className="min-h-screen bg-[#034956] flex flex-col">

      {/* Top bar */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10 flex-shrink-0">
        <button
          onClick={() => navigate(`/course/${courseId}`)}
          className="text-[#e2f1f2]/70 hover:text-white transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[#e2f1f2]/50 text-xs truncate">{course?.title}</p>
          <p className="text-white text-sm font-semibold truncate">{lesson.title}</p>
        </div>
        <div className="text-[#e2f1f2]/40 text-xs flex-shrink-0">
          {currentIndex + 1} / {lessons.length}
        </div>
      </div>

      {/* Video player */}
      <div className="flex-1 flex flex-col">
        <div className="relative bg-black" style={{ paddingTop: '56.25%' /* 16:9 */ }}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay"
              allowFullScreen
              title={lesson.title}
              // Prevent Google Drive from showing branding via sandbox restrictions
              // Note: allow-same-origin is required for the embed to work
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-white/40 text-sm">Vidéo non disponible</p>
                <p className="text-white/25 text-xs mt-1">URL manquante pour cette leçon</p>
              </div>
            </div>
          )}
        </div>

        {/* Lesson detail panel */}
        <div className="bg-[#f6faf7] flex-1">
          <div className="max-w-3xl mx-auto px-4 py-6">

            {/* Lesson header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-[#034956] font-extrabold text-xl">{lesson.title}</h1>
                {lesson.duration && (
                  <p className="text-[#034956]/50 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {lesson.duration}
                  </p>
                )}
              </div>

              {/* Mark complete button */}
              {done ? (
                <div className="flex items-center gap-2 bg-[#f26722]/10 text-[#f26722] px-4 py-2 rounded-full flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                  <span className="text-sm font-semibold">Terminée</span>
                </div>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  disabled={marking}
                  className="bg-[#f26722] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center gap-2 flex-shrink-0"
                >
                  {marking ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                      </svg>
                      Marquer comme terminée
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Previous / Next navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => prevLesson && navigate(`/course/${courseId}/lesson/${prevLesson.id}`)}
                disabled={!prevLesson}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-[#034956]/15 text-[#034956] py-3 rounded-xl text-sm font-medium hover:border-[#034956]/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                Précédente
              </button>

              <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="px-4 py-3 rounded-xl text-sm text-[#034956]/50 hover:text-[#034956] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
              </button>

              <button
                onClick={() => nextLesson && navigate(`/course/${courseId}/lesson/${nextLesson.id}`)}
                disabled={!nextLesson}
                className="flex-1 flex items-center justify-center gap-2 bg-[#034956] text-white py-3 rounded-xl text-sm font-medium hover:bg-teal-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Suivante
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
