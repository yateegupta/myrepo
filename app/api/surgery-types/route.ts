import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const surgeryTypes = await prisma.surgeryType.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        defaultDrapeTypeId: true,
        defaultDrapeType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    })

    return NextResponse.json(surgeryTypes)
  } catch (error) {
    console.error('Error fetching surgery types:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
