import { createId } from "@paralleldrive/cuid2";
import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type ModelStatic,
  type NonAttribute,
} from "sequelize";

import { sequelize } from "./client";
import {
  DISCOUNT_TYPES,
  ORDER_ITEM_KINDS,
  ORDER_STATUSES,
  PRODUCT_STATUSES,
  ROLES,
  STRENGTH_RATINGS,
  type DiscountType,
  type OrderItemKind,
  type OrderStatus,
  type ProductStatus,
  type Role,
  type StrengthRating,
} from "./enums";

// Column definitions mirror the schema Prisma originally created, so the
// existing database works unchanged: same table names, column names, types
// (VARCHAR(191), DATETIME(3), DECIMAL(p,s), JSON, ENUM) and index names.
//
// Each model sets `modelName` explicitly: production builds minify class
// names, and Sequelize otherwise derives model names (and SQL aliases) from them.
//
// Every helper returns a fresh object: Sequelize mutates attribute
// definitions in place (e.g. sets `field`), so sharing one object between
// columns makes them alias each other.

const pk = () => ({
  type: DataTypes.STRING(191),
  primaryKey: true,
  defaultValue: () => createId(),
});
const str = (allowNull = false) => ({ type: DataTypes.STRING(191), allowNull });
const text = (allowNull = false) => ({ type: DataTypes.TEXT, allowNull });
const decimal = (precision: number, scale: number, allowNull = false) => ({
  type: DataTypes.DECIMAL(precision, scale),
  allowNull,
});
const timestamp = () => ({ type: DataTypes.DATE(3), allowNull: false });

export type ProductSpec = { label: string; value: string };
export type FilamentColor = { name: string; hex: string };

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

// Credentials-only auth (no OAuth), JWT session strategy -> no NextAuth
// Account/Session/VerificationToken tables needed.
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare name: string | null;
  declare email: string;
  declare passwordHash: string;
  declare role: CreationOptional<Role>;
  declare image: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare addresses?: NonAttribute<Address[]>;
  declare orders?: NonAttribute<Order[]>;
}

User.init(
  {
    id: pk(),
    name: str(true),
    email: str(),
    passwordHash: str(),
    role: { type: DataTypes.ENUM(...ROLES), allowNull: false, defaultValue: "CUSTOMER" },
    image: str(true),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    sequelize,
    modelName: "User",
    tableName: "User",
    indexes: [{ name: "User_email_key", unique: true, fields: ["email"] }],
  }
);

// Deliberately separate from User — admin and customer accounts share no
// table, no relation, and (per the Multi-Zones auth split) no session/cookie
// namespace either. No self-service signup: rows only ever get created via
// the seed script.
export class AdminUser extends Model<
  InferAttributes<AdminUser>,
  InferCreationAttributes<AdminUser>
> {
  declare id: CreationOptional<string>;
  declare name: string | null;
  declare email: string;
  declare passwordHash: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AdminUser.init(
  {
    id: pk(),
    name: str(true),
    email: str(),
    passwordHash: str(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    sequelize,
    modelName: "AdminUser",
    tableName: "AdminUser",
    indexes: [{ name: "AdminUser_email_key", unique: true, fields: ["email"] }],
  }
);

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export class Category extends Model<InferAttributes<Category>, InferCreationAttributes<Category>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare slug: string;
  declare description: CreationOptional<string | null>;
  declare image: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;

  declare products?: NonAttribute<Product[]>;
}

Category.init(
  {
    id: pk(),
    name: str(),
    slug: str(),
    description: text(true),
    image: str(true),
    createdAt: timestamp(),
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "Category",
    updatedAt: false,
    indexes: [{ name: "Category_slug_key", unique: true, fields: ["slug"] }],
  }
);

export class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare slug: string;
  declare description: string;
  declare price: number;
  declare compareAtPrice: CreationOptional<number | null>;
  declare images: string[];
  declare material: CreationOptional<string | null>;
  declare tags: CreationOptional<string[] | null>;
  declare specifications: CreationOptional<ProductSpec[] | null>;
  declare stock: CreationOptional<number>;
  declare rating: CreationOptional<number>;
  declare reviewCount: CreationOptional<number>;
  declare featured: CreationOptional<boolean>;
  declare status: CreationOptional<ProductStatus>;
  declare categoryId: ForeignKey<Category["id"]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare category?: NonAttribute<Category>;
}

