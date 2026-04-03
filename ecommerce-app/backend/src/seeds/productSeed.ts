import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { SubCategory } from "../entities/SubCategory";

export async function seedProducts(): Promise<void> {
  const productRepo = AppDataSource.getRepository(Product);
  const subRepo = AppDataSource.getRepository(SubCategory);

  const count = await productRepo.count();
  if (count > 0) {
    console.log("  Products already seeded, skipping.");
    return;
  }

  // Helper to find a subcategory by name
  const findSub = async (name: string) => {
    const sub = await subRepo.findOne({ where: { name } });
    if (!sub) throw new Error(`SubCategory "${name}" not found. Run taxonomy seed first.`);
    return sub;
  };

  const sampleProducts = [
    {
      name: "Anker Multimedia Keyboard",
      description: "Full-size USB keyboard with multimedia keys and quiet typing experience.",
      price: 1299.00,
      stock: 50,
      subCategory: await findSub("Keyboards"),
    },
    {
      name: "Logitech M235 Wireless Mouse",
      description: "Compact wireless mouse with 12-month battery life and smooth tracking.",
      price: 999.00,
      stock: 75,
      subCategory: await findSub("Mice"),
    },
    {
      name: "Dell 24-inch FHD Monitor",
      description: "Full HD IPS monitor with 75Hz refresh rate and slim bezels.",
      price: 12999.00,
      stock: 20,
      subCategory: await findSub("Monitors"),
    },
    {
      name: "Parker Vector Pen Set",
      description: "Set of 3 smooth-writing ballpoint pens in blue, black, and red.",
      price: 349.00,
      stock: 200,
      subCategory: await findSub("Pens"),
    },
    {
      name: "NCERT Mathematics Textbook Grade 10",
      description: "Official NCERT mathematics textbook for Grade 10 students.",
      price: 89.00,
      stock: 150,
      subCategory: await findSub("Textbooks"),
    },
    {
      name: "Wooden Study Table",
      description: "Solid wood study table with a drawer and smooth surface finish.",
      price: 4999.00,
      stock: 15,
      subCategory: await findSub("Tables"),
    },
    {
      name: "Ergonomic Office Chair",
      description: "Adjustable lumbar support chair with breathable mesh back.",
      price: 8999.00,
      stock: 10,
      subCategory: await findSub("Office Chairs"),
    },
    {
      name: "USB-C Fast Charger 65W",
      description: "GaN technology 65W fast charger compatible with laptops and phones.",
      price: 1799.00,
      stock: 100,
      subCategory: await findSub("Chargers"),
    },
  ];

  for (const data of sampleProducts) {
    const product = productRepo.create(data);
    await productRepo.save(product);
  }

  console.log(`  ${sampleProducts.length} sample products created.`);
}