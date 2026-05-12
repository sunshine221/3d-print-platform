// prisma/seed.ts — 初始化角色 + 管理员账号 + 示例分类
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. 角色
  const adminPermissions = [
    'product:read', 'product:write', 'product:delete',
    'category:read', 'category:write', 'category:delete',
    'order:read', 'order:write', 'order:status',
    'inquiry:read', 'inquiry:write', 'inquiry:quote',
    'user:read', 'user:manage',
    'content:read', 'content:write',
    'media:read', 'media:write',
    'system:read', 'system:write',
  ];

  const editorPermissions = [
    'product:read', 'product:write',
    'category:read',
    'order:read', 'order:status',
    'inquiry:read', 'inquiry:write', 'inquiry:quote',
    'user:read',
    'content:read', 'content:write',
    'media:read',
  ];

  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: { permissions: adminPermissions },
    create: { name: '管理员', slug: 'admin', permissions: adminPermissions },
  });

  const editorRole = await prisma.role.upsert({
    where: { slug: 'editor' },
    update: { permissions: editorPermissions },
    create: { name: '运营编辑', slug: 'editor', permissions: editorPermissions },
  });

  console.log(`Roles: ${adminRole.slug}, ${editorRole.slug}`);

  // 2. 管理员
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@ymbj.online' },
    update: {},
    create: {
      email: 'admin@ymbj.online',
      passwordHash,
      name: '系统管理员',
      roleId: adminRole.id,
    },
  });

  console.log('Admin: admin@ymbj.online / admin123');

  // 3. 示例分类
  const catData = [
    { name: '手办模型', slug: 'figures' },
    { name: '工业零件', slug: 'industrial' },
    { name: '建筑模型', slug: 'architecture' },
    { name: '艺术雕塑', slug: 'sculpture' },
  ];

  for (const cat of catData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log(`Categories: ${catData.map((c) => c.slug).join(', ')}`);

  // 4. 示例页面
  const pageData = [
    { title: '关于我们', slug: 'about', content: '<p>关于我们页面内容</p>', isSystem: true },
    { title: '材料介绍', slug: 'materials', content: '<p>材料介绍内容</p>', isSystem: true },
    { title: '打印指南', slug: 'guide', content: '<p>打印指南内容</p>', isSystem: true },
    { title: '联系我们', slug: 'contact', content: '<p>联系我们内容</p>', isSystem: true },
  ];

  for (const page of pageData) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  console.log(`Pages: ${pageData.map((p) => p.slug).join(', ')}`);
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
