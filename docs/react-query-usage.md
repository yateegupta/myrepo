# React Query Usage Guide

This document provides examples of how to use React Query in the application.

## Basic Query

```typescript
import { useOrders } from '@/lib/hooks/use-orders';

function OrdersList() {
  const { data, isLoading, error } = useOrders();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.map(order => (
        <div key={order.id}>{order.hospitalName}</div>
      ))}
    </div>
  );
}
```

## Query with Filter

```typescript
import { useOrders } from '@/lib/hooks/use-orders';

function PendingOrders() {
  const { data, isLoading } = useOrders('PENDING');

  // ... render logic
}
```

## Mutation

```typescript
import { useUpdateOrderStatus } from '@/lib/hooks/use-orders';

function OrderActions({ orderId }: { orderId: string }) {
  const updateStatus = useUpdateOrderStatus();

  const handleComplete = () => {
    updateStatus.mutate(
      { id: orderId, status: 'COMPLETED' },
      {
        onSuccess: () => {
          console.log('Order completed successfully');
        },
        onError: (error) => {
          console.error('Failed to update order:', error);
        },
      }
    );
  };

  return (
    <button onClick={handleComplete} disabled={updateStatus.isPending}>
      {updateStatus.isPending ? 'Updating...' : 'Complete Order'}
    </button>
  );
}
```

## Custom Hook Pattern

Create custom hooks in `lib/hooks/` following this pattern:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useResource(id?: string) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const response = await fetch(`/api/resource/${id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource'] });
    },
  });
}
```

## Configuration

The React Query client is configured in `lib/react-query.ts` with these defaults:

- **staleTime**: 60 seconds - Data is considered fresh for 1 minute
- **gcTime**: 5 minutes - Unused data is garbage collected after 5 minutes
- **refetchOnWindowFocus**: false - Don't refetch when window regains focus
- **retry**: 1 - Retry failed requests once

## Best Practices

1. **Query Keys**: Use descriptive, hierarchical query keys
   - `['orders']` - All orders
   - `['orders', 'PENDING']` - Filtered orders
   - `['orders', id]` - Single order

2. **Invalidation**: Invalidate related queries after mutations

   ```typescript
   queryClient.invalidateQueries({ queryKey: ['orders'] });
   ```

3. **Optimistic Updates**: For immediate UI feedback

   ```typescript
   onMutate: async (newData) => {
     await queryClient.cancelQueries({ queryKey: ['orders'] });
     const previous = queryClient.getQueryData(['orders']);
     queryClient.setQueryData(['orders'], (old) => [...old, newData]);
     return { previous };
   },
   onError: (err, newData, context) => {
     queryClient.setQueryData(['orders'], context.previous);
   },
   ```

4. **Error Handling**: Always handle loading and error states
