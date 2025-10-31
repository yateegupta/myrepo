'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OrderWizardProps {
  submitterName: string;
  submitterRole: string;
}

export default function OrderWizard({ submitterName, submitterRole }: OrderWizardProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Welcome, {submitterName} ({submitterRole})
            </p>
            <p className="mb-4">
              Order wizard functionality will be implemented here. This is a placeholder component
              to maintain compatibility with the routing structure.
            </p>
            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
