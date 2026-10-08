// /app/lib/actions.ts
'use server';

import { z } from 'zod';
import { Pool } from 'pg'; // Replaced @vercel/postgres with your standard Supabase connection pool
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth'; 
import { AuthError } from 'next-auth'; 

// Initialize your connection pool pointing directly to your Supabase string
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// 1. Zod Parsing Form Validation Schemas
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than \$0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// 2. State Type Contract for Form State Handlers
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

// 3. Create Invoice Server Action (Supabase Safe Pool Connection)
export async function createInvoice(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    // Parameterized string format query to match database pooling safely
    await pool.query(
      'INSERT INTO invoices (customer_id, amount, status, date) VALUES ($1, $2, $3, $4)',
      [customerId, amountInCents, status, date]
    );
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// 4. Update Invoice Server Action (Supabase Safe Pool Connection)
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
): Promise<State> {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    // Parameterized string format query to match database pooling safely
    await pool.query(
      'UPDATE invoices SET customer_id = $1, amount = $2, status = $3 WHERE id = $4',
      [customerId, amountInCents, status, id]
    );
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// 5. Delete Invoice Server Action (Supabase Safe Pool Connection)
export async function deleteInvoice(id: string) {
  try {
    // Parameterized string format query to match database pooling safely
    await pool.query('DELETE FROM invoices WHERE id = $1', [id]);
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

// 6. Authenticate Form Handler Action (Chapter 14 Entry Point)
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
