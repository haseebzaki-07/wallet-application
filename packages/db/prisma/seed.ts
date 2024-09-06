import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPasswordHaseeb = await bcrypt.hash('haseeb', 10);
  const hashedPasswordFarhan = await bcrypt.hash('farhan', 10);

  const Haseeb = await prisma.user.upsert({
    where: { number: '9999999999' },
    update: {
      password: hashedPasswordHaseeb, // Ensure the password is updated
    },
    create: {
      number: '9999999999',
      password: hashedPasswordHaseeb,
      name: 'haseeb',
      OnRampTransaction: {
        create: {
          startTime: new Date(),
          status: 'Success',
          amount: 20000,
          token: '122',
          provider: 'HDFC Bank',
        },
      },
      Balance: {
        create: {
          amount: 5000000,
          locked: 1000000,
        },
      },
    },
  });

  const Farhan = await prisma.user.upsert({
    where: { number: '9999999998' },
    update: {
      password: hashedPasswordFarhan, // Ensure the password is updated
    },
    create: {
      number: '9999999998',
      password: hashedPasswordFarhan,
      name: 'farhan',
      OnRampTransaction: {
        create: {
          startTime: new Date(),
          status: 'Failure',
          amount: 2000,
          token: '123',
          provider: 'HDFC Bank',
        },
      },
      Balance: {
        create: {
          amount: 7000000,
          locked: 1500000,
        },
      },
    },
  });

  console.log({ Haseeb, Farhan });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
