import { PrismaClient } from "@prisma/client";
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
	await seedUsers(prisma);
	await seedUserRoles(prisma);
	await seedUserManagerRelations(prisma);
	await seedProjects(prisma);
}

