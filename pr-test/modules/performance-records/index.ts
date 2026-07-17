import { CycleStatus, PrismaClient } from "@prisma/client";
import { getRandomItem } from "../mock-data/mock-utils";

// How many criteria each related author logs against, per cycle. Higher = a richer
// evidence matrix in the roundtable room (logs are grouped per criterion there).
const CRITERIA_PER_AUTHOR = 4;

/**
 * Performance records (continuous feedback logs).
 *
 * These are the primary evidence source in the roundtable room: the evidence matrix
 * shows, per criterion, every log written about the reviewee — scoped to the
 * session's cycle (record.cycleId === session.cycleId). So records must be tagged to
 * the SAME cycle the roundtable belongs to.
 *
 * We seed logs for COMPLETED cycles (history) AND the ACTIVE cycle (so HR's manually
 * created roundtable has evidence). Authors = each reviewee's line manager + peer
 * reviewers. Keyed off cycle PARTICIPANTS, not roundtable reviewees, because the
 * ACTIVE cycle has no seeded roundtable sessions yet.
 */
export async function seedMockPerformanceRecords(prisma: PrismaClient) {
	console.log("Seeding Performance Records (per cycle participant)...");

	const targetCycles = await prisma.pRCycle.findMany({
		where: { status: { in: [CycleStatus.COMPLETED, CycleStatus.ACTIVE] } },
		include: { participants: true },
	});
	if (targetCycles.length === 0) {
		console.warn("  No COMPLETED/ACTIVE cycles found. Skipping performance records.");
		return;
	}

	const criteria = await prisma.evaluationCriterion.findMany({
		include: { category: true },
	});

	const contexts = [
		"Dự án SOTRAMS - Giai đoạn phát triển MVP",
		"Project NOMIS ERP - Hoàn thiện Module Quản lý Tài chính",
		"Dự án DEMLUOS - Tối ưu hóa hiệu năng cơ sở dữ liệu",
		"Chiến dịch ra mắt sản phẩm mới",
		"Quy trình cải tiến bảo mật và tối ưu CI/CD cho hệ thống",
	];

	const logByCriterion = (name: string): string[] =>
		DETAILED_LOGS[name] ?? [
			"Hoàn thành tốt các yêu cầu đề ra đối với tiêu chí này trong suốt kỳ đánh giá.",
			"Thể hiện năng lực ổn định và tinh thần trách nhiệm cao với công việc được giao.",
		];

	let recordCount = 0;

	for (const cycle of targetCycles) {
		// Every participant in the cycle is a potential roundtable reviewee — seed
		// evidence for all of them regardless of whether a session exists yet.
		for (const participant of cycle.participants) {
			const employeeId = participant.employeeId;

			// Related authors = line manager + peer reviewers for this reviewee.
			const managerRel = await prisma.userManagerRelation.findFirst({
				where: {
					employeeId,
					relationshipType: "LINE_MANAGER",
					status: "ACTIVE",
				},
			});
			const peerAssignments = await prisma.peerAssignment.findMany({
				where: {
					revieweeId: employeeId,
					peerReviewList: { cycleId: cycle.id },
					reviewerId: { not: null },
				},
			});

			const authorIds = new Set<string>();
			if (managerRel) authorIds.add(managerRel.managerId);
			for (const pa of peerAssignments) {
				if (pa.reviewerId) authorIds.add(pa.reviewerId);
			}
			authorIds.delete(employeeId); // never author your own log

			if (authorIds.size === 0) continue;

			// Each related author writes logs against several criteria, so the
			// evidence matrix has multiple entries per criterion per reviewee.
			for (const authorId of authorIds) {
				const numCriteria = Math.min(CRITERIA_PER_AUTHOR, criteria.length);
				for (let i = 0; i < numCriteria; i++) {
					const crit =
						criteria[(recordCount + i) % criteria.length];
					const description = getRandomItem(logByCriterion(crit.name));
					const context = getRandomItem(contexts);

					await prisma.performanceRecord.create({
						data: {
							employeeId,
							authorId,
							cycleId: cycle.id,
							context: `${context}: Đánh giá định kỳ về ${crit.name}.`,
							items: {
								create: [
									{
										categoryId: crit.categoryId,
										criterionId: crit.id,
										description,
									},
								],
							},
						},
					});
					recordCount++;
				}
			}
		}
	}

	console.log(`  Seeded ${recordCount} performance records.`);
}

// A compact set of realistic per-criterion feedback lines.
const DETAILED_LOGS: Record<string, string[]> = {
	"Work Productivity": [
		"Hoàn thành toàn bộ hạng mục công việc trong sprint sớm hơn thời hạn, giúp cả đội có thêm thời gian kiểm thử kỹ lưỡng trước khi bàn giao.",
		"Chủ động tăng ca hỗ trợ xử lý khối lượng phát sinh trong giai đoạn go-live, đảm bảo không có task nào bị trễ deadline.",
	],
	"Work Quality": [
		"Code sạch sẽ, tối ưu, hầu như không phát hiện lỗi trong quá trình QA và kiểm thử nghiệm thu người dùng.",
		"Viết tài liệu kỹ thuật chi tiết cho toàn bộ API mới, giúp các team khác tích hợp nhanh hơn đáng kể.",
	],
	Cooperation: [
		"Phối hợp nhịp nhàng với các phòng ban, phản hồi nhanh chóng mọi yêu cầu điều chỉnh kỹ thuật.",
		"Sẵn sàng chia sẻ kiến thức và hướng dẫn nhiệt tình cho các thành viên mới của dự án.",
	],
	"Process Adherence": [
		"Tuân thủ tuyệt đối quy trình git flow và review code nghiêm ngặt của dự án.",
		"Cập nhật đầy đủ nhật ký công việc và trạng thái task trên Jira đúng quy định.",
	],
	Accountability: [
		"Thẳng thắn nhận trách nhiệm khi xảy ra sự cố và làm việc đến cùng để khắc phục triệt để.",
		"Luôn hoàn thành đúng cam kết đã đưa ra trong các buổi họp lập kế hoạch sprint.",
	],
	"Communication Skills": [
		"Trình bày báo cáo tiến độ mạch lạc, rõ ràng và giải đáp thấu đáo các câu hỏi từ những phòng ban khác.",
		"Chủ động giao tiếp trực tiếp để làm rõ bất đồng ý kiến thay vì để hiểu lầm kéo dài.",
	],
	"Teamwork Skills": [
		"Tích cực hỗ trợ đồng đội sửa lỗi phức tạp, cùng nhau hoàn thành sprint kịp tiến độ.",
		"Giữ thái độ hòa đồng, cởi mở, góp phần xây dựng bầu không khí đoàn kết trong nhóm.",
	],
};
