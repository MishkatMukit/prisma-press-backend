import type { Role } from "../../generated/prisma/enums";

export interface RegisterUserPayload {
    name: string;
    email: string;
    password: string;
    profilePhoto?: string
}
declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                name: string;
                id: string;
                role: Role;
            }
        }
    }
}