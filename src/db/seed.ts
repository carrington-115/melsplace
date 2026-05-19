/**
 * Seed script — populates the database with initial categories, products, and FAQs.
 * Run with: npx tsx src/db/seed.ts
 */
import { db } from "./index"
import { categories, products, faqs } from "./schema"
import { eq } from "drizzle-orm"

const CATEGORIES = [
  { name: "Grains & Staples", slug: "grains-staples", description: "Rice, cassava, fufu, yam and more", displayOrder: 1 },
  { name: "Spices & Seasonings", slug: "spices-seasonings", description: "Authentic African spices and blends", displayOrder: 2 },
  { name: "Beverages", slug: "beverages", description: "Zobo, palm wine, malt drinks, and more", displayOrder: 3 },
  { name: "Snacks", slug: "snacks", description: "Chin chin, plantain chips, puff puff mixes", displayOrder: 4 },
  { name: "Condiments & Sauces", slug: "condiments-sauces", description: "Palm oil, groundnut paste, ogiri, and more", displayOrder: 5 },
  { name: "Frozen & Fresh", slug: "frozen-fresh", description: "Fresh frozen fish, goat, cow tripe, and more", displayOrder: 6 },
]

const FAQS = [
  {
    question: "How do I place an order?",
    answer: "Browse our products, add items to your cart, then click 'Place Order'. Choose delivery or in-store pickup, and we'll contact you to confirm and arrange payment.",
    category: "Orders",
    displayOrder: 1,
  },
  {
    question: "Can I modify or cancel my order?",
    answer: "Contact us within 2 hours of placing your order to request changes. Once an order is being processed, changes may not be possible.",
    category: "Orders",
    displayOrder: 2,
  },
  {
    question: "Do you deliver outside Charlotte, NC?",
    answer: "Yes! We deliver across the US. Delivery times and costs vary by location. Local Charlotte deliveries are typically same-day or next-day.",
    category: "Delivery",
    displayOrder: 1,
  },
  {
    question: "How much does delivery cost?",
    answer: "Delivery is $8.99 for orders under $75. Orders over $75 qualify for free shipping.",
    category: "Delivery",
    displayOrder: 2,
  },
  {
    question: "Are your products authentic?",
    answer: "Absolutely. We source directly from African suppliers and carefully curate every product to ensure authenticity and quality.",
    category: "Products",
    displayOrder: 1,
  },
  {
    question: "How should I store perishable items?",
    answer: "Storage instructions vary by product. Most dried goods should be stored in a cool, dry place. Frozen items should go directly in the freezer.",
    category: "Products",
    displayOrder: 2,
  },
  {
    question: "Where is your Charlotte store located?",
    answer: "We're located in Charlotte, NC. Select 'In-Store Pickup' at checkout and we'll include the exact address in your confirmation email.",
    category: "Pickup & Returns",
    displayOrder: 1,
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns on non-perishable items within 7 days of purchase if the product is unopened. Please contact us to initiate a return.",
    category: "Pickup & Returns",
    displayOrder: 2,
  },
]

async function seed() {
  console.log("Seeding database...")

  // Categories
  console.log("Creating categories...")
  const createdCategories: Record<string, string> = {}
  for (const cat of CATEGORIES) {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, cat.slug),
    })
    if (existing) {
      createdCategories[cat.slug] = existing.id
      console.log(`  ↩ Category already exists: ${cat.name}`)
    } else {
      const [created] = await db.insert(categories).values(cat).returning({ id: categories.id })
      createdCategories[cat.slug] = created.id
      console.log(`  ✓ Created category: ${cat.name}`)
    }
  }

  // Sample products
  console.log("Creating sample products...")
  const sampleProducts = [
    {
      name: "Basmati Rice 5kg",
      slug: "basmati-rice-5kg",
      categoryId: createdCategories["grains-staples"],
      description: "Premium long-grain basmati rice, perfect for jollof, fried rice, and stews.",
      manufacturer: "Royal Gold",
      originCountry: "Nigeria",
      weightGrams: 5000,
      price: "18.99",
      inventory: 50,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Suya Spice Mix 200g",
      slug: "suya-spice-mix-200g",
      categoryId: createdCategories["spices-seasonings"],
      description: "Authentic West African suya spice blend — peanut-based with chili, ginger, and paprika.",
      manufacturer: "Iya Foods",
      originCountry: "Nigeria",
      weightGrams: 200,
      price: "8.99",
      inventory: 30,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Zobo Hibiscus Drink (6-pack)",
      slug: "zobo-hibiscus-drink-6pack",
      categoryId: createdCategories["beverages"],
      description: "Refreshing bottled zobo (hibiscus) drink, lightly sweetened. Rich in antioxidants.",
      manufacturer: "Zobo Queen",
      originCountry: "Nigeria",
      price: "14.99",
      inventory: 20,
      isActive: true,
    },
    {
      name: "Plantain Chips 150g",
      slug: "plantain-chips-150g",
      categoryId: createdCategories["snacks"],
      description: "Crispy plantain chips seasoned with sea salt. A delicious African snack.",
      manufacturer: "Nkulenu",
      originCountry: "Ghana",
      weightGrams: 150,
      price: "4.99",
      compareAtPrice: "6.99",
      inventory: 45,
      isActive: true,
    },
    {
      name: "Red Palm Oil 1L",
      slug: "red-palm-oil-1l",
      categoryId: createdCategories["condiments-sauces"],
      description: "Pure unrefined red palm oil, essential for egusi soup, banga soup, and more.",
      manufacturer: "Abuja Farms",
      originCountry: "Nigeria",
      weightGrams: 1000,
      price: "12.99",
      inventory: 35,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Egusi Ground 500g",
      slug: "egusi-ground-500g",
      categoryId: createdCategories["condiments-sauces"],
      description: "Finely ground egusi (melon seeds), ready to use in soups and stews.",
      manufacturer: "Iya Foods",
      originCountry: "Nigeria",
      weightGrams: 500,
      price: "9.49",
      inventory: 28,
      isActive: true,
    },
  ]

  for (const product of sampleProducts) {
    const existing = await db.query.products.findFirst({
      where: eq(products.slug, product.slug),
    })
    if (existing) {
      console.log(`  ↩ Product already exists: ${product.name}`)
    } else {
      await db.insert(products).values(product)
      console.log(`  ✓ Created product: ${product.name}`)
    }
  }

  // FAQs
  console.log("Creating FAQs...")
  for (const faq of FAQS) {
    const existing = await db.query.faqs.findFirst({
      where: eq(faqs.question, faq.question),
    })
    if (existing) {
      console.log(`  ↩ FAQ already exists: ${faq.question.slice(0, 40)}...`)
    } else {
      await db.insert(faqs).values({ ...faq, isPublished: true })
      console.log(`  ✓ Created FAQ: ${faq.question.slice(0, 40)}...`)
    }
  }

  console.log("\nSeed complete!")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
