// /app/ui/invoices/edit-form.tsx
'use client';

import { useActionState } from 'react';
import { updateInvoice, State } from '@/app/lib/actions';

export default function EditInvoiceForm({ invoice, customers }: { invoice: any, customers: any[] }) {
  const initialState: State = { message: null, errors: {} };
  
  // 1. Bind the id first. The function will accept (prevState, formData) down the line.
  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
  
  // 2. Use the bound action configuration inside the hook
  const [state, formAction] = useActionState(updateInvoiceWithId, initialState);

  return (
    <form action={formAction}>
       {/* Make sure your form elements use state.errors?.amount etc. cleanly */}
    </form>
  );
}
