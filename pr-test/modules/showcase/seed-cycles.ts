import {
	AssignmentStatus,
	CycleStatus,
	PrismaClient,
	RoleScope,
	StageType,
} from "@prisma/client";
import * as path from "path";
import {
	CYCLE,
	CYCLE_SPECS,
	type CycleSpec,
	HERO_PROJECT_MANAGER,
	isCeoOrCpo,
	isEligible,
} from "./showcase-data";

import * as fs from "fs";

const findBackendDir = () => {
	if (process.env.EHUB_BE_DIR) {
		return path.resolve(process.env.EHUB_BE_DIR);
	}
	const candidates = [
		path.resolve(__dirname, "../../../../Ehub-Atsone/ehub-nestjs-be"),
		path.resolve(__dirname, "../../../../official_backend/ehub-nestjs-be"),
		path.resolve(__dirname, "../../../../ehub-nestjs-be"),
	];
	for (const candidate of candidates) {
		if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, "package.json"))) {
			return candidate;
		}
	}
	return candidates[1]; // fallback to default
};
const beDir = findBackendDir();

const { PeerMatchingEngine } = require(
	path.resolve(
		beDir,
		"src/features/peer-assignments/utils/peer-matching-engine",
	),
) as {
	generate: (
		employees: unknown[],
		startDate: Date,
	) => Array<{
		revieweeId: string;
		reviewerId: string | null;
	}>;
};

/**
 * The 5-cycle matrix (replaces the old pr-cycles seed).
 *
 *  - 2 COMPLETED cycles (full execution data filled later by seedMockSubmissions)
 *  - 1 ACTIVE cycle, at the Peer Review stage (90% self / 50% peer filled by the
 *    showcase ACTIVE fill step)
 *  - 2 DRAFT cycles: one ready-to-publish, one blocked on the PM's peer approval
 *
 * Invariant: every cycle's participants == getEligibleEmployees(startDate, tenure)
 * (joinedAt <= startDate - tenure). Peer assignments come from the real backend
 * PeerMatchingEngine so the seeded lists match what "Generate Peer List" produces.
 */
export async function seedShowcaseCycles(prisma: PrismaClient) {
	console.log("Seeding Showcase Cycles (5-cycle matrix)...");

	// Replace any existing cycles so counts stay consistent.
	await prisma.pRCycle.deleteMany({});

	const forms = await prisma.pRForm.findMany();
	const formId = (type: StageType, scope: RoleScope) =>
		forms.find((f) => f.stageType === type && f.roleScope === scope)?.id ?? null;

	const mSelf = formId(StageType.SELF_REVIEW, RoleScope.MANAGEMENT);
	const nmSelf = formId(StageType.SELF_REVIEW, RoleScope.NON_MANAGEMENT);
	const mPeer = formId(StageType.PEER_REVIEW, RoleScope.MANAGEMENT);
	const nmPeer = formId(StageType.PEER_REVIEW, RoleScope.NON_MANAGEMENT);

	if (!mSelf || !nmSelf || !mPeer || !nmPeer) {
		throw new Error(
			"Showcase cycles: required forms missing. Run criteria + forms seed first.",
		);
	}

	const categories = await prisma.evaluationCategory.findMany({
		include: { criteria: true },
	});

	// All users with the context the PeerMatchingEngine needs.
	const allUsers = await prisma.user.findMany({
		include: {
			department: { select: { id: true, name: true } },
			userRoles: { include: { role: true } },
			projectMemberships: {
				include: {
					project: {
						select: { id: true, name: true, projectManagerId: true },
					},
				},
			},
		},
	});

	const pmUser = allUsers.find((u) => u.email === HERO_PROJECT_MANAGER.email);

	for (const spec of CYCLE_SPECS) {
		await seedOneCycle(prisma, spec, {
			allUsers,
			categories,
			forms: { mSelf, nmSelf, mPeer, nmPeer },
			pmUserId: pmUser?.id ?? null,
		});
	}

	console.log(`Seeded ${CYCLE_SPECS.length} showcase cycles.`);
}

