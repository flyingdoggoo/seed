import { PrismaClient } from "@prisma/client";
import { categoryDefinitions } from "./criteria-data";

export async function seedCategories(prisma: PrismaClient) {
	console.log("Seeding Evaluation Categories...");
	await prisma.evaluationCategory.deleteMany({});

	for (const def of categoryDefinitions) {
		await prisma.evaluationCategory.create({
			data: {
				name: def.name,
				weight: def.weight,
				roleScope: def.roleScope,
				version: 1,
			},
		});
	}
	console.log("Seeded Evaluation Categories.");
}
