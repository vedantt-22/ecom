import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { SubCategory } from "../entities/SubCategory";
import fs from "fs";
import path from "path";

type CsvProductRow = {
  name: string;
  description: string;
  price: string;
  stock: string;
  imagePath: string;
  subCategoryId?: string;
  subCategoryName?: string;
};

const PRODUCTS_CSV_PATH = path.resolve(__dirname, "../data/cleaned_products.csv");
const FURNITURE_CSV_PATH = path.resolve(__dirname, "../data/cleaned_furniture.csv");

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const nextChar = line[i + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result.map((value) => value.trim());
}

function loadCsvRows(csvPath: string): CsvProductRow[] {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length <= 1) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const required = ["name", "description", "price", "stock", "imagePath"];

  for (const header of required) {
    if (!headers.includes(header)) {
      throw new Error(`Missing required CSV header "${header}" in ${path.basename(csvPath)}`);
    }
  }

  if (!headers.includes("subCategoryName") && !headers.includes("subCategoryId")) {
    throw new Error(
      `CSV ${path.basename(csvPath)} must include subCategoryName or subCategoryId`
    );
  }

  const rows: CsvProductRow[] = [];
  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    if (values.length !== headers.length) {
      continue;
    }

    const rowData: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowData[header] = values[index] ?? "";
    });

    rows.push({
      name: rowData.name,
      description: rowData.description,
      price: rowData.price,
      stock: rowData.stock,
      imagePath: rowData.imagePath,
      subCategoryId: rowData.subCategoryId,
      subCategoryName: rowData.subCategoryName,
    });
  }

  return rows;
}

export async function seedProducts(): Promise<void> {
  const productRepo = AppDataSource.getRepository(Product);
  const subRepo = AppDataSource.getRepository(SubCategory);

  const rows = [
    ...loadCsvRows(PRODUCTS_CSV_PATH),
    ...loadCsvRows(FURNITURE_CSV_PATH),
  ];

  if (rows.length === 0) {
    console.log("  No product rows found in CSV files, skipping.");
    return;
  }

  const subCategories = await subRepo.find({ relations: ["category"] });
  const subCategoryById = new Map<number, SubCategory>(
    subCategories.map((subCategory) => [subCategory.id, subCategory])
  );
  const subCategoryByName = new Map<string, SubCategory>(
    subCategories.map((subCategory) => [subCategory.name.trim().toLowerCase(), subCategory])
  );
  const subCategoryByCategoryName = new Map<string, SubCategory>();

  for (const subCategory of subCategories) {
    const categoryName = subCategory.category?.name?.trim().toLowerCase();
    if (categoryName && !subCategoryByCategoryName.has(categoryName)) {
      subCategoryByCategoryName.set(categoryName, subCategory);
    }
  }

  const existingRows = await productRepo
    .createQueryBuilder("product")
    .select("product.name", "name")
    .addSelect("product.imagePath", "imagePath")
    .addSelect("product.subCategoryId", "subCategoryId")
    .getRawMany<{ name: string; imagePath: string | null; subCategoryId: number }>();

  const productKey = (name: string, imagePath: string | null, subCategoryId: number): string => {
    return `${name.trim().toLowerCase()}::${(imagePath ?? "").trim()}::${subCategoryId}`;
  };

  const seen = new Set<string>(
    existingRows.map((row) => productKey(row.name, row.imagePath, Number(row.subCategoryId)))
  );

  const productsToInsert: Product[] = [];
  let skippedRows = 0;
  let remappedRows = 0;

  for (const row of rows) {
    const price = Number(row.price);
    const stock = Number(row.stock);

    if (!row.name || !row.description || Number.isNaN(price) || Number.isNaN(stock)) {
      skippedRows += 1;
      continue;
    }

    let subCategory: SubCategory | undefined;

    const normalizedSubCategoryName = (row.subCategoryName ?? "").trim().toLowerCase();
    if (normalizedSubCategoryName) {
      subCategory = subCategoryByName.get(normalizedSubCategoryName);
      if (!subCategory) {
        subCategory = subCategoryByCategoryName.get(normalizedSubCategoryName);
      }
    }

    if (!subCategory) {
      const subCategoryId = Number(row.subCategoryId);
      if (!Number.isNaN(subCategoryId)) {
        subCategory = subCategoryById.get(subCategoryId);
      }
    }

    if (!subCategory) {
      skippedRows += 1;
      continue;
    }

    const uniqueKey = productKey(row.name, row.imagePath || null, subCategory.id);
    if (seen.has(uniqueKey)) {
      skippedRows += 1;
      continue;
    }
    seen.add(uniqueKey);

    if ((row.subCategoryName ?? "").trim().toLowerCase() === "home") {
      remappedRows += 1;
    }

    productsToInsert.push(
      productRepo.create({
        name: row.name,
        description: row.description,
        price,
        stock,
        imagePath: row.imagePath || null,
        subCategory,
      })
    );
  }

  if (productsToInsert.length === 0) {
    console.log("  No new products inserted from CSV files.");
    return;
  }

  await productRepo.save(productsToInsert);

  console.log(`  ${productsToInsert.length} products inserted from CSV files.`);
  if (skippedRows > 0) {
    console.log(`  ${skippedRows} CSV row(s) skipped (invalid or already present).`);
  }
  if (remappedRows > 0) {
    console.log(`  ${remappedRows} furniture row(s) mapped using category name.`);
  }
}