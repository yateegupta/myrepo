import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const surgeryType = await prisma.surgeryType.findUnique({
      where: { id: params.id },
      include: {
        defaultDrapeType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        defaultItems: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                description: true,
                unit: true,
              },
            },
          },
          orderBy: {
            item: {
              name: 'asc',
            },
          },
        },
      },
    })

    if (!surgeryType) {
      return NextResponse.json({ error: 'Surgery type not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: surgeryType.id,
      name: surgeryType.name,
      description: surgeryType.description,
      defaultDrapeType: surgeryType.defaultDrapeType,
      defaultItems: surgeryType.defaultItems.map((sti: {
        item: {
          id: string
          name: string
          description: string | null
          unit: string | null
        }
        defaultQuantity: number
      }) => ({
        id: sti.item.id,
        name: sti.item.name,
        description: sti.item.description,
        unit: sti.item.unit,
        defaultQuantity: sti.defaultQuantity,
      })),
    })
  } catch (error) {
    console.error('Error fetching surgery type defaults:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
