import { requireRole } from '@/lib/session'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default async function NursePage() {
  try {
    const user = await requireRole(['NURSE', 'HOSPITAL_ADMIN'])

    return (
      <>
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Nurse Dashboard
              </h1>
              <p className="text-gray-600 mb-4">
                Welcome, {user.name}. Manage patient care and records.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Patient Care</h3>
                  <p className="text-gray-600 text-sm">
                    Monitor and update patient care plans
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Medication Records</h3>
                  <p className="text-gray-600 text-sm">
                    Track medication administration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  } catch {
    redirect('/unauthorized')
  }
}
