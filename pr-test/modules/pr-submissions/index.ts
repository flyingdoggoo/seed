import {
	PrismaClient,
	RoleScope,
	StageType,
	SubmissionStatus,
} from "@prisma/client";
import { getRandomRating } from "../mock-data/mock-utils";

function getDetailedAnswer(text: string): string {
	const detailedLogsByCriterion: Record<string, string[]> = {
		"Work Productivity": [
			"Trong suốt kỳ đánh giá, tôi đã hoàn thành toàn bộ các hạng mục công việc trong sprint sớm hơn thời hạn, giúp nhóm có thêm thời gian kiểm thử và hoàn thiện sản phẩm.",
			"Tôi luôn chủ động sắp xếp thời gian làm việc khoa học, tăng ca khi có yêu cầu khẩn cấp để đảm bảo dự án go-live đúng tiến độ mà không phát sinh lỗi nghiêm trọng.",
			"Tự nghiên cứu và xây dựng công cụ script tự động hóa quy trình báo cáo, giúp tiết kiệm đáng kể thời gian làm việc hàng tuần cho bản thân và các đồng nghiệp trong nhóm."
		],
		"Work Quality": [
			"Code của tôi luôn sạch sẽ, tối ưu, tuân thủ đúng các tiêu chuẩn thiết kế hệ thống và hầu như không phát hiện lỗi lớn nào trong quá trình kiểm thử QA.",
			"Thiết kế giao diện người dùng cực kỳ tỉ mỉ, bám sát các bản vẽ Figma và chú trọng tối ưu hóa hiệu năng tải trang cũng như trải nghiệm người dùng trên mobile.",
			"Viết tài liệu hướng dẫn tích hợp chi tiết và chuẩn hóa các API giúp các bộ phận khác dễ dàng kết nối hệ thống mà không cần tốn nhiều thời gian trao đổi."
		],
		"Cooperation": [
			"Tôi phối hợp rất nhịp nhàng với team frontend và product manager để làm rõ mọi yêu cầu nghiệp vụ phức tạp, sẵn sàng chia sẻ kiến thức chuyên môn.",
			"Nhiệt tình hướng dẫn và hỗ trợ các bạn thành viên mới hòa nhập nhanh chóng với dự án, giải thích chi tiết các module nghiệp vụ khó hiểu.",
			"Luôn duy trì thái độ giao tiếp chuyên nghiệp, lắng nghe và tôn trọng mọi phản hồi đóng góp từ đồng nghiệp để cùng nhau đưa ra giải pháp tốt nhất."
		],
		"Process Adherence": [
			"Tôi tuân thủ nghiêm túc quy trình git flow, thực hiện review code kỹ lưỡng cho đồng nghiệp trước khi merge code vào nhánh phát triển chính.",
			"Cập nhật tiến độ công việc đầy đủ, kịp thời trên Jira và chấm công, báo cáo công việc hàng ngày đúng giờ theo quy định của bộ phận.",
			"Tuyệt đối tuân thủ mọi chính sách an toàn thông tin và bảo mật dữ liệu của công ty, đảm bảo môi trường làm việc an toàn, tuân thủ ISO."
		],
		"Empowerment": [
			"Tôi luôn tin tưởng giao phó các module chức năng độc lập cho các bạn junior tự quản lý và đưa ra quyết định, tạo không gian cho các bạn phát triển.",
			"Tạo điều kiện thuận lợi và khuyến khích mọi thành viên trong team tự tin đề xuất các giải pháp kỹ thuật mới trong các buổi thảo luận chung.",
			"Hỗ trợ định hướng và hướng dẫn cách giải quyết vấn đề thay vì làm hộ, giúp các thành viên trong nhóm nâng cao năng lực tự xử lý công việc."
		],
		"Innovation": [
			"Tôi đã chủ động đề xuất áp dụng giải pháp tối ưu hóa dữ liệu mới, giúp cải thiện đáng kể tốc độ truy vấn cơ sở dữ liệu của hệ thống.",
			"Sáng kiến tối ưu hóa luồng chat Slack giúp nhóm tương tác nhanh chóng, giảm thiểu các cuộc họp không cần thiết và tăng hiệu quả công việc.",
			"Tự xây dựng các bộ component dùng chung (UI components) giúp rút ngắn thời gian phát triển giao diện của các dự án tiếp theo."
		],
		"Accountability": [
			"Tôi luôn nhận trách nhiệm cao nhất đối với kết quả công việc của mình, chủ động tìm giải pháp khắc phục ngay khi phát hiện có sai sót.",
			"Báo cáo trung thực và kịp thời mọi rủi ro tiềm ẩn của dự án cho quản lý để cùng có phương án xử lý, không giấu giếm hay né tránh.",
			"Đảm bảo hoàn thành đúng các cam kết về thời gian và chất lượng sản phẩm đã đưa ra trong các buổi lập kế hoạch sprint."
		],
		"Empathy": [
			"Tôi luôn lắng nghe và thấu hiểu những khó khăn, áp lực công việc của đồng nghiệp để chủ động hỗ trợ, gánh vác bớt phần việc khi họ quá tải.",
			"Kiên nhẫn giải thích các thuật ngữ kỹ thuật phức tạp cho các bạn ở bộ phận nghiệp vụ khác hiểu rõ, tạo sự đồng thuận cao.",
			"Đặt lợi ích chung của nhóm lên trên lợi ích cá nhân, ứng xử hòa nhã và tôn trọng tính cách, quan điểm khác biệt của mỗi người."
		],
		"Agility": [
			"Thích ứng cực kỳ nhanh khi dự án thay đổi yêu cầu nghiệp vụ ở giai đoạn cuối, chủ động điều chỉnh code kịp thời đảm bảo tiến độ bàn giao.",
			"Chủ động tự học hỏi và nắm bắt nhanh chóng các công cụ, công nghệ mới để đưa vào áp dụng ngay khi dự án có yêu cầu khẩn cấp.",
			"Luôn giữ bình tĩnh, thái độ tích cực và tập trung cao độ để tìm giải pháp xử lý khi hệ thống gặp sự cố khẩn cấp trên môi trường thực tế."
		],
		"Impact": [
			"Đóng góp quan trọng vào sự thành công của dự án thông qua việc hoàn thiện các tính năng cốt lõi chất lượng cao, mang lại giá trị lớn cho khách hàng.",
			"Giải pháp cải tiến thuật toán của tôi đã giúp giảm đáng kể tài nguyên tiêu thụ của server, tiết kiệm chi phí hạ tầng cho công ty.",
			"Quy trình làm việc mới do tôi đề xuất đã được áp dụng rộng rãi trong team, giúp chuẩn hóa và tăng hiệu suất làm việc của cả nhóm."
		],
		"Problem-Solving Thinking": [
			"Phân tích nhanh chóng nguyên nhân gốc rễ lỗi nghẽn hệ thống và đề xuất giải pháp xử lý triệt để, không để lỗi tái diễn trong tương lai.",
			"Đưa ra các giải pháp thay thế linh hoạt để giải quyết bài toán tích hợp API bên thứ ba khi họ gặp sự cố gián đoạn dịch vụ.",
			"Luôn tiếp cận mọi vấn đề phát sinh với tư duy tìm giải pháp khắc phục trước tiên thay vì mất thời gian truy cứu trách nhiệm."
		],
		"Critical Thinking": [
			"Chủ động phân tích kỹ các điểm bất hợp lý trong bản yêu cầu nghiệp vụ ban đầu và đề xuất các chỉnh sửa phù hợp giúp tiết kiệm thời gian dev.",
			"Đánh giá khách quan, chi tiết ưu nhược điểm của các giải pháp công nghệ trước khi đưa ra quyết định lựa chọn giải pháp phù hợp nhất.",
			"Luôn đưa ra các nhận định, kết luận dựa trên số liệu và minh chứng rõ ràng thay vì dựa trên cảm tính hay phán đoán chủ quan."
		],
		"Communication Skills": [
			"Truyền đạt thông tin công việc mạch lạc, rõ ràng trong các buổi họp, luôn xác nhận lại thông tin để tránh hiểu lầm giữa các bên.",
			"Viết email và tài liệu hướng dẫn súc tích, dễ hiểu, phản hồi thông tin trên chat room nhanh chóng và chuyên nghiệp.",
			"Chủ động chia sẻ tiến độ và các vướng mắc của bản thân cho teamlead biết để cùng phối hợp tháo gỡ kịp thời."
		],
		"Teamwork Skills": [
			"Tích cực phối hợp và hỗ trợ các thành viên khác sửa lỗi code, sẵn sàng nhận thêm việc khi đồng nghiệp gặp quá tải.",
			"Luôn giữ thái độ hòa đồng, cởi mở, lắng nghe ý kiến của mọi người và tích cực xây dựng bầu không khí đoàn kết trong nhóm làm việc.",
			"Chia sẻ gánh nặng công việc với đồng nghiệp khi họ phải nghỉ phép đột xuất, đảm bảo công việc chung không bị gián đoạn.",
			"Chủ động đứng ra tổ chức các hoạt động team building nhỏ giúp gắn kết tinh thần các thành viên trong nhóm sau giờ làm việc.",
			"Phối hợp ăn ý với team QA từ khâu viết tài liệu đến khâu test lỗi, tạo nên quy trình làm việc khép kín vô cùng hiệu quả."
		]
	};

	const generalAnswers: Record<string, string[]> = {
		"Key Accomplishments": [
			"Hoàn thành xuất sắc tất cả các mục tiêu cá nhân đã đề ra, đóng góp lớn vào sự thành công của dự án qua việc triển khai các module cốt lõi đúng tiến độ và chất lượng cao.",
			"Cải tiến quy trình kiểm thử và tự động hóa CI/CD, giúp tối ưu hóa thời gian phát triển và nâng cao chất lượng sản phẩm đầu ra của toàn bộ phòng ban."
		],
		"Areas for Improvement": [
			"Cần tiếp tục cải thiện kỹ năng quản lý thời gian và sắp xếp công việc khoa học hơn để nâng cao hiệu suất làm việc dưới áp lực lớn.",
			"Nâng cao thêm kỹ năng thuyết trình và giao tiếp tiếng Anh để chuẩn bị cho việc làm việc trực tiếp với các khách hàng và đối tác nước ngoài."
		],
		"Other Comments / Support Needed": [
			"Rất mong tiếp tục nhận được sự hỗ trợ, định hướng chuyên môn sâu sắc từ Line Manager và các khóa đào tạo nội bộ chất lượng của công ty.",
			"Mong muốn công ty tạo điều kiện để tham gia vào các dự án công nghệ mới, có độ phức tạp cao hơn để thử thách bản thân."
		]
	};

	// Try exact match first
	if (detailedLogsByCriterion[text]) {
		const list = detailedLogsByCriterion[text];
		return list[Math.floor(Math.random() * list.length)];
	}
	if (generalAnswers[text]) {
		const list = generalAnswers[text];
		return list[Math.floor(Math.random() * list.length)];
	}

	// Fallback to searching substring
	for (const key of Object.keys(detailedLogsByCriterion)) {
		if (
			text.toLowerCase().includes(key.toLowerCase()) ||
			key.toLowerCase().includes(text.toLowerCase())
		) {
			const list = detailedLogsByCriterion[key];
			return list[Math.floor(Math.random() * list.length)];
		}
	}

	for (const key of Object.keys(generalAnswers)) {
		if (
			text.toLowerCase().includes(key.toLowerCase()) ||
			key.toLowerCase().includes(text.toLowerCase())
		) {
			const list = generalAnswers[key];
			return list[Math.floor(Math.random() * list.length)];
		}
	}

	// General fallback
	const fallbackFeedback = [
		"Hoàn thành xuất sắc các nhiệm vụ được giao đúng thời hạn cam kết, code quality rất tốt và hiếm khi có lỗi phát sinh.",
		"Kỹ năng giải quyết vấn đề tốt, luôn chủ động phối hợp với đồng đội để tháo gỡ các khó khăn kỹ thuật trong dự án.",
		"Có tinh thần trách nhiệm cao, thái độ làm việc chuyên nghiệp và luôn sẵn sàng hỗ trợ đồng nghiệp khi cần thiết."
	];
	return fallbackFeedback[Math.floor(Math.random() * fallbackFeedback.length)];
}

