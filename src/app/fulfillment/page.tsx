import { requireRole } from '@/lib/session'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default async function FulfillmentPage() {
  try {
    const user = await requireRole(['FULFILLMENT_AGENT', 'HOSPITAL_ADMIN'])

    return (
      <>
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Fulfillment Dashboard
              </h1>
              <p className="text-gray-600 mb-4">
                Welcome, {user.name}. Manage orders and inventory.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Pending Orders</h3>
                  <p className="text-gray-600 text-sm">
                    Process and fulfill pending orders
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Inventory Management</h3>
                  <p className="text-gray-600 text-sm">
                    Track and manage medical supplies
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
