import { PrismaClient } from "@prisma/client";
import { seedUS3US6Cycles } from "./seed-us3-us6";

export async function seedUS3US6Module(prisma: PrismaClient) {
	await seedUS3US6Cycles(prisma);
}
