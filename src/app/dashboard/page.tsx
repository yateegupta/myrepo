import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome, {user.name}!
            </h1>
            <p className="text-gray-600 mb-2">
              Role: <span className="font-semibold">{user.role}</span>
            </p>
            <p className="text-gray-600">
              Email: <span className="font-semibold">{user.email}</span>
            </p>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Dashboard Overview
              </h2>
              <p className="text-gray-700">
                This is your personalized dashboard. The navigation and available
                features are tailored based on your role.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