import { CYCLE } from "../showcase-data";

export async function seedMockSubmissions(prisma: PrismaClient) {
	console.log("Seeding Mock PR Form Submissions...");

	const users = await prisma.user.findMany({
		include: { userRoles: { include: { role: true } } },
	});

	const completedCycles = await prisma.pRCycle.findMany({
		where: {
			OR: [
				{ status: "COMPLETED" },
				{ name: CYCLE.BILATERAL },
			],
		},
		include: { stages: true, participants: true },
	});

	const allForms = await prisma.pRForm.findMany({
		include: { questions: true },
	});
	const getForm = (type: StageType, scope: RoleScope) =>
		allForms.find((f) => f.stageType === type && f.roleScope === scope);

	const mSelfForm = getForm(StageType.SELF_REVIEW, RoleScope.MANAGEMENT);
	const nmSelfForm = getForm(StageType.SELF_REVIEW, RoleScope.NON_MANAGEMENT);
	const mPeerForm = getForm(StageType.PEER_REVIEW, RoleScope.MANAGEMENT);
	const nmPeerForm = getForm(StageType.PEER_REVIEW, RoleScope.NON_MANAGEMENT);

	if (!mSelfForm || !nmSelfForm || !mPeerForm || !nmPeerForm) {
		console.warn("Forms are missing. Cannot proceed with mock submissions.");
		return;
	}

	for (const cycle of completedCycles) {
		const selfStage = cycle.stages.find(
			(s) => s.type === StageType.SELF_REVIEW,
		);
		const peerStage = cycle.stages.find(
			(s) => s.type === StageType.PEER_REVIEW,
		);
		if (!selfStage || !peerStage) continue;

		const peerList = await prisma.peerReviewList.findUnique({
			where: { cycleId: cycle.id },
			include: { peerAssignments: true },
		});

		for (const participant of cycle.participants) {
			const reviewee = users.find((u) => u.id === participant.employeeId)!;
			const isManagement = reviewee.userRoles.some((ur) =>
				["LINE_MANAGER", "PROJECT_MANAGER", "FUNCTION_LEAD"].includes(
					ur.role.code,
				),
			);

			const selfForm = isManagement ? mSelfForm : nmSelfForm;
			const peerForm = isManagement ? mPeerForm : nmPeerForm;

			// 1. Self Review Submission
			const existingSelfSub = await prisma.pRFormSubmission.findFirst({
				where: {
					cycleId: cycle.id,
					authorId: reviewee.id,
					revieweeId: reviewee.id,
					stageId: selfStage.id,
				},
			});

			if (!existingSelfSub) {
				let selfScore = 0;
				let ratingCount = 0;
				const selfAnswers = selfForm.questions.map((q) => {
					const isRating = q.type === "RATING";
					const rating = isRating ? getRandomRating() : undefined;
					if (isRating && rating !== undefined) {
						selfScore += rating;
						ratingCount++;
					}
					return {
						questionId: q.id,
						rating,
						textAnswer: getDetailedAnswer(q.text),
					};
				});
				selfScore =
					ratingCount > 0
						? parseFloat((selfScore / ratingCount).toFixed(2))
						: 0;

				await prisma.pRFormSubmission.create({
					data: {
						cycleId: cycle.id,
						stageId: selfStage.id,
						formId: selfForm.id,
						authorId: reviewee.id,
						revieweeId: reviewee.id,
						status: SubmissionStatus.SUBMITTED,
						totalScore: selfScore,
						submittedAt: new Date(),
						answers: { create: selfAnswers },
					},
				});
			}

			// 2. Peer Review Submission
			if (peerList) {
				const assignments = peerList.peerAssignments.filter(
					(pa) => pa.revieweeId === reviewee.id,
				);
				for (const assignment of assignments) {
					if (assignment && assignment.reviewerId) {
						const existingPeerSub = await prisma.pRFormSubmission.findFirst({
							where: {
								cycleId: cycle.id,
								authorId: assignment.reviewerId,
								revieweeId: reviewee.id,
								stageId: peerStage.id,
							},
						});

						if (!existingPeerSub) {
							let peerScore = 0;
							let ratingCount = 0;
							const peerAnswers = peerForm.questions.map((q) => {
								const isRating = q.type === "RATING";
								const rating = isRating ? getRandomRating() : undefined;
								if (isRating && rating !== undefined) {
									peerScore += rating;
									ratingCount++;
								}
								return {
									questionId: q.id,
									rating,
									textAnswer: getDetailedAnswer(q.text),
								};
							});
							peerScore =
								ratingCount > 0
									? parseFloat((peerScore / ratingCount).toFixed(2))
									: 0;

							await prisma.pRFormSubmission.create({
								data: {
									cycleId: cycle.id,
									stageId: peerStage.id,
									formId: peerForm.id,
									authorId: assignment.reviewerId,
									revieweeId: reviewee.id,
									status: SubmissionStatus.SUBMITTED,
									totalScore: peerScore,
									submittedAt: new Date(),
									assignment: { connect: { id: assignment.id } },
									answers: { create: peerAnswers },
								},
							});
						}
					}
				}
			}
		}
	}
}
