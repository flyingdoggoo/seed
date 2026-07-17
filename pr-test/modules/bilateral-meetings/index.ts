import { PrismaClient } from "@prisma/client";
import { CYCLE, HERO_EMPLOYEE } from "../showcase-data";

export async function seedMockOneOnOnes(prisma: PrismaClient) {
	console.log("Seeding Mock 1:1 Meetings...");

	const users = await prisma.user.findMany({
		include: { userRoles: { include: { role: true } } },
	});
	const userManagers = await prisma.userManagerRelation.findMany({
		where: { relationshipType: "LINE_MANAGER" },
	});

	const completedCycles = await prisma.pRCycle.findMany({
		where: {
			OR: [
				{ status: "COMPLETED" },
				{ name: CYCLE.BILATERAL },
			],
		},
		include: { participants: true },
	});

	for (const cycle of completedCycles) {
		const results = await prisma.roundtableResult.findMany({
			where: { cycleId: cycle.id },
		});

		for (const result of results) {
			const reviewee = users.find((u) => u.id === result.revieweeId);
			if (!reviewee) continue;

			const managerRel = userManagers.find(
				(um) => um.employeeId === reviewee.id,
			);

			let managerId = managerRel?.managerId;
			if (!managerId) {
				// Find a manager in the same department
				const deptManagers = users.filter(
					(u) =>
						u.departmentId === reviewee.departmentId &&
						u.userRoles.some((r) =>
							["LINE_MANAGER", "PROJECT_MANAGER"].includes(r.role.code),
						),
				);
				managerId = deptManagers.length > 0 ? deptManagers[0].id : reviewee.id;
			}

			const existingMeeting = await prisma.oneOnOneMeeting.findFirst({
				where: { cycleId: cycle.id, employeeId: reviewee.id },
			});

			if (!existingMeeting) {
				const isCompletedCycle = cycle.status === "COMPLETED";
				const isHeroEmployee = reviewee.email === HERO_EMPLOYEE.email;
				const meetingStatus = isCompletedCycle ? true : !isHeroEmployee;

				await prisma.oneOnOneMeeting.create({
					data: {
						cycleId: cycle.id,
						employeeId: reviewee.id,
						managerId: managerId,
						status: meetingStatus,
						RoundTableResultId: result.id,
					},
				});
			}
		}
	}
}
