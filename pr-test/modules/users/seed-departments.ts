import { PrismaClient } from "@prisma/client";
import { departmentsData } from "./departments-projects-data";

export async function seedDepartments(prisma: PrismaClient) {
	console.log("Seeding Departments...");

	for (const dept of departmentsData) {
		const existing = await prisma.department.findFirst({
			where: { code: dept.code },
		});
		if (existing) {
			await prisma.department.update({
				where: { id: existing.id },
				data: { name: dept.name },
			});
		} else {
			await prisma.department.create({
				data: { name: dept.name, code: dept.code },
			});
		}
	}
	console.log(`Seeded ${departmentsData.length} Departments.`);
}
