import { PrismaClient } from "@prisma/client";
import { getRandomItem } from "../mock-data/mock-utils";

export async function seedMockPerformanceRecords(prisma: PrismaClient) {
	console.log("Seeding Mock Performance Records...");

	const users = await prisma.user.findMany({
		include: { userRoles: { include: { role: true } } },
	});
	const managers = users.filter((u) =>
		u.userRoles.some((r) =>
			["LINE_MANAGER", "PROJECT_MANAGER"].includes(r.role.code),
		),
	);

	if (managers.length === 0 || users.length < 2) return;

	const targetCycle = await prisma.pRCycle.findFirst({
		where: { name: "Q1 2025 PR Cycle" },
	});
	if (!targetCycle) {
		console.warn(
			"Q1 2025 PR Cycle not found. Skipping detailed performance logs.",
		);
		return;
	}

	const criteria = await prisma.evaluationCriterion.findMany({
		where: {
			category: {
				roleScope: "NON_MANAGEMENT",
			},
		},
		include: {
			category: true,
		},
	});

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

	const specialUserNames = [...aooNames, ...bdoNames];
	const dbSpecialUsers = users.filter((u) =>
		specialUserNames.includes(u.fullName),
	);

	const author =
		managers.find((m) => m.email === "long.nguyen@ehub.com") || managers[0];

	const detailedLogsByCriterion: Record<string, string[]> = {
		"Work Productivity": [
			"Hoàn thành toàn bộ các hạng mục công việc trong sprint sớm hơn thời hạn 2 ngày, giúp cả đội có thêm thời gian test kỹ lưỡng và debug trước khi bàn giao cho khách hàng.",
			"Chủ động tăng ca hỗ trợ xử lý khối lượng công việc phát sinh đột biến của dự án trong giai đoạn go-live, đảm bảo không có task nào bị trễ deadline hay bị tồn đọng.",
			"Tự xây dựng công cụ script tự động hóa quá trình xuất báo cáo hàng ngày, tiết kiệm được trung bình 4 giờ làm việc mỗi tuần cho cả phòng ban.",
			"Xử lý xuất sắc cùng lúc 3 dự án nhỏ mà vẫn đảm bảo tiến độ và chất lượng đồng đều, nhận được sự đánh giá cao từ Line Manager.",
			"Đề xuất phương án chia nhỏ task và phân bổ lại nguồn lực hợp lý hơn trong nhóm, giúp nâng cao năng suất chung của team lên 20%.",
		],
		"Work Quality": [
			"Code sạch sẽ, tối ưu, hầu như không phát hiện lỗi trong quá trình QA và kiểm thử nghiệm thu người dùng (UAT), đạt tỷ lệ release thành công 100%.",
			"Thiết kế giao diện người dùng cực kỳ tỉ mỉ, bám sát từng pixel của bản vẽ Figma và tối ưu hóa trải nghiệm trên thiết bị di động mượt mà.",
			"Viết tài liệu hướng dẫn kỹ thuật chi tiết, dễ hiểu cho toàn bộ API mới phát triển, giúp giảm thời gian tích hợp của các team khác xuống một nửa.",
			"Phát hiện và tự sửa đổi 5 lỗi bảo mật tiềm ẩn trong mã nguồn cũ trước khi hệ thống bị quét quét quét định kỳ bởi bên thứ ba.",
			"Đảm bảo chất lượng các bản thiết kế sản phẩm luôn đạt tiêu chuẩn thẩm mỹ cao, đúng định vị thương hiệu và được khách hàng duyệt ngay từ vòng đầu.",
		],
		Cooperation: [
			"Phối hợp nhịp nhàng với phòng ban Marketing để triển khai chiến dịch quảng cáo mới, phản hồi nhanh chóng mọi yêu cầu điều chỉnh kỹ thuật.",
			"Sẵn sàng chia sẻ tài liệu nghiên cứu và hướng dẫn nhiệt tình cho các thành viên mới gia nhập dự án thích nghi nhanh với hệ thống.",
			"Chủ động đứng ra làm cầu nối giải quyết xung đột ý kiến giữa team thiết kế và team phát triển, đưa ra giải pháp trung hòa cả hai bên.",
			"Tích cực tham gia đóng góp ý kiến xây dựng trong mọi buổi họp lập kế hoạch và cải tiến quy trình làm việc chung của công ty.",
			"Hỗ trợ nhiệt tình cho các đồng nghiệp ở dự án khác khi họ gặp khó khăn kỹ thuật nghiêm trọng, dù bản thân đang bận rộn với dự án riêng.",
		],
		"Process Adherence": [
			"Tuân thủ tuyệt đối quy trình git flow và review code nghiêm ngặt của dự án, không bao giờ tự ý push thẳng code lên nhánh production.",
			"Ghi nhận đầy đủ, chi tiết nhật ký công việc hàng ngày và cập nhật trạng thái các task trên Jira chính xác theo đúng quy định chung.",
			"Thực hiện nghiêm túc mọi chính sách bảo mật thông tin dữ liệu của công ty, bảo vệ tài khoản và thiết bị làm việc an toàn.",
			"Tuân thủ đúng quy trình viết test case và báo cáo lỗi của bộ phận QA, giúp việc quản lý chất lượng dự án luôn đồng bộ.",
			"Luôn tham gia đầy đủ các buổi họp daily scrum đúng giờ và chuẩn bị nội dung báo cáo ngắn gọn, súc tích theo đúng format.",
		],
		Empowerment: [
			"Tin tưởng giao phó một module độc lập cho bạn lập trình viên junior quản lý, đồng thời theo sát hỗ trợ định hướng khi cần thiết.",
			"Chủ động tổ chức các buổi trao đổi chia sẻ quyền hạn và khuyến khích mọi người tự đưa ra quyết định trong phạm vi công việc của mình.",
			"Tạo điều kiện tối đa để các thành viên trong nhóm tự đề xuất ý tưởng thiết kế sáng tạo mới và chịu trách nhiệm hiện thực hóa chúng.",
			"Khuyến khích đồng đội tự tin trình bày giải pháp kỹ thuật trước khách hàng, giúp các bạn nâng cao kỹ năng thuyết trình và tự tin.",
			"Luôn lắng nghe và tôn trọng các quyết định cá nhân của thành viên trong nhóm, tạo bầu không khí tự chủ và sáng tạo cao.",
		],
		Innovation: [
			"Đề xuất áp dụng công nghệ caching mới giúp tăng tốc độ tải trang web của dự án lên gấp đôi mà không phát sinh thêm chi phí server.",
			"Sáng tạo ra quy trình làm việc mới trên Slack giúp việc trao đổi giữa các bộ phận trở nên nhanh chóng, giảm thiểu email rác.",
			"Nghiên cứu thành công và đưa vào sử dụng thư viện UI components mới giúp rút ngắn thời gian phát triển frontend đi 30%.",
			"Đề xuất ý tưởng thiết kế giao diện độc đáo cho tính năng mới của sản phẩm, giúp tăng tỷ lệ tương tác của người dùng thêm 15%.",
			"Cải tiến quy trình kiểm thử tự động bằng cách viết thêm script lọc lỗi giả, giúp giảm thời gian chạy test CI/CD từ 15 phút xuống 5 phút.",
		],
		Accountability: [
			"Thẳng thắn nhận trách nhiệm khi để xảy ra lỗi cấu hình sai trên môi trường test và làm việc xuyên đêm để khắc phục hoàn toàn sự cố.",
			"Cam kết theo đuổi và giải quyết triệt để phản hồi tiêu cực từ khách hàng về giao diện mới, không đổ lỗi cho hoàn cảnh hay các thành viên khác.",
			"Luôn hoàn thành đúng những gì đã hứa hẹn trong buổi họp, tự giác theo dõi tiến độ công việc của mình mà không cần ai đốc thúc.",
			"Chủ động viết báo cáo phân tích nguyên nhân lỗi sau mỗi sự cố để rút kinh nghiệm sâu sắc cho toàn bộ đội ngũ phát triển.",
			"Đảm bảo báo cáo trung thực mọi rủi ro có thể xảy ra với dự án ngay khi phát hiện, giúp ban quản lý có biện pháp phòng ngừa kịp thời.",
		],
		Empathy: [
			"Lắng nghe và chia sẻ khó khăn cá nhân với đồng nghiệp trong giai đoạn gia đình họ gặp chuyện buồn, chủ động gánh vác bớt một phần công việc.",
			"Kiên nhẫn giải thích cặn kẽ các khái niệm kỹ thuật phức tạp cho đồng nghiệp phi kỹ thuật hiểu, không tỏ thái độ khó chịu hay trịch thượng.",
			"Luôn đặt mình vào vị trí của người dùng cuối để cảm nhận những điểm bất tiện trong trải nghiệm sản phẩm và tìm cách tối ưu hóa.",
			"Biết cách động viên, khích lệ tinh thần đồng đội khi dự án gặp trục trặc kỹ thuật hoặc bị khách hàng phàn nàn, giữ vững tinh thần team.",
			"Thể hiện sự tôn trọng tuyệt đối với những ý kiến trái chiều của mọi người trong cuộc họp, giải quyết bất đồng trên tinh thần xây dựng.",
		],
		Agility: [
			"Thích nghi nhanh chóng khi dự án đột ngột thay đổi yêu cầu nghiệp vụ sát ngày release, hoàn thành việc chỉnh sửa code đúng hạn.",
			"Tự học và áp dụng thành công ngôn ngữ lập trình mới chỉ trong vòng một tuần để kịp thời tham gia vào dự án khẩn cấp của công ty.",
			"Sẵn sàng thay đổi phương pháp làm việc cũ để chuyển sang mô hình Agile mới theo định hướng cải tiến của ban lãnh đạo.",
			"Nhanh chóng làm quen và làm chủ công cụ quản lý công việc mới mà công ty vừa chuyển đổi sang sử dụng mà không gặp khó khăn.",
			"Giữ vững hiệu suất làm việc cao và thái độ bình tĩnh khi cơ cấu tổ chức nhóm có sự xáo trộn nhân sự lớn trong quý.",
		],
		Impact: [
			"Đóng góp to lớn vào việc giúp công ty ký kết thành công hợp đồng lớn với khách hàng nhờ bản demo sản phẩm chạy cực kỳ mượt mà.",
			"Giải pháp tối ưu hóa dữ liệu của bạn đã giúp tiết kiệm được 20% chi phí vận hành hạ tầng cloud hàng tháng cho công ty.",
			"Quy trình onboarding mới do bạn xây dựng đã giúp các bạn nhân viên mới bắt nhịp với công việc chỉ trong vòng 3 ngày thay vì 2 tuần.",
			"Bản thiết kế bao bì sản phẩm mới của bạn nhận được phản hồi cực tốt từ thị trường, góp phần tăng doanh số bán hàng quý này.",
			"Hệ thống tự động hóa do bạn phát triển đã giải phóng sức lao động cho 3 nhân sự, giúp họ tập trung vào các công việc chuyên sâu khác.",
		],
		"Problem-Solving Thinking": [
			"Phân tích nhanh chóng nguyên nhân lỗi nghẽn cổng kết nối database và đưa ra giải pháp phân luồng tải tối ưu giải quyết dứt điểm sự cố.",
			"Tự tìm tòi nguyên nhân lỗi hiển thị font chữ trên hệ điều hành cũ và viết đoạn mã vá lỗi tương thích hoàn hảo.",
			"Đưa ra giải pháp tạm thời giúp hệ thống tiếp tục chạy ổn định trong khi chờ đối tác liên kết khắc phục sự cố gián đoạn API phía họ.",
			"Nghiên cứu nguyên nhân tỷ lệ chuyển đổi trên app giảm và đề xuất thay đổi vị trí nút bấm kêu gọi hành động giúp cải thiện tình hình.",
			"Giải quyết thành công tranh chấp quyền truy cập file dùng chung bằng cách thiết lập lại cấu trúc thư mục phân quyền khoa học hơn.",
		],
		"Critical Thinking": [
			"Chỉ ra những điểm bất hợp lý về mặt trải nghiệm người dùng trong yêu cầu thiết kế mới của khách hàng và đề xuất phương án hợp lý hơn.",
			"Đánh giá khách quan các ưu nhược điểm của 3 thư viện kỹ thuật khác nhau trước khi đề xuất lựa chọn thư viện tối ưu nhất cho dự án.",
			"Phát hiện lỗi logic trong thuật toán tính lương cũ của hệ thống và đề xuất công thức tính mới đảm bảo tính chính xác tuyệt đối.",
			"Đặt ra những câu hỏi phản biện sắc bén giúp làm sáng tỏ nhiều điểm mập mờ trong kế hoạch triển khai dự án của ban quản lý.",
			"Đánh giá rủi ro kỹ thuật kỹ lưỡng của hệ thống trước khi quyết định nâng cấp lên phiên bản framework mới nhất.",
		],
		"Communication Skills": [
			"Trình bày báo cáo tiến độ dự án mạch lạc, rõ ràng trước ban giám đốc và giải đáp thấu đáo mọi câu hỏi chất vấn từ các phòng ban.",
			"Viết email trao đổi công việc ngắn gọn, súc tích nhưng đầy đủ thông tin cần thiết, giúp đối tác phản hồi nhanh chóng và chính xác.",
			"Thuyết trình thu hút, thuyết phục về tính năng sản phẩm mới trong buổi ra mắt nội bộ, truyền cảm hứng tốt cho đội ngũ kinh doanh.",
			"Truyền đạt chính xác chỉ đạo của Line Manager tới toàn thể thành viên trong nhóm, đảm bảo mọi người hiểu đúng mục tiêu cần đạt.",
			"Luôn chủ động giao tiếp trao đổi trực tiếp để làm rõ các bất đồng ý kiến thay vì nhắn tin qua lại dễ gây hiểu lầm trên chat room.",
		],
		"Teamwork Skills": [
			"Tích cực phối hợp giúp đỡ bạn cùng phòng ban sửa lỗi code phức tạp, cùng nhau hoàn thành sprint kịp tiến độ bàn giao.",
			"Luôn giữ thái độ hòa đồng, cởi mở, lắng nghe ý kiến của mọi người và tích cực xây dựng bầu không khí đoàn kết trong nhóm làm việc.",
			"Chia sẻ gánh nặng công việc với đồng nghiệp khi họ phải nghỉ phép đột xuất, đảm bảo công việc chung không bị gián đoạn.",
			"Chủ động đứng ra tổ chức các hoạt động team building nhỏ giúp gắn kết tinh thần các thành viên trong nhóm sau giờ làm việc.",
			"Phối hợp ăn ý với team QA từ khâu viết tài liệu đến khâu test lỗi, tạo nên quy trình làm việc khép kín vô cùng hiệu quả.",
		],
	};

	const contexts = [
		"Dự án SOTRAMS - Giai đoạn phát triển MVP",
		"Project NOMIS ERP - Hoàn thiện Module Quản lý Tài chính",
		"Dự án DEMLUOS - Tối ưu hóa hiệu năng cơ sở dữ liệu",
		"Chiến dịch ra mắt sản phẩm mới Q1 2025",
		"Quy trình cải tiến bảo mật và tối ưu CI/CD cho hệ thống",
	];

	// 1. Seed detailed logs for special department employees (AOO and BDO)
	for (const employee of dbSpecialUsers) {
		for (const crit of criteria) {
			const numLogs = Math.floor(Math.random() * 3) + 3; // 3 to 5 logs
			const logDescriptions = detailedLogsByCriterion[crit.name] || [
				"Hoàn thành tốt các yêu cầu đề ra đối với tiêu chí này.",
			];

			for (let j = 0; j < numLogs; j++) {
				const description = logDescriptions[j % logDescriptions.length];
				const context = contexts[Math.floor(Math.random() * contexts.length)];

				await prisma.performanceRecord.create({
					data: {
						employeeId: employee.id,
						authorId: author.id,
						cycleId: targetCycle.id,
						context: `${context}: Đánh giá định kỳ về ${crit.name}.`,
						items: {
							create: [
								{
									categoryId: crit.categoryId,
									criterionId: crit.id,
									description: description,
								},
							],
						},
					},
				});
			}
		}
	}

	// 2. Seed a few random logs for other users to preserve basic mock data
	const nonSpecialUsers = users.filter(
		(u) => !specialUserNames.includes(u.fullName) && u.id !== author.id,
	);
	for (let i = 0; i < 15; i++) {
		const emp = getRandomItem(
			nonSpecialUsers.length > 0 ? nonSpecialUsers : users,
		);
		const randomCrit = getRandomItem(criteria);
		const isKudos = Math.random() > 0.3;
		await prisma.performanceRecord.create({
			data: {
				employeeId: emp.id,
				authorId: author.id,
				cycleId: targetCycle.id,
				context: isKudos
					? "Nhận xét tích cực định kỳ trong Sprint."
					: "Nhận xét nhắc nhở cải thiện trong Sprint.",
				items: {
					create: [
						{
							categoryId: randomCrit.categoryId,
							criterionId: randomCrit.id,
							description: isKudos
								? "Làm việc rất tích cực, đạt hiệu suất tốt."
								: "Cần tập trung cải thiện tiến độ công việc.",
						},
					],
				},
			},
		});
	}
}
