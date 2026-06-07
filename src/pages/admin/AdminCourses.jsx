// Form Academy — Admin Courses Page (Placeholder)
// Route: /admin/courses
// Full implementation in Sprint #4.

import AdminLayout from './AdminLayout'

export default function AdminCourses() {
  return (
    <AdminLayout currentPage="courses">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-[#034956] mb-2">Cours</h1>
        <p className="text-[#034956]/55 text-sm mb-8">Gestion du contenu de formation.</p>
        <div className="bg-white rounded-2xl border border-[#034956]/5 p-10 text-center">
          <p className="text-[#034956] font-semibold mb-2">Disponible après Sprint #4</p>
          <p className="text-[#034956]/50 text-sm max-w-sm mx-auto">La gestion des cours et leçons sera implémentée dans le prochain sprint.</p>
        </div>
      </div>
    </AdminLayout>
  )
}
