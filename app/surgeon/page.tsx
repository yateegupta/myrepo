import { requireRole } from '@/lib/session'
import { redirect } from 'next/navigation'
import { UserRole } from '@/types/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default async function SurgeonPage() {
  try {
    const user = await requireRole([UserRole.SURGEON, UserRole.HOSPITAL_ADMIN, UserRole.ADMIN])

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Surgeon Dashboard</h1>
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
                  Manage your procedures and patient surgical records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Role: <span className="font-semibold">{user.role}</span>
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Procedures</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    View and manage scheduled surgical procedures
                  </p>
                  <Link href="/orders/new">
                    <Button className="mt-4">Create Procedure Order</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Patient Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Access patient medical and surgical records
                  </p>
                  <Button className="mt-4" variant="outline">
                    View Records
                  </Button>
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
