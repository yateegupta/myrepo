import 'dotenv/config'

import { PrismaClient } from '@prisma/client'
import type { Hospital, DrapeType, SurgeryType, Item } from '@prisma/client'
import { UserRole, OrderStatus } from '../types/prisma'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const requireEntity = <T>(value: T | undefined, message: string): T => {
  if (!value) {
    throw new Error(message)
  }
  return value
}

async function main() {
  // Clear existing data respecting relational constraints
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.surgeryTypeItem.deleteMany()
  await prisma.item.deleteMany()
  await prisma.surgeryType.deleteMany()
  await prisma.drapeType.deleteMany()
  await prisma.user.deleteMany()
  await prisma.hospital.deleteMany()

  // Seed hospitals
  const hospitalsData = [
    { name: 'General Hospital', address: '123 Main Street, Springfield' },
    { name: 'City Medical Center', address: '200 Elm Avenue, Riverside' },
    { name: 'St. Mary Medical Center', address: '456 Oak Drive, Fairview' },
  ]

  const hospitals = new Map<string, Hospital>()
  for (const hospital of hospitalsData) {
    const created = await prisma.hospital.create({ data: hospital })
    hospitals.set(created.name, created)
  }

  // Seed drape types
  const drapeTypesData = [
    { name: 'Standard Orthopedic Pack', description: 'Standard drape setup for general orthopedic procedures.' },
    { name: 'Cardiac Barrier Pack', description: 'Antimicrobial drape system ideal for open cardiac surgeries.' },
    { name: 'Neuro Precision Pack', description: 'Specialized fenestrated drape kit for neurosurgical procedures.' },
  ]

  const drapeTypes = new Map<string, DrapeType>()
  for (const drapeType of drapeTypesData) {
    const created = await prisma.drapeType.create({ data: drapeType })
    drapeTypes.set(created.name, created)
  }

  // Seed items that can be used in surgery kits and orders
  const itemsData = [
    { name: 'Large Sterile Drape', description: 'Full coverage sterile field drape.', unit: 'each' },
    { name: 'Fenestrated Drape', description: 'Procedure-specific fenestration.', unit: 'each' },
    { name: 'Instrument Table Cover', description: 'Sterile cover for instrument tables.', unit: 'each' },
    { name: 'Fluid Collection Pouch', description: 'Disposable pouch for fluid management.', unit: 'each' },
    { name: 'Suture Pack', description: 'Assorted absorbable sutures.', unit: 'pack' },
    { name: 'Sterile Gown', description: 'Impervious sterile surgical gown.', unit: 'each' },
    { name: 'Absorbent Towels', description: 'Lint-free sterile towels.', unit: 'bundle' },
  ]

  const items = new Map<string, Item>()
  for (const item of itemsData) {
    const created = await prisma.item.create({ data: item })
    items.set(created.name, created)
  }

  // Seed surgery types with references to default drape types
  const surgeryTypesData = [
    {
      name: 'Total Knee Replacement',
      description: 'Comprehensive drape coverage for knee arthroplasty.',
      defaultDrapeTypeName: 'Standard Orthopedic Pack',
    },
    {
      name: 'Coronary Artery Bypass',
      description: 'Cardiac surgery requiring specialized antimicrobial barriers.',
      defaultDrapeTypeName: 'Cardiac Barrier Pack',
    },
    {
      name: 'Cranial Tumor Resection',
      description: 'Precise fenestration and fluid control for neurosurgery.',
      defaultDrapeTypeName: 'Neuro Precision Pack',
    },
  ]

  const surgeryTypes = new Map<string, SurgeryType>()
  for (const surgeryType of surgeryTypesData) {
    const defaultDrapeType = surgeryType.defaultDrapeTypeName
      ? requireEntity(
          drapeTypes.get(surgeryType.defaultDrapeTypeName),
          `Missing drape type seed: ${surgeryType.defaultDrapeTypeName}`
        )
      : undefined

    const created = await prisma.surgeryType.create({
      data: {
        name: surgeryType.name,
        description: surgeryType.description,
        defaultDrapeTypeId: defaultDrapeType?.id,
      },
    })
    surgeryTypes.set(created.name, created)
  }

  // Map default surgery constituents
  const surgeryDefaults = [
    {
      surgery: 'Total Knee Replacement',
      items: [
        { name: 'Large Sterile Drape', quantity: 2 },
        { name: 'Instrument Table Cover', quantity: 1 },
        { name: 'Sterile Gown', quantity: 4 },
        { name: 'Absorbent Towels', quantity: 2 },
      ],
    },
    {
      surgery: 'Coronary Artery Bypass',
      items: [
        { name: 'Fenestrated Drape', quantity: 1 },
        { name: 'Fluid Collection Pouch', quantity: 2 },
        { name: 'Instrument Table Cover', quantity: 1 },
        { name: 'Sterile Gown', quantity: 6 },
      ],
    },
    {
      surgery: 'Cranial Tumor Resection',
      items: [
        { name: 'Fenestrated Drape', quantity: 2 },
        { name: 'Large Sterile Drape', quantity: 1 },
        { name: 'Suture Pack', quantity: 3 },
        { name: 'Absorbent Towels', quantity: 3 },
      ],
    },
  ]

  for (const mapping of surgeryDefaults) {
    const surgeryType = requireEntity(
      surgeryTypes.get(mapping.surgery),
      `Missing surgery type seed: ${mapping.surgery}`
    )

    for (const { name, quantity } of mapping.items) {
      const item = requireEntity(items.get(name), `Missing item seed: ${name}`)
      await prisma.surgeryTypeItem.create({
        data: {
          surgeryTypeId: surgeryType.id,
          itemId: item.id,
          defaultQuantity: quantity,
        },
      })
    }
  }

  // Seed users for each role
  const hashedPassword = await bcrypt.hash('password123', 10)

  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      password: hashedPassword,
    },
  })

  await prisma.user.create({
    data: {
      email: 'admin@hospital.com',
      name: 'Hospital Admin',
      role: UserRole.HOSPITAL_ADMIN,
      password: hashedPassword,
    },
  })

  await prisma.user.create({
    data: {
      email: 'surgeon@hospital.com',
      name: 'Dr. Sarah Johnson',
      role: UserRole.SURGEON,
      password: hashedPassword,
    },
  })

  await prisma.user.create({
    data: {
      email: 'nurse@hospital.com',
      name: 'Nurse Emma Davis',
      role: UserRole.NURSE,
      password: hashedPassword,
    },
  })

  await prisma.user.create({
    data: {
      email: 'fulfillment@example.com',
      name: 'Fulfillment Coordinator',
      role: UserRole.FULFILLMENT,
      password: hashedPassword,
    },
  })

  await prisma.user.create({
    data: {
      email: 'fulfillment@hospital.com',
      name: 'Fulfillment Agent',
      role: UserRole.FULFILLMENT_AGENT,
      password: hashedPassword,
    },
  })

  const submitterOne = await prisma.user.create({
    data: {
      email: 'sarah.connor@generalhospital.org',
      name: 'Sarah Connor',
      role: UserRole.SUBMITTER,
      password: hashedPassword,
      hospitalId: requireEntity(
        hospitals.get('General Hospital'),
        'Missing hospital seed: General Hospital'
      ).id,
    },
  })

  const submitterTwo = await prisma.user.create({
    data: {
      email: 'jack.ryan@stmary.org',
      name: 'Jack Ryan',
      role: UserRole.SUBMITTER,
      password: hashedPassword,
      hospitalId: requireEntity(
        hospitals.get('St. Mary Medical Center'),
        'Missing hospital seed: St. Mary Medical Center'
      ).id,
    },
  })

  // Pre-fetch frequently used references for orders
  const generalHospital = requireEntity(
    hospitals.get('General Hospital'),
    'Missing hospital seed: General Hospital'
  )
  const stMaryHospital = requireEntity(
    hospitals.get('St. Mary Medical Center'),
    'Missing hospital seed: St. Mary Medical Center'
  )
  const cityMedicalCenter = requireEntity(
    hospitals.get('City Medical Center'),
    'Missing hospital seed: City Medical Center'
  )

  const standardOrthopedicPack = requireEntity(
    drapeTypes.get('Standard Orthopedic Pack'),
    'Missing drape type seed: Standard Orthopedic Pack'
  )
  const cardiacBarrierPack = requireEntity(
    drapeTypes.get('Cardiac Barrier Pack'),
    'Missing drape type seed: Cardiac Barrier Pack'
  )
  const neuroPrecisionPack = requireEntity(
    drapeTypes.get('Neuro Precision Pack'),
    'Missing drape type seed: Neuro Precision Pack'
  )

  const totalKneeReplacement = requireEntity(
    surgeryTypes.get('Total Knee Replacement'),
    'Missing surgery type seed: Total Knee Replacement'
  )
  const coronaryArteryBypass = requireEntity(
    surgeryTypes.get('Coronary Artery Bypass'),
    'Missing surgery type seed: Coronary Artery Bypass'
  )
  const cranialTumorResection = requireEntity(
    surgeryTypes.get('Cranial Tumor Resection'),
    'Missing surgery type seed: Cranial Tumor Resection'
  )

  const largeSterileDrape = requireEntity(
    items.get('Large Sterile Drape'),
    'Missing item seed: Large Sterile Drape'
  )
  const sterileGown = requireEntity(items.get('Sterile Gown'), 'Missing item seed: Sterile Gown')
  const instrumentTableCover = requireEntity(
    items.get('Instrument Table Cover'),
    'Missing item seed: Instrument Table Cover'
  )
  const fluidCollectionPouch = requireEntity(
    items.get('Fluid Collection Pouch'),
    'Missing item seed: Fluid Collection Pouch'
  )
  const fenestratedDrape = requireEntity(
    items.get('Fenestrated Drape'),
    'Missing item seed: Fenestrated Drape'
  )
  const suturePack = requireEntity(items.get('Suture Pack'), 'Missing item seed: Suture Pack')
  const absorbentTowels = requireEntity(
    items.get('Absorbent Towels'),
    'Missing item seed: Absorbent Towels'
  )

  // Seed sample orders showcasing relations
  await prisma.order.create({
    data: {
      hospitalId: generalHospital.id,
      submitterId: submitterOne.id,
      drapeTypeId: standardOrthopedicPack.id,
      drapeTypeName: standardOrthopedicPack.name,
      surgeryTypeId: totalKneeReplacement.id,
      surgeryTypeName: totalKneeReplacement.name,
      status: OrderStatus.PENDING,
      customizationNotes: 'Add extra absorbent towels for high fluid volumes.',
      items: {
        create: [
          {
            itemId: largeSterileDrape.id,
            itemName: largeSterileDrape.name,
            quantity: 2,
          },
          {
            itemId: sterileGown.id,
            itemName: sterileGown.name,
            quantity: 6,
            notes: 'Include two XXL sizes.',
          },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      hospitalId: stMaryHospital.id,
      submitterId: submitterTwo.id,
      drapeTypeId: cardiacBarrierPack.id,
      drapeTypeName: cardiacBarrierPack.name,
      surgeryTypeId: coronaryArteryBypass.id,
      surgeryTypeName: coronaryArteryBypass.name,
      status: OrderStatus.IN_PROGRESS,
      customizationNotes: 'Rush case scheduled for first case tomorrow.',
      items: {
        create: [
          {
            itemId: fluidCollectionPouch.id,
            itemName: fluidCollectionPouch.name,
            quantity: 3,
          },
          {
            itemId: instrumentTableCover.id,
            itemName: instrumentTableCover.name,
            quantity: 2,
          },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      hospitalId: cityMedicalCenter.id,
      submitterId: submitterOne.id,
      drapeTypeId: neuroPrecisionPack.id,
      drapeTypeName: neuroPrecisionPack.name,
      surgeryTypeId: cranialTumorResection.id,
      surgeryTypeName: cranialTumorResection.name,
      status: OrderStatus.COMPLETED,
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      customizationNotes: 'Delivered yesterday, ensure restock for next week.',
      items: {
        create: [
          {
            itemId: fenestratedDrape.id,
            itemName: fenestratedDrape.name,
            quantity: 2,
          },
          {
            itemId: suturePack.id,
            itemName: suturePack.name,
            quantity: 4,
          },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      hospitalId: generalHospital.id,
      submitterId: submitterTwo.id,
      drapeTypeName: 'Custom Pediatric Pack',
      surgeryTypeName: 'Pediatric Appendectomy',
      status: OrderStatus.PENDING,
      customizationNotes: 'Custom pack requested by surgical team.',
      items: {
        create: [
          {
            itemName: 'Pediatric Instrument Kit',
            quantity: 1,
            notes: 'Custom item not in catalog.',
          },
          {
            itemId: absorbentTowels.id,
            itemName: absorbentTowels.name,
            quantity: 1,
          },
        ],
      },
    },
  })

  console.log('Database seeded successfully!')
  console.log('Seeded hospitals:', Array.from(hospitals.keys()))
  console.log('Seeded drape types:', Array.from(drapeTypes.keys()))
  console.log('Seeded surgery types:', Array.from(surgeryTypes.keys()))
  console.log('Default constituents:', surgeryDefaults.length, 'surgery mappings created')
  console.log('Users created: admin, fulfillment, and two submitters')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
