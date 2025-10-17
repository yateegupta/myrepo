import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { orderInclude, serializeOrder } from '@/lib/order'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'

const createOrderSchema = z.object({
  drapeTypeId: z.string().optional(),
  drapeTypeName: z.string().optional(),
  surgeryTypeId: z.string().optional(),
  surgeryTypeName: z.string().optional(),
  customizationNotes: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string().optional(),
      itemName: z.string().min(1, 'Item name is required'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      notes: z.string().optional(),
    })
  ).min(1, 'At least one item is required'),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'FULFILLMENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const hospitalId = searchParams.get('hospitalId')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const skip = (page - 1) * limit

    const where: Prisma.OrderWhereInput = {}

    if (status) {
      where.status = status as any
    }

    if (hospitalId) {
      where.hospitalId = hospitalId
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders: orders.map(serializeOrder),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUBMITTER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only submitters can create orders' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validationResult = createOrderSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hospitalId: true },
    })

    if (!user?.hospitalId) {
      return NextResponse.json(
        { error: 'User must be associated with a hospital to create orders' },
        { status: 400 }
      )
    }

    if (data.drapeTypeId) {
      const drapeType = await prisma.drapeType.findUnique({
        where: { id: data.drapeTypeId },
      })
      if (!drapeType) {
        return NextResponse.json(
          { error: 'Invalid drapeTypeId' },
          { status: 400 }
        )
      }
    }

    if (data.surgeryTypeId) {
      const surgeryType = await prisma.surgeryType.findUnique({
        where: { id: data.surgeryTypeId },
      })
      if (!surgeryType) {
        return NextResponse.json(
          { error: 'Invalid surgeryTypeId' },
          { status: 400 }
        )
      }
    }

    for (const item of data.items) {
      if (item.itemId) {
        const catalogItem = await prisma.item.findUnique({
          where: { id: item.itemId },
        })
        if (!catalogItem) {
          return NextResponse.json(
            { error: `Invalid itemId: ${item.itemId}` },
            { status: 400 }
          )
        }
      }
    }

    const order = await prisma.order.create({
      data: {
        hospitalId: user.hospitalId,
        submitterId: session.user.id,
        drapeTypeId: data.drapeTypeId,
        drapeTypeName: data.drapeTypeName,
        surgeryTypeId: data.surgeryTypeId,
        surgeryTypeName: data.surgeryTypeName,
        customizationNotes: data.customizationNotes,
        items: {
          create: data.items.map((item) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            notes: item.notes,
          })),
        },
      },
      include: orderInclude,
    })

    return NextResponse.json(serializeOrder(order), { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
