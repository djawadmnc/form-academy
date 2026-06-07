// Form Academy — Courses Firestore Service
// Collection: courses/{courseId}

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
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

const COL = 'courses'

/**
 * getCourse — fetch a single course by ID
 */
export async function getCourse(courseId) {
  const snap = await getDoc(doc(db, COL, courseId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/**
 * getAllCourses — all active courses, ordered by title
 */
export async function getAllCourses() {
  const q = query(collection(db, COL), orderBy('title'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * createCourse
 * @param {{ title, description, level, isActive }} data
 */
export async function createCourse(data) {
  const ref = await addDoc(collection(db, COL), {
    title:       data.title.trim(),
    description: data.description?.trim() || '',
    level:       data.level || 'Tous niveaux',
    isActive:    data.isActive ?? true,
    createdAt:   serverTimestamp(),
  })
  return ref.id
}

/**
 * updateCourse — partial update
 */
export async function updateCourse(courseId, data) {
  await updateDoc(doc(db, COL, courseId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * deleteCourse — hard delete (admin only)
 */
export async function deleteCourse(courseId) {
  await deleteDoc(doc(db, COL, courseId))
}