Product.init(
  {
    id: pk(),
    name: str(),
    slug: str(),
    description: text(),
    price: decimal(10, 2),
    compareAtPrice: decimal(10, 2, true),
    images: { type: DataTypes.JSON, allowNull: false },
    material: str(true),
    tags: { type: DataTypes.JSON, allowNull: true },
    specifications: { type: DataTypes.JSON, allowNull: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 25 },
    rating: { ...decimal(2, 1), defaultValue: 0 },
    reviewCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    status: {
      type: DataTypes.ENUM(...PRODUCT_STATUSES),
      allowNull: false,
      defaultValue: "LIVE",
    },
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "Product",
    indexes: [
      { name: "Product_slug_key", unique: true, fields: ["slug"] },
      { name: "Product_categoryId_idx", fields: ["categoryId"] },
    ],
  }
);

export class Filament extends Model<InferAttributes<Filament>, InferCreationAttributes<Filament>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare type: string;
  declare colors: FilamentColor[];
  declare pricePerGram: number;
  declare density: number;
  declare stockGrams: CreationOptional<number>;
  declare strength: CreationOptional<StrengthRating>;
  declare finish: string;
  declare description: string;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Filament.init(
  {
    id: pk(),
    name: str(),
    type: str(),
    colors: { type: DataTypes.JSON, allowNull: false },
    pricePerGram: decimal(6, 3),
    density: decimal(4, 2),
    stockGrams: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5000 },
    strength: {
      type: DataTypes.ENUM(...STRENGTH_RATINGS),
      allowNull: false,
      defaultValue: "MEDIUM",
    },
    finish: str(),
    description: text(),
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  { sequelize, modelName: "Filament", tableName: "Filament" }
);

// ---------------------------------------------------------------------------
// Settings (singleton rows, id always 1)
// ---------------------------------------------------------------------------

// Tunable constants the pricing engine (lib/pricing.ts) uses to turn
// geometry into a quote.
export class PricingSettings extends Model<
  InferAttributes<PricingSettings>,
  InferCreationAttributes<PricingSettings>
> {
  declare id: CreationOptional<number>;
  declare machineRatePerHour: CreationOptional<number>;
  declare printSpeedGramsPerHour: CreationOptional<number>;
  declare finishingCostFlat: CreationOptional<number>;
  declare infillFactor: CreationOptional<number>;
  declare shapeFactor: CreationOptional<number>;
  declare minimumPrice: CreationOptional<number>;
  declare updatedAt: CreationOptional<Date>;
}

PricingSettings.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
    machineRatePerHour: { ...decimal(6, 2), defaultValue: 2.5 },
    printSpeedGramsPerHour: { ...decimal(6, 2), defaultValue: 20 },
    finishingCostFlat: { ...decimal(6, 2), defaultValue: 2 },
    infillFactor: { ...decimal(4, 3), defaultValue: 0.3 },
    shapeFactor: { ...decimal(4, 3), defaultValue: 0.55 },
    minimumPrice: { ...decimal(6, 2), defaultValue: 10 },
    updatedAt: timestamp(),
  },
  { sequelize, modelName: "PricingSettings", tableName: "PricingSettings", createdAt: false }
);

// The UPI QR shown at the end of checkout. Edited from the admin Settings page.
export class PaymentSettings extends Model<
  InferAttributes<PaymentSettings>,
  InferCreationAttributes<PaymentSettings>
> {
  declare id: CreationOptional<number>;
  declare qrImageUrl: CreationOptional<string | null>;
  declare upiId: CreationOptional<string | null>;
  declare payeeName: CreationOptional<string | null>;
  declare updatedAt: CreationOptional<Date>;
}

