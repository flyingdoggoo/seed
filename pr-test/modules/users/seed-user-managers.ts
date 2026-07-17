import { PrismaClient } from "@prisma/client";
import { userData } from "./users-data";

export async function seedUserManagerRelations(prisma: PrismaClient) {
	console.log("Seeding User Manager Relations...");

	for (const u of userData) {
		if (!u.lineManager) continue;

		const employee = await prisma.user.findUnique({
			where: { email: u.email },
		});

		// Find the manager by their exact fullName which we saved in lineManager
		// Because fullNames might have slight mismatches, let's look up userData first
		const managerData = userData.find((m) => m.fullName === u.lineManager);
		if (!managerData) {
			console.log(
				`Could not find manager data for ${u.lineManager} (manager of ${u.fullName})`,
			);
			continue;
		}

		const manager = await prisma.user.findUnique({
			where: { email: managerData.email },
		});

		if (employee && manager) {
			const existing = await prisma.userManagerRelation.findFirst({
				where: { employeeId: employee.id, managerId: manager.id },
			});

			if (!existing) {
				await prisma.userManagerRelation.create({
					data: {
						employeeId: employee.id,
						managerId: manager.id,
						relationshipType: "LINE_MANAGER",
						status: "ACTIVE",
						startDate: new Date(),
					},
				});
			}
		}
	}

	console.log("Seeded User Manager Relations.");
}
