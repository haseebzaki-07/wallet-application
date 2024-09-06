import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prisma from '@repo/db/clients';

export const authOptions = {
  providers: [
  
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' , placeholder : "enter your email "},
        password: { label: 'Password', type: 'password' , placeholder : "enter your password "},
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find the merchant by email
        const merchant = await prisma.merchant.findUnique({
          where: { email: credentials.email },
        });

        // If merchant exists and password matches, return the merchant
        if (merchant && await bcrypt.compare(credentials.password, merchant.password)) {
          return { id: merchant.id, email: merchant.email, name: merchant.name };
        }

        const hashedPassword = await bcrypt.hash(credentials.password, 12);
        const newMerchant = await prisma.merchant.create({
          data: {
            email: credentials.email,
            password: hashedPassword,
            auth_type: 'Credentials',
          },
        });

        return { id: newMerchant.id, email: newMerchant.email, name: newMerchant.name };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token-merchant`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token-merchant`,
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
      if (token?.sub) {
        session.user.id = token.sub; // Assign the user ID from the token to the session
      }
      return session;
    },
    async jwt({ token, user }: any) {
      // Attach user info to the token on sign-in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  }
};
