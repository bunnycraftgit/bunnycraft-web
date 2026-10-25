import bcrypt from "bcryptjs";

import { CATEGORIES, FILAMENTS, PRODUCTS, REVIEW_POOL, img, printImage } from "@bunnycraft/shared/src/lib/catalog-data";
import { sequelize } from "../client";
import {
  AdminUser,
  Category,
  Coupon,
  Filament,
  PricingSettings,
  Product,
  Review,
  User,
} from "../models";

async function main() {
  console.log("Seeding categories...");
  const categoryBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const values = { name: c.name, description: c.description, image: printImage(c.imageIndex, 700, 700) };
    const [category, created] = await Category.findOrCreate({
      where: { slug: c.slug },
      defaults: { ...values, slug: c.slug },
    });
    if (!created) await category.update(values);
    categoryBySlug.set(c.slug, category.id);
  }

  console.log("Seeding filaments...");
  for (const f of FILAMENTS) {
    await Filament.findOrCreate({ where: { id: f.id }, defaults: { ...f, colors: [...f.colors] } });
  }

  console.log("Seeding pricing settings...");
  await PricingSettings.findOrCreate({
    where: { id: 1 },
    defaults: {
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
    const [product] = await Product.findOrCreate({
      where: { slug: p.slug },
      defaults: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: "compareAtPrice" in p ? (p.compareAtPrice ?? null) : null,
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
      await Review.create({
        productId: product.id,
        authorName: r.authorName,
        rating: r.rating,
        comment: r.comment,
        photoUrl: img(`avatar-${r.authorName}`, 128, 128),
      });
    }
    const avgRating = picks.reduce((sum, r) => sum + r.rating, 0) / Math.max(picks.length, 1);
    await Product.update(
      { rating: Math.round(avgRating * 10) / 10, reviewCount: picks.length },
      { where: { id: product.id } }
    );
  }

  console.log("Seeding coupons...");
  await Coupon.findOrCreate({
    where: { code: "WELCOME10" },
    defaults: { code: "WELCOME10", discountType: "PERCENT", value: 10, active: true },
  });
  await Coupon.findOrCreate({
    where: { code: "SHIP5" },
    defaults: { code: "SHIP5", discountType: "FIXED", value: 5, minSubtotal: 30, active: true },
  });

  console.log("Seeding users...");
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const demoPassword = await bcrypt.hash("Demo1234!", 10);

  await User.findOrCreate({
    where: { email: "admin@bunnycraft.com" },
    defaults: {
      name: "BunnyCraft Admin",
      email: "admin@bunnycraft.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  await User.findOrCreate({
    where: { email: "demo@bunnycraft.com" },
    defaults: {
      name: "Demo Customer",
      email: "demo@bunnycraft.com",
      passwordHash: demoPassword,
      role: "CUSTOMER",
    },
  });

  console.log("Seeding admin users...");
  // Separate table from User entirely — this is the only way an admin
  // account gets created (no self-service signup in the admin app).
  await AdminUser.findOrCreate({
    where: { email: "admin@bunnycraft.com" },
    defaults: {
      name: "BunnyCraft Admin",
      email: "admin@bunnycraft.com",
      passwordHash: adminPassword,
    },
  });

  console.log("\nSeed complete.");
  console.log("  Admin login:    admin@bunnycraft.com / Admin123! (AdminUser table)");
  console.log("  Customer login: demo@bunnycraft.com / Demo1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
