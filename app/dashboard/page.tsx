'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrderDetailSheet } from '@/components/order-detail-sheet'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Package, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { OrderStatus } from '@/types/prisma'

interface OrderItem {
  id: string
  itemName: string
  quantity: number
  notes?: string | null
}

interface Order {
  id: string
  orderNumber: string
  hospital: string
  drapeType: string
  surgeryType: string
  status: OrderStatus
  customizationNotes?: string | null
  createdAt: string
  updatedAt: string
  completedAt?: string | null
  submitter: {
    id: string
    name: string | null
    email: string
  }
  items: OrderItem[]
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
}

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.role !== 'FULFILLMENT') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      })
      router.push('/')
    }
  }, [status, session, router, toast])

  useEffect(() => {
    if (status === 'authenticated' && session?.user.role === 'FULFILLMENT') {
      fetchOrders()
    }
  }, [status, session, statusFilter])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const url = statusFilter === 'all' 
        ? '/api/orders' 
        : `/api/orders?status=${statusFilter}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        throw new Error('Failed to fetch orders')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const optimisticOrders = orders.map(order =>
      order.id === orderId
        ? { ...order, status: newStatus }
        : order
    )
    setOrders(optimisticOrders)

    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      const updatedOrder = await response.json()
      
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? updatedOrder : order
        )
      )

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder)
      }

      toast({
        title: 'Success',
        description: `Order status updated to ${statusLabels[newStatus]}`,
      })
    } catch (error) {
      setOrders(orders)
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder })
      }
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      })
    }
  }

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order)
    setIsSheetOpen(true)
  }

  if (status === 'loading' || (status === 'authenticated' && session?.user.role !== 'FULFILLMENT')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Fulfillment Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Manage and track orders
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{session?.user.name}</p>
                <p className="text-xs text-muted-foreground">{session?.user.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Orders</CardTitle>
                <CardDescription>
                  View and manage all fulfillment orders
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filter by status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Orders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground">
                  {statusFilter === 'all'
                    ? 'There are no orders in the system yet.'
                    : `There are no orders with status "${statusLabels[statusFilter as OrderStatus]}".`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead className="hidden md:table-cell">Hospital</TableHead>
                      <TableHead className="hidden sm:table-cell">Submitter</TableHead>
                      <TableHead className="hidden lg:table-cell">Surgery Type</TableHead>
                      <TableHead className="hidden lg:table-cell">Drape Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(order)}
                      >
                        <TableCell className="font-medium">
                          {order.orderNumber.slice(0, 8)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {order.hospital}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {order.submitter.name || order.submitter.email}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {order.surgeryType}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {order.drapeType}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(new Date(order.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <OrderDetailSheet
        order={selectedOrder}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
