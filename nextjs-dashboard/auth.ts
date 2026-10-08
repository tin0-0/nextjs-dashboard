// /auth.ts
import NextAuth from 'next-auth';
import authConfig from './auth.config'; 
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { Pool } from 'pg'; // Secure connection pooling for your Supabase database instance
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcryptjs';

// Set up a connection pool pointing directly to your Supabase connection string
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, 
});

async function getUser(email: string): Promise<User | undefined> {
  try {
    const result = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0]; // Returns the single matched user profile record
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

// FIX: Added 'handlers' to the destructive export mapping signature block
export const { handlers, auth, signIn, signOut } = NextAuth({
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
          
          console.log('--- LOGIN DEBUG ---');
          console.log('User found in Supabase database:', !!user);
          
          if (user) {
            console.log('Entered Password string:', password);
            console.log('Database Encrypted Hash String:', user.password);
            
            const passwordsMatch = await bcrypt.compare(password, user.password);
            console.log('Do Passwords Match?:', passwordsMatch);
            console.log('-------------------');
            
            if (passwordsMatch) return user;
          }
        }

        console.log('Invalid credentials matching logic fallback triggered.');
        return null;
      },
    }),
  ],
});
