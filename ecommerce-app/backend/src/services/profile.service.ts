import bcrypt from "bcryptjs";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { sessionStore } from "../store/sessionStore";
import { validateInput, validatePassword, validateEmail } from "../utils/validation";


// Repository helper
const userRepo = () => AppDataSource.getRepository(User);

export class ProfileService {

//Get Profile Data (active sessions, etc.)
async getProfile(userId: number, currentJti: string) {
    const allSessions = sessionStore.getForUser(userId);

    const activeSessions = allSessions.map((s) => ({
        jti: s.jti,
        ip: s.ip,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        isCurrent: s.jti === currentJti,
    }));

    return {
        success: true,
        statusCode: 200,
        activeSessions,
    };
}

//Edit Profile (name, email, password)
async editProfile(userId: number, name?: string, email?: string) {
    const users = await userRepo().findOne({ where: { id: userId } });

    if(!users) {
        return {
            success: false,
            statusCode: 404,
            message: "User not found",
        };
    }

    if(name !== undefined) {
        const cleanName = validateInput(name);
        if(cleanName.length < 2) {
            return {
                success: false,
                statusCode: 400,
                message: "Name must be more than 2 characters",
            };
        }
        users.name = cleanName;
    }

    if(email !== undefined) {
        const cleanEmail = validateInput(email).toLowerCase();
        if(!validateEmail(cleanEmail)) {
            return {
                success: false,
                statusCode: 400,
                message: "Invalid email format",
            };

        }
        users.email = cleanEmail;
    }

    await userRepo().save(users);

    return {
        success: true,
        statusCode: 200,
        message: "Profile updated successfully",
    };
}

// Change Passsword
async changePassword(userID:  number, currentJti: string, currentPassword: string, newPassword: string) {

    if(!validatePassword(newPassword)) {
        return {
            success: false,
            statusCode: 400,
            message: "Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters."
        };
    }

    const user = await userRepo().findOne({ where: { id: userID } });

    if(!user) {
        return {
            success: false,
            statusCode: 404,
            message: "User not found",
        };
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);

    if(!match) {
        return {
            success: false,
            statusCode: 400,
            message: "Current password is incorrect",
        };
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepo().save(user);

    const allSessions = sessionStore.getForUser(userID);
    for(const session of allSessions) {
        if(session.jti !== currentJti) {
            sessionStore.delete(session.jti);
        }
    }

        return {
            success: true,
            statusCode: 200,
            message: "Password changed successfully. All other sessions have been logged out.",
        }
    }
}

export const profileService = new ProfileService();
