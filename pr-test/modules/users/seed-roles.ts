import { PrismaClient, RoleType, ScopeType } from "@prisma/client";

export async function seedRolesAndPermissions(prisma: PrismaClient) {
	console.log("Seeding Roles and Permissions...");

	const rolesData = [
		{ code: RoleType.EMPLOYEE, name: "Employee" },
		{ code: RoleType.LINE_MANAGER, name: "Line Manager" },
		{ code: RoleType.PROJECT_MANAGER, name: "Project Manager" },
		{ code: RoleType.FUNCTION_LEAD, name: "Function Lead" },
		{ code: RoleType.HR_ADMIN, name: "HR Admin" },
	];

	for (const role of rolesData) {
		await prisma.role.upsert({
			where: { code: role.code },
			update: { name: role.name },
			create: { code: role.code, name: role.name },
		});
	}

	const permissionsData = [
		// PR Cycle Setup
		{ code: "PR_CYCLES_CREATE", resource: "pr_cycles", action: "create" },
		{ code: "PR_CYCLES_READ", resource: "pr_cycles", action: "read" },
		{ code: "PR_CYCLES_UPDATE", resource: "pr_cycles", action: "update" },
		{ code: "PR_CYCLES_DELETE", resource: "pr_cycles", action: "delete" },
		// Criteria
		{ code: "CRITERIA_CREATE", resource: "criteria", action: "create" },
		{ code: "CRITERIA_READ", resource: "criteria", action: "read" },
		{ code: "CRITERIA_UPDATE", resource: "criteria", action: "update" },
		{ code: "CRITERIA_DELETE", resource: "criteria", action: "delete" },
		// Forms
		{ code: "FORMS_CREATE", resource: "forms", action: "create" },
		{ code: "FORMS_READ", resource: "forms", action: "read" },
		{ code: "FORMS_UPDATE", resource: "forms", action: "update" },
		{ code: "FORMS_DELETE", resource: "forms", action: "delete" },
		// Roundtable
		{ code: "ROUND_TABLE_CREATE", resource: "round_table", action: "create" },
		{ code: "ROUND_TABLE_READ", resource: "round_table", action: "read" },
		{ code: "ROUND_TABLE_UPDATE", resource: "round_table", action: "update" },
		{ code: "ROUND_TABLE_DELETE", resource: "round_table", action: "delete" },
		// Performance Records
		{
			code: "PERFORMANCE_RECORDS_CREATE",
			resource: "performance_records",
			action: "create",
		},
		{
			code: "PERFORMANCE_RECORDS_READ",
			resource: "performance_records",
			action: "read",
		},
		{
			code: "PERFORMANCE_RECORDS_UPDATE",
			resource: "performance_records",
			action: "update",
		},
		{
			code: "PERFORMANCE_RECORDS_DELETE",
			resource: "performance_records",
			action: "delete",
		},
		// Peer Assignments
		{
			code: "PEER_ASSIGNMENTS_CREATE",
			resource: "peer_assignments",
			action: "create",
		},
		{
			code: "PEER_ASSIGNMENTS_READ",
			resource: "peer_assignments",
			action: "read",
		},
		{
			code: "PEER_ASSIGNMENTS_UPDATE",
			resource: "peer_assignments",
			action: "update",
		},
		{
			code: "PEER_ASSIGNMENTS_DELETE",
			resource: "peer_assignments",
			action: "delete",
		},
		// Bilateral Meetings
		{
			code: "BILATERAL_MEETINGS_CREATE",
			resource: "bilateral_meetings",
			action: "create",
		},
		{
			code: "BILATERAL_MEETINGS_READ",
			resource: "bilateral_meetings",
			action: "read",
		},
		{
			code: "BILATERAL_MEETINGS_UPDATE",
			resource: "bilateral_meetings",
			action: "update",
		},
		{
			code: "BILATERAL_MEETINGS_DELETE",
			resource: "bilateral_meetings",
			action: "delete",
		},
		// Acknowledgements
		{
			code: "ACKNOWLEDGEMENTS_CREATE",
			resource: "acknowledgements",
			action: "create",
		},
		{
			code: "ACKNOWLEDGEMENTS_READ",
			resource: "acknowledgements",
			action: "read",
		},
		{
			code: "ACKNOWLEDGEMENTS_UPDATE",
			resource: "acknowledgements",
			action: "update",
		},
		{
			code: "ACKNOWLEDGEMENTS_DELETE",
			resource: "acknowledgements",
			action: "delete",
		},
		// Notifications
		{ code: "NOTIFICATIONS_READ", resource: "notifications", action: "read" },
		{
			code: "NOTIFICATIONS_CREATE",
			resource: "notifications",
			action: "create",
		},
	];

	for (const perm of permissionsData) {
		await prisma.permission.upsert({
			where: { code: perm.code },
			update: { resource: perm.resource, action: perm.action },
			create: { code: perm.code, resource: perm.resource, action: perm.action },
		});
	}

	// Seed RolePermissions for Admin
	const adminRole = await prisma.role.findUnique({
		where: { code: RoleType.HR_ADMIN },
	});
	if (adminRole) {
		const allPerms = await prisma.permission.findMany();
		for (const perm of allPerms) {
			const existing = await prisma.rolePermission.findFirst({
				where: { roleId: adminRole.id, permissionId: perm.id },
			});
			if (!existing) {
				await prisma.rolePermission.create({
					data: {
						roleId: adminRole.id,
						permissionId: perm.id,
						scopeType: ScopeType.GLOBAL,
					},
				});
			}
		}
	}

	console.log("Seeded Roles and Permissions.");
}