PaymentSettings.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
    qrImageUrl: str(true),
    upiId: str(true),
    payeeName: str(true),
    updatedAt: timestamp(),
  },
  { sequelize, modelName: "PaymentSettings", tableName: "PaymentSettings", createdAt: false }
);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]> | null;
  declare guestEmail: CreationOptional<string | null>;
  declare status: CreationOptional<OrderStatus>;
  declare subtotal: number;
  declare discountTotal: CreationOptional<number>;
  declare shippingTotal: CreationOptional<number>;
  declare total: number;
  declare couponCode: CreationOptional<string | null>;
  // Manual UPI payment: customer scans the store QR, pays, and uploads a
  // screenshot. An admin checks it and moves the order to PROCESSING.
  declare paymentProofUrl: CreationOptional<string | null>;
  declare paymentReference: CreationOptional<string | null>;
  declare paymentSubmittedAt: CreationOptional<Date | null>;
  declare shippingName: string;
  declare shippingLine1: string;
  declare shippingLine2: CreationOptional<string | null>;
  declare shippingCity: string;
  declare shippingState: string;
  declare shippingZip: string;
  declare shippingCountry: string;
  declare trackingNumber: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare user?: NonAttribute<User | null>;
  declare items?: NonAttribute<OrderItem[]>;
}

Order.init(
  {
    id: pk(),
    guestEmail: str(true),
    status: {
      type: DataTypes.ENUM(...ORDER_STATUSES),
      allowNull: false,
      defaultValue: "PENDING_PAYMENT",
    },
    subtotal: decimal(10, 2),
    discountTotal: { ...decimal(10, 2), defaultValue: 0 },
    shippingTotal: { ...decimal(10, 2), defaultValue: 0 },
    total: decimal(10, 2),
    couponCode: str(true),
    paymentProofUrl: str(true),
    paymentReference: str(true),
    paymentSubmittedAt: { type: DataTypes.DATE(3), allowNull: true },
    shippingName: str(),
    shippingLine1: str(),
    shippingLine2: str(true),
    shippingCity: str(),
    shippingState: str(),
    shippingZip: str(),
    shippingCountry: str(),
    trackingNumber: str(true),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "Order",
    indexes: [{ name: "Order_userId_idx", fields: ["userId"] }],
  }
);

export class OrderItem extends Model<
  InferAttributes<OrderItem>,
  InferCreationAttributes<OrderItem>
> {
  declare id: CreationOptional<string>;
  declare orderId: ForeignKey<Order["id"]>;
  declare productId: ForeignKey<Product["id"]> | null;
  declare filamentId: ForeignKey<Filament["id"]> | null;
  declare kind: OrderItemKind;
  declare name: string;
  declare quantity: number;
  declare unitPrice: number;
  // Snapshot of the customize-wizard configuration, only set when kind = CUSTOM
  declare fileUrl: CreationOptional<string | null>;
  declare fileName: CreationOptional<string | null>;
  declare fileType: CreationOptional<string | null>;
  declare heightMm: CreationOptional<number | null>;
  declare widthMm: CreationOptional<number | null>;
  declare depthMm: CreationOptional<number | null>;
  declare estWeightGrams: CreationOptional<number | null>;
  declare estPrintHours: CreationOptional<number | null>;

  declare order?: NonAttribute<Order>;
}

OrderItem.init(
  {
    id: pk(),
    kind: { type: DataTypes.ENUM(...ORDER_ITEM_KINDS), allowNull: false },
    name: str(),
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unitPrice: decimal(10, 2),
    fileUrl: str(true),
    fileName: str(true),
    fileType: str(true),
    heightMm: decimal(8, 2, true),
    widthMm: decimal(8, 2, true),
    depthMm: decimal(8, 2, true),
    estWeightGrams: decimal(8, 2, true),
    estPrintHours: decimal(6, 2, true),
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "OrderItem",
    timestamps: false,
    indexes: [{ name: "OrderItem_orderId_idx", fields: ["orderId"] }],
  }
);

