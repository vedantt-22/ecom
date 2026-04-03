import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";

export async function seedAdmin(): Promise<void> {
  const userRepo = AppDataSource.getRepository(User);

  // Check if admin already exists — never create duplicates
  const existing = await userRepo.findOne({
    where: { email: "admin@store.com" },
  });

  if (existing) {
    console.log("  Admin already exists, skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash("Admin@123", 12);

  const admin = userRepo.create({
    name: "Store Admin",
    email: "admin@store.com",
    passwordHash,
    role: "admin",
    isLocked: false,
  });

  await userRepo.save(admin);
  console.log("  Admin user created: admin@store.com / Admin@123");
}