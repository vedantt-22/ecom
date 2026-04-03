// Quick one-off check — run with: ts-node src/checkDb.ts
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import { ProductType } from "./entities/ProductType";
import { Product } from "./entities/Product";

async function check() {
  await AppDataSource.initialize();

  const users = await AppDataSource.getRepository(User).count();
  const types = await AppDataSource.getRepository(ProductType).count();
  const products = await AppDataSource.getRepository(Product).count();

  console.log(`Users: ${users}`);       // should be 1
  console.log(`Types: ${types}`);       // should be 3
  console.log(`Products: ${products}`); // should be 8

  await AppDataSource.destroy();
}

check();