export class Coupon extends Model<InferAttributes<Coupon>, InferCreationAttributes<Coupon>> {
  declare id: CreationOptional<string>;
  declare code: string;
  declare discountType: DiscountType;
  declare value: number;
  declare minSubtotal: CreationOptional<number | null>;
  declare usageLimit: CreationOptional<number | null>;
  declare usedCount: CreationOptional<number>;
  declare active: CreationOptional<boolean>;
  declare expiresAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
}

Coupon.init(
  {
    id: pk(),
    code: str(),
    discountType: { type: DataTypes.ENUM(...DISCOUNT_TYPES), allowNull: false },
    value: decimal(10, 2),
    minSubtotal: decimal(10, 2, true),
    usageLimit: { type: DataTypes.INTEGER, allowNull: true },
    usedCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    expiresAt: { type: DataTypes.DATE(3), allowNull: true },
    createdAt: timestamp(),
  },
  {
    sequelize,
    modelName: "Coupon",
    tableName: "Coupon",
    updatedAt: false,
    indexes: [{ name: "Coupon_code_key", unique: true, fields: ["code"] }],
  }
);

// ---------------------------------------------------------------------------
// Customer data
// ---------------------------------------------------------------------------

export class WishlistItem extends Model<
  InferAttributes<WishlistItem>,
  InferCreationAttributes<WishlistItem>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;
  declare productId: ForeignKey<Product["id"]>;
  declare createdAt: CreationOptional<Date>;

  declare product?: NonAttribute<Product>;
}

WishlistItem.init(
  { id: pk(), createdAt: timestamp() },
  {
    sequelize,
    modelName: "WishlistItem",
    tableName: "WishlistItem",
    updatedAt: false,
    indexes: [
      {
        name: "WishlistItem_userId_productId_key",
        unique: true,
        fields: ["userId", "productId"],
      },
    ],
  }
);

export class Review extends Model<InferAttributes<Review>, InferCreationAttributes<Review>> {
  declare id: CreationOptional<string>;
  declare productId: ForeignKey<Product["id"]>;
  declare userId: ForeignKey<User["id"]> | null;
  declare authorName: string;
  declare rating: number;
  declare comment: string;
  declare photoUrl: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;

  declare product?: NonAttribute<Product>;
}

Review.init(
  {
    id: pk(),
    authorName: str(),
    rating: { type: DataTypes.INTEGER, allowNull: false },
    comment: text(),
    photoUrl: str(true),
    createdAt: timestamp(),
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "Review",
    updatedAt: false,
    indexes: [{ name: "Review_productId_idx", fields: ["productId"] }],
  }
);

// Customer testimonials added by hand in the admin panel and shown on the
// homepage (separate from per-product Review rows).
export class Testimonial extends Model<
  InferAttributes<Testimonial>,
  InferCreationAttributes<Testimonial>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare place: CreationOptional<string | null>;
  declare photoUrl: CreationOptional<string | null>;
  declare rating: CreationOptional<number>;
  declare comment: string;
  declare published: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Testimonial.init(
  {
    id: pk(),
    name: str(),
    place: str(true),
    photoUrl: str(true),
    rating: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
    comment: text(),
    published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  { sequelize, modelName: "Testimonial", tableName: "Testimonial" }
);

export class Address extends Model<InferAttributes<Address>, InferCreationAttributes<Address>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;
  declare fullName: string;
  declare line1: string;
  declare line2: CreationOptional<string | null>;
  declare city: string;
  declare state: string;
  declare zip: string;
  declare country: string;
  declare phone: CreationOptional<string | null>;
  declare isDefault: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
}

Address.init(
  {
    id: pk(),
    fullName: str(),
    line1: str(),
    line2: str(true),
    city: str(),
    state: str(),
    zip: str(),
    country: str(),
    phone: str(true),
    isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: timestamp(),
  },
  { sequelize, modelName: "Address", tableName: "Address", updatedAt: false }
);