async function seedOneCycle(
	prisma: PrismaClient,
	spec: CycleSpec,
	ctx: {
		allUsers: any[];
		categories: any[];
		forms: { mSelf: string; nmSelf: string; mPeer: string; nmPeer: string };
		pmUserId: string | null;
	},
) {
	const startDate = new Date(spec.startDate);

	// Eligible participants = same rule the publish endpoint enforces.
	const participants = ctx.allUsers.filter(
		(u) =>
			u.status === "ACTIVE" &&
			isEligible(u.joinedAt ? new Date(u.joinedAt) : null, startDate, spec.tenureMonths),
	);

	const cycle = await prisma.pRCycle.create({
		data: {
			name: spec.name,
			status: spec.status,
			startDate,
			endDate: new Date(spec.endDate),
			publishAt:
				spec.status === CycleStatus.DRAFT ? null : startDate,
			tenureMonths: spec.tenureMonths,
		},
	});

	// EvaluationSetVersion snapshot for every criterion.
	for (const cat of ctx.categories) {
		for (const crit of cat.criteria) {
			await prisma.evaluationSetVersion.create({
				data: { cycleId: cycle.id, categoryId: cat.id, criterionId: crit.id },
			});
		}
	}

	// Stages (self <= peer <= roundtable <= oneOnOne).
	const selfStage = await prisma.pRCycleStage.create({
		data: {
			cycleId: cycle.id,
			name: "Self Review",
			type: StageType.SELF_REVIEW,
			managementFormId: ctx.forms.mSelf,
			nonManagementFormId: ctx.forms.nmSelf,
			startAt: new Date(spec.stages.self.start),
			endAt: new Date(spec.stages.self.end),
		},
	});
	const peerStage = await prisma.pRCycleStage.create({
		data: {
			cycleId: cycle.id,
			name: "Peer Review",
			type: StageType.PEER_REVIEW,
			managementFormId: ctx.forms.mPeer,
			nonManagementFormId: ctx.forms.nmPeer,
			startAt: new Date(spec.stages.peer.start),
			endAt: new Date(spec.stages.peer.end),
		},
	});
	await prisma.pRCycleStage.createMany({
		data: [
			{
				cycleId: cycle.id,
				name: "Roundtable",
				type: StageType.ROUNDTABLE,
				startAt: new Date(spec.stages.roundtable.start),
				endAt: new Date(spec.stages.roundtable.end),
			},
			{
				cycleId: cycle.id,
				name: "One on One",
				type: StageType.ONE_ON_ONE,
				startAt: new Date(spec.stages.oneOnOne.start),
				endAt: new Date(spec.stages.oneOnOne.end),
			},
		],
	});

	// Participants — exactly the eligible set.
	for (const p of participants) {
		await prisma.cycleParticipant.create({
			data: { cycleId: cycle.id, employeeId: p.id },
		});
	}

	// Peer assignments via the real engine (same-role, project/team, cap 3).
	const matchingInput = participants.map((p) => ({
		id: p.id,
		fullName: p.fullName,
		jobTitle: p.jobTitle,
		departmentId: p.departmentId,
		department: p.department,
		projectMemberships: p.projectMemberships.map((m: any) => ({
			projectId: m.projectId,
			joinAt: m.joinAt,
			leftAt: m.leftAt,
			project: m.project,
		})),
		userRoles: p.userRoles.map((ur: any) => ({ role: { code: ur.role.code } })),
	}));

	const results = PeerMatchingEngine.generate(matchingInput, startDate);

	// The "needs PM confirm" draft leaves the PM's approvals pending so the cycle
	// is not yet ready to publish; every other cycle is CONFIRMED.
	const needsPmConfirm = spec.name === CYCLE.DRAFT_NEEDS_PM;
	const listStatus = needsPmConfirm
		? AssignmentStatus.REQUESTED
		: AssignmentStatus.CONFIRMED;

	const peerList = await prisma.peerReviewList.create({
		data: { cycleId: cycle.id, status: listStatus },
	});

	// Manager (line manager) per reviewee, for the assignment's managerId.
	const managerRelations = await prisma.userManagerRelation.findMany({
		where: { relationshipType: "LINE_MANAGER", status: "ACTIVE" },
	});
	const managerByEmployee = new Map<string, string>();
	for (const rel of managerRelations) {
		if (!managerByEmployee.has(rel.employeeId)) {
			managerByEmployee.set(rel.employeeId, rel.managerId);
		}
	}

	const participantById = new Map(participants.map((p) => [p.id, p]));

	for (const r of results) {
		if (!r.reviewerId) continue; // unmatched reviewee — no assignment row

		const managerId = managerByEmployee.get(r.revieweeId) ?? null;

		// In the "needs PM confirm" draft, assignments whose PM is our hero PM stay
		// pending (approvalStatus null); all others are approved.
		const isPmPending =
			needsPmConfirm && ctx.pmUserId !== null && managerId === ctx.pmUserId;

		await prisma.peerAssignment.create({
			data: {
				peerReviewListId: peerList.id,
				stageId: peerStage.id,
				revieweeId: r.revieweeId,
				reviewerId: r.reviewerId,
				managerId,
				approvalStatus: isPmPending ? null : true,
				confirmAt: isPmPending ? null : startDate,
				requestedAt: startDate,
				dueAt: new Date(spec.stages.peer.end),
			},
		});
	}

	// Ensure Tung Nguyen PM has extra peer review assignments in ACTIVE & DRAFT cycles
	if (
		(spec.status === CycleStatus.ACTIVE || spec.status === CycleStatus.DRAFT) &&
		ctx.pmUserId
	) {
		const pmId = ctx.pmUserId;
		const targets = participants.filter(
			(p) => p.id !== pmId && !isCeoOrCpo(p),
		);
		const targetsToAssign = targets.slice(0, 3);
		for (const target of targetsToAssign) {
			const existing = await prisma.peerAssignment.findFirst({
				where: {
					peerReviewListId: peerList.id,
					revieweeId: target.id,
					reviewerId: pmId,
				},
			});
			if (!existing) {
				const managerId = managerByEmployee.get(target.id) ?? null;
				const isPmPending = needsPmConfirm && managerId === pmId;
				await prisma.peerAssignment.create({
					data: {
						peerReviewListId: peerList.id,
						stageId: peerStage.id,
						revieweeId: target.id,
						reviewerId: pmId,
						managerId,
						approvalStatus: isPmPending ? null : true,
						confirmAt: isPmPending ? null : startDate,
						requestedAt: startDate,
						dueAt: new Date(spec.stages.peer.end),
					},
				});
			}
		}
	}

	console.log(
		`  [${spec.status}] ${spec.name}: ${participants.length} participants, ${results.filter((r) => r.reviewerId).length} peer assignments, list=${listStatus}`,
	);

	return { cycleId: cycle.id, selfStageId: selfStage.id, peerStageId: peerStage.id };
}
