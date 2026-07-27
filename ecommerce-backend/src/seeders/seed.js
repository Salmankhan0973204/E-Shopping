// ─── Database Seeder ────────────────────────────────────────────────────────
// Admin user + categories + products daalta hai database mein, schema follow karte hue.
// Re-run karna safe hai — jo already exist karta hai (email/name/sku se) usko skip kar dega.
// Run: npm run seed

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { User } from "../models/user.model.js";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";

const ADMIN_EMAIL = "admin@eshopping.com";
const ADMIN_PASSWORD = "Admin@123";

const categoriesData = [
  { name: "Electronics" },
  { name: "Fashion" },
  { name: "Home & Kitchen" },
  { name: "Sports & Outdoors" },
  { name: "Books" },
];

const placeholderImage = (seed) => ({
  url: `https://picsum.photos/seed/${seed}/800/800`,
  public_id: `seed/${seed}`,
});

const productsData = [
  // ─── Electronics ───────────────────────────────────────────────
  {
    name: "Wireless Bluetooth Headphones",
    slug: "wireless-bluetooth-headphones",
    shortDescription: "Over-ear headphones with active noise cancellation",
    fullDescription:
      "Enjoy immersive sound with 30-hour battery life, active noise cancellation, and a comfortable over-ear design perfect for travel and daily commutes.",
    category: "Electronics",
    brand: "SoundCore",
    price: 89.99,
    salePrice: 69.99,
    sku: "ELEC-HEAD-001",
    stock: 45,
    status: "active",
    isFeatured: true,
  },
  {
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    shortDescription: "Track heart rate, sleep, and workouts",
    fullDescription:
      "A sleek smartwatch with heart rate monitoring, sleep tracking, GPS, and a 7-day battery life. Water resistant up to 50m.",
    category: "Electronics",
    brand: "PulseFit",
    price: 129.99,
    sku: "ELEC-WATCH-002",
    stock: 30,
    status: "active",
    isFeatured: true,
  },
  {
    name: "4K Action Camera",
    slug: "4k-action-camera",
    shortDescription: "Waterproof 4K camera for adventures",
    fullDescription:
      "Capture every moment in stunning 4K resolution. Waterproof up to 30m, with image stabilization and a wide-angle lens.",
    category: "Electronics",
    brand: "GoShot",
    price: 149.99,
    salePrice: 119.99,
    sku: "ELEC-CAM-003",
    stock: 20,
    status: "active",
  },

  // ─── Fashion ────────────────────────────────────────────────────
  {
    name: "Men's Classic Denim Jacket",
    slug: "mens-classic-denim-jacket",
    shortDescription: "Timeless denim jacket for everyday wear",
    fullDescription:
      "A classic denim jacket made from durable cotton, featuring a comfortable fit and button-up front. A wardrobe essential.",
    category: "Fashion",
    brand: "UrbanThread",
    price: 59.99,
    sku: "FASH-JCKT-001",
    stock: 60,
    status: "active",
  },
  {
    name: "Women's Running Shoes",
    slug: "womens-running-shoes",
    shortDescription: "Lightweight shoes with responsive cushioning",
    fullDescription:
      "Engineered for comfort and performance, these running shoes feature breathable mesh and responsive foam cushioning for every stride.",
    category: "Fashion",
    brand: "StrideX",
    price: 79.99,
    salePrice: 64.99,
    sku: "FASH-SHOE-002",
    stock: 50,
    status: "active",
    isFeatured: true,
  },
  {
    name: "Leather Bifold Wallet",
    slug: "leather-bifold-wallet",
    shortDescription: "Genuine leather wallet with RFID protection",
    fullDescription:
      "Handcrafted from genuine leather, this bifold wallet offers RFID-blocking protection and ample card and cash storage.",
    category: "Fashion",
    brand: "CraftHide",
    price: 34.99,
    sku: "FASH-WALT-003",
    stock: 80,
    status: "active",
  },

  // ─── Home & Kitchen ────────────────────────────────────────────
  {
    name: "Stainless Steel Cookware Set",
    slug: "stainless-steel-cookware-set",
    shortDescription: "10-piece cookware set for every meal",
    fullDescription:
      "A complete 10-piece stainless steel cookware set including pots, pans, and lids. Dishwasher safe and induction compatible.",
    category: "Home & Kitchen",
    brand: "ChefPro",
    price: 199.99,
    salePrice: 159.99,
    sku: "HOME-COOK-001",
    stock: 15,
    status: "active",
    isFeatured: true,
  },
  {
    name: "Espresso Coffee Maker",
    slug: "espresso-coffee-maker",
    shortDescription: "Barista-quality espresso at home",
    fullDescription:
      "Brew rich, café-quality espresso at home with this compact machine featuring a built-in milk frother and 15-bar pump pressure.",
    category: "Home & Kitchen",
    brand: "BrewCraft",
    price: 149.99,
    sku: "HOME-COFFEE-002",
    stock: 25,
    status: "active",
  },
  {
    name: "Robot Vacuum Cleaner",
    slug: "robot-vacuum-cleaner",
    shortDescription: "Smart vacuum with app control",
    fullDescription:
      "Keep your floors spotless with this smart robot vacuum featuring app control, scheduled cleaning, and automatic charging.",
    category: "Home & Kitchen",
    brand: "CleanBot",
    price: 249.99,
    salePrice: 199.99,
    sku: "HOME-VAC-003",
    stock: 18,
    status: "active",
  },

  // ─── Sports & Outdoors ─────────────────────────────────────────
  {
    name: "Non-Slip Yoga Mat",
    slug: "non-slip-yoga-mat",
    shortDescription: "Extra-thick mat for comfort and grip",
    fullDescription:
      "A premium non-slip yoga mat with extra cushioning for joint support, ideal for yoga, pilates, and home workouts.",
    category: "Sports & Outdoors",
    brand: "FlexZen",
    price: 29.99,
    sku: "SPRT-YOGA-001",
    stock: 100,
    status: "active",
  },
  {
    name: "4-Person Camping Tent",
    slug: "4-person-camping-tent",
    shortDescription: "Weatherproof tent for family camping trips",
    fullDescription:
      "Spacious and weatherproof, this 4-person tent sets up in minutes and keeps you dry with a full rainfly and taped seams.",
    category: "Sports & Outdoors",
    brand: "TrailBase",
    price: 119.99,
    salePrice: 94.99,
    sku: "SPRT-TENT-002",
    stock: 12,
    status: "active",
  },

  // ─── Books ─────────────────────────────────────────────────────
  {
    name: "The Art of Programming",
    slug: "the-art-of-programming",
    shortDescription: "A practical guide to writing better software",
    fullDescription:
      "A practical, example-driven guide covering software design principles, clean code practices, and problem-solving techniques for developers.",
    category: "Books",
    brand: "TechPress",
    price: 39.99,
    sku: "BOOK-PROG-001",
    stock: 40,
    status: "active",
  },
  {
    name: "Mindful Living Guide",
    slug: "mindful-living-guide",
    shortDescription: "A beginner's guide to mindfulness and calm",
    fullDescription:
      "An accessible introduction to mindfulness practices, breathing techniques, and daily habits for a calmer, more focused life.",
    category: "Books",
    brand: "CalmPress",
    price: 19.99,
    sku: "BOOK-MIND-002",
    stock: 55,
    status: "active",
  },
];

