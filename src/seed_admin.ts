import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  const admins = [
    { email: 'admin@gmail.com', password: 'admin123', artist_name: 'Super Admin', real_name: 'Administrator 1' },
    { email: 'admin2@gmail.com', password: 'admin123', artist_name: 'Admin Skena', real_name: 'Administrator 2' },
  ];

  for (const adm of admins) {
    const existingUser = await prisma.user.findUnique({ where: { email: adm.email } });

    if (existingUser) {
      await prisma.user.update({
        where: { email: adm.email },
        data: {
          account_type: 'ADMIN',
        }
      });
      console.log(`Updated existing user ${adm.email} to ADMIN.`);
    } else {
      const password_hash = await bcrypt.hash(adm.password, 10);
      await prisma.user.create({
        data: {
          email: adm.email,
          password_hash,
          account_type: 'ADMIN',
          email_verified: true,
          musician_profile: {
            create: {
              artist_name: adm.artist_name,
              real_name: adm.real_name,
              is_verified: true,
              verification_status: 'APPROVED',
            }
          }
        }
      });
      console.log(`Created new ADMIN user: ${adm.email}`);
    }
  }
}

seedAdmin()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
