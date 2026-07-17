import { PrismaClient } from "@prisma/client";
import { seedForms } from "./seed-forms";

export async function seedPrFormsModule(prisma: PrismaClient) {
	await seedForms(prisma);
}
