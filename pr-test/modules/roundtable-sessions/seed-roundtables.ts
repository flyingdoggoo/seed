import {
	CycleStatus,
	PrismaClient,
	RoundTableStatus,
	StageType,
} from "@prisma/client";
import {
	feedbackPool,
	getRandomItem,
	getRandomRating,
} from "../mock-data/mock-utils";
import { ROUNDTABLE_REVIEWER_EMAILS, CYCLE } from "../showcase-data";

/**
 * Showcase roundtable seed (replaces the old AOO/BDO-only mock).
 *
 * Only COMPLETED cycles get seeded sessions. The ACTIVE cycle's roundtable is
 * created MANUALLY by HR during the demo, so we intentionally leave it empty here —
 * the evidence (self/peer submissions + performance records) is still seeded so the
 * room has data once HR schedules it.
 *
 * For every COMPLETED cycle that has a roundtable stage:
 *   - one roundtable session grouped per department represented in the cycle
 *   - Long Nguyen + Tung Nguyen sit as reviewers on every session (so HR, who only
 *     sees roundtables they joined, sees a consistent reviewer set across cycles)
 *   - every participant is a reviewee with a RoundtableResult and full criterion
 *     results, all finalized
 */
export async function seedShowcaseRoundtables(prisma: PrismaClient) {
	console.log("Seeding Showcase Roundtable Sessions...");

	await prisma.roundtableSession.deleteMany({});
	await prisma.roundtableResult.deleteMany({});

	const users = await prisma.user.findMany({
		include: {
			userRoles: { include: { role: true } },
			department: { select: { id: true, name: true } },
		},
	});
	const userById = new Map(users.map((u) => [u.id, u]));

	const reviewers = users.filter((u) =>
		ROUNDTABLE_REVIEWER_EMAILS.includes(u.email),
	);
	if (reviewers.length === 0) {
		console.warn("  No showcase roundtable reviewers found. Skipping.");
		return;
	}

	const allCategories = await prisma.evaluationCategory.findMany({
		include: { criteria: true },
	});

	// COMPLETED cycles or the active Bilateral cycle
	const targetCycles = await prisma.pRCycle.findMany({
		where: {
			OR: [
				{ status: CycleStatus.COMPLETED },
				{ name: CYCLE.BILATERAL },
			],
		},
		include: { stages: true, participants: true },
	});

	for (const cycle of targetCycles) {
		const roundtableStage = cycle.stages.find(
			(s) => s.type === StageType.ROUNDTABLE,
		);
		if (!roundtableStage) continue;

		const status = RoundTableStatus.COMPLETED;

		// Group participants by department so each session has a clear roster.
		const participantsByDept = new Map<string, string[]>();
		for (const p of cycle.participants) {
			const u = userById.get(p.employeeId);
			const deptName = u?.department?.name ?? "Unassigned";
			if (!participantsByDept.has(deptName)) participantsByDept.set(deptName, []);
			participantsByDept.get(deptName)!.push(p.employeeId);
		}

		for (const [deptName, employeeIds] of participantsByDept) {
			const session = await prisma.roundtableSession.create({
				data: {
					cycleId: cycle.id,
					title: `Roundtable ${deptName} — ${cycle.name}`,
					departmentName: [deptName],
					status,
					startAt: roundtableStage.startAt,
					endAt: roundtableStage.endAt,
				},
			});

			// Long + Tung review every session.
			for (const reviewer of reviewers) {
				await prisma.roundtableReviewer.create({
					data: { sessionId: session.id, userId: reviewer.id },
				});
			}

			for (const employeeId of employeeIds) {
				const reviewee = userById.get(employeeId);
				if (!reviewee) continue;

				const rtReviewee = await prisma.roundtableReviewee.create({
					data: { sessionId: session.id, employeeId },
				});

				const result = await prisma.roundtableResult.create({
					data: { cycleId: cycle.id, revieweeId: employeeId },
				});
				await prisma.roundtableReviewee.update({
					where: { id: rtReviewee.id },
					data: { roundtableResultId: result.id },
				});

				const isManagement = reviewee.userRoles.some((ur) =>
					["LINE_MANAGER", "PROJECT_MANAGER", "FUNCTION_LEAD"].includes(
						ur.role.code,
					),
				);
				const scope = isManagement ? "MANAGEMENT" : "NON_MANAGEMENT";
				const validCategories = allCategories.filter(
					(c) => c.roleScope === scope,
				);

				for (const cat of validCategories) {
					for (const crit of cat.criteria) {
						await prisma.roundtableCriterionResult.create({
							data: {
								sessionId: session.id,
								revieweeId: rtReviewee.id,
								evaluation_criterion_id: crit.id,
								criterionScore: getRandomRating(),
								feedback: getRandomItem(feedbackPool),
								// COMPLETED cycles are finalized.
								finalizedAt: new Date(),
								roundtableResultId: result.id,
							},
						});
					}
				}
			}
		}

		console.log(
			`  ${cycle.name}: ${participantsByDept.size} session(s), ${cycle.participants.length} reviewees, reviewers=${reviewers.map((r) => r.fullName).join(", ")}`,
		);
	}
}
