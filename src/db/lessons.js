// Form Academy — Lessons Firestore Service
// Collection: lessons/{lessonId}
// Lessons belong to a course via courseId.
// Ordered by the `order` field (integer, 1-based).

import { db } from '../firebase'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

const COL = 'lessons'

/**
 * getLesson — fetch a single lesson by ID
 */
export async function getLesson(lessonId) {
  const snap = await getDoc(doc(db, COL, lessonId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/**
 * getLessonsForCourse — all lessons belonging to courseId, ordered by `order`
 */
export async function getLessonsForCourse(courseId) {
  const q = query(
    collection(db, COL),
    where('courseId', '==', courseId),
    orderBy('order')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * createLesson
 * @param {{
 *   courseId: string,
 *   title: string,
 *   order: number,        — display order within course (1, 2, 3…)
 *   videoUrl: string,     — Google Drive share link
 *   duration: string,     — optional, e.g. '12:30'
 *   isPublished: boolean
 * }} data
 */
export async function createLesson(data) {
  const ref = await addDoc(collection(db, COL), {
    courseId:    data.courseId,
    title:       data.title.trim(),
    order:       data.order,
    videoUrl:    data.videoUrl?.trim() || '',
    duration:    data.duration?.trim() || '',
    isPublished: data.isPublished ?? true,
    createdAt:   serverTimestamp(),
  })
  return ref.id
}

/**
 * updateLesson — partial update
 */
export async function updateLesson(lessonId, data) {
  await updateDoc(doc(db, COL, lessonId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * deleteLesson — hard delete (admin only)
 */
export async function deleteLesson(lessonId) {
  await deleteDoc(doc(db, COL, lessonId))
}

/**
 * convertDriveUrl
 * Converts a Google Drive share URL into an embeddable iframe src.
 *
 * Input:  https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * Output: https://drive.google.com/file/d/FILE_ID/preview
 *
 * The /preview URL works in iframes and hides Google Drive chrome.
 */
export function convertDriveUrl(url) {
  if (!url) return ''
  // Already a preview URL — return as-is
  if (url.includes('/preview')) return url
  // Extract file ID from standard share URL
  const match = url.match(/\/file\/d\/([^/]+)/)
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
  // Fallback — return original
  return url
}
