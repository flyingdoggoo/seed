import { PrismaClient, RoundTableStatus, StageType } from "@prisma/client";
import {
	feedbackPool,
	getRandomItem,
	getRandomRating,
} from "../mock-data/mock-utils";
import { DemoConfig } from "../../config";

export async function seedMockRoundtables(prisma: PrismaClient) {
	console.log("Seeding Mock Roundtable Sessions...");

	// Clean old roundtable sessions & results to avoid duplicate/stale records
	await prisma.roundtableSession.deleteMany({});
	await prisma.roundtableResult.deleteMany({});

	// Setup department mapping for AOO and BDO reviewees
	const aooDept = await prisma.department.findFirst({ where: { code: "AOO" } });
	const bdoDept = await prisma.department.findFirst({ where: { code: "BDO" } });

	const aooNames = [
		"Loan Ngo (TMS - CS)",
		"Tien Le (TMS - PA)",
		"An Nguyen (EHUB - AM)",
		"Hang Do (EG - HR)",
		"Van Nguyen (EHUB - AM)",
		"Linh Tran (TMS - PM)",
	];

	const bdoNames = [
		"Sinh Nguyen (EHUB - BD)",
		"Ngoc Dang (EHUB - BD)",
		"Phuc Pham (EG - CA)",
		"Hoang Nguyen (EHUB - WD)",
	];

	if (aooDept) {
		await prisma.user.updateMany({
			where: { fullName: { in: aooNames } },
			data: { departmentId: aooDept.id },
		});
		console.log(`Assigned ${aooNames.length} users to department AOO`);
	}

	if (bdoDept) {
		await prisma.user.updateMany({
			where: { fullName: { in: bdoNames } },
			data: { departmentId: bdoDept.id },
		});
		console.log(`Assigned ${bdoNames.length} users to department BDO`);
	}

	const users = await prisma.user.findMany({
		include: { userRoles: { include: { role: true } } },
	});

	// Get all COMPLETED and ACTIVE cycles to seed sessions for
	const targetCycles = await prisma.pRCycle.findMany({
		where: { status: { in: ["COMPLETED", "ACTIVE"] } },
		include: { stages: true, participants: true },
	});

	const departments = await prisma.department.findMany({
		include: { users: true },
	});

	const allCategories = await prisma.evaluationCategory.findMany({
		include: { criteria: true },
	});

	const demoManager = users.find((u) => u.email === DemoConfig.LINE_MANAGER.EMAIL);

	for (const cycle of targetCycles) {
		const roundtableStage = cycle.stages.find(
			(s) => s.type === StageType.ROUNDTABLE,
		);
		if (!roundtableStage) continue;

		// Skip seeding roundtable sessions for "[TEST] Q3 2026 PR Cycle" to allow manual generation testing
		if (cycle.name === "[TEST] Q3 2026 PR Cycle") {
			continue;
		}

		// Only seed for "Q1 2025 PR Cycle"
		if (cycle.name !== "Q1 2025 PR Cycle") {
			continue;
		}

		// Only seed for AOO and BDO departments as requested
		const targetDepts = departments.filter((d) => ["AOO", "BDO"].includes(d.code));

		for (const dept of targetDepts) {
			let status = RoundTableStatus.COMPLETED;
			let startAt = new Date("2026-08-05T10:00:00Z");
			let endAt = new Date("2026-08-05T12:00:00Z");

			const session = await prisma.roundtableSession.create({
				data: {
					cycleId: cycle.id,
					title: `Roundtable ${dept.name} - ${cycle.name}`,
					departmentName: [dept.name],
					status,
					startAt,
					endAt,
				},
			});

			let reviewees: typeof users = [];
			let reviewers: typeof users = [];

			if (dept.code === "AOO") {
				reviewees = users.filter((u) => aooNames.includes(u.fullName));
				if (demoManager) reviewers.push(demoManager);
			} else if (dept.code === "BDO") {
				reviewees = users.filter((u) => bdoNames.includes(u.fullName));
				if (demoManager) reviewers.push(demoManager);
			}

			for (const reviewer of reviewers) {
				await prisma.roundtableReviewer.create({
					data: { sessionId: session.id, userId: reviewer.id },
				});
			}

			for (const reviewee of reviewees) {
				const rtReviewee = await prisma.roundtableReviewee.create({
					data: { sessionId: session.id, employeeId: reviewee.id },
				});

				const result = await prisma.roundtableResult.create({
					data: { cycleId: cycle.id, revieweeId: reviewee.id },
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
								finalizedAt: new Date(),
								roundtableResultId: result.id,
							},
						});
					}
				}
			}
		}
	}
}
