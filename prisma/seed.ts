import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const users = [
    {
      email: 'admin@hospital.com',
      name: 'Hospital Admin',
      role: Role.HOSPITAL_ADMIN,
      password: 'admin123',
    },
    {
      email: 'surgeon@hospital.com',
      name: 'Dr. Sarah Johnson',
      role: Role.SURGEON,
      password: 'surgeon123',
    },
    {
      email: 'nurse@hospital.com',
      name: 'Nurse Emma Davis',
      role: Role.NURSE,
      password: 'nurse123',
    },
    {
      email: 'fulfillment@hospital.com',
      name: 'Fulfillment Agent',
      role: Role.FULFILLMENT_AGENT,
      password: 'fulfillment123',
    },
  ]

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        password: hashedPassword,
      },
    })
    
    console.log(`✓ Created user: ${user.email} (${user.role})`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
