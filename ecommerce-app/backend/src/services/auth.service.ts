import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid"; // Removed unused 'validate'
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Cart } from "../entities/Cart";
import { PasswordResetCode } from "../entities/PasswordResetCode";
import { sessionStore } from "../store/sessionStore";
import { JWT_SECRET } from "../passport"; 
import { validateInput, validateRegistrationInput, validatePassword } from "../utils/validation";

// Repository helpers
const userRepo = () => AppDataSource.getRepository(User);
const cartRepo = () => AppDataSource.getRepository(Cart);
const resetRepo = () => AppDataSource.getRepository(PasswordResetCode);

export class AuthService {
    async register(name: string, email: string, password: string) {
        const errors = validateRegistrationInput(
            name ?? "",
            email ?? "",
            password ?? ""
        );

        if (errors.length > 0) {
            return { success: false, statusCode: 400, errors };
        }

        const cleanName = validateInput(name);
        const cleanEmail = validateInput(email).toLowerCase();
        
        // Check if user exists BEFORE hashing (saves CPU time)
        const existing = await userRepo().findOne({
            where: { email: cleanEmail }
        });

        if (existing) {
            return { success: false, statusCode: 409, errors: [{ field: "email", message: "An account with this email already exists" }] };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create User
        const user = userRepo().create({
            name: cleanName,
            email: cleanEmail,
            passwordHash,
            role: "customer",
            isLocked: false,
        });
        
        const savedUser = await userRepo().save(user);

        // Create empty Cart for the new user
        const cart = cartRepo().create({
            user: savedUser,
            items: [],
        });
        await cartRepo().save(cart);

        return { success: true, statusCode: 201, message: "Account created successfully. Please log in." };
    }

    async login(email: string, password: string, ip: string, userAgent: string) {
        const cleanEmail = validateInput(email).toLowerCase();

        const user = await userRepo().findOne({
            where: { email: cleanEmail }
        });

        // 1. Check user existence
        if (!user) {
            return { success: false, statusCode: 401, message: "Invalid email or password" };
        }

        // 2. Check if locked
        if (user.isLocked) {
            return { success: false, statusCode: 403, message: "Account is locked. Please contact support." };
        }

        // 3. Verify password
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return { success: false, statusCode: 401, message: "Invalid email or password" };
        }
    
        // 4. Session & Token Generation
        const jti = uuidv4();
        const token = jwt.sign(
            { id: user.id, role: user.role, jti },
            JWT_SECRET, 
            { expiresIn: "7d" }
        );

        // Store session in memory/store
        sessionStore.create(jti, {
            userId: user.id,
            username: user.email,
            role: user.role,
            ip,
            userAgent,
            createdAt: new Date(),
        });

        return {
            success: true,
            statusCode: 200,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }

    async logout(jti: string) {
        sessionStore.delete(jti);
        return { success: true, statusCode: 200, message: "Logged out successfully" };
    }

    async logoutSession(jti: string, requestingUserID: number) {
        const session = sessionStore.get(jti);
        if (!session) {
            return { success: false, statusCode: 404, message: "Session not found" };
        }
        
        if (session.userId !== requestingUserID) {
            return { success: false, statusCode: 403, message: "You are not the owner of this session" };
        }
        sessionStore.delete(jti);
        return { success: true, statusCode: 200, message: "Session logged out successfully" };
    }
    //Logout All Sessions for a User

    async logoutAll(userrID: number) {
        sessionStore.deleteAllForUser(userrID);
        return {success: true, statusCode: 200, message: "All sessions logged out successfully"};
    }

    async forgetPassword(email: string) {
        const cleanEmail = validateInput(email).toLowerCase();
        const user = await userRepo().findOne({
            where: {email: cleanEmail}
        });
        // Always return the same response whether the email
        // exists or not. Prevents user enumeration.
        if(!user) {
            return {success: true, statusCode: 200, message: "If an account with that email exists, a password reset code has been sent."};
        }

        await resetRepo().update(
            {user: {id: user.id}, used: false},
            {used: true}
         );
        const code = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const resetCode = resetRepo().create({
            code,
            expiresAt,
            used: false,
            user,
        });
        await resetRepo().save(resetCode);

        return {
            success:    true,
            statusCode: 200,
            code,
            expiresAt,
            message: "Reset code generated.",
        };
    }

    async getResetCode(email: string) {
        const cleanEmail = validateInput(email).toLowerCase();

        const user = await userRepo().findOne({
            where: { email: cleanEmail }
        });

        if (!user) {
            return {
                success: false,
                statusCode: 404,
                message: "No active reset code found."
            };
        }

        const activeCode = await resetRepo().findOne({
            where: {
                user: { id: user.id },
                used: false,
            },
            order: { createdAt: "DESC" }
        });

        if (!activeCode || new Date() > activeCode.expiresAt) {
            return {
                success: false,
                statusCode: 404,
                message: "No active reset code found."
            };
        }

        return {
            success: true,
            statusCode: 200,
            message: "Reset code retrieved.",
            code: activeCode.code,
            expiresAt: activeCode.expiresAt,
        };
    }

    // Reset password using the code sent to email
    async resetPassword(email: string, code: string, newPassword: string) {
        if(!validatePassword(newPassword)) {
            return {
                success: false,
                statusCode: 400,
                message: "Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters."
            };
        }
        const cleanEmail = validateInput(email).toLowerCase();

        const user = await userRepo().findOne({
            where: {email: cleanEmail}
        });

        if(!user) {
            return {
                success: false,
                statusCode: 400,
                message: "Invalid or expired reset code."
            };
        }
        const resetCode = await resetRepo().findOne({
            where: {
                code,
                user: {id: user.id},
                used: false,
            }
        });
        if(!resetCode || new Date() > resetCode.expiresAt || resetCode.used) {
            return {
                success: false,
                statusCode: 400,
                message: "Invalid or expired reset code."
            };
        }
        resetCode.used = true;
        await resetRepo().save(resetCode);

        user.passwordHash = await bcrypt.hash(newPassword, 12);
        await userRepo().save(user);

        sessionStore.deleteAllForUser(user.id);

        return {
            success: true,
            statusCode: 200,
            message: "Password reset successful. Please log in with your new password."
        }
    }
}
export const authService = new AuthService();
