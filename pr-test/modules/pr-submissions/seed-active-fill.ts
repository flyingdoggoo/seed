import {
	PrismaClient,
	RoleScope,
	StageType,
	SubmissionStatus,
} from "@prisma/client";
import { getRandomItem, getRandomRating } from "../mock-data/mock-utils";
import { feedbackPool } from "../mock-data/mock-utils";
import {
	ACTIVE_PEER_SUBMISSION_COMPLETION,
	ACTIVE_SELF_REVIEW_COMPLETION,
	CYCLE,
	HERO_EMPLOYEE,
	HERO_LINE_MANAGER,
	HERO_PROJECT_MANAGER,
} from "../showcase-data";

/**
 * Fills the ACTIVE cycle to an in-progress Peer Review state:
 *   - self review closed (07-15): all participants have SUBMITTED their self review
 *   - most peer assignments SUBMITTED (ACTIVE_PEER_SUBMISSION_COMPLETION), rest DRAFT
 * Hero accounts are pinned to deterministic states so a demo login always shows a
 * known screen:
 *   - Chuong Mai (employee): self SUBMITTED, one peer assignment still DRAFT (a to-do)
 *   - Long Nguyen (LM) / Tung Nguyen (PM): self SUBMITTED
 */
export async function seedActiveCycleFill(prisma: PrismaClient) {
	console.log("Filling ACTIVE cycle (90% self / 50% peer, heroes pinned)...");

	const cycle = await prisma.pRCycle.findFirst({
		where: { name: CYCLE.ACTIVE },
		include: { stages: true, participants: true },
	});
	if (!cycle) {
		console.warn(`  ACTIVE cycle "${CYCLE.ACTIVE}" not found. Skipping fill.`);
		return;
	}

	const selfStage = cycle.stages.find((s) => s.type === StageType.SELF_REVIEW);
	const peerStage = cycle.stages.find((s) => s.type === StageType.PEER_REVIEW);
	if (!selfStage || !peerStage) return;

	const users = await prisma.user.findMany({
		include: { userRoles: { include: { role: true } } },
	});
	const userById = new Map(users.map((u) => [u.id, u]));

	const forms = await prisma.pRForm.findMany({ include: { questions: true } });
	const getForm = (type: StageType, scope: RoleScope) =>
		forms.find((f) => f.stageType === type && f.roleScope === scope);
	const mSelf = getForm(StageType.SELF_REVIEW, RoleScope.MANAGEMENT);
	const nmSelf = getForm(StageType.SELF_REVIEW, RoleScope.NON_MANAGEMENT);
	const mPeer = getForm(StageType.PEER_REVIEW, RoleScope.MANAGEMENT);
	const nmPeer = getForm(StageType.PEER_REVIEW, RoleScope.NON_MANAGEMENT);
	if (!mSelf || !nmSelf || !mPeer || !nmPeer) return;

	const isManagement = (userId: string) =>
		(userById.get(userId)?.userRoles ?? []).some((ur) =>
			["LINE_MANAGER", "PROJECT_MANAGER", "FUNCTION_LEAD"].includes(ur.role.code),
		);

	const buildAnswers = (questions: { id: string; type: string }[]) => {
		let sum = 0;
		let count = 0;
		const answers = questions.map((q) => {
			const isRating = q.type === "RATING";
			const rating = isRating ? getRandomRating() : undefined;
			if (isRating && rating !== undefined) {
				sum += rating;
				count++;
			}
			return { questionId: q.id, rating, textAnswer: getRandomItem(feedbackPool) };
		});
		const score = count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;
		return { answers, score };
	};

	const heroEmails = new Set([
		HERO_EMPLOYEE.email,
		HERO_LINE_MANAGER.email,
		HERO_PROJECT_MANAGER.email,
	]);

	// ── Self reviews: heroes always submit; others hit ~90% ────────────────────
	const participantIds = cycle.participants.map((p) => p.employeeId);
	const nonHeroParticipants = participantIds.filter(
		(id) => !heroEmails.has(userById.get(id)?.email ?? ""),
	);
	const selfTarget = Math.round(
		nonHeroParticipants.length * ACTIVE_SELF_REVIEW_COMPLETION,
	);

	const submitSelf = async (revieweeId: string) => {
		const mgmt = isManagement(revieweeId);
		const form = mgmt ? mSelf : nmSelf;
		const { answers, score } = buildAnswers(form.questions);
		await prisma.pRFormSubmission.create({
			data: {
				cycleId: cycle.id,
				stageId: selfStage.id,
				formId: form.id,
				authorId: revieweeId,
				revieweeId,
				status: SubmissionStatus.SUBMITTED,
				totalScore: score,
				submittedAt: new Date(),
				answers: { create: answers },
			},
		});
	};

	// Heroes first.
	for (const email of heroEmails) {
		const u = users.find((x) => x.email === email);
		if (u && participantIds.includes(u.id)) await submitSelf(u.id);
	}
	// 90% of the rest.
	for (let i = 0; i < nonHeroParticipants.length; i++) {
		if (i < selfTarget) await submitSelf(nonHeroParticipants[i]);
	}

	// ── Peer submissions: ACTIVE_PEER_SUBMISSION_COMPLETION submitted, rest DRAFT ──
	const assignments = await prisma.peerAssignment.findMany({
		where: { peerReviewList: { cycleId: cycle.id }, reviewerId: { not: null } },
	});

	const chuong = users.find((u) => u.email === HERO_EMPLOYEE.email);

	// Force one of Chuong's outgoing peer assignments to stay DRAFT (a visible
	// to-do when he logs in), and make sure at least one where he is reviewee is done.
	const chuongOutgoing = chuong
		? assignments.filter((a) => a.reviewerId === chuong.id)
		: [];
	const chuongPinnedDraftId = chuongOutgoing[0]?.id ?? null;

	const peerTarget = Math.round(
		assignments.length * ACTIVE_PEER_SUBMISSION_COMPLETION,
	);

	let submitted = 0;
	for (const a of assignments) {
		if (!a.reviewerId) continue;

		// Chuong's pinned assignment always stays DRAFT.
		const forceDraft = a.id === chuongPinnedDraftId;
		const shouldSubmit = !forceDraft && submitted < peerTarget;

		const mgmt = isManagement(a.reviewerId);
		const form = mgmt ? mPeer : nmPeer;
		const { answers, score } = buildAnswers(form.questions);

		if (shouldSubmit) {
			const existingSub = await prisma.pRFormSubmission.findFirst({
				where: {
					stageId: peerStage.id,
					authorId: a.reviewerId,
					revieweeId: a.revieweeId,
				},
			});

			if (!existingSub) {
				const sub = await prisma.pRFormSubmission.create({
					data: {
						cycleId: cycle.id,
						stageId: peerStage.id,
						formId: form.id,
						authorId: a.reviewerId,
						revieweeId: a.revieweeId,
						status: SubmissionStatus.SUBMITTED,
						totalScore: score,
						submittedAt: new Date(),
						assignment: { connect: { id: a.id } },
						answers: { create: answers },
					},
				});
				await prisma.peerAssignment.update({
					where: { id: a.id },
					data: { submissionId: sub.id },
				});
				submitted++;
			}
		} else {
			// DRAFT: partial answers, not yet submitted.
			const existingSub = await prisma.pRFormSubmission.findFirst({
				where: {
					stageId: peerStage.id,
					authorId: a.reviewerId,
					revieweeId: a.revieweeId,
				},
			});

			if (!existingSub) {
				const draftAnswers = answers.slice(0, Math.max(1, answers.length - 1));
				const sub = await prisma.pRFormSubmission.create({
					data: {
						cycleId: cycle.id,
						stageId: peerStage.id,
						formId: form.id,
						authorId: a.reviewerId,
						revieweeId: a.revieweeId,
						status: SubmissionStatus.DRAFT,
						assignment: { connect: { id: a.id } },
						answers: { create: draftAnswers },
					},
				});
				await prisma.peerAssignment.update({
					where: { id: a.id },
					data: { submissionId: sub.id },
				});
			}
		}
	}

	console.log(
		`  ACTIVE fill: ${selfTarget + heroEmails.size} self submitted, ${submitted}/${assignments.length} peer submitted.`,
	);
}
