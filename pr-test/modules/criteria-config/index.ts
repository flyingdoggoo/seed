import { PrismaClient } from "@prisma/client";
import { seedCategories } from "./seed-categories";
import { seedCriteria } from "./seed-criteria";
import { seedRubrics } from "./seed-rubrics";

export async function seedCriteriaConfig(prisma: PrismaClient) {
	console.log("Cleaning old categories, criteria, and rubrics...");
	await prisma.rubric.deleteMany({});
	await prisma.evaluationCriterion.deleteMany({});
	await prisma.evaluationCategory.deleteMany({});

	await seedCategories(prisma);
	await seedCriteria(prisma);
	await seedRubrics(prisma);
}