async function seed() {
  await connectDB();

  // ─── Admin User ────────────────────────────────────────────────
  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    admin = await User.create({
      name: "Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
      isVerified: true,
    });
    console.log(`✅ Created admin user → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log(`↷ Admin user already exists → ${ADMIN_EMAIL}`);
  }

  // ─── Categories ────────────────────────────────────────────────
  const categoryIdByName = {};
  for (const catData of categoriesData) {
    let category = await Category.findOne({ name: catData.name });
    if (!category) {
      category = await Category.create(catData);
      console.log(`✅ Created category → ${category.name}`);
    } else {
      console.log(`↷ Category already exists → ${category.name}`);
    }
    categoryIdByName[catData.name] = category._id;
  }

  // ─── Products ──────────────────────────────────────────────────
  for (const p of productsData) {
    const exists = await Product.findOne({ sku: p.sku });
    if (exists) {
      console.log(`↷ Product already exists → ${p.name}`);
      continue;
    }

    await Product.create({
      ...p,
      category: categoryIdByName[p.category],
      mainImage: placeholderImage(p.slug),
      gallery: [placeholderImage(`${p.slug}-2`), placeholderImage(`${p.slug}-3`)],
      createdBy: admin._id,
    });
    console.log(`✅ Created product → ${p.name}`);
  }

  console.log("\n🌱 Seeding complete.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
