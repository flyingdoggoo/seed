import { PrismaClient, RoleType } from "@prisma/client";
import { userData } from "./users-data";

export async function seedUserRoles(prisma: PrismaClient) {
	console.log("Seeding User Roles...");

	for (const u of userData) {
		if (!u.role) continue;

		const user = await prisma.user.findUnique({ where: { email: u.email } });
		const role = await prisma.role.findUnique({
			where: { code: u.role as RoleType },
		});

		if (user && role) {
			const existing = await prisma.userRole.findFirst({
				where: { userId: user.id, roleId: role.id },
			});
			if (!existing) {
				await prisma.userRole.deleteMany({ where: { userId: user.id } }); // Clear existing roles to ensure one main role
				await prisma.userRole.create({
					data: {
						userId: user.id,
						roleId: role.id,
						startAt: new Date(),
					},
				});
			}
		}
	}
	console.log("Seeded User Roles.");
}
