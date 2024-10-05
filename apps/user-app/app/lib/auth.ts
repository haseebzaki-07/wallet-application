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
          placeholder: 'Enter your password',
          type: 'password',
        },
        name: {
          label: 'Name',
          type: 'text',
          placeholder: 'Enter your name (only for signup)',
        },
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'Enter your email (only for signup)',
        },
      },
      async authorize(credentials) {
        const { phone, password, name, email }: any = credentials;

        const existingUser = await db.user.findFirst({
          where: { number: phone },
        });

        if (existingUser) {
          const parsed = loginSchema.safeParse({ phone, password });

          if (!parsed.success) {
            throw new Error(parsed.error.errors.map((e) => e.message).join(', '));
          }

          const passwordValidation = await bcrypt.compare(password, existingUser.password);

          if (passwordValidation) {
            return {
              id: existingUser.id.toString(),
              name: existingUser.name,
              email: existingUser.email,
              number : existingUser.number
            };
          }

          throw new Error('Invalid phone number or password.');
        }

        const parsed = signupSchema.safeParse({ phone, password, name, email });

        if (!parsed.success) {
          throw new Error(parsed.error.errors.map((e) => e.message).join(', '));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
          const user = await db.user.create({
            data: {
              number: phone,
              password: hashedPassword,
              name,
              email,
            },
          });

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            number : user.number
          };
        } catch (e) {
          console.error(e);
          throw new Error('Failed to create user.');
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token-user`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token-user`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      },
    },
  },
 
  callbacks: {
    async session({ session, token }: any) {
      if (token?.id) {
        session.user.id = token.id; // Add the user ID from the token to the session
      }
      if (token?.number) {
        session.user.number = token.number; // Add the phone number to the session
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id; // Store user ID in the JWT token
        token.number = user.number; // Store user phone number in the JWT token
      }
      return token;
    },
  }
};
