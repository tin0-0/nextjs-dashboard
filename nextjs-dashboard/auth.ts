// /auth.ts
import NextAuth from 'next-auth';
import authConfig from '@/auth.config'; 
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { Pool } from 'pg'; // Secure connection pooling for your Supabase database instance
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

// Set up a connection pool pointing directly to your Supabase connection string
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, 
});

async function getUser(email: string): Promise<User | undefined> {
  try {
    // Parameterized string format query to match database roles securely
    const result = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0]; // FIX: Pick the first matched user object instead of returning the full array
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials matching failed.');
        return null;
      },
    }),
  ],
});
