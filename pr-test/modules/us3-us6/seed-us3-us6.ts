import {
	AssignmentStatus,
	CycleStatus,
	FormStatus,
	PrismaClient,
	RoleScope,
	RoleType,
	StageType,
	SubmissionStatus,
} from "@prisma/client";
import { feedbackPool, getRandomItem, getRandomRating } from "../mock-data/mock-utils";
import { DemoConfig } from "../../config";
import { pendingEmployeesData } from "../users/additional-users";
import { emailMappings, nameMappings } from "../users/user-mapping";

// ─── Constants ───────────────────────────────────────────────────────────────
const NOW = new Date();
const PAST_30_DAYS = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000);
const PAST_3_DAYS = new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000);
const FUTURE_14_DAYS = new Date(NOW.getTime() + 14 * 24 * 60 * 60 * 1000);
const CYCLE_START_ACTIVE = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000);
const CYCLE_START_OVERDUE = new Date(NOW.getTime() - 45 * 24 * 60 * 60 * 1000);

// Relative stage dates for Cycle A/C
const CYCLE_A_START = new Date(NOW.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago (July 10)
const SELF_STAGE_A_START = CYCLE_A_START;
const SELF_STAGE_A_END = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000);   // 2 days ago (July 13)

const PEER_STAGE_A_START = new Date(NOW.getTime() - 1 * 24 * 60 * 60 * 1000);  // 1 day ago (July 14)
const PEER_STAGE_A_END = new Date(NOW.getTime() + 2 * 24 * 60 * 60 * 1000);    // 2 days from now (July 17)

