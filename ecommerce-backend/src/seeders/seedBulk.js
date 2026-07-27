// ─── Bulk Product Seeder ────────────────────────────────────────────────────
// 1000 products generate karta hai across existing categories, schema-valid,
// har product ko uske TYPE se matching real photo milti hai (loremflickr,
// keyword-tagged) — generic/abstract placeholder nahi.
// Idempotent nahi hai deterministic index se, but duplicate SKUs ko skip
// karta hai (ordered:false insertMany) taaki safe re-run ho sake.
// Run: npm run seed:bulk

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { User } from "../models/user.model.js";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";

const ADMIN_EMAIL = "admin@eshopping.com";
const ADMIN_PASSWORD = "Admin@123";
const TOTAL_PRODUCTS = 1000;

// ─── Category → naming pools + image keywords ──────────────────────────────
const CATEGORY_DATA = {
  Electronics: {
    code: "ELEC",
    brands: ["SoundCore", "PulseFit", "GoShot", "NexaTech", "VoltEdge", "ByteWave", "QuantumGear", "ZenithPro"],
    adjectives: ["Premium", "Compact", "Wireless", "Portable", "Pro", "Ultra", "Smart", "Advanced"],
    types: [
      { name: "Headphones", keyword: "headphones", price: [40, 150] },
      { name: "Smartwatch", keyword: "smartwatch", price: [60, 250] },
      { name: "Action Camera", keyword: "camera", price: [70, 300] },
      { name: "Bluetooth Speaker", keyword: "speaker", price: [25, 120] },
      { name: "Laptop", keyword: "laptop", price: [400, 1500] },
      { name: "Smartphone", keyword: "smartphone", price: [200, 1200] },
      { name: "Tablet", keyword: "tablet", price: [150, 800] },
      { name: "Wireless Mouse", keyword: "computermouse", price: [10, 50] },
      { name: "Gaming Keyboard", keyword: "keyboard", price: [30, 150] },
      { name: "Power Bank", keyword: "powerbank", price: [15, 60] },
      { name: "Drone", keyword: "drone", price: [100, 600] },
      { name: "Smart Bulb", keyword: "lightbulb", price: [10, 35] },
      { name: "WiFi Router", keyword: "router", price: [30, 150] },
      { name: "External Hard Drive", keyword: "harddrive", price: [40, 150] },
      { name: "Webcam", keyword: "webcam", price: [20, 90] },
    ],
  },
  "Mobile Phones": {
    code: "MOBL",
    brands: ["NexaTech", "ByteWave", "VoltEdge", "ClickCore", "OrbitCell", "SnapLink"],
    adjectives: ["Slim", "Rugged", "Fast-Charging", "Magnetic", "Universal", "Premium"],
    types: [
      { name: "Smartphone Case", keyword: "phonecase", price: [10, 40] },
      { name: "Screen Protector", keyword: "smartphonescreen", price: [5, 20] },
      { name: "Wireless Earbuds", keyword: "earbuds", price: [30, 130] },
      { name: "Phone Charger", keyword: "phonecharger", price: [8, 30] },
      { name: "Phone Stand", keyword: "phonestand", price: [8, 25] },
      { name: "Car Phone Mount", keyword: "carphonemount", price: [10, 30] },
      { name: "Portable Power Bank", keyword: "powerbank", price: [15, 55] },
      { name: "Phone Ring Holder", keyword: "phoneholder", price: [5, 15] },
      { name: "Charging Cable", keyword: "usbcable", price: [5, 20] },
      { name: "Phone Camera Lens Kit", keyword: "cameralens", price: [15, 60] },
    ],
  },
  Fashion: {
    code: "FASH",
    brands: ["UrbanThread", "StrideX", "CraftHide", "Velora", "NorthPeak", "LumiWear", "Draft&Co"],
    adjectives: ["Classic", "Modern", "Vintage", "Slim-Fit", "Casual", "Elegant", "Everyday"],
    types: [
      { name: "Denim Jacket", keyword: "denimjacket", price: [40, 100] },
      { name: "Running Shoes", keyword: "runningshoes", price: [50, 130] },
      { name: "Leather Wallet", keyword: "leatherwallet", price: [20, 60] },
      { name: "T-Shirt", keyword: "tshirt", price: [10, 35] },
      { name: "Sunglasses", keyword: "sunglasses", price: [15, 90] },
      { name: "Backpack", keyword: "backpack", price: [25, 90] },
      { name: "Wristwatch", keyword: "wristwatch", price: [40, 200] },
      { name: "Sneakers", keyword: "sneakers", price: [40, 140] },
      { name: "Handbag", keyword: "handbag", price: [30, 150] },
      { name: "Leather Belt", keyword: "leatherbelt", price: [12, 40] },
      { name: "Wool Scarf", keyword: "scarf", price: [10, 35] },
      { name: "Baseball Cap", keyword: "baseballcap", price: [10, 25] },
      { name: "Hoodie", keyword: "hoodie", price: [25, 60] },
      { name: "Slim Jeans", keyword: "jeans", price: [30, 80] },
      { name: "Summer Dress", keyword: "summerdress", price: [25, 90] },
    ],
  },
  "Home & Kitchen": {
    code: "HOME",
    brands: ["ChefPro", "BrewCraft", "CleanBot", "NestHome", "LuxeLiving", "PureAir"],
    adjectives: ["Deluxe", "Compact", "Stainless", "Modern", "Multi-Function", "Everyday"],
    types: [
      { name: "Cookware Set", keyword: "cookwareset", price: [80, 250] },
      { name: "Coffee Maker", keyword: "coffeemaker", price: [50, 200] },
      { name: "Vacuum Cleaner", keyword: "vacuumcleaner", price: [90, 300] },
      { name: "Blender", keyword: "blender", price: [25, 90] },
      { name: "Toaster", keyword: "toaster", price: [15, 60] },
      { name: "Air Fryer", keyword: "airfryer", price: [50, 180] },
      { name: "Bedding Set", keyword: "beddingset", price: [30, 120] },
      { name: "Table Lamp", keyword: "tablelamp", price: [15, 70] },
      { name: "Dinnerware Set", keyword: "dinnerware", price: [40, 150] },
      { name: "Knife Set", keyword: "kitchenknife", price: [25, 100] },
      { name: "Storage Containers", keyword: "foodcontainer", price: [10, 40] },
      { name: "Curtains", keyword: "curtains", price: [15, 60] },
      { name: "Wall Clock", keyword: "wallclock", price: [10, 45] },
      { name: "Area Rug", keyword: "arearug", price: [30, 150] },
      { name: "Throw Cushion", keyword: "cushion", price: [8, 30] },
    ],
  },
  "Sports & Outdoors": {
    code: "SPRT",
    brands: ["FlexZen", "TrailBase", "PeakGear", "IronCore", "AquaFlow", "SprintMax"],
    adjectives: ["Pro", "Lightweight", "Heavy-Duty", "Adjustable", "All-Terrain", "Compact"],
    types: [
      { name: "Yoga Mat", keyword: "yogamat", price: [15, 45] },
      { name: "Camping Tent", keyword: "campingtent", price: [60, 250] },
      { name: "Dumbbell Set", keyword: "dumbbell", price: [30, 150] },
      { name: "Bicycle", keyword: "bicycle", price: [150, 800] },
      { name: "Hiking Backpack", keyword: "hikingbackpack", price: [40, 150] },
      { name: "Water Bottle", keyword: "waterbottle", price: [8, 30] },
      { name: "Fishing Rod", keyword: "fishingrod", price: [25, 120] },
      { name: "Skateboard", keyword: "skateboard", price: [30, 100] },
      { name: "Tennis Racket", keyword: "tennisracket", price: [30, 130] },
      { name: "Soccer Ball", keyword: "soccerball", price: [10, 35] },
      { name: "Basketball", keyword: "basketball", price: [12, 40] },
      { name: "Resistance Bands", keyword: "resistancebands", price: [10, 30] },
      { name: "Sleeping Bag", keyword: "sleepingbag", price: [25, 100] },
      { name: "Camping Chair", keyword: "campingchair", price: [20, 70] },
    ],
  },
  Books: {
    code: "BOOK",
    brands: ["TechPress", "CalmPress", "NovelHouse", "SagePages", "InkWell", "ClassicBind"],
    adjectives: ["Illustrated", "Complete", "Beginner's", "Pocket", "Definitive", "Essential"],
    types: [
      { name: "Programming Guide", keyword: "programmingbook", price: [20, 50] },
      { name: "Mystery Novel", keyword: "novelbook", price: [10, 25] },
      { name: "Cookbook", keyword: "cookbook", price: [15, 40] },
      { name: "Self-Help Book", keyword: "selfhelpbook", price: [10, 25] },
      { name: "Fantasy Novel", keyword: "fantasybook", price: [10, 30] },
      { name: "History Book", keyword: "historybook", price: [15, 35] },
      { name: "Biography", keyword: "biographybook", price: [12, 30] },
      { name: "Poetry Collection", keyword: "poetrybook", price: [8, 20] },
      { name: "Children's Book", keyword: "childrensbook", price: [8, 20] },
      { name: "Science Fiction Novel", keyword: "scifibook", price: [10, 28] },
    ],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const round2 = (n) => Math.round(n * 100) / 100;

const keywordImage = (keyword, lock) => ({
  url: `https://loremflickr.com/800/800/${keyword}?lock=${lock}`,
  public_id: `seed/${keyword}-${lock}`,
});

function generateProductsForCategory(categoryName, categoryId, adminId, count, globalStart) {
  const data = CATEGORY_DATA[categoryName];
  const { brands, adjectives, types, code } = data;
  const products = [];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const adjective = adjectives[Math.floor(i / types.length) % adjectives.length];
    const brand = brands[Math.floor(i / (types.length * adjectives.length)) % brands.length];
    const globalIndex = globalStart + i;

    const name = `${brand} ${adjective} ${type.name}`;
    const slug = slugify(`${name}-${globalIndex}`);
    const sku = `${code}-${String(globalIndex).padStart(5, "0")}`;

    const [minP, maxP] = type.price;
    const price = round2(minP + Math.random() * (maxP - minP));
    const onSale = Math.random() < 0.35;
    const salePrice = onSale ? round2(price * (0.7 + Math.random() * 0.2)) : undefined;
    const stock = Math.floor(Math.random() * 150) + 5;

    products.push({
      name,
      slug,
      shortDescription: `${adjective} ${type.name.toLowerCase()} from ${brand}.`,
      fullDescription: `The ${name} combines quality craftsmanship with everyday functionality — a reliable ${type.name.toLowerCase()} built for ${categoryName.toLowerCase()} enthusiasts.`,
      category: categoryId,
      brand,
      price,
      salePrice,
      currency: "USD",
      sku,
      stock,
      stockStatus: stock > 0 ? "in_stock" : "out_of_stock",
      mainImage: keywordImage(type.keyword, globalIndex),
      gallery: [keywordImage(type.keyword, globalIndex + 100000), keywordImage(type.keyword, globalIndex + 200000)],
      status: "active",
      isFeatured: Math.random() < 0.08,
      createdBy: adminId,
    });
  }

  return products;
}

async function seedBulk() {
  await connectDB();

  // ─── Admin user (reuse if already seeded) ─────────────────────
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
  }

  // ─── Resolve category ids (must already exist) ────────────────
  const categoryNames = Object.keys(CATEGORY_DATA);
  const categories = await Category.find({ name: { $in: categoryNames } });
  const categoryIdByName = {};
  categories.forEach((c) => (categoryIdByName[c.name] = c._id));

  const missing = categoryNames.filter((n) => !categoryIdByName[n]);
  if (missing.length) {
    console.error(`❌ Missing categories in DB: ${missing.join(", ")}. Run "npm run seed" first.`);
    process.exit(1);
  }

  // ─── Distribute TOTAL_PRODUCTS across categories ──────────────
  const base = Math.floor(TOTAL_PRODUCTS / categoryNames.length);
  const remainder = TOTAL_PRODUCTS % categoryNames.length;
  const counts = categoryNames.map((_, i) => base + (i < remainder ? 1 : 0));

  let allProducts = [];
  let globalIndex = 1;
  categoryNames.forEach((catName, idx) => {
    const count = counts[idx];
    const products = generateProductsForCategory(catName, categoryIdByName[catName], admin._id, count, globalIndex);
    allProducts = allProducts.concat(products);
    globalIndex += count;
    console.log(`→ Generated ${count} products for ${catName}`);
  });

  console.log(`\nInserting ${allProducts.length} products...`);

  try {
    const result = await Product.insertMany(allProducts, { ordered: false });
    console.log(`✅ Inserted ${result.length} products.`);
  } catch (err) {
    // ordered:false → mongoose still throws a BulkWriteError with partial results on dup-key clashes
    const inserted = err?.insertedDocs?.length ?? err?.result?.result?.nInserted ?? 0;
    const writeErrors = err?.writeErrors?.length ?? 0;
    console.log(`✅ Inserted ${inserted} products (${writeErrors} skipped — likely already seeded/duplicate SKU).`);
    if (writeErrors && writeErrors !== err?.writeErrors?.length) {
      console.error(err);
    }
  }

  console.log("\n🌱 Bulk seeding complete.");
  await mongoose.disconnect();
  process.exit(0);
}

seedBulk().catch((err) => {
  console.error("❌ Bulk seeding failed:", err);
  process.exit(1);
});
