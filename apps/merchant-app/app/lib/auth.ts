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
          console.log("merchant id in db:" + merchant.id);
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
        console.log("Merchant id when hnew user created" + newMerchant.id)
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
      // Ensure that the session user ID comes from your database, not from Google’s large ID
      
      if (token.id) {
        session.user.id = token.id;
      }
    
      return session;
    }
    ,
    async jwt({ token, user, account, profile }: any) {
      // If a user is logging in for the first time, `user` will be defined
      if (user) {
        // For CredentialsProvider (email/password)
        token.id = user.id;
      }
    
      // For GoogleProvider, map the Google user to the merchant in the database
      if (account?.provider === 'google') {
        const merchant = await prisma.merchant.findUnique({
          where: { email: token.email as string }, // Assuming you store Google email in your database
        });
        
        if (merchant) {
          // Use the merchant's ID from the database
          token.id = merchant.id;
        } else {
          // Handle case where Google login doesn't map to any merchant in the DB
          console.error('No matching merchant found for Google account');
        }
      }
    
      return token;
    }
    
  }
};
