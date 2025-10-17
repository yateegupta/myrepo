import { requireRole } from '@/lib/session'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default async function AdminPage() {
  try {
    const user = await requireRole('HOSPITAL_ADMIN')

    return (
      <>
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Hospital Admin Panel
              </h1>
              <p className="text-gray-600 mb-4">
                Welcome, {user.name}. You have full administrative access.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">User Management</h3>
                  <p className="text-gray-600 text-sm">
                    Manage all users and their roles
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">System Settings</h3>
                  <p className="text-gray-600 text-sm">
                    Configure system-wide settings
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Reports</h3>
                  <p className="text-gray-600 text-sm">
                    View and generate system reports
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