export class NewsletterSubscriber extends Model<
  InferAttributes<NewsletterSubscriber>,
  InferCreationAttributes<NewsletterSubscriber>
> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare createdAt: CreationOptional<Date>;
}

NewsletterSubscriber.init(
  { id: pk(), email: str(), createdAt: timestamp() },
  {
    sequelize,
    modelName: "NewsletterSubscriber",
    tableName: "NewsletterSubscriber",
    updatedAt: false,
    indexes: [{ name: "NewsletterSubscriber_email_key", unique: true, fields: ["email"] }],
  }
);

export class ContactMessage extends Model<
  InferAttributes<ContactMessage>,
  InferCreationAttributes<ContactMessage>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string;
  declare subject: string;
  declare message: string;
  declare createdAt: CreationOptional<Date>;
}

ContactMessage.init(
  {
    id: pk(),
    name: str(),
    email: str(),
    subject: str(),
    message: text(),
    createdAt: timestamp(),
  },
  { sequelize, modelName: "ContactMessage", tableName: "ContactMessage", updatedAt: false }
);

// ---------------------------------------------------------------------------
// Associations — aliases match the relation names the app code uses.
// Referential actions match Prisma's defaults: required relations RESTRICT,
// optional ones SET NULL, plus the explicit cascades from the old schema.
// ---------------------------------------------------------------------------

function relate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parent: ModelStatic<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  child: ModelStatic<any>,
  opts: {
    foreignKey: string;
    as: string;
    inverseAs?: string;
    allowNull: boolean;
    onDelete: "CASCADE" | "RESTRICT" | "SET NULL";
  }
) {
  const foreignKey = {
    name: opts.foreignKey,
    allowNull: opts.allowNull,
    type: DataTypes.STRING(191),
  };
  const fk = { foreignKey, onDelete: opts.onDelete, onUpdate: "CASCADE" };
  child.belongsTo(parent, { ...fk, as: opts.as });
  if (opts.inverseAs) parent.hasMany(child, { ...fk, as: opts.inverseAs });
}

relate(Category, Product, {
  foreignKey: "categoryId",
  as: "category",
  inverseAs: "products",
  allowNull: false,
  onDelete: "RESTRICT",
});
relate(User, Order, {
  foreignKey: "userId",
  as: "user",
  inverseAs: "orders",
  allowNull: true,
  onDelete: "SET NULL",
});
relate(Order, OrderItem, {
  foreignKey: "orderId",
  as: "order",
  inverseAs: "items",
  allowNull: false,
  onDelete: "CASCADE",
});
relate(Product, OrderItem, {
  foreignKey: "productId",
  as: "product",
  inverseAs: "orderItems",
  allowNull: true,
  onDelete: "SET NULL",
});
relate(Filament, OrderItem, {
  foreignKey: "filamentId",
  as: "filament",
  inverseAs: "orderItems",
  allowNull: true,
  onDelete: "SET NULL",
});
relate(User, WishlistItem, {
  foreignKey: "userId",
  as: "user",
  inverseAs: "wishlistItems",
  allowNull: false,
  onDelete: "CASCADE",
});
relate(Product, WishlistItem, {
  foreignKey: "productId",
  as: "product",
  inverseAs: "wishlistItems",
  allowNull: false,
  onDelete: "CASCADE",
});
relate(Product, Review, {
  foreignKey: "productId",
  as: "product",
  inverseAs: "reviews",
  allowNull: false,
  onDelete: "CASCADE",
});
relate(User, Review, {
  foreignKey: "userId",
  as: "user",
  inverseAs: "reviews",
  allowNull: true,
  onDelete: "SET NULL",
});
relate(User, Address, {
  foreignKey: "userId",
  as: "user",
  inverseAs: "addresses",
  allowNull: false,
  onDelete: "CASCADE",
});
