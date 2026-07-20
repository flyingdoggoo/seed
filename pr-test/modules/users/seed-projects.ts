import { PrismaClient, RoleType } from "@prisma/client";
import { DemoConfig } from "../../config";
import { projectsData } from "./departments-projects-data";
import { emailMappings, nameMappings } from "./user-mapping";

export async function seedProjects(prisma: PrismaClient) {
	console.log("Seeding Projects...");

	// ─── Project Manager mapping (by login email) ─────────────────────────────
	// Determines the primary projectManagerId and auto-adds them as members.
	const projectManagerMapping: Record<string, string[]> = {
		SOTRAMS: ["linh.tran@sotrams.ecaps"],
		NOMISERP: [DemoConfig.PROJECT_MANAGER.EMAIL],
		DEMLUOS: [DemoConfig.PROJECT_MANAGER.EMAIL, "linh.tran@sotrams.ecaps"],
		LAYOLIXAT: ["ngan.ho@ehub.com"],
		// Hiếu Manager (nguyenthanhhieu17022005@ehub.enosta.com) làm PM cho TEVAENOHP
		TEVAENOHP: ["nguyenthanhhieu17022005@ehub.enosta.com"],
	};

	// ─── Explicit member mapping (by fullName) ────────────────────────────────
	// Real + key virtual accounts pinned to specific projects.
	// All remaining users without a project are distributed automatically below.
	const projectMembersMapping: Record<string, string[]> = {
		SOTRAMS: [
			// Virtual pool
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
			// Real accounts
			"Tai Vo",        // Engineering Manager - real account
			"nguyen nguyen", // real account
			"Linh Do",       // Frontend Engineer - real account
			"Chuong Mai",    // Hero employee
		],
		NOMISERP: [
			// Virtual pool
			"An Nguyen (EHUB - PM)",
			"Phat Nguyen (EHUB - FE)",
			"Linh Tran (TMS - PM)",
			"Huyen Cao (EHUB - PA)",
			"A Not (EHUB - FE)",
			"Hai Ta (EHUB - BE)",
			"Dat Le (EHUB - FE)",
			// Real accounts - Hiếu Manager và nhân viên dưới quyền
			"Hiếu Manager",
			"Hiếu HR",
			"Hiếu Nhân Viên",
			"Linh Manager",  // Frontend Chapter Lead - real account
			"Vo Duc Ba",     // real account
		],
		DEMLUOS: [
			// Real accounts assigned to DEMLUOS
			"Le Ky Ba",         // real account
			"Ba Le",            // Backend Chapter Lead - real account
			"Kien Nguyen Enos", // HR Manager - real account
			"Kien Nguyen",      // Frontend Chapter Lead - real account
			"Tai Vo PM",        // Project Manager - real account
		],
		LAYOLIXAT: [
			// Virtual pool
			"Long Nguyen (EHUB - PDO)",
			"Ngan Ho (EHUB - PM)",
			"Viet Truong (EHUB - FE)",
			// Real accounts
			"adam trần",           // Frontend Engineer - real account
			"Tran Hoang Xuan Ba",  // Backend Engineer - real account
		],
		// TEVAENOHP: Hiếu Manager làm PM, cùng với nhân viên dưới quyền
		TEVAENOHP: [
			"Hiếu Manager",
			"Hiếu HR",
			"Hiếu Nhân Viên",
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

	// Helper to find a user by login email
	const findUser = (emailStr: string) => {
		const mappedEmail = emailMappings[emailStr] || emailStr;
		return users.find((u) => u.email === mappedEmail);
	};

	// Fallback manager if none mapped/found
	const defaultManager =
		users.find((u) =>
			u.userRoles.some((ur) => ur.role.code === RoleType.PROJECT_MANAGER),
		) || users[0];

	// ─── Phase 1: Seed projects + explicit member assignments ─────────────────
	const createdProjects: Array<{ id: string; code: string }> = [];

	for (const prj of projectsData) {
		const managerEmails = projectManagerMapping[prj.code] || [];
		const mappedManagers = managerEmails.map(findUser).filter(Boolean);

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

		createdProjects.push({ id: createdProject.id, code: prj.code });

		// Add ALL mapped managers to ProjectMembers so they are linked
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

		// Add explicitly mapped members (by fullName)
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

	// ─── Phase 2: Auto-distribute remaining users without any project ─────────
	// Ensures every employee (real + virtual pool) belongs to at least one project.
	console.log("  Auto-distributing remaining users into projects...");

	const allProjectMembers = await prisma.projectMembers.findMany({
		select: { employeeId: true },
	});
	const assignedUserIds = new Set(allProjectMembers.map((m) => m.employeeId));

	// Exclude HR_ADMIN from project membership (system-wide role, not project-bound)
	const unassignedUsers = users.filter(
		(u) =>
			!assignedUserIds.has(u.id) &&
			!u.userRoles.some((ur) => ur.role.code === RoleType.HR_ADMIN),
	);

	if (unassignedUsers.length > 0 && createdProjects.length > 0) {
		console.log(
			`  Found ${unassignedUsers.length} users without a project — distributing round-robin across ${createdProjects.length} projects.`,
		);

		let projectIndex = 0;
		for (const user of unassignedUsers) {
			const targetProject = createdProjects[projectIndex % createdProjects.length];
			await prisma.projectMembers.create({
				data: {
					projectId: targetProject.id,
					employeeId: user.id,
					joinAt: new Date(),
				},
			});
			projectIndex++;
		}
	} else {
		console.log("  All users already assigned to at least one project.");
	}

	console.log(
		`Seeded ${projectsData.length} Projects with PM, explicit member mappings, and full auto-distribution.`,
	);
}
