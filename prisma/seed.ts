import { PrismaClient, DiscountType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

import { CATEGORIES, FILAMENTS, PRODUCTS, REVIEW_POOL, img, printImage } from "../src/lib/catalog-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories...");
  const categoryBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, image: printImage(c.imageIndex, 700, 700) },
      create: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: printImage(c.imageIndex, 700, 700),
      },
    });
    categoryBySlug.set(c.slug, category.id);
  }

  console.log("Seeding filaments...");
  for (const f of FILAMENTS) {
    await prisma.filament.upsert({
      where: { id: f.id },
      update: {},
      create: { ...f, colors: f.colors },
    });
  }

  console.log("Seeding pricing settings...");
  await prisma.pricingSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      machineRatePerHour: 2.5,
      printSpeedGramsPerHour: 20,
      finishingCostFlat: 2,
      infillFactor: 0.3,
      shapeFactor: 0.55,
      minimumPrice: 10,
    },
  });

  console.log("Seeding products...");
  const createdProducts: { id: string; slug: string }[] = [];
  for (const [i, p] of PRODUCTS.entries()) {
    const categoryId = categoryBySlug.get(p.categorySlug)!;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: "compareAtPrice" in p ? p.compareAtPrice : undefined,
        images: [printImage(i), printImage(i + 3), printImage(i + 6)],
        material: p.material,
        tags: [...p.tags],
        featured: "featured" in p ? (p.featured ?? false) : false,
        stock: 15 + Math.floor(Math.random() * 40),
        categoryId,
        rating: 0,
        reviewCount: 0,
      },
    });
    createdProducts.push({ id: product.id, slug: product.slug });
  }

  console.log("Seeding reviews...");
  for (const product of createdProducts) {
    const reviewCount = 2 + Math.floor(Math.random() * 3);
    const picks = [...REVIEW_POOL].sort(() => Math.random() - 0.5).slice(0, reviewCount);
    for (const r of picks) {
      await prisma.review.create({
        data: {
          productId: product.id,
          authorName: r.authorName,
          rating: r.rating,
          comment: r.comment,
          photoUrl: img(`avatar-${r.authorName}`, 128, 128),
        },
      });
    }
    const avgRating =
      picks.reduce((sum, r) => sum + r.rating, 0) / Math.max(picks.length, 1);
    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: picks.length,
      },
    });
  }

  console.log("Seeding coupons...");
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discountType: DiscountType.PERCENT,
      value: 10,
      active: true,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "SHIP5" },
    update: {},
    create: {
      code: "SHIP5",
      discountType: DiscountType.FIXED,
      value: 5,
      minSubtotal: 30,
      active: true,
    },
  });

  console.log("Seeding users...");
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const demoPassword = await bcrypt.hash("Demo1234!", 10);

  await prisma.user.upsert({
    where: { email: "admin@bunnycraft.com" },
    update: {},
    create: {
      name: "BunnyCraft Admin",
      email: "admin@bunnycraft.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "demo@bunnycraft.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "demo@bunnycraft.com",
      passwordHash: demoPassword,
      role: Role.CUSTOMER,
    },
  });

  console.log("\nSeed complete.");
  console.log("  Admin login:    admin@bunnycraft.com / Admin123!");
  console.log("  Customer login: demo@bunnycraft.com / Demo1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
