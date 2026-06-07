// Form Academy — Leads Firestore Service
// Handles all read/write operations on the `leads` collection.
//
// Status lifecycle (locked):
//   New → Contacted → Awaiting Payment → Paid
//   → Pending Activation (link generated, student not yet activated)
//   → Activated (student completed activation, uid known)

import { db } from '../firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  where,
  limit,
} from 'firebase/firestore'

const COLLECTION = 'leads'

export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Awaiting Payment',
  'Paid',
  'Pending Activation',
  'Activated',
]

/**
 * createLead
 * Called when a visitor submits the enrollment form.
 * Writes a new document to the `leads` collection.
 *
 * @param {Object} formData
 * @returns {Promise<string>} new document ID
 */
export async function createLead(formData) {
  const lead = {
    firstName:     formData.firstName.trim(),
    lastName:      formData.lastName.trim(),
    phone:         formData.phone.trim(),
    email:         formData.email.trim(),
    wilaya:        formData.wilaya?.trim() || '',
    course:        formData.course,
    paymentMethod: formData.paymentMethod,
    notes:         formData.notes?.trim() || '',
    status:        'New',
    uid:           null,   // set when student completes activation
    createdAt:     serverTimestamp(),
  }

  const docRef = await addDoc(collection(db, COLLECTION), lead)
  return docRef.id
}

/**
 * updateLeadStatus
 * Advances a lead to a new status. Only updates the status field.
 *
 * @param {string} leadId
 * @param {string} status - one of LEAD_STATUSES
 */
export async function updateLeadStatus(leadId, status) {
  const ref = doc(db, COLLECTION, leadId)
  await updateDoc(ref, { status })
}

/**
 * linkLeadToUser
 * Called when a student successfully completes activation.
 * Writes the student's Firebase Auth uid into the lead document
 * and sets status to 'Activated'.
 *
 * @param {string} leadId
 * @param {string} uid - Firebase Auth UID of the activated student
 */
export async function linkLeadToUser(leadId, uid) {
  const ref = doc(db, COLLECTION, leadId)
  await updateDoc(ref, {
    uid,
    status: 'Activated',
    activatedAt: serverTimestamp(),
  })
}

/**
 * getLead
 * Fetches a single lead document by ID.
 * Returns null if the document does not exist.
 * Used by ActivatePage to read the course field during activation.
 *
 * @param {string} leadId
 * @returns {Object|null}
 */
export async function getLead(leadId) {
  const snap = await getDoc(doc(db, COLLECTION, leadId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/**
 * emailExistsInLeads
 * Returns true if any lead document already uses this email address.
 * Used by the enrollment form to block duplicate submissions.
 *
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function emailExistsInLeads(email) {
  const q = query(
    collection(db, COLLECTION),
    where('email', '==', email.trim().toLowerCase()),
    limit(1)
  )
  const snap = await getDocs(q)
  return !snap.empty
}

/**
 * getAllLeads
 * Returns all leads ordered by creation date (newest first).
 * Used by the admin dashboard.
 */
export async function getAllLeads() {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}
