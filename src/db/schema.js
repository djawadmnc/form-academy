// Form Academy — Firestore Collection Schemas
// Source of truth: Notion > Form Academy v1 - Project Blueprint > Database Architecture
//
// MVP Collections (7):
//   leads, users, courses, lessons, enrollments, certificates, settings
//
// Phase 2 Collections (not built):
//   teacherAssignments

// ─── LEADS ───────────────────────────────────────────────────────────────────
// Created when a visitor submits the enrollment form.
// Status lifecycle: New → Contacted → Awaiting Payment → Paid → Activated
export const LEAD_SCHEMA = {
  firstName:     '',        // string — required
  lastName:      '',        // string — required
  phone:         '',        // string — required
  email:         '',        // string — required
  wilaya:        '',        // string — optional
  course:        '',        // string — required (course ID or name)
  paymentMethod: '',        // 'CCP' | 'BaridiMob'
  notes:         '',        // string — optional
  status:        'New',     // 'New' | 'Contacted' | 'Awaiting Payment' | 'Paid' | 'Activated'
  createdAt:     null,      // Firestore serverTimestamp()
}

export const LEAD_STATUSES = ['New', 'Contacted', 'Awaiting Payment', 'Paid', 'Activated']

// ─── USERS ────────────────────────────────────────────────────────────────────
// Created when admin activates a student account.
// role: 'student' | 'admin'  (teacher = Phase 2)
export const USER_SCHEMA = {
  uid:          '',         // string — Firebase Auth UID (document ID)
  firstName:    '',         // string
  lastName:     '',         // string
  email:        '',         // string
  phone:        '',         // string
  role:         'student',  // 'student' | 'admin'
  isActive:     true,       // bool
  activatedAt:  null,       // Firestore serverTimestamp()
  createdAt:    null,       // Firestore serverTimestamp()
}

// ─── COURSES ──────────────────────────────────────────────────────────────────
// Managed by admin. Content is static; videos hosted on Google Drive.
export const COURSE_SCHEMA = {
  title:       '',          // string — e.g. 'Couture Prêt-à-Porter'
  description: '',          // string
  level:       '',          // 'Débutant' | 'Intermédiaire' | 'Tous niveaux'
  moduleCount: 0,           // number
  isActive:    true,        // bool — false = archived
  createdAt:   null,        // Firestore serverTimestamp()
}

// ─── LESSONS ──────────────────────────────────────────────────────────────────
// Belongs to a course. Video URL is a Google Drive share link.
export const LESSON_SCHEMA = {
  courseId:    '',          // string — parent course document ID
  title:       '',          // string — e.g. 'Leçon 3 — Tracé du patron'
  moduleNumber: 1,          // number
  lessonNumber: 1,          // number
  videoUrl:    '',          // string — Google Drive share link
  duration:    '',          // string — e.g. '12:30' (optional)
  isPublished: true,        // bool
  createdAt:   null,        // Firestore serverTimestamp()
}

// ─── ENROLLMENTS ──────────────────────────────────────────────────────────────
// One document per student-course pair. Tracks progress.
export const ENROLLMENT_SCHEMA = {
  studentId:         '',    // string — users document ID
  courseId:          '',    // string — courses document ID
  completedLessons:  [],    // string[] — lesson document IDs
  progressPercent:   0,     // number — 0-100
  isCompleted:       false, // bool
  completedAt:       null,  // Firestore serverTimestamp() | null
  enrolledAt:        null,  // Firestore serverTimestamp()
}

// ─── CERTIFICATES ─────────────────────────────────────────────────────────────
// One certificate per student per course. Issued after admin approval.
export const CERTIFICATE_SCHEMA = {
  studentId:    '',         // string — users document ID
  courseId:     '',         // string — courses document ID
  issuedAt:     null,       // Firestore serverTimestamp()
  approvedBy:   '',         // string — admin user ID
  status:       'Pending',  // 'Pending' | 'Issued'
  downloadUrl:  '',         // string — PDF URL (Phase 2: Firebase Storage)
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
// Single document: settings/global
export const SETTINGS_SCHEMA = {
  platformName:    'Form Academy',
  contactEmail:    '',
  telegramLink:    '',
  maintenanceMode: false,
  updatedAt:       null,    // Firestore serverTimestamp()
}
