import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import OrderWizard from '@/components/order-wizard';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export default async function NewOrderPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== UserRole.SUBMITTER && session.user.role !== UserRole.ADMIN) {
    redirect('/dashboard');
  }

  return (
    <OrderWizard
      submitterName={session.user.name ?? session.user.email}
      submitterRole={session.user.role}
    />
  );
}
