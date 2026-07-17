import { PrismaClient } from "@prisma/client";
import { categoryDefinitions } from "./criteria-data";

export async function seedCriteria(prisma: PrismaClient) {
	console.log("Seeding Evaluation Criteria...");
	await prisma.evaluationCriterion.deleteMany({});

	for (const def of categoryDefinitions) {
		const category = await prisma.evaluationCategory.findFirst({
			where: { name: def.name, roleScope: def.roleScope },
		});
		if (!category) continue;

		for (const crit of def.criteria) {
			await prisma.evaluationCriterion.create({
				data: {
					categoryId: category.id,
					name: crit.name,
					description: crit.description,
					weight: crit.weight,
				},
			});
		}
	}
	console.log("Seeded Evaluation Criteria.");
}
