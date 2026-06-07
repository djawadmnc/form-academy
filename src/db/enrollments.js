// Form Academy — Enrollments Firestore Service
// Collection: enrollments/{enrollmentId}
// One document per student–course pair.
// Document ID convention: {studentId}_{courseId} — deterministic, prevents duplicates.

import { db } from '../firebase'
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'

const COL = 'enrollments'

// Deterministic ID: prevents the same student from being enrolled twice
function enrollmentId(studentId, courseId) {
  return `${studentId}_${courseId}`
}

/**
 * enrollStudent — create enrollment if it doesn't exist (idempotent)
 * @param {string} studentId — users/{uid}
 * @param {string} courseId  — courses/{courseId}
 */
export async function enrollStudent(studentId, courseId) {
  const id  = enrollmentId(studentId, courseId)
  const ref = doc(db, COL, id)
  const existing = await getDoc(ref)

  if (existing.exists()) return id // already enrolled — no-op

  await setDoc(ref, {
    studentId,
    courseId,
    enrolledAt: serverTimestamp(),
  })
  return id
}

/**
 * getEnrollment — check if a student is enrolled in a specific course
 * Returns the enrollment document or null.
 */
export async function getEnrollment(studentId, courseId) {
  const id   = enrollmentId(studentId, courseId)
  const snap = await getDoc(doc(db, COL, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/**
 * getStudentEnrollments — all enrollments for a student
 * Returns array of enrollment documents (each has courseId).
 */
export async function getStudentEnrollments(studentId) {
  const q    = query(collection(db, COL), where('studentId', '==', studentId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * getCourseEnrollments — all students enrolled in a course (admin use)
 */
export async function getCourseEnrollments(courseId) {
  const q    = query(collection(db, COL), where('courseId', '==', courseId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
