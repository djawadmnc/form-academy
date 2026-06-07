// Form Academy — Admin Students Page (Placeholder)
// Route: /admin/students
// Full implementation in Sprint #4 (after Firebase Auth integration).

import AdminLayout from './AdminLayout'

export default function AdminStudents() {
  return (
    <AdminLayout currentPage="students">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-[#034956] mb-2">Étudiants</h1>
        <p className="text-[#034956]/55 text-sm mb-8">Gestion des comptes étudiants actifs.</p>
        <div className="bg-white rounded-2xl border border-[#034956]/5 p-10 text-center">
          <p className="text-[#034956] font-semibold mb-2">Disponible après Sprint #4</p>
          <p className="text-[#034956]/50 text-sm max-w-sm mx-auto">La gestion des étudiants sera activée après l'intégration de Firebase Authentication et du système d'activation de compte.</p>
        </div>
      </div>
    </AdminLayout>
  )
}
