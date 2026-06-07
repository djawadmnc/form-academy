# Form Academy

Online learning platform for couture and broderie.
Built with React + Vite + Tailwind CSS + Firebase.

---

## Deployment Checklist

Complete every item before going live. Each item is a hard requirement — missing any one will break the platform for real users.

### Firebase Console

- [ ] **Email/Password authentication** enabled
  `Authentication → Sign-in method → Email/Password → Enable`

- [ ] **Email Link (passwordless) authentication** enabled
  `Authentication → Sign-in method → Email link (passwordless sign-in) → Enable`

- [ ] **Authorized domains** configured
  `Authentication → Settings → Authorized domains`
  Add: `localhost` (development) + your GitHub Pages domain (e.g. `username.github.io`)

- [ ] **Firestore security rules** deployed
  `Firestore Database → Rules → Paste rules from README → Publish`
  ⚠️ Without this, any browser can read/write all data.

- [ ] **First admin account created** manually
  1. `Authentication → Users → Add user` — enter email + temp password
  2. Copy the UID shown
  3. `Firestore → users → Add document` (ID = the UID)
  4. Fields: `uid`, `email`, `firstName`, `lastName`, `role: "admin"`, `status: "active"`, `createdAt`
  5. Sign in at `/login`, then change password

- [ ] **Firestore indexes** — none required for MVP (single-field queries only)

### Environment

- [ ] `.env` file created from `.env.example` with real Firebase project values
- [ ] `.env` is in `.gitignore` — never committed to GitHub

### Status lifecycle verified

- [ ] Enrollment form creates lead with status `New`
- [ ] Admin can advance lead through: `New → Contacted → Awaiting Payment → Paid`
- [ ] Admin clicking "Activer" sets status to `Pending Activation`
- [ ] Student completing activation sets status to `Activated` and writes `uid` into lead

### Route protection verified

- [ ] `/dashboard` redirects to `/login` when not authenticated
- [ ] `/admin/*` redirects to `/dashboard` when logged in as student
- [ ] Admin logs in → lands on `/admin`
- [ ] Student logs in → lands on `/dashboard`

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Firebase

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your Firebase credentials from the Firebase Console:
- Go to https://console.firebase.google.com
- Select your project → Project Settings → Your Apps → Web App
- Copy each value into `.env`

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Set up Firestore

In the Firebase Console:
1. Go to Firestore Database → Create database
2. Choose production mode
3. Apply the security rules below

**Firestore Security Rules (paste into Firebase Console):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Leads: public write (enrollment form), admin read
    match /leads/{leadId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null
        && request.auth.token.role == 'admin';
    }
    // Users: authenticated read of own doc, admin full access
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null
        && request.auth.token.role == 'admin';
    }
    // Courses & Lessons: public read, admin write
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.role == 'admin';
    }
    match /lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.auth.token.role == 'admin';
    }
    // Enrollments: student reads own, admin full
    match /enrollments/{enrollmentId} {
      allow read: if request.auth != null
        && (resource.data.studentId == request.auth.uid
            || request.auth.token.role == 'admin');
      allow write: if request.auth != null
        && request.auth.token.role == 'admin';
    }
    // Certificates: student reads own, admin full
    match /certificates/{certId} {
      allow read: if request.auth != null
        && (resource.data.studentId == request.auth.uid
            || request.auth.token.role == 'admin');
      allow write: if request.auth != null
        && request.auth.token.role == 'admin';
    }
    // Settings: admin only
    match /settings/{docId} {
      allow read, write: if request.auth != null
        && request.auth.token.role == 'admin';
    }
  }
}
```

### 4. Run the development server
```bash
npm run dev
```

Open http://localhost:5173

---

## Routes

| Path               | Description                  |
|--------------------|------------------------------|
| `/`                | Public homepage              |
| `/enrollment`      | 3-step enrollment form       |
| `/admin`           | Admin dashboard              |
| `/admin/leads`     | Lead management (live data)  |
| `/admin/students`  | Student management (Sprint 4)|
| `/admin/courses`   | Course management (Sprint 4) |

---

## Project Structure

```
src/
├── firebase.js              # Firebase app initialization
├── db/
│   ├── schema.js            # Firestore collection schemas (documentation)
│   └── leads.js             # Leads collection CRUD
├── components/              # Shared UI components (Navbar, Hero, etc.)
├── pages/
│   ├── EnrollmentPage.jsx   # 3-step form → Firestore lead creation
│   └── admin/
│       ├── AdminLayout.jsx
│       ├── AdminDashboard.jsx
│       ├── AdminLeads.jsx   # Live Firestore reads + status updates
│       ├── AdminStudents.jsx
│       └── AdminCourses.jsx
└── App.jsx                  # React Router configuration
```

---

## Client Demo

Open `preview.html` directly in any browser for the static demo (no Firebase required).

---

## Sprint Status

| Sprint | Status     | Scope                                         |
|--------|------------|-----------------------------------------------|
| #1     | ✅ Done    | Homepage, UI components                       |
| #2     | ✅ Done    | Enrollment form UI, Dashboard UI              |
| #3     | ✅ Done    | Firebase, Firestore, live form submit         |
| #4     | ✅ Done    | Auth, protected routes, activation link flow  |
| #5     | ⏳ Next    | Course content, progress tracking, certs      |

---

## Sprint #4 — Firebase Console Setup Required

Before Sprint #4 features work, configure the following in the Firebase Console:

### 1. Enable Email/Password Authentication
Firebase Console → Authentication → Sign-in method → Email/Password → Enable

### 2. Enable Email Link (passwordless) Authentication
Firebase Console → Authentication → Sign-in method → Email link (passwordless sign-in) → Enable

### 3. Add Authorized Domain
Firebase Console → Authentication → Settings → Authorized domains
Add your GitHub Pages domain: `[username].github.io`
Also add `localhost` for local development.

### 4. Create the first admin account manually
After a student activates and logs in, their `users/{uid}` document is created with `role: 'student'`.
To create an admin:
1. Create a user via Firebase Console → Authentication → Add user
2. Note the UID
3. In Firestore → users → Add document with that UID as the document ID
4. Set fields: `uid`, `email`, `firstName`, `lastName`, `role: "admin"`, `status: "active"`, `createdAt`

### Activation link flow (admin steps)
1. Student submits enrollment form → lead appears in `/admin/leads`
2. Admin contacts student, collects payment
3. Admin updates lead status to `Paid`
4. Admin clicks "Activer →" button on the lead row
5. System generates activation link and sends email to student via Firebase
6. Admin copies the `/activate` URL shown and sends it via WhatsApp/Telegram as backup
7. Student clicks link → lands on `/activate` → sets password → account created → redirected to `/dashboard`
