import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = 'admin@gmail.com';
  const password = 'admin123';
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: {
        account_type: 'ADMIN',
      }
    });
    console.log(`Updated existing user ${email} to ADMIN.`);
  } else {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        account_type: 'ADMIN',
        email_verified: true,
        musician_profile: {
          create: {
            artist_name: 'Super Admin',
            real_name: 'Administrator',
            is_verified: true,
            verification_status: 'APPROVED',
          }
        }
      }
    });
    console.log(`Created new ADMIN user: ${email}`);
  }
}

seedAdmin()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
