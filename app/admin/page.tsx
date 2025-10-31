import { requireRole } from '@/lib/session'
import { redirect } from 'next/navigation'
import { UserRole } from '@/types/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LogOut } from 'lucide-react'

export default async function AdminPage() {
  try {
    const user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.ADMIN])

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Hospital Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.name}</span>
              <Link href="/api/auth/signout">
                <Button variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Welcome, {user.name}!</CardTitle>
                <CardDescription>
                  Full administrative access to the hospital management system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Role: <span className="font-semibold">{user.role}</span>
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    Manage all users and their roles
                  </p>
                  <Button>Manage Users</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    View and manage all orders
                  </p>
                  <Link href="/dashboard">
                    <Button variant="outline">View Orders</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    Configure system-wide settings
                  </p>
                  <Button variant="outline">Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Surgeon Area</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    Access surgeon features
                  </p>
                  <Link href="/surgeon">
                    <Button variant="outline">Surgeon Dashboard</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nurse Area</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    Access nurse features
                  </p>
                  <Link href="/nurse">
                    <Button variant="outline">Nurse Dashboard</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    View and generate system reports
                  </p>
                  <Button variant="outline">View Reports</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  } catch {
    redirect('/unauthorized')
  }
}
