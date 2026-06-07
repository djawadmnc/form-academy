// Form Academy — Progress Firestore Service
// Collection: progress/{progressId}
// One document per student–course pair (same ID scheme as enrollments).
// Tracks which lesson IDs have been completed and the computed percentage.

import { db } from '../firebase'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore'

const COL = 'progress'

// Same deterministic ID as enrollments for easy lookup
function progressId(studentId, courseId) {
  return `${studentId}_${courseId}`
}

/**
 * getProgress — fetch progress document for a student/course pair.
 * Returns null if no progress recorded yet.
 */
export async function getProgress(studentId, courseId) {
  const snap = await getDoc(doc(db, COL, progressId(studentId, courseId)))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/**
 * markLessonComplete
 * Adds lessonId to completedLessons (arrayUnion — idempotent).
 * Recalculates progressPercent based on totalLessons.
 * Creates the document if it doesn't exist yet.
 *
 * @param {string} studentId
 * @param {string} courseId
 * @param {string} lessonId   — the lesson just completed
 * @param {number} totalLessons — total lesson count for this course
 */
export async function markLessonComplete(studentId, courseId, lessonId, totalLessons) {
  const id  = progressId(studentId, courseId)
  const ref = doc(db, COL, id)

  const existing = await getDoc(ref)

  if (!existing.exists()) {
    // First lesson completed — create the document
    await setDoc(ref, {
      studentId,
      courseId,
      completedLessons:  [lessonId],
      progressPercent:   totalLessons > 0 ? Math.round((1 / totalLessons) * 100) : 0,
      isCompleted:       totalLessons === 1,
      completedAt:       totalLessons === 1 ? serverTimestamp() : null,
      updatedAt:         serverTimestamp(),
    })
    return
  }

  // Existing document — add lesson and recalculate
  const data = existing.data()
  const alreadyDone = (data.completedLessons || []).includes(lessonId)
  if (alreadyDone) return // idempotent — don't recalculate

  const newCompleted = [...(data.completedLessons || []), lessonId]
  const newPercent   = totalLessons > 0
    ? Math.round((newCompleted.length / totalLessons) * 100)
    : 0
  const isCompleted  = newCompleted.length >= totalLessons

  await updateDoc(ref, {
    completedLessons: arrayUnion(lessonId),
    progressPercent:  newPercent,
    isCompleted,
    completedAt:      isCompleted ? serverTimestamp() : null,
    updatedAt:        serverTimestamp(),
  })
}

/**
 * isLessonComplete — fast check for a single lesson
 */
export async function isLessonComplete(studentId, courseId, lessonId) {
  const prog = await getProgress(studentId, courseId)
  if (!prog) return false
  return (prog.completedLessons || []).includes(lessonId)
}
