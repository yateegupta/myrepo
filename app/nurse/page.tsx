import { requireRole } from '@/lib/session'
import { redirect } from 'next/navigation'
import { UserRole } from '@/types/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LogOut } from 'lucide-react'

export default async function NursePage() {
  try {
    const user = await requireRole([UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.ADMIN])

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Nurse Dashboard</h1>
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
                  Manage patient care and medical supplies
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
                  <CardTitle className="text-lg">Patient Care</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Monitor and update patient care plans
                  </p>
                  <Button className="mt-4">View Patients</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Supply Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Request medical supplies for patient care
                  </p>
                  <Link href="/orders/new">
                    <Button className="mt-4" variant="outline">
                      Create Supply Request
                    </Button>
                  </Link>
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
