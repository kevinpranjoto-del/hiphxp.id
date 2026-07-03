import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/shared/auth';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Platform super administrator' },
    { name: 'ADMIN', description: 'Administrator' },
    { name: 'EDITOR', description: 'Editor' },
    { name: 'WRITER', description: 'Writer' },
    { name: 'MUSICIAN', description: 'Musician account' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name as any },
      update: {},
      create: role,
    });
  }

  const passwordHash = await hashPassword('Password123!');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hiphxp.id' },
    update: {},
    create: {
      email: 'admin@hiphxp.id',
      password_hash: passwordHash,
      account_type: 'SUPER_ADMIN',
      role: { connect: { name: 'SUPER_ADMIN' } },
      email_verified: true,
    },
  });

  await prisma.article.createMany({
    data: [
      {
        title: 'Maintenance Mode',
        slug: 'maintenance-mode',
        content: 'Platform sedang dibangun. Backend dan database siap untuk pengembangan lanjutan.',
        status: 'PUBLISHED',
        seo_title: 'Maintenance Mode',
        meta_description: 'Platform Hip-Hop Indonesia sedang dalam tahap pengembangan.',
        view_count: 12,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.activityLog.create({
    data: {
      user_id: admin.id,
      action: 'CREATE',
      entity_type: 'seed',
      details: 'Initial seed executed',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
