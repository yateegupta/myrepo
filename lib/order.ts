import type { Prisma } from '@prisma/client'

export const orderInclude = {
  hospital: true,
  drapeType: true,
  surgeryType: true,
  submitter: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: {
    include: {
      item: true,
    },
  },
} satisfies Prisma.OrderInclude

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof orderInclude
}>

export function serializeOrder(order: OrderWithRelations) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    hospital: order.hospital.name,
    drapeType: order.drapeTypeName ?? order.drapeType?.name ?? 'Custom',
    surgeryType: order.surgeryTypeName ?? order.surgeryType?.name ?? 'Custom',
    status: order.status,
    customizationNotes: order.customizationNotes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    completedAt: order.completedAt,
    submitter: order.submitter,
    items: order.items.map((item: {
      id: string
      itemName: string
      quantity: number
      notes: string | null
      item: { name: string } | null
    }) => ({
      id: item.id,
      itemName: item.item?.name ?? item.itemName,
      quantity: item.quantity,
      notes: item.notes,
    })),
  }
}
