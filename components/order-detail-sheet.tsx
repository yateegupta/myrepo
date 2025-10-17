'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Clock, Package, User, Building2, FileText } from 'lucide-react'
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

interface OrderDetailSheetProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (orderId: string, status: OrderStatus) => void
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

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
  onStatusChange,
}: OrderDetailSheetProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  if (!order) return null

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true)
    try {
      await onStatusChange(order.id, newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Order Details</SheetTitle>
          <SheetDescription>
            Order #{order.orderNumber}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <Badge className={statusColors[order.status]}>
              {statusLabels[order.status]}
            </Badge>
            <div className="flex gap-2">
              {order.status === 'PENDING' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange(OrderStatus.IN_PROGRESS)}
                  disabled={isUpdating}
                >
                  Mark In Progress
                </Button>
              )}
              {order.status === 'IN_PROGRESS' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange(OrderStatus.COMPLETED)}
                  disabled={isUpdating}
                >
                  Mark Completed
                </Button>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Hospital</p>
                <p className="text-sm text-muted-foreground">{order.hospital}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Submitted By</p>
                <p className="text-sm text-muted-foreground">
                  {order.submitter.name || order.submitter.email}
                </p>
                <p className="text-xs text-muted-foreground">{order.submitter.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Surgery Details</p>
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Type:</span> {order.surgeryType}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Drape:</span> {order.drapeType}
                  </p>
                </div>
              </div>
            </div>

            {order.customizationNotes && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Customization Notes</p>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {order.customizationNotes}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Timeline</p>
                <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                  <p>Created: {format(new Date(order.createdAt), 'PPp')}</p>
                  <p>Updated: {format(new Date(order.updatedAt), 'PPp')}</p>
                  {order.completedAt && (
                    <p>Completed: {format(new Date(order.completedAt), 'PPp')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{item.itemName}</p>
                    <Badge variant="secondary">Qty: {item.quantity}</Badge>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
