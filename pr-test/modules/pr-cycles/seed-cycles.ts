import {
	AssignmentStatus,
	CycleStatus,
	PrismaClient,
	RoleScope,
	StageType,
} from "@prisma/client";
import { PeerMatchingEngine } from "../../../../official_backend/ehub-nestjs-be/src/features/peer-assignments/utils/peer-matching-engine";
import {
	CYCLE,
	CYCLE_SPECS,
	type CycleSpec,
	HERO_PROJECT_MANAGER,
	isEligible,
} from "../showcase-data";

// A participant's role scope, used to pick a same-scope fallback reviewer when the
// matching engine leaves a reviewee unmatched.
const MANAGEMENT_ROLE_CODES = ["LINE_MANAGER", "PROJECT_MANAGER", "FUNCTION_LEAD"];
function isManagementUser(user: { userRoles: { role: { code: string } }[] }): boolean {
	return user.userRoles.some((ur) => MANAGEMENT_ROLE_CODES.includes(ur.role.code));
}

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

	// Fallback reviewer pool per scope, so a reviewee the engine could not match
	// still gets an assignment row. Without this the reviewee is a participant with
	// no assignment, and the backend flags the list as outdated ("re-generate the
	// peer list" — isOutdated fires when distinct reviewees !== participant count).
	const participantById = new Map(participants.map((p) => [p.id, p]));
	const pickFallbackReviewer = (revieweeId: string): string | null => {
		const reviewee = participantById.get(revieweeId);
		if (!reviewee) return null;
		const wantManagement = isManagementUser(reviewee);
		// Prefer a same-scope peer that is not the reviewee.
		const sameScope = participants.find(
			(p) => p.id !== revieweeId && isManagementUser(p) === wantManagement,
		);
		if (sameScope) return sameScope.id;
		// Last resort: anyone else in the cycle.
		const anyOther = participants.find((p) => p.id !== revieweeId);
		return anyOther?.id ?? null;
	};

	// #4: for the "needs PM confirm" draft, force one reviewee to be managed by the
	// hero PM (Tung) and leave it pending, so the peer-list status shows exactly one
	// manager pending (the counter groups pending assignments by managerId).
	const pmPendingRevieweeId =
		needsPmConfirm && ctx.pmUserId
			? results.find((r) => r.revieweeId !== ctx.pmUserId)?.revieweeId ?? null
			: null;

	let assignmentCount = 0;
	for (const r of results) {
		const reviewerId = r.reviewerId ?? pickFallbackReviewer(r.revieweeId);
		if (!reviewerId) continue; // cycle has a single participant — nothing to pair

		// Pin the PM as this reviewee's manager in the needs-PM draft; otherwise use
		// the reviewee's real line manager.
		const managerId =
			r.revieweeId === pmPendingRevieweeId && ctx.pmUserId
				? ctx.pmUserId
				: managerByEmployee.get(r.revieweeId) ?? null;

		// In the "needs PM confirm" draft, the assignment managed by our hero PM stays
		// pending (approvalStatus null, unconfirmed); all others are approved.
		const isPmPending =
			needsPmConfirm && ctx.pmUserId !== null && managerId === ctx.pmUserId;

		await prisma.peerAssignment.create({
			data: {
				peerReviewListId: peerList.id,
				stageId: peerStage.id,
				revieweeId: r.revieweeId,
				reviewerId,
				managerId,
				approvalStatus: isPmPending ? null : true,
				confirmAt: isPmPending ? null : startDate,
				requestedAt: startDate,
				dueAt: new Date(spec.stages.peer.end),
			},
		});
		assignmentCount++;
	}

	console.log(
		`  [${spec.status}] ${spec.name}: ${participants.length} participants, ${assignmentCount} peer assignments (every participant is a reviewee), list=${listStatus}`,
	);

	return { cycleId: cycle.id, selfStageId: selfStage.id, peerStageId: peerStage.id };
}
