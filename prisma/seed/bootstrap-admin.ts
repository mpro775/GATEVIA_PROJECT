import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function bootstrap(): Promise<void> {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password)
    throw new Error('ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD are required.');
  if (password.length < 16)
    throw new Error('Bootstrap password must contain at least 16 characters.');
  const role = await prisma.role.findUnique({ where: { key: 'super_admin' } });
  if (!role) throw new Error('Run the system seed before bootstrapping an administrator.');
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    throw new Error('An account with this email already exists; bootstrap will not overwrite it.');
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
  await prisma.user.create({
    data: {
      email,
      displayName: 'Super Administrator',
      passwordHash,
      status: 'active',
      mustChangePassword: true,
      roles: { create: { roleId: role.id } },
    },
  });
  process.stdout.write(
    'Super administrator created. Remove bootstrap values from the environment and change the password on first sign-in.\n',
  );
}

bootstrap().finally(async () => prisma.$disconnect());
