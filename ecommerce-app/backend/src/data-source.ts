import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "./entities/User";
import { ProductType } from "./entities/ProductType";
import { Category } from "./entities/Category";
import { SubCategory } from "./entities/SubCategory";
import { Product } from "./entities/Product";
import { Cart } from "./entities/Cart";
import { CartItem } from "./entities/CartItem";
import { Order } from "./entities/Order";
import { OrderItem } from "./entities/OrderItem";
import { PasswordResetCode } from "./entities/PasswordResetCode";
import { Payment } from "./entities/Payment";
import { Review } from "./entities/Review";
import { Address } from "./entities/Address";

dotenv.config();

export const AppDataSource = new DataSource({
    type: process.env.DB_TYPE as any || "sqlite",
    database: process.env.DB_DATABASE || "ecommerce.db",
    synchronize: process.env.DB_SYNCHRONIZE === "true",
    logging: process.env.DB_LOGGING === "true",
    entities: [User, ProductType, Category, SubCategory,
  Product, Cart, CartItem, Order, OrderItem,
  PasswordResetCode,
  Address, Review, Payment,],
    migrations: [__dirname + "/migrations/**/*.ts"],
});
