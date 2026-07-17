import { PrismaClient, RoleType } from "@prisma/client";
import { DemoConfig } from "../../config";
import { projectsData } from "./departments-projects-data";
import { emailMappings, nameMappings } from "./user-mapping";

export async function seedProjects(prisma: PrismaClient) {
	console.log("Seeding Projects...");

	// Mapping based on user input
	const projectManagerMapping: Record<string, string[]> = {
		SOTRAMS: ["linh.tran@sotrams.ecaps"],
		NOMISERP: [DemoConfig.PROJECT_MANAGER.EMAIL],
		DEMLUOS: [DemoConfig.PROJECT_MANAGER.EMAIL, "linh.tran@sotrams.ecaps"],
		LAYOLIXAT: ["ngan.ho@ehub.com"],
		STUNSTEP: [DemoConfig.PROJECT_MANAGER.EMAIL],
	};

	const projectMembersMapping: Record<string, string[]> = {
		SOTRAMS: [
			"Phat Nguyen (EHUB - FE)",
			"Long Nguyen (EHUB - PDO)",
			"Linh Tran (TMS - PM)",
			"Dung Le (EHUB - BE)",
			"Hanh Tran (EHUB - QA)",
			"Long Nguyen (EHUB - FE)",
			"Tri Nguyen (EHUB - FE)",
			"Thao Le (EHUB - PA)",
			"Hai Nguyen (EHUB - MO)",
			"Minh Ha (TMS - PA)",
			"Nga Nguyen (EHUB - QA)",
			"Hai Pham (EHUB - MO)",
			"Quoc Nguyen (EHUB - BE)",
			"Oanh Do (TMS - DS)",
			"Chuong Vo (TMS - BE)",
			"Tien Le (TMS - PA)",
			"Dung Tran (TMS - FE)",
			"Nhu Nguyen (TMS - BD)",
			"Hoang Nguyen (TMS - DS)",
			"Son Nguyen (TMS - BD)",
			"Kim Thi (TMS - BE)",
			"Linh Ha (TMS - BD)",
			"Long Le (TMS - BD)",
			"Loc Nguyen (TMS - BD)",
			"Trinh Le (TMS - BD)",
		],
		NOMISERP: [
			"An Nguyen (EHUB - PM)",
			"Phat Nguyen (EHUB - FE)",
			"Linh Tran (TMS - PM)",
			"Huyen Cao (EHUB - PA)",
			"A Not (EHUB - FE)",
			"Hai Ta (EHUB - BE)",
			"Dat Le (EHUB - FE)",
		],
		LAYOLIXAT: [
			"Long Nguyen (EHUB - PDO)",
			"Ngan Ho (EHUB - PM)",
			"Viet Truong (EHUB - FE)",
		],
	};

	const users = await prisma.user.findMany({
		include: {
			userRoles: {
				include: {
					role: true,
				},
			},
		},
	});

	// Helper to find a user by email
	const findUser = (emailStr: string) => {
		const mappedEmail = emailMappings[emailStr] || emailStr;
		return users.find((u) => u.email === mappedEmail);
	};

	// Fallback manager if none mapped/found
	const defaultManager =
		users.find((u) =>
			u.userRoles.some((ur) => ur.role.code === RoleType.PROJECT_MANAGER),
		) || users[0];

	for (const prj of projectsData) {
		const managerNames = projectManagerMapping[prj.code] || [];
		const mappedManagers = managerNames.map(findUser).filter(Boolean);

		// Pick the first manager as the primary projectManagerId
		const primaryManager =
			mappedManagers.length > 0 ? mappedManagers[0] : defaultManager;

		if (!primaryManager) {
			console.warn(`No default manager found for ${prj.code}. Skipping.`);
			continue;
		}

		const createdProject = await prisma.project.upsert({
			where: { code: prj.code },
			update: {
				name: prj.name,
				projectManagerId: primaryManager.id,
			},
			create: {
				name: prj.name,
				code: prj.code,
				status: "ACTIVE",
				projectManagerId: primaryManager.id,
				startDate: new Date(),
			},
		});

		// Add ALL mapped managers (including the 2nd one) to ProjectMembers so they are linked
		for (const managerUser of mappedManagers) {
			if (!managerUser) continue;

			const existingMember = await prisma.projectMembers.findFirst({
				where: { projectId: createdProject.id, employeeId: managerUser.id },
			});

			if (!existingMember) {
				await prisma.projectMembers.create({
					data: {
						projectId: createdProject.id,
						employeeId: managerUser.id,
						joinAt: new Date(),
					},
				});
			}
		}

		// Add mapped regular employees to the project
		const membersToAssign = projectMembersMapping[prj.code] || [];

		for (const memberName of membersToAssign) {
			const mappedName = nameMappings[memberName] || memberName;
			const emp = users.find((u) => u.fullName === mappedName);
			if (!emp) {
				console.warn(
					`Could not find user with full name "${memberName}" for project ${prj.code}. Skipping.`,
				);
				continue;
			}

			const existingMember = await prisma.projectMembers.findFirst({
				where: { projectId: createdProject.id, employeeId: emp.id },
			});

			if (!existingMember) {
				await prisma.projectMembers.create({
					data: {
						projectId: createdProject.id,
						employeeId: emp.id,
						joinAt: new Date(),
					},
				});
			}
		}
	}

	console.log(
		`Seeded ${projectsData.length} Projects with PM and team member mappings.`,
	);
}
