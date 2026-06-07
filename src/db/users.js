// Form Academy — Users Firestore Service
// Handles the users/{uid} collection.
// Documents are created when a student completes activation.

import { db } from '../firebase'
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, limit, getDocs } from 'firebase/firestore'

const COLLECTION = 'users'

/**
 * createUser
 * Called during student activation after they set their password.
 * Document ID = Firebase Auth UID.
 *
 * @param {string} uid - Firebase Auth UID
 * @param {Object} data - { email, firstName, lastName, role, status }
 */
export async function createUser(uid, data) {
  const userDoc = {
    uid,
    email:      data.email,
    firstName:  data.firstName,
    lastName:   data.lastName,
    role:       data.role       || 'student',   // 'student' | 'admin'
    status:     data.status     || 'active',    // 'active' | 'inactive'
    leadId:     data.leadId     || null,        // explicit link to leads/{leadId}
    courseName: data.courseName || null,        // purchased formation name, copied from lead.course
    createdAt:  serverTimestamp(),
  }

  await setDoc(doc(db, COLLECTION, uid), userDoc)
  return userDoc
}

/**
 * getUser
 * Fetches a user document by Firebase Auth UID.
 * Returns null if the document does not exist.
 *
 * @param {string} uid
 * @returns {Object|null}
 */
export async function getUser(uid) {
  const snap = await getDoc(doc(db, COLLECTION, uid))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/**
 * emailExistsInUsers
 * Returns true if any activated user document already uses this email.
 * Used by the enrollment form to block duplicate student accounts.
 *
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function emailExistsInUsers(email) {
  const q = query(
    collection(db, COLLECTION),
    where('email', '==', email.trim().toLowerCase()),
    limit(1)
  )
  const snap = await getDocs(q)
  return !snap.empty
}
