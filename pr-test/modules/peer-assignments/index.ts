import { AssignmentStatus, PrismaClient, StageType } from "@prisma/client";

export async function seedMockPeerAssignments(prisma: PrismaClient) {
	console.log("Seeding Mock Peer Assignments...");

	const users = await prisma.user.findMany({
		include: {
			userRoles: { include: { role: true } },
			department: true,
		},
	});
	const userManagers = await prisma.userManagerRelation.findMany({
		where: { relationshipType: "LINE_MANAGER" },
	});

	const completedCycles = await prisma.pRCycle.findMany({
		where: { status: "COMPLETED" },
		include: { stages: true, participants: true },
	});

	for (const cycle of completedCycles) {
		const peerStage = cycle.stages.find(
			(s) => s.type === StageType.PEER_REVIEW,
		);
		if (!peerStage) continue;

		let peerList = await prisma.peerReviewList.findUnique({
			where: { cycleId: cycle.id },
		});
		if (!peerList) {
			peerList = await prisma.peerReviewList.create({
				data: { cycleId: cycle.id, status: AssignmentStatus.CONFIRMED },
			});
		}

		for (let i = 0; i < cycle.participants.length; i++) {
			const participant = cycle.participants[i];
			const reviewee = users.find((u) => u.id === participant.employeeId)!;
			const managerRel = userManagers.find(
				(um) => um.employeeId === reviewee.id,
			);

			const isSpecialDept =
				reviewee.department?.code === "AOO" ||
				reviewee.department?.code === "BDO";

			const potentialReviewers = users.filter((u) => u.id !== reviewee.id);
			const reviewer1 = potentialReviewers[i % potentialReviewers.length];
			const reviewer2 = potentialReviewers[(i + 1) % potentialReviewers.length];

			const targetReviewers = isSpecialDept
				? [reviewer1, reviewer2]
				: [reviewer1];

			for (const r of targetReviewers) {
				const existingAssignment = await prisma.peerAssignment.findFirst({
					where: {
						peerReviewListId: peerList.id,
						revieweeId: reviewee.id,
						reviewerId: r.id,
					},
				});

				if (!existingAssignment) {
					await prisma.peerAssignment.create({
						data: {
							peerReviewListId: peerList.id,
							stageId: peerStage.id,
							revieweeId: reviewee.id,
							reviewerId: r.id,
							managerId: managerRel?.managerId || null,
							approvalStatus: true,
							confirmAt: new Date(),
							requestedAt: new Date(),
							dueAt: new Date(),
						},
					});
				}
			}
		}
	}
}