const ROUNDTABLE_STAGE_A_START = new Date(NOW.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now (July 18)
const ROUNDTABLE_STAGE_A_END = new Date(NOW.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now (July 22)

const ONE_ON_ONE_STAGE_A_START = new Date("2026-08-01T00:00:00Z"); // August 1st, 2026
const ONE_ON_ONE_STAGE_A_END = new Date("2026-08-15T23:59:59Z"); // August 15th, 2026

const CYCLE_A_END = ONE_ON_ONE_STAGE_A_END;

/**
 * US3–US6 Test Cycles
 *
 * Cycle A: "[TEST] Q3 2026 PR Cycle" — ACTIVE (còn hạn 14 ngày)
 *   Scenarios:
 *   - Alice: form trống (Not Started)     → US3: xem form | US5: block submit
 *   - Bob:   self DRAFT (thiếu 1 câu bắt buộc, peer DRAFT) → US4: điền dở | US5: block
 *   - Carol: self SUBMITTED, peer SUBMITTED → US5: success | US6: read-only
 *
 * Cycle B: "[TEST] Q1 2026 PR Cycle (Overdue)" — ACTIVE nhưng deadline đã qua
 *   Scenarios:
 *   - Alice: self/peer LOCKED (auto-lock)  → US6: deadline lock
 *   - Bob:   self LATE (draft → locked)    → US6: deadline lock
 *   - Carol: self SUBMITTED (trước hạn)    → US6: submitted read-only
 */
export async function seedUS3US6Cycles(prisma: PrismaClient) {
	console.log("\n--- Seeding US3-US6 Test Cycles ---");

	// Clean up old Overdue cycle if exists
	const oldOverdue = await prisma.pRCycle.findFirst({
		where: { name: "[TEST] Q1 2026 PR Cycle (Overdue)" },
	});
	if (oldOverdue) {
		await prisma.pRCycle.delete({ where: { id: oldOverdue.id } });
	}

	// ── 1. Lấy/tạo test users ────────────────────────────────────────────────
	const testerEmail = DemoConfig.LINE_MANAGER.EMAIL; // nguyenthanhhieu17022005@ehub.enosta.com
	const testerUser = await prisma.user.findUnique({
		where: { email: testerEmail },
	});

	if (!testerUser) {
		console.warn(`Tester user with email ${testerEmail} not found in DB. Make sure users are seeded first.`);
	}

	// lmUser (Line Manager cho các test case)
	// Để tránh testerUser tự quản lý chính mình, ta chọn một manager khác làm lmUser
	const lmUser = await prisma.user.findFirst({
		where: {
			userRoles: { some: { role: { code: RoleType.LINE_MANAGER } } },
			id: testerUser ? { not: testerUser.id } : undefined,
		},
	});
	if (!lmUser) {
		console.warn("No separate LINE_MANAGER found. Skipping US3-US6 seed.");
		return;
	}

	// Lấy thêm các employee khác để làm Alice và Carol
	const cutoff = new Date(CYCLE_START_ACTIVE.getTime() - 4 * 30 * 24 * 60 * 60 * 1000);
	const otherEmployees = await prisma.user.findMany({
		where: {
			joinedAt: { lte: cutoff },
			userRoles: { some: { role: { code: RoleType.EMPLOYEE } } },
			id: testerUser ? { notIn: [lmUser.id, testerUser.id] } : { not: lmUser.id },
		},
		take: 2,
	});

	if (otherEmployees.length < 2) {
		console.warn(
			`Need at least 2 other eligible employees, found ${otherEmployees.length}. Skipping US3-US6 seed.`,
		);
		return;
	}

	const alice = otherEmployees[0];
	const carol = otherEmployees[1];

	// Gán testerUser làm Bob để người dùng đăng nhập bằng email của họ sẽ có dữ liệu để test US3-US6
	const bob = testerUser || await prisma.user.findFirst({
		where: {
			joinedAt: { lte: cutoff },
			userRoles: { some: { role: { code: RoleType.EMPLOYEE } } },
			id: { notIn: [lmUser.id, alice.id, carol.id] },
		},
	});

	if (!bob) {
		console.warn("Could not resolve Bob user. Skipping US3-US6 seed.");
		return;
	}

	console.log(
		`Test participants: Alice=${alice.fullName} (${alice.email}), Bob [TESTER]=${bob.fullName} (${bob.email}), Carol=${carol.fullName} (${carol.email})`,
	);

	// ── 2. Đảm bảo manager relation tồn tại ─────────────────────────────────
	for (const emp of [alice, bob, carol]) {
		const existing = await prisma.userManagerRelation.findFirst({
			where: { employeeId: emp.id, managerId: lmUser.id },
		});
		if (!existing) {
			await prisma.userManagerRelation.create({
				data: {
					employeeId: emp.id,
					managerId: lmUser.id,
					relationshipType: "LINE_MANAGER",
					status: "ACTIVE",
					startDate: new Date("2023-01-01"),
				},
			});
		}
	}

	// ── 3. Lấy form NON_MANAGEMENT & MANAGEMENT ──────────────────────────────
	const selfFormNonMgmt = await prisma.pRForm.findFirst({
		where: { stageType: StageType.SELF_REVIEW, roleScope: RoleScope.NON_MANAGEMENT },
		include: { questions: true, sections: { include: { questions: true } } },
	});
	const peerFormNonMgmt = await prisma.pRForm.findFirst({
		where: { stageType: StageType.PEER_REVIEW, roleScope: RoleScope.NON_MANAGEMENT },
		include: { questions: true, sections: { include: { questions: true } } },
	});
	const selfFormMgmt = await prisma.pRForm.findFirst({
		where: { stageType: StageType.SELF_REVIEW, roleScope: RoleScope.MANAGEMENT },
		include: { questions: true, sections: { include: { questions: true } } },
	});
	const peerFormMgmt = await prisma.pRForm.findFirst({
		where: { stageType: StageType.PEER_REVIEW, roleScope: RoleScope.MANAGEMENT },
		include: { questions: true, sections: { include: { questions: true } } },
	});

	if (!selfFormNonMgmt || !peerFormNonMgmt || !selfFormMgmt || !peerFormMgmt) {
		console.warn("Required forms not found. Run criteria + forms seed first.");
		return;
	}

	const getFormQuestions = (form: any) => {
		const rootQs = form.questions || [];
		const sectionQs = (form.sections || []).flatMap((s: any) => s.questions || []);
		const allQs = [...rootQs, ...sectionQs];
		const uniqueMap = new Map();
		for (const q of allQs) {
			uniqueMap.set(q.id, q);
		}
		return Array.from(uniqueMap.values());
	};

	const selfQuestionsNonMgmt = getFormQuestions(selfFormNonMgmt);
	const peerQuestionsNonMgmt = getFormQuestions(peerFormNonMgmt);
	const selfQuestionsMgmt = getFormQuestions(selfFormMgmt);
	const peerQuestionsMgmt = getFormQuestions(peerFormMgmt);

	// Helper: tạo answers đầy đủ (tất cả câu có rating + textAnswer)
	const makeFullAnswers = (questions: any[]) =>
		questions.map((q) => ({
			questionId: q.id,
			rating: q.type === "RATING" ? getRandomRating() : undefined,
			textAnswer: getRandomItem(feedbackPool),
		}));

	// Helper: tạo answers thiếu (bỏ trống câu required cuối cùng để test validation)
	const makeDraftAnswers = (questions: any[]) => {
		if (questions.length === 0) return [];
		// Điền tất cả trừ câu required cuối (để test US5 block)
		const requiredQs = questions.filter((q) => q.required);
		const lastRequired = requiredQs[requiredQs.length - 1];
		return questions
			.filter((q) => q.id !== lastRequired?.id)
			.map((q) => ({
				questionId: q.id,
				rating: q.type === "RATING" ? getRandomRating() : undefined,
				textAnswer: getRandomItem(feedbackPool),
			}));
	};

	// ══════════════════════════════════════════════════════════════════════════
	// CYCLE A: Active (còn hạn)
	// ══════════════════════════════════════════════════════════════════════════
	await seedCycleA(prisma, {
		lmUser,
		alice,
		bob,
		carol,
		selfFormNonMgmt,
		peerFormNonMgmt,
		selfFormMgmt,
		peerFormMgmt,
		selfQuestionsNonMgmt,
		peerQuestionsNonMgmt,
		selfQuestionsMgmt,
		peerQuestionsMgmt,
		makeFullAnswers,
		makeDraftAnswers,
	});



	console.log("--- US3-US6 Test Cycles seeded successfully ---\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// CYCLE A: [TEST] Q3 2026 PR Cycle — Còn hạn 14 ngày
// ─────────────────────────────────────────────────────────────────────────────
async function seedCycleA(
	prisma: PrismaClient,
	ctx: {
		lmUser: any;
		alice: any;
		bob: any;
		carol: any;
		selfFormNonMgmt: any;
		peerFormNonMgmt: any;
		selfFormMgmt: any;
		peerFormMgmt: any;
		selfQuestionsNonMgmt: any[];
		peerQuestionsNonMgmt: any[];
		selfQuestionsMgmt: any[];
		peerQuestionsMgmt: any[];
		makeFullAnswers: (q: any[]) => any[];
		makeDraftAnswers: (q: any[]) => any[];
	},
) {
	const {
		lmUser,
		alice,
		bob,
		carol,
		selfFormNonMgmt,
		peerFormNonMgmt,
		selfFormMgmt,
		peerFormMgmt,
		selfQuestionsNonMgmt,
		peerQuestionsNonMgmt,
		selfQuestionsMgmt,
		peerQuestionsMgmt,
		makeFullAnswers,
		makeDraftAnswers,
	} = ctx;

	console.log("  [Cycle A] Creating active cycle with 14-day deadline...");

	// Xóa cycle cũ nếu tồn tại để seed lại sạch
	const existing = await prisma.pRCycle.findFirst({
		where: { name: "[TEST] Q3 2026 PR Cycle" },
	});
	if (existing) {
		await prisma.pRCycle.delete({ where: { id: existing.id } });
	}

	const cycleA = await prisma.pRCycle.create({
		data: {
			name: "[TEST] Q3 2026 PR Cycle",
			status: CycleStatus.ACTIVE,
			startDate: CYCLE_A_START,
			endDate: CYCLE_A_END,
			publishAt: CYCLE_A_START,
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
					cycleId: cycleA.id,
					categoryId: cat.id,
					criterionId: crit.id,
				},
			});
		}
	}

	// Stages
	const selfStageA = await prisma.pRCycleStage.create({
		data: {
			cycleId: cycleA.id,
			name: "Self Review",
			type: StageType.SELF_REVIEW,
			nonManagementFormId: selfFormNonMgmt.id,
			managementFormId: selfFormMgmt.id,
			startAt: SELF_STAGE_A_START,
			endAt: SELF_STAGE_A_END,
		},
	});
	const peerStageA = await prisma.pRCycleStage.create({
		data: {
			cycleId: cycleA.id,
			name: "Peer Review",
			type: StageType.PEER_REVIEW,
			nonManagementFormId: peerFormNonMgmt.id,
			managementFormId: peerFormMgmt.id,
			startAt: PEER_STAGE_A_START,
			endAt: PEER_STAGE_A_END,
		},
	});
	await prisma.pRCycleStage.createMany({
		data: [
			{
				cycleId: cycleA.id,
				name: "Roundtable",
				type: StageType.ROUNDTABLE,
				startAt: ROUNDTABLE_STAGE_A_START,
				endAt: ROUNDTABLE_STAGE_A_END,
			},
			{
				cycleId: cycleA.id,
				name: "One on One",
				type: StageType.ONE_ON_ONE,
				startAt: ONE_ON_ONE_STAGE_A_START,
				endAt: ONE_ON_ONE_STAGE_A_END,
			},
		],
	});

	// Deduplicate by name
	const uniquePendingData = Array.from(
		new Map(pendingEmployeesData.map((item) => [item.fullName, item])).values(),
	);

	console.log(`  [Cycle A] Processing ${uniquePendingData.length} unique employees for roundtable...`);

	const departments = await prisma.department.findMany();
	const projects = await prisma.project.findMany();
	const employeeRole = await prisma.role.findFirst({
		where: { code: RoleType.EMPLOYEE },
	});

	const additionalEmployees = [];
	let projectIdx = 0;
	let deptIdx = 0;

	for (const item of uniquePendingData) {
		const dbDept = departments[deptIdx % departments.length];
		deptIdx++;

		const mappedName = nameMappings[item.fullName] || item.fullName;

		let user = await prisma.user.findFirst({
			where: { fullName: mappedName },
		});

		if (user) {
			user = await prisma.user.update({
				where: { id: user.id },
				data: {
					departmentId: dbDept.id,
					jobTitle: item.jobTitle,
				},
			});
		} else {
			const cleanName = mappedName.split("(")[0].trim();
			const emailName = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");
			const rawEmail = `${emailName}.${dbDept.code.toLowerCase()}@team.ehub.com`;
			const email = emailMappings[rawEmail] || rawEmail;
			const empCode = `EMP-R-${Math.floor(10000 + Math.random() * 90000)}`;

			user = await prisma.user.create({
				data: {
					email,
					fullName: mappedName,
					employeeCode: empCode,
					joinedAt: new Date("2024-01-01"),
					departmentId: dbDept.id,
					jobTitle: item.jobTitle,
				},
			});

			if (employeeRole) {
				await prisma.userRole.create({
					data: {
						userId: user.id,
						roleId: employeeRole.id,
					},
				});
			}
		}

		await prisma.projectMembers.deleteMany({
			where: { employeeId: user.id },
		});

		if (projects.length > 0) {
			const prj = projects[projectIdx % projects.length];
			projectIdx++;
			await prisma.projectMembers.create({
				data: {
					projectId: prj.id,
					employeeId: user.id,
					joinAt: new Date("2024-01-01"),
				},
			});
		}

		additionalEmployees.push(user);
	}

	// Ensure manager relation and participant record exists for all participants
	const allParticipants = [alice, bob, carol, ...additionalEmployees];
	for (const emp of allParticipants) {
		await prisma.cycleParticipant.create({ data: { cycleId: cycleA.id, employeeId: emp.id } });

		const existingRel = await prisma.userManagerRelation.findFirst({
			where: { employeeId: emp.id, managerId: lmUser.id },
		});
		if (!existingRel) {
			await prisma.userManagerRelation.create({
				data: {
					employeeId: emp.id,
					managerId: lmUser.id,
					relationshipType: "LINE_MANAGER",
					status: "ACTIVE",
					startDate: new Date("2023-01-01"),
				},
			});
		}
	}

	// Peer Review List + Assignments
	const peerListA = await prisma.peerReviewList.create({
		data: { cycleId: cycleA.id, status: AssignmentStatus.CONFIRMED },
	});
	// alice ← bob, bob ← carol, carol ← alice
	const pairings = [
		{ reviewee: alice, reviewer: bob },
		{ reviewee: bob, reviewer: carol },
		{ reviewee: carol, reviewer: alice },
	];
	for (const { reviewee, reviewer } of pairings) {
		await prisma.peerAssignment.create({
			data: {
				peerReviewListId: peerListA.id,
				stageId: peerStageA.id,
				revieweeId: reviewee.id,
				reviewerId: reviewer.id,
				managerId: lmUser.id,
				approvalStatus: true,
				confirmAt: PEER_STAGE_A_START,
				requestedAt: PEER_STAGE_A_START,
				dueAt: PEER_STAGE_A_END,
			},
		});
	}

	// ── Alice: Not Started (US3 – chỉ xem form, chưa điền gì) ───────────────
	// Không tạo submission cho alice → FE sẽ render "Not Started" state
	console.log(`    Alice (${alice.fullName}): Not Started — no submission created`);

	// ── Bob: Self DRAFT (thiếu câu required) + Peer DRAFT ───────────────────
	// Bob is a Manager: uses MANAGEMENT forms
	const bobDraftAnswers = makeDraftAnswers(selfQuestionsMgmt);
	await prisma.pRFormSubmission.create({
		data: {
			cycleId: cycleA.id,
			stageId: selfStageA.id,
			formId: selfFormMgmt.id,
			authorId: bob.id,
			revieweeId: bob.id,
			status: SubmissionStatus.DRAFT,
			answers: { create: bobDraftAnswers },
		},
	});
	// Bob cũng có peer submission draft (review alice). Bob (Manager reviewer) reviews Alice (Non-Manager).
	// Since Bob is a Manager, his reviewer role scope is MANAGEMENT, so his submission form uses peerFormMgmt.
	const bobPeerDraftAnswers = makeDraftAnswers(peerQuestionsMgmt);
	const alicePeerAssignment = await prisma.peerAssignment.findFirst({
		where: { peerReviewListId: peerListA.id, revieweeId: alice.id, reviewerId: bob.id },
	});
	const bobPeerSub = await prisma.pRFormSubmission.create({
		data: {
			cycleId: cycleA.id,
			stageId: peerStageA.id,
			formId: peerFormMgmt.id,
			authorId: bob.id,
			revieweeId: alice.id,
			status: SubmissionStatus.DRAFT,
			answers: { create: bobPeerDraftAnswers },
		},
	});
	if (alicePeerAssignment) {
		await prisma.peerAssignment.update({
			where: { id: alicePeerAssignment.id },
			data: { submissionId: bobPeerSub.id },
		});
	}
	console.log(`    Bob (${bob.fullName}): Self DRAFT (missing required) + Peer DRAFT`);

	// ── Carol: Self SUBMITTED + Peer SUBMITTED ────────────────────────────────
	// Carol is Non-Manager: uses NON_MANAGEMENT forms
	const carolSelfAnswers = makeFullAnswers(selfQuestionsNonMgmt);
	const carolSelfScore =
		selfQuestionsNonMgmt.length > 0
			? parseFloat(
					(carolSelfAnswers.reduce((a, r) => a + (r.rating || 0), 0) / selfQuestionsNonMgmt.length).toFixed(2),
				)
			: 0;
	await prisma.pRFormSubmission.create({
		data: {
			cycleId: cycleA.id,
			stageId: selfStageA.id,
			formId: selfFormNonMgmt.id,
			authorId: carol.id,
			revieweeId: carol.id,
			status: SubmissionStatus.SUBMITTED,
			totalScore: carolSelfScore,
			submittedAt: PAST_3_DAYS,
			answers: { create: carolSelfAnswers },
		},
	});
	// Carol (Non-Manager reviewer) reviews Bob (Manager).
	// Since Carol is Non-Manager, her reviewer role scope is NON_MANAGEMENT, so she uses peerFormNonMgmt.
	const carolPeerAnswers = makeFullAnswers(peerQuestionsNonMgmt);
	const carolPeerScore =
		peerQuestionsNonMgmt.length > 0
			? parseFloat(
					(carolPeerAnswers.reduce((a, r) => a + (r.rating || 0), 0) / peerQuestionsNonMgmt.length).toFixed(2),
				)
			: 0;
	const bobPeerAssignment = await prisma.peerAssignment.findFirst({
		where: { peerReviewListId: peerListA.id, revieweeId: bob.id, reviewerId: carol.id },
	});
	const carolPeerSub = await prisma.pRFormSubmission.create({
		data: {
			cycleId: cycleA.id,
			stageId: peerStageA.id,
			formId: peerFormNonMgmt.id,
			authorId: carol.id,
			revieweeId: bob.id,
			status: SubmissionStatus.SUBMITTED,
			totalScore: carolPeerScore,
			submittedAt: PAST_3_DAYS,
			answers: { create: carolPeerAnswers },
		},
	});
	if (bobPeerAssignment) {
		await prisma.peerAssignment.update({
			where: { id: bobPeerAssignment.id },
			data: { submissionId: carolPeerSub.id },
		});
	}
	console.log(`    Carol (${carol.fullName}): Self SUBMITTED + Peer SUBMITTED`);

	// Seed submitted Self Review and 3 peer review assignments/submissions for all additional employees
	const M = additionalEmployees.length;
	console.log(`  [Cycle A] Seeding self reviews and 3/3 peer reviews for ${M} additional employees...`);
	for (let i = 0; i < M; i++) {
		const emp = additionalEmployees[i];

		// 1. Self Review Submission
		const selfAnswers = makeFullAnswers(selfQuestionsNonMgmt);
		const selfScore =
			selfQuestionsNonMgmt.length > 0
				? parseFloat(
						(selfAnswers.reduce((a, r) => a + (r.rating || 0), 0) / selfQuestionsNonMgmt.length).toFixed(2),
					)
				: 0;

		await prisma.pRFormSubmission.create({
			data: {
				cycleId: cycleA.id,
				stageId: selfStageA.id,
				formId: selfFormNonMgmt.id,
				authorId: emp.id,
				revieweeId: emp.id,
				status: SubmissionStatus.SUBMITTED,
				totalScore: selfScore,
				submittedAt: PAST_3_DAYS,
				answers: { create: selfAnswers },
			},
		});

		// 2. 3 Peer Review Assignments & Submissions
		// Pick 3 reviewers from additionalEmployees
		const reviewers = [
			additionalEmployees[(i + 1) % M],
			additionalEmployees[(i + 2) % M],
			additionalEmployees[(i + 3) % M],
		];

		for (const reviewer of reviewers) {
			const peerAnswers = makeFullAnswers(peerQuestionsNonMgmt);
			const peerScore =
				peerQuestionsNonMgmt.length > 0
					? parseFloat(
							(peerAnswers.reduce((a, r) => a + (r.rating || 0), 0) / peerQuestionsNonMgmt.length).toFixed(2),
						)
					: 0;

			const peerSub = await prisma.pRFormSubmission.create({
				data: {
					cycleId: cycleA.id,
					stageId: peerStageA.id,
					formId: peerFormNonMgmt.id,
					authorId: reviewer.id,
					revieweeId: emp.id,
					status: SubmissionStatus.SUBMITTED,
					totalScore: peerScore,
					submittedAt: PAST_3_DAYS,
					answers: { create: peerAnswers },
				},
			});

			await prisma.peerAssignment.create({
				data: {
					peerReviewListId: peerListA.id,
					stageId: peerStageA.id,
					revieweeId: emp.id,
					reviewerId: reviewer.id,
					managerId: lmUser.id,
					approvalStatus: true,
					confirmAt: PEER_STAGE_A_START,
					requestedAt: PEER_STAGE_A_START,
					dueAt: PEER_STAGE_A_END,
					submissionId: peerSub.id,
				},
			});
		}
	}
	console.log(`    Successfully seeded 3/3 peer reviews and self reviews for all additional employees.`);
}


