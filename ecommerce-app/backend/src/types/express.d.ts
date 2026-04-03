import { User as UserEntity } from "../entities/users"; // Adjust path to your users.ts

declare global {
  namespace Express {
    // This "merges" with the existing Express User interface
    interface User extends UserEntity {}
  }
}