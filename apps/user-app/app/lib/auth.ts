import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import db from '@repo/db/clients';

// Schema for signup (new user creation)
const signupSchema = z.object({
  phone: z.string().min(1, 'Phone number is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
});

// Schema for login (existing user)
const loginSchema = z.object({
  phone: z.string().min(1, 'Phone number is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: {
          label: 'Phone number',
          type: 'text',
          placeholder: 'Enter your phone number',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Enter your password',
        },
        name: {
          label: 'Name (for signup)',
          type: 'text',
          placeholder: 'Enter your name',
        },
        email: {
          label: 'Email (for signup)',
          type: 'text',
          placeholder: 'Enter your email',
        },
      },
      async authorize(credentials) {
        const { phone, password, name, email } = credentials || {};

        try {
          // Attempt login if the user exists
          const existingUser = await db.user.findUnique({ where: { number: phone } });

          if (existingUser) {
            // Validate login credentials
            const parsed = loginSchema.safeParse({ phone, password });
            if (!parsed.success) {
              throw new Error('Invalid login data. ' + parsed.error.errors.map(e => e.message).join(', '));
            }

            // Check password
            const passwordValid = await bcrypt.compare(password, existingUser.password);
            if (!passwordValid) throw new Error('Invalid phone number or password.');

            // Successful login
            return {
              id: existingUser.id.toString(),
              name: existingUser.name,
              email: existingUser.email,
              number: existingUser.number,
            };
          } else {
            // User doesn't exist: proceed with signup
            const parsed = signupSchema.safeParse({ phone, password, name, email });
            if (!parsed.success) {
              throw new Error('Invalid signup data. ' + parsed.error.errors.map(e => e.message).join(', '));
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await db.user.create({
              data: { number: phone, password: hashedPassword, name, email },
            });

            // Successful signup
            return {
              id: newUser.id.toString(),
              name: newUser.name,
              email: newUser.email,
              number: newUser.number,
            };
          }
        } catch (error) {
          console.error('Error in authorize:', error.message);
          throw new Error('Authentication failed. ' + error.message);
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token-user',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token-user',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      },
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id; // Attach user ID to session
      if (token?.number) session.user.number = token.number; // Attach phone number
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Store user ID in the JWT token
        token.number = user.number; // Store phone number in JWT
      }
      return token;
    },
  },
};
