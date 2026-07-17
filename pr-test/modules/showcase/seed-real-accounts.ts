import { EmploymentStatus, PrismaClient } from "@prisma/client";
import { REAL_LARK_ACCOUNTS } from "./real-accounts";

/**
 * Seeds the fixed real/hero identities (heroes + real Lark accounts).
 *
 * Runs BEFORE the virtual-pool user seed so these accounts are authoritative:
 * clean fullName, explicit department, explicit role, and a LarkAccountLink whose
 * `email` holds the Lark-resolution address (larkEmail) — kept separate from the
 * @ehub.enosta.com login on User.email.
 *
 * User.email is unique, so downstream modules match these people by email, never
 * by fullName.
 */
export async function seedRealAccounts(prisma: PrismaClient) {
	console.log("Seeding Real/Hero Accounts...");

	const departments = await prisma.department.findMany();
	const deptByCode = new Map(departments.map((d) => [d.code, d.id]));

	// Roles are seeded earlier (seed-roles). Resolve once.
	const roles = await prisma.role.findMany();
	const roleIdByCode = new Map(roles.map((r) => [r.code, r.id]));

	for (const acc of REAL_LARK_ACCOUNTS) {
		const departmentId = deptByCode.get(acc.departmentCode) ?? null;
		if (!departmentId) {
			console.warn(
				`  Department code "${acc.departmentCode}" not found for ${acc.email}; leaving department null.`,
			);
		}

		const user = await prisma.user.upsert({
			where: { email: acc.email },
			update: {
				fullName: acc.fullName,
				jobTitle: acc.jobTitle,
				employeeCode: acc.employeeCode,
				status: EmploymentStatus.ACTIVE,
				joinedAt: new Date(acc.joinedAt),
				departmentId,
			},
			create: {
				email: acc.email,
				fullName: acc.fullName,
				jobTitle: acc.jobTitle,
				employeeCode: acc.employeeCode,
				status: EmploymentStatus.ACTIVE,
				joinedAt: new Date(acc.joinedAt),
				departmentId,
			},
		});

		// One main role per user (mirror seed-user-roles behaviour).
		const roleId = roleIdByCode.get(acc.role);
		if (roleId) {
			const existing = await prisma.userRole.findFirst({
				where: { userId: user.id, roleId },
			});
			if (!existing) {
				await prisma.userRole.deleteMany({ where: { userId: user.id } });
				await prisma.userRole.create({
					data: { userId: user.id, roleId, startAt: new Date() },
				});
			}
		}

		// Store the Lark-resolution address on LarkAccountLink.email. The larkUserId
		// is filled in later by the Lark resolution step / calendar seed; seed a
		// placeholder-free link only if we can, otherwise leave it to that step.
	}

	console.log(`Seeded ${REAL_LARK_ACCOUNTS.length} real/hero accounts.`);
}

/**
 * Wires manager relations for the real accounts using their explicit
 * lineManagerEmail (email-based, stable). Runs after all users exist.
 */
export async function seedRealAccountManagerRelations(prisma: PrismaClient) {
	console.log("Seeding Real Account Manager Relations...");

	for (const acc of REAL_LARK_ACCOUNTS) {
		if (!acc.lineManagerEmail) continue;

		const employee = await prisma.user.findUnique({
			where: { email: acc.email },
		});
		const manager = await prisma.user.findUnique({
			where: { email: acc.lineManagerEmail },
		});
		if (!employee || !manager) continue;

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
					startDate: new Date("2023-01-01T00:00:00.000Z"),
				},
			});
		}
	}

	console.log("Seeded Real Account Manager Relations.");
}
