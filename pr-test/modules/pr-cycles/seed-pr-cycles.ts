import {
	AssignmentStatus,
	CycleStatus,
	PrismaClient,
	StageType,
} from "@prisma/client";
import { DemoConfig } from "../../config";

function getEligibleUsers(users: any[], startDate: Date, tenureMonths = 4) {
	const cutOffDate = new Date(startDate);
	cutOffDate.setMonth(cutOffDate.getMonth() - tenureMonths);

	return users.filter((u) => {
		if (!u.joinedAt) return false;
		const joinedDate = new Date(u.joinedAt);
		return joinedDate <= cutOffDate;
	});
}

export async function seedPrCycles(prisma: PrismaClient) {
	console.log("Seeding PR Cycles...");

	// Clean old cycles
	await prisma.pRCycle.deleteMany({});

	// Fetch required data
	const users = await prisma.user.findMany({});
	const userManagers = await prisma.userManagerRelation.findMany({
		where: { relationshipType: "LINE_MANAGER" },
	});

	const forms = await prisma.pRForm.findMany({});
	const getForm = (type: string, scope: string) =>
		forms.find((f) => f.stageType === type && f.roleScope === scope)?.id ||
		null;

	const mSelfFormId = getForm("SELF_REVIEW", "MANAGEMENT");
	const nmSelfFormId = getForm("SELF_REVIEW", "NON_MANAGEMENT");
	const mPeerFormId = getForm("PEER_REVIEW", "MANAGEMENT");
	const nmPeerFormId = getForm("PEER_REVIEW", "NON_MANAGEMENT");

	const cyclesToCreate = [
		{ name: "Q1 2025 PR Cycle", status: CycleStatus.COMPLETED },
		{ name: "Q2 2025 PR Cycle", status: CycleStatus.DRAFT },
		{ name: "Q1 2026 PR Cycle", status: CycleStatus.DRAFT }, // "ready to publish" -> ACTIVE
		{ name: "Q2 2026 PR Cycle", status: CycleStatus.DRAFT },
	];

	const demoManager = await prisma.user.findFirst({
		where: { email: DemoConfig.LINE_MANAGER.EMAIL },
	});

	if (demoManager) {
		console.log(`Found Demo Manager: ${demoManager.fullName} (${demoManager.id})`);
	} else {
		console.log(`Warning: Demo Manager with email ${DemoConfig.LINE_MANAGER.EMAIL} not found!`);
	}

	for (const cycleData of cyclesToCreate) {
		let startDate = new Date();
		let endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
		let publishAt = new Date();

		if (cycleData.name === "Q1 2025 PR Cycle") {
			startDate = new Date("2025-01-01T00:00:00Z");
			endDate = new Date("2025-02-01T00:00:00Z");
			publishAt = new Date("2025-01-01T00:00:00Z");
		} else if (cycleData.name === "Q2 2025 PR Cycle") {
			startDate = new Date("2025-04-01T00:00:00Z");
			endDate = new Date("2025-05-01T00:00:00Z");
			publishAt = new Date("2025-04-01T00:00:00Z");
		} else if (cycleData.name.includes("2026")) {
			startDate = new Date("2026-08-09T00:00:00Z");
			endDate = new Date("2026-09-09T00:00:00Z");
			publishAt = new Date("2026-08-09T00:00:00Z");
		}

		const cycle = await prisma.pRCycle.create({
			data: {
				name: cycleData.name,
				status: cycleData.status,
				startDate,
				endDate,
				publishAt,
				tenureMonths: 4,
			},
		});

		// Create EvaluationSetVersion records for all criteria
		const categories = await prisma.evaluationCategory.findMany({
			include: { criteria: true },
		});
		for (const cat of categories) {
			for (const crit of cat.criteria) {
				await prisma.evaluationSetVersion.create({
					data: {
						cycleId: cycle.id,
						categoryId: cat.id,
						criterionId: crit.id,
					},
				});
			}
		}

		// Create Stages
		const stagesData = [
			{
				name: "Self Review",
				type: StageType.SELF_REVIEW,
				mFormId: mSelfFormId,
				nmFormId: nmSelfFormId,
			},
			{
				name: "Peer Review",
				type: StageType.PEER_REVIEW,
				mFormId: mPeerFormId,
				nmFormId: nmPeerFormId,
			},
			{
				name: "Roundtable",
				type: StageType.ROUNDTABLE,
				mFormId: null,
				nmFormId: null,
			},
			{
				name: "One on One",
				type: StageType.ONE_ON_ONE,
				mFormId: null,
				nmFormId: null,
			},
		];

		const createdStages: Record<string, string> = {};
		for (const st of stagesData) {
			const stage = await prisma.pRCycleStage.create({
				data: {
					cycleId: cycle.id,
					name: st.name,
					type: st.type,
					managementFormId: st.mFormId,
					nonManagementFormId: st.nmFormId,
					startAt: startDate,
					endAt: endDate,
				},
			});
			createdStages[st.type] = stage.id;
		}

		// Filter eligible users for this cycle (avoid mismatch that triggers "Generate List Again")
		const eligibleUsersForCycle = getEligibleUsers(users, cycle.startDate!, 4);

		// Add Participants
		for (const user of eligibleUsersForCycle) {
			await prisma.cycleParticipant.create({
				data: {
					cycleId: cycle.id,
					employeeId: user.id,
				},
			});
		}

		// Peer Review Data for Q1 2026
		if (cycleData.name === "Q1 2026 PR Cycle") {
			const peerList = await prisma.peerReviewList.create({
				data: {
					cycleId: cycle.id,
					status: AssignmentStatus.CONFIRMED,
				},
			});

			// Create Peer Assignments
			for (let i = 0; i < eligibleUsersForCycle.length; i++) {
				const reviewee = eligibleUsersForCycle[i];
				const reviewer = eligibleUsersForCycle[(i + 1) % eligibleUsersForCycle.length];

				const managerRel = userManagers.find(
					(um) => um.employeeId === reviewee.id,
				);

				await prisma.peerAssignment.create({
					data: {
						peerReviewListId: peerList.id,
						stageId: createdStages[StageType.PEER_REVIEW],
						revieweeId: reviewee.id,
						reviewerId: reviewer.id,
						managerId: managerRel ? managerRel.managerId : null,
						approvalStatus: true,
						confirmAt: new Date(),
						requestedAt: new Date(),
						dueAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
					},
				});
			}
		}

		// Peer Review Data for Q2 2026 (Demo Cycle: all managers confirmed except the demo manager)
		if (cycleData.name === "Q2 2026 PR Cycle") {
			const peerList = await prisma.peerReviewList.create({
				data: {
					cycleId: cycle.id,
					status: AssignmentStatus.REQUESTED,
				},
			});

			// Create Peer Assignments
			for (let i = 0; i < eligibleUsersForCycle.length; i++) {
				const reviewee = eligibleUsersForCycle[i];
				const reviewer = eligibleUsersForCycle[(i + 1) % eligibleUsersForCycle.length];

				const managerRel = userManagers.find(
					(um) => um.employeeId === reviewee.id,
				);

				const managerId = managerRel ? managerRel.managerId : null;

				// If manager is the demo line manager, set status to pending (null)
				// Otherwise, set to approved (true) and confirmed
				const isDemoManager = demoManager && managerId === demoManager.id;
				const approvalStatus = isDemoManager ? null : true;
				const confirmAt = isDemoManager ? null : new Date();

				await prisma.peerAssignment.create({
					data: {
						peerReviewListId: peerList.id,
						stageId: createdStages[StageType.PEER_REVIEW],
						revieweeId: reviewee.id,
						reviewerId: reviewer.id,
						managerId,
						approvalStatus,
						confirmAt,
						requestedAt: new Date(),
						dueAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
					},
				});
			}
		}
	}

	console.log("Seeded PR Cycles and Peer Assignments.");
}
