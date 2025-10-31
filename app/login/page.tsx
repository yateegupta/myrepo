'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: 'Error',
          description: 'Invalid email or password',
          variant: 'destructive',
        })
      } else {
        router.push('/')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Fulfillment Dashboard</CardTitle>
          <CardDescription>
            Sign in to access the fulfillment dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="fulfillment@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Test Credentials:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-semibold">Hospital Admin</p>
                <p>Email: admin@hospital.com</p>
                <p>Password: password123</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-semibold">Surgeon</p>
                <p>Email: surgeon@hospital.com</p>
                <p>Password: password123</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-semibold">Nurse</p>
                <p>Email: nurse@hospital.com</p>
                <p>Password: password123</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-semibold">Fulfillment Agent</p>
                <p>Email: fulfillment@hospital.com</p>
                <p>Password: password123</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-semibold">Submitter</p>
                <p>Email: sarah.connor@generalhospital.org</p>
                <p>Password: password123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
