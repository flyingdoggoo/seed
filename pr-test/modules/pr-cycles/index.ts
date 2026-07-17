import { PrismaClient } from "@prisma/client";
import { seedPrCycles } from "./seed-pr-cycles";

export async function seedPrCyclesModule(prisma: PrismaClient) {
	await seedPrCycles(prisma);
}
