import { PrismaClient } from "@prisma/client";
import {
	seedRealAccountManagerRelations,
	seedRealAccounts,
} from "./seed-real-accounts";
import { seedDepartments } from "./seed-departments";
import { seedProjects } from "./seed-projects";
import { seedRolesAndPermissions } from "./seed-roles";
import { seedUserManagerRelations } from "./seed-user-managers";
import { seedUserRoles } from "./seed-user-roles";
import { seedUsers } from "./seed-users";
import { seedLarkCalendarEvents } from "./seed-lark-events";

export async function seedUsersModule(prisma: PrismaClient) {
	await seedDepartments(prisma);
	await seedRolesAndPermissions(prisma);
	// Fixed real/hero identities first, so the virtual-pool seed treats them as
	// reserved and downstream modules can match them by email.
	await seedRealAccounts(prisma);
	await seedUsers(prisma);
	await seedUserRoles(prisma);
	await seedUserManagerRelations(prisma);
	await seedRealAccountManagerRelations(prisma);
	await seedProjects(prisma);
}

