import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Bersihkan data (urutan menghormati foreign key)
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  const [rina, budi, sari] = await Promise.all([
    prisma.user.create({
      data: { name: 'Rina Maharani', email: 'rina@connectspace.test', password, bio: 'Product designer. Suka kopi dan sketsa.', avatar: 'https://i.pravatar.cc/150?img=47' },
    }),
    prisma.user.create({
      data: { name: 'Budi Santoso', email: 'budi@connectspace.test', password, bio: 'Backend engineer, penggemar Express.', avatar: 'https://i.pravatar.cc/150?img=12' },
    }),
    prisma.user.create({
      data: { name: 'Sari Wulandari', email: 'sari@connectspace.test', password, bio: 'Junior web programmer.', avatar: 'https://i.pravatar.cc/150?img=32' },
    }),
  ]);

  const p1 = await prisma.post.create({
    data: { userId: rina.id, content: 'Selamat datang di ConnectSpace! Ruang ngobrol internal tim kita.', createdAt: new Date(Date.now() - 3 * 3600_000) },
  });
  const p2 = await prisma.post.create({
    data: { userId: budi.id, content: 'Pemandangan dari kantor pagi ini.', image: 'https://picsum.photos/seed/connectspace1/900/560', createdAt: new Date(Date.now() - 2 * 3600_000) },
  });
  const p3 = await prisma.post.create({
    data: { userId: sari.id, content: 'Baru selesai belajar Prisma migration. Mantap!', createdAt: new Date(Date.now() - 3600_000) },
  });

  await prisma.like.createMany({
    data: [
      { userId: budi.id, postId: p1.id },
      { userId: sari.id, postId: p1.id },
      { userId: rina.id, postId: p2.id },
      { userId: rina.id, postId: p3.id },
    ],
  });

  await prisma.comment.createMany({
    data: [
      { postId: p1.id, userId: budi.id, comment: 'Siap, semangat semuanya!' },
      { postId: p2.id, userId: sari.id, comment: 'Bagus banget pemandangannya.', image: 'https://picsum.photos/seed/connectspace2/600/400' },
      { postId: p3.id, userId: budi.id, comment: 'Keren, lanjut ke relasi many-to-many ya.' },
    ],
  });

  console.log('Seeder selesai. Login demo: rina@connectspace.test / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
