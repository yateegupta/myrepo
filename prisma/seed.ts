import { PrismaClient, UserRole, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();

  const submitter1 = await prisma.user.create({
    data: {
      email: 'submitter@example.com',
      name: 'John Submitter',
      role: UserRole.SUBMITTER,
      password: 'password123',
    },
  });

  const submitter2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      role: UserRole.SUBMITTER,
      password: 'password123',
    },
  });

  const fulfillment = await prisma.user.create({
    data: {
      email: 'fulfillment@example.com',
      name: 'Fulfillment User',
      role: UserRole.FULFILLMENT,
      password: 'password123',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      password: 'password123',
    },
  });

  const order1 = await prisma.order.create({
    data: {
      hospital: 'General Hospital',
      submitterId: submitter1.id,
      drapeType: 'Sterile Blue',
      surgeryType: 'Orthopedic',
      status: OrderStatus.PENDING,
      customizationNotes: 'Please ensure extra padding on the knee area',
      items: {
        create: [
          {
            itemName: 'Surgical Drape Large',
            quantity: 5,
            notes: 'Blue color preferred',
          },
          {
            itemName: 'Sterile Gloves Size M',
            quantity: 10,
          },
          {
            itemName: 'Gauze Pads',
            quantity: 50,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      hospital: 'St. Mary Medical Center',
      submitterId: submitter2.id,
      drapeType: 'Standard Green',
      surgeryType: 'Cardiac',
      status: OrderStatus.IN_PROGRESS,
      customizationNotes: 'Rush order - needed by tomorrow',
      items: {
        create: [
          {
            itemName: 'Cardiac Drape Set',
            quantity: 2,
          },
          {
            itemName: 'Sterile Towels',
            quantity: 20,
          },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      hospital: 'City Hospital',
      submitterId: submitter1.id,
      drapeType: 'Premium White',
      surgeryType: 'Neurosurgery',
      status: OrderStatus.COMPLETED,
      completedAt: new Date(Date.now() - 86400000),
      items: {
        create: [
          {
            itemName: 'Neurosurgery Drape Kit',
            quantity: 1,
          },
          {
            itemName: 'Sterile Covers',
            quantity: 5,
          },
        ],
      },
    },
  });

  const order4 = await prisma.order.create({
    data: {
      hospital: 'Metropolitan Health',
      submitterId: submitter2.id,
      drapeType: 'Antimicrobial Blue',
      surgeryType: 'General Surgery',
      status: OrderStatus.PENDING,
      items: {
        create: [
          {
            itemName: 'General Drape Medium',
            quantity: 8,
          },
          {
            itemName: 'Instrument Covers',
            quantity: 15,
          },
          {
            itemName: 'Table Covers',
            quantity: 3,
          },
        ],
      },
    },
  });

  console.log('Database seeded successfully!');
  console.log('Users created:');
  console.log('- Submitter:', submitter1.email);
  console.log('- Submitter:', submitter2.email);
  console.log('- Fulfillment:', fulfillment.email);
  console.log('- Admin:', admin.email);
  console.log('\nOrders created:', 4);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
