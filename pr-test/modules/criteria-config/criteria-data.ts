import { RoleScope } from "@prisma/client";

export const categoryDefinitions = [
	{
		name: "Performance",
		weight: 60,
		roleScope: RoleScope.NON_MANAGEMENT,
		criteria: [
			{
				name: "Work Productivity",
				description: "Work productivity",
				weight: 25,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Thường xuyên trễ deadline hoặc thiếu chủ động trong việc quản lý thời gian và ưu tiên. Tỷ lệ công việc hoàn thành đúng hạn dưới 70%.\n- Ảnh hưởng rõ rệt đến tiến độ chung của nhóm và làm giảm hiệu suất của đồng đội do phải làm việc bù hoặc phải điều chỉnh lại kế hoạch lớn.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Hoàn thành phần lớn công việc đúng hạn (khoảng 70%-89% công việc). Đôi khi chậm tiến độ đối với các nhiệm vụ quan trọng, dẫn đến việc cần phải điều chỉnh nhẹ kế hoạch tổng thể của nhóm.\n- Thường xuyên cần hướng dẫn chi tiết hoặc follow-up từ Teamlead/LM/PM để đảm bảo nhiệm vụ được hoàn thành",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Hoàn thành tất cả công việc đúng deadline (trên 90% công việc được hoàn thành đúng hạn). Có chủ động sắp xếp công việc để đạt được mục tiêu cá nhân.\n- Thỉnh thoảng cần được nhắc nhở hoặc follow-up từ Teamlead/LM/PM đối với các nhiệm vụ mới hoặc phức tạp",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Luôn hoàn thành tất cả công việc trước hoặc đúng deadline kể cả những yêu cầu phát sinh (trên 95% công việc được hoàn thành đúng hạn). Hoàn toàn không phát sinh lỗi có thể ảnh hưởng đến tiến độ chung của nhóm.\n- Chủ động đưa ra giải pháp sắp xếp thứ tự ưu tiên và dự báo rủi ro, giúp team vận hành trơn tru và đạt mục tiêu chung một cách dễ dàng hơn.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Luôn hoàn thành công việc trước xa deadline, luôn chủ động về thời gian, kể cả những tình huống phát sinh ngoài kế hoạch.\n- Tiêu chuẩn hoá và tối ưu hoá quy trình làm việc, lập kế hoạch và sắp xếp ưu tiên công việc của bản thân hiệu quả, trở thành hình mẫu năng suất cho team.",
					},
				],
			},
			{
				name: "Work Quality",
				description: "Work quality",
				weight: 25,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Output sai hướng, sai nghiêm trọng; không thể sử dụng; phải làm lại; gây ảnh hưởng lớn đến tiến độ, khách hàng, dữ liệu hoặc team.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Output thiếu sót quan trọng; chưa hiểu rõ một phần của yêu cầu; cần 2-3 vòng sửa; gây chậm tiến độ hoặc ảnh hưởng công việc của người review/đồng đội.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Output đáp ứng đầy đủ yêu cầu; có chỉnh sửa ít (≤ 2 vòng) nhưng không ảnh hưởng tiến độ; lỗi nhỏ không ảnh hưởng chất lượng tổng thể.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Output hoàn chỉnh ngay từ lần đầu; nội dung chính xác; hiểu đúng yêu cầu; không cần chỉnh hoặc chỉ chỉnh format rất ít;\n- Output có giá trị ứng dụng cao và được team đánh giá tốt.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Xuất sắc hoàn thành các nhiệm vụ/dự án có độ phức tạp cao trong phạm vi công việc,\n- Thường xuyên vượt chỉ tiêu và đạt được chất lượng output hoàn hảo.\n- Giải quyết được các yêu cầu phát sinh một cách nhanh chóng và mức chỉnh sửa ≤ 1 vòng.",
					},
				],
			},
			{
				name: "Cooperation",
				description: "Cooperation",
				weight: 5,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Chưa ý thức về việc hợp tác.\n- Có gây ảnh hưởng tiêu cực đến team; lặp lại lỗi hợp tác lỗi dù đã nhắc nhở.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Hợp tác ổn nhưng chưa chủ động; đôi khi gây ảnh hưởng đến tiến độ chung, cần nhắc nhở.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Phối hợp tốt, chủ động, không cần nhắc nhở hay giám sát từ cấp trên.\n- Hợp tác hiệu quả liên phòng ban/bộ phận khi được giao nhiệm vụ, không xảy ra bất kì xung đột nào bị ghi nhận.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Chủ động phối hợp với team, hỗ trợ đồng đội, hợp tác liên bộ phận/phòng ban hiệu quả (Lark, ISO, bảo mật).\n- Không thờ ơ với lỗi sai xung quanh; chia sẻ với cấp quản lý khi thấy biểu hiện hợp tác chưa phù hợp trong nhóm.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Chủ động phối hợp với team, hỗ trợ đồng đội, hợp tác liên bộ phận/phòng ban hiệu quả (ví dụ Lark, ISO, bảo mật...) không xảy ra bất kỳ xung đột nào bị ghi nhận.\n- Chủ động nhắc nhở đồng nghiệp trong phạm vi cho phép hoặc chia sẻ mong đợi hợp tác của bản thân để đạt được hiệu quả hợp tác chung, mục tiêu chung.",
					},
				],
			},
			{
				name: "Process Adherence",
				description: "Process adherence",
				weight: 5,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Không tuân thủ quy trình, thường xuyên làm theo ý muốn cá nhân.\n- Lặp lại lỗi ≥ 3 lần dù đã được nhắc nhở.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Tuân thủ khoảng 50% quy trình đưa ra, thường tự điều chỉnh quy trình theo thiên kiến cá nhân vì nghĩ rằng miễn không ảnh hưởng lớn hiệu suất và chất lượng công việc mình là được.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Hoàn toàn tuân thủ quy trình, không cần nhắc nhở hay giám sát",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Tuân thủ quy trình một cách tích cực và chủ động vì tư duy rằng tuân thủ giúp tổ chức đảm bảo chất lượng, an toàn và tính nhất quán trong vận hành.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Trở thành tiêu chuẩn hoặc mức độ tấm gương để những thành viên khác thấy cần phải tuân thủ để giảm rủi ro, và tăng hiệu quả vận hành\n- Duy trì sự tuân thủ tuyệt đối ngay cả trong những hoàn cảnh áp lực cao nhất hoặc khi không ai giám sát.",
					},
				],
			},
		],
	},
	{
		name: "Culture Fit",
		weight: 24,
		roleScope: RoleScope.NON_MANAGEMENT,
		criteria: [
			{
				name: "Empowerment",
				description: "Empowers peers and team members",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Thiếu tính sở hữu các nhiệm vụ và thường xuyên chờ đợi chỉ đạo cụ thể cho từng bước công việc, kể cả những công việc đơn giản.\n- Không dám đưa ra quyết định, dù là trong phạm vi thẩm quyền.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Vẫn cần sự theo dõi sát sao và nhắc nhở từ quản lý để đảm bảo công việc được hoàn thành đúng hướng.\n- Chỉ thể hiện sự tự chủ trong các nhiệm vụ quen thuộc/đơn giản.\n- Gặp khó khăn khi đưa ra quyết định độc lập.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Tạo niềm tin cho cấp quản lý có thể tin tưởng để mình độc lập làm việc.\n- Có khả năng tự chủ trong các công việc thường ngày, sau khi đã được hướng dẫn. Thực hiện chính xác các quyền hạn được giao.\n- Thường xuyên báo cáo tiến độ và chủ động đặt câu hỏi khi gặp các rào cản rõ ràng.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Tạo niềm tin cho cấp quản lý có thể tin tưởng trao quyền cho mình ở một số nhiệm vụ cốt lõi.\n- Chủ động trong việc lập kế hoạch, tổ chức và đưa ra các quyết định độc lập để giải quyết vấn đề trong phạm vi công việc.\n- Chỉ tìm kiếm sự hỗ trợ của quản lý cho các vấn đề mang tính chiến lược hoặc vượt quá thẩm quyền.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Tạo niềm tin mạnh mẽ cho cấp quản lý hoàn toàn tin tưởng trao quyền cho mình.\n- Luôn luôn thể hiện quyền sở hữu (ownership) cao nhất với công việc của bản thân.\n- Ownership được thể hiện: Luôn luôn chủ động cải tiến quy trình, đưa ra các quyết định mang tính đột phá trong phạm vi chuyên môn để tối ưu hóa kết quả cá nhân.",
					},
				],
			},
			{
				name: "Innovation",
				description: "Brings new ideas to the team",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Không đóng góp ý tưởng mới hoặc phản đối các đề xuất thay đổi/cải tiến. Chỉ làm việc theo lối mòn và quy trình đã có.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Có đề xuất ý tưởng mới, nhưng chưa được đánh giá là thực tế.\n- Chưa chủ động tìm kiếm các cơ hội để cải tiến hoặc đổi mới, hoặc chỉ thực hiện khi được yêu cầu",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Chủ động tham gia vào các hoạt động sáng tạo của nhóm.\n- Đưa ra được các ý tưởng mới hợp lý khi được yêu cầu hoặc khi phát hiện vấn đề, giúp giải quyết các khó khăn trong công việc thường nhật.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Thường xuyên đề xuất các ý tưởng cải tiến liên quan đến hệ thống quy trình hoặc sản phẩm/dịch vụ hiện có.\n- Các đề xuất này được triển khai và mang lại hiệu quả rõ rệt (tiết kiệm chi phí/thời gian đáng kể…).",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Trong kỳ, có đưa ra ít nhất 1 giải pháp đột phá hoặc công nghệ mới, được triển khai, tạo ra giá trị đáng kể có thể đo lường (tăng doanh thu, lợi thế cạnh tranh...) cho team, bộ phận, khách hàng.",
					},
				],
			},
			{
				name: "Accountability",
				description: "Takes ownership of outcomes",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Tránh né việc chịu trách nhiệm về kết quả tiêu cực; quản lý phải can thiệp để xác định người chịu trách nhiệm.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Cần sự thúc đẩy từ quản lý để thừa nhận sai sót.\n- Giải thích, báo cáo, ghi nhận còn thiếu dữ liệu hoặc không đầy đủ, dẫn đến việc phải nhắc lại các hành động khắc phục.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Hoàn thành các cam kết đã giao.\n- Cung cấp báo cáo, giải thích, ghi nhận rõ ràng khi được hỏi.\n- Hạn chế tối đa việc đổ lỗi cho yếu tố bên ngoài khi được chất vấn.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Công khai nhận trách nhiệm về kết quả dù thành công hay thất bại trong các cuộc họp/báo cáo.\n- Có kế hoạch công khai về việc phát huy các thành tích hoặc khắc phục vấn đề một cách đúng hạn mà không cần nhắc nhở.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Chủ động đề xuất buổi họp/buổi đối thoại (retro) để phân tích thất bại, rút kinh nghiệm và đề xuất thay đổi quy trình để ngăn chặn tái diễn trong toàn team/bộ phận.",
					},
				],
			},
			{
				name: "Empathy",
				description: "Understands others' perspectives",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Thường xuyên bỏ qua ý kiến/cảm xúc của đồng nghiệp, chỉ hành động dựa trên logic cá nhân, dẫn đến mâu thuẫn thường xuyên, hoặc các bất hoà ngầm trong team.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Phản ứng hời hợt hoặc không phù hợp với các tín hiệu cảm xúc.\n- Cần được nhắc nhở để tập trung lắng nghe ý kiến của người khác.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Lắng nghe đầy đủ ý kiến của người khác (không bao giờ ngắt lời).\n- Phản hồi bằng ngôn ngữ tích cực và thừa nhận quan điểm khác biệt trước khi đưa ra ý kiến riêng.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Chủ động đặt các câu hỏi thăm dò để hiểu đối phương, xác nhận lại để đạt sự thấu hiểu chung.\n- Thực hiện ít nhất 1 hành vi cải thiện sau khi lắng nghe phản hồi xây dựng từ bất cứ ai.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Sử dụng dữ liệu phản hồi (Feedback) từ cấp trên/khách hàng để đề xuất cải tiến chính sách/ quy trình.\n- Luôn luôn điều chỉnh nội dung giao tiếp dựa trên đối tượng để tối đa hóa hiệu quả làm việc ở mức cao nhất có thể.",
					},
				],
			},
			{
				name: "Agility",
				description: "Adapts quickly to changes",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Kháng cự hoặc tích cực phản đối các thay đổi, vẫn duy trì dùng các phương pháp, công cụ cũ ngay cả khi không còn phù hợp.\n- Gây ra cản trở cho tiến độ chung khi dự án cần điều chỉnh.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Chấp nhận thay đổi một cách miễn cưỡng hoặc chậm chạp.\n- Cần nhiều thời gian và sự hỗ trợ từ quản lý/đồng nghiệp để thích nghi với các yêu cầu hoặc công nghệ mới. Hiệu suất bị giảm tạm thời sau khi có thay đổi.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Chấp nhận thay đổi một cách sẵn lòng và điều chỉnh công việc/tiến độ khi có chỉ đạo.\n- Có khả năng tự học hỏi các kỹ năng hoặc công cụ mới ở tốc độ hợp lý để đáp ứng yêu cầu công việc.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Phản ứng ngay lập tức và hiệu quả trước những thay đổi quan trọng (ví dụ: thay đổi yêu cầu dự án, thay đổi cơ cấu tổ chức, công cụ làm việc, lỗi hệ thống).\n- Điều chỉnh kế hoạch, mức độ ưu tiên một cách liền mạch, duy trì hiệu suất cá nhân và hỗ trợ đồng nghiệp thích nghi.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Luôn luôn chủ động dự đoán và sẵn sàng tiếp nhận các thay đổi lớn về công nghệ/chiến lược công ty.\n- Nhanh chóng làm chủ các công cụ/phương pháp mới, thích nghi nhanh nhất với thay đổi và có thể hướng dẫn lại đội nhóm áp dụng.",
					},
				],
			},
			{
				name: "Impact",
				description: "Creates visible positive outcomes",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Hành động thường xuyên dẫn đến hậu quả tiêu cực (sai sót lớn, chậm trễ, vượt chi phí) hoặc không đạt được bất kỳ kết quả có ý nghĩa nào, đòi hỏi người khác phải can thiệp khắc phục.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Công việc tạo ra kết quả nhưng chất lượng không ổn định, dẫn đến hạn chế các tác động tích cực hoặc không nhất quán.\n- Thỉnh thoảng có một vài hành vi, thái độ tiêu cực tạo tác động không tốt đến ngoài phạm vi team.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Luôn hoàn thành công việc/dự án với chất lượng yêu cầu và đạt được giá trị mong đợi.\n- Tác động phù hợp các mục tiêu đã xác định và đóng góp tích cực vào hiệu suất của nhóm trực tiếp.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Công việc/ý tưởng/đề xuất tạo ra cải tiến đáng kể, mang lại lợi ích cho nhiều hơn 1 team (cross functional)\n- Cách làm việc/thái độ hành vi tạo ra ảnh hưởng tích cực lên nhiều hơn 1 team, hoặc nguồn động lực để cải thiện nói chung.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Công việc/ý tưởng/đề xuất tạo ra lợi ích đột phá, có thể định lượng (ví dụ: doanh thu, tiết kiệm chi phí, nguồn lực, giảm tải...).\n- Tầm ảnh hưởng góp phần chuyển đổi một quy trình hoặc lĩnh vực của tổ chức, thiết lập một tiêu chuẩn mới.",
					},
				],
			},
		],
	},
	{
		name: "Skill Set",
		weight: 16,
		roleScope: RoleScope.NON_MANAGEMENT,
		criteria: [
			{
				name: "Problem-Solving Thinking",
				description: "Problem-solving thinking",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Luôn luôn đưa ra các vấn đề và không đính kèm giải pháp.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details: "- Nhận diện được đúng vấn đề.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Nhận diện đúng vấn đề, nguyên nhân và liệt kê các giải pháp, có ít nhất 1 giải pháp được đánh giá khả thi (bởi cấp trên hoặc team).",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Tư duy hướng giải pháp hơn là truy cứu trách nhiệm lỗi là do ai.\n- Nhận diện được vấn đề, nguyên nhân cốt lõi và đề xuất được ít nhất 2 giải pháp, có ít nhất 1 giải pháp được áp dụng, có định hướng giải pháp phòng ngừa vấn đề lặp lại.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Tư duy phân tích khách quan và đa chiều, chú trọng tìm giải pháp nhanh, hiệu quả, tác động lớn.\n- Thường xuyên đưa ra tư vấn cho cấp cao hơn dưới góc độ chuyên môn để hỗ trợ chọn giải pháp tối ưu nhất trong tình huống phát sinh.",
					},
				],
			},
			{
				name: "Critical Thinking",
				description: "Critical thinking",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Không có thói quen đặt câu hỏi làm rõ; tiếp cận vấn đề cảm tính; đưa ra giải pháp sai hoặc không thể sử dụng.\n- Thường xuyên mắc các lỗi do thiếu tư duy đánh giá và kiểm tra.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Hiểu vấn đề ở mức cơ bản, phân tích vấn đề chưa đầy đủ; thường bỏ sót thông tin quan trọng.\n- Ít đặt câu hỏi để làm rõ; đưa ra giải pháp vì trách nhiệm phải làm",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Biết đặt câu hỏi để làm rõ những điều chưa hiểu.\n- Đánh giá được vấn đề theo hướng dẫn.\n- Giải pháp đưa ra có tính ứng dụng nhưng còn phụ thuộc vào PM/LM.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Đặt câu hỏi trong phạm vi hiểu biết cá nhân.\n- Phân biệt được đâu là dữ kiện, đâu là ý kiến cá nhân, đâu là suy đoán.\n- Đưa ra được giải pháp hợp lý.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Đặt câu hỏi sâu sắc và có mục đích.\n- Xem xét vấn đề từ nhiều góc độ khác nhau và cân nhắc các quan điểm đối lập trước khi hình thành ý kiến.\n- Triệt tiêu hoàn toàn thiên kiến, định kiến, kinh nghiệm cá nhân khi đưa ra giải pháp. Mọi kết luận đều phải dựa trên dữ liệu, tổng hợp.",
					},
				],
			},
			{
				name: "Communication Skills",
				description: "Communication skills",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Giao tiếp kém; thông tin sai hoặc thiếu nghiêm trọng; gây ảnh hưởng đến tiến độ, teamwork hoặc chất lượng công việc; tránh giao tiếp hoặc không phản hồi.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Giao tiếp thiếu rõ ràng; dễ gây hiểu nhầm.\n- Không chủ động thông báo hoặc cập nhật tiến độ; cần nhắc nhở nhiều lần.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Giao tiếp cơ bản đạt yêu cầu; thỉnh thoảng diễn đạt chưa rõ.\n- Thiếu cập nhật tiến độ thường xuyên; đôi khi cần hướng dẫn để truyền đạt chính xác hơn.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Giao tiếp tốt; diễn đạt đúng trọng tâm, đạt được mục tiêu giao tiếp chung; có hỏi lại khi chưa rõ; đôi khi người nghe cần phải hỏi lại, nhưng không ảnh hưởng công việc.\n- Luôn chủ động cập nhật thông tin tương đối đầy đủ.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Có mục đích giao tiếp rõ ràng, truyền đạt mạch lạc, ngôn từ và thái độ tôn trọng; Tạo được sự tương tác hai chiều.\n- Luôn cập nhật tiến độ đúng hạn; trình bày vấn đề logic giúp người khác dễ hiểu, chủ động làm rõ yêu cầu bằng câu hỏi phù hợp.",
					},
				],
			},
			{
				name: "Teamwork Skills",
				description: "Teamwork skills",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Không hợp tác; gây xung đột; làm việc tách biệt; cản trở tiến độ chung; ảnh hưởng tiêu cực đến tinh thần hoặc hiệu quả của team.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Khó hợp tác; phản hồi chậm; thiếu tinh thần hỗ trợ.\n- Đôi khi tạo áp lực cho team hoặc làm chậm workflow.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Hợp tác ở mức cơ bản; đôi khi làm việc thiên về cá nhân; phối hợp chưa thật sự trơn tru.\n- Phối hợp hỗ trợ lẫn nhau khi được yêu cầu.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Hợp tác tốt; chủ động cao; phối hợp tạo hiệu quả ổn định.\n- Giữ thái độ tích cực và tôn trọng đồng đội.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Chủ động hỗ trợ đồng đội; hợp tác tích cực; sẵn sàng chia sẻ thông tin; tinh thần hợp tác ưu tiên mục tiêu chung hơn\n- Đóng vai trò chủ chốt trong việc duy trì tinh thần làm việc nhóm tích cực tại team/bộ phận.",
					},
				],
			},
		],
	},
	{
		name: "Performance",
		weight: 60,
		roleScope: RoleScope.MANAGEMENT,
		criteria: [
			{
				name: "Work & Team Management",
				description: "Work & team management",
				weight: 20,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Không có kế hoạch hoặc kế hoạch sơ sài. Thiếu kiểm soát hoặc theo dõi tiến độ, dẫn đến team thường xuyên gặp trở ngại hoặc chậm tiến độ nghiêm trọng. Chất lượng output dưới mức chấp nhận được.\n- Phân công thiếu công bằng/hợp lý, tạo ra xung đột hoặc gánh nặng công việc không đều, gây ảnh hưởng tiêu cực đến tinh thần và khả năng hoàn thành mục tiêu chung của đội.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Có kế hoạch nhưng thiếu tính hệ thống hoặc chưa tối ưu. Đôi khi thiếu theo dõi sát sao hoặc chậm điều chỉnh, dẫn đến tiến độ công việc hoặc chất lượng output của team thỉnh thoảng không đạt yêu cầu (dưới 100%).\n- Việc phân công chưa cân bằng hoặc chưa khai thác hết tiềm năng của thành viên, cần sự can thiệp từ quản lý cấp cao hơn để đội nhóm vận hành ổn định.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Lập kế hoạch, theo dõi và điều chỉnh kịp thời, đảm bảo team vận hành ổn định và 100% output đạt chuẩn chất lượng đã định.\n- Phân công công việc công bằng và rõ ràng.\n- Kiểm soát rủi ro cơ bản và xử lý tốt các vấn đề phát sinh thường gặp, giúp team duy trì tiến độ theo đúng lịch trình.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Lập kế hoạch rõ ràng và linh hoạt, đảm bảo 100% output đạt chuẩn và team hoạt động năng suất cao.\n- Phân công hợp lý dựa trên phân tích điểm mạnh của nhân viên.\n- Chủ động kiểm soát rủi ro toàn diện, hướng dẫn, giúp team không bị gián đoạn và luôn hoàn thành tốt mục tiêu đặt ra.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Có kế hoạch chiến lược rõ ràng, cụ thể, đảm bảo team vận hành hiệu quả 100% output đạt chuẩn và vượt kỳ vọng.\n- Phân công dựa trên phân tích chuyên sâu về điểm mạnh và tiềm năng phát triển của từng thành viên, đồng thời tạo cơ hội, định hình và nâng cao năng lực cho toàn bộ team.\n- Thiết lập các quy trình tự động, giúp team luôn dẫn đầu về hiệu suất và đổi mới.",
					},
				],
			},
			{
				name: "Work Quality",
				description: "Work quality",
				weight: 20,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Kiểm soát chất lượng chưa tốt; để xảy ra lỗi lặp lại; không phát hiện được lỗi trước khi deliver.\n- Hướng dẫn thiếu rõ ràng dẫn đến chất lượng công việc của toàn team không ổn định.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Kiểm soát chất lượng ở mức cơ bản; team đôi khi gặp lỗi nhỏ trong kiểm soát.\n- Khả năng review và hướng dẫn ở mức vừa đủ để đảm bảo chất lượng sản phẩm đầu ra.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Đảm bảo 100% output công việc đạt chuẩn; kiểm soát lỗi phát sinh luôn được xử lý nhanh.\n- Có hướng dẫn/feedback hiệu quả lại cho team.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Đảm bảo 100% output công việc đạt chuẩn; kiểm soát lỗi tốt; phát hiện rủi ro trước khi xảy ra; chất lượng deliverables cao và ổn định.\n- Hướng dẫn/feedback rõ ràng giúp team nâng chuẩn chất lượng.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Thiết kế và triển khai thành công ít nhất công cụ/ quy trình mới, giúp giảm thiểu rủi ro vận hành hoặc tăng hiệu suất lên 100% cho toàn team/ bộ phận (ví dụ: giảm 30% thời gian xử lý, giảm 50% lỗi đã gặp).\n- Tiêu chuẩn hoá các hướng dẫn/feedback đến toàn bộ phận.",
					},
				],
			},
			{
				name: "Personal Productivity",
				description: "Personal productivity",
				weight: 15,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Hoàn thành công việc cá nhân đúng hạn ở mức cơ bản; đôi khi để team chậm tiến độ do thiếu theo dõi; năng suất ở mức đạt yêu cầu nhưng chưa ổn định.\n- Cần hỗ trợ từ cấp trên trong những tình huống khó.\n- Không kiểm soát được tiến độ làm việc của bản thân; để xảy ra chậm deadline; thiếu chủ động trong xử lý blockers; phân bổ công việc chưa hợp lý gây quá tải hoặc thiếu tải cho team.\n- Hiệu suất không đều một cách rõ rệt.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Đảm bảo tiến độ công việc cá nhân đúng kế hoạch; theo dõi tiến độ team sát sao; xử lý blockers kịp thời; năng suất cá nhân ổn định.\n- Đôi khi chậm nhưng không ảnh hưởng đến tiến độ chung.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Đảm bảo hiệu suất cá nhân ổn định, hoàn thành đầy đủ các nhiệm vụ quản lý (planning, follow-up, report, review,…). Chủ động giải quyết vấn đề và rủi ro, giúp tiến độ công việc chung không bị gián đoạn.\n- Thể hiện vai trò dẫn dắt bằng hành động cụ thể, từ đó tạo ảnh hưởng tích cực tới hiệu suất của team.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Luôn duy trì hiệu suất cá nhân cao và ổn định mà không cần bất cứ sự theo dõi nào từ cấp cao hơn; có khả năng xử lý tình huống khẩn cấp mà vẫn đảm bảo được tiến độ dự án.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Luôn đảm bảo tiến độ sớm hơn kế hoạch; chủ động dự báo rủi ro và loại bỏ blockers trước khi ảnh hưởng; phân bổ nguồn lực tối ưu; quản lý workload khoa học.",
					},
				],
			},
			{
				name: "Cooperation & Compliance",
				description: "Cooperation & compliance",
				weight: 5,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Không tuân thủ quy trình hoặc thường xuyên làm theo ý muốn cá nhân, lặp lại lỗi tuân thủ quy trình nhiều lần sau khi đã được nhắc nhở, gây rủi ro lớn hoặc tổn hại đến chất lượng.\n- Thiếu ý thức về hợp tác, gây ra xung đột hoặc lặp lại lỗi phối hợp, dẫn đến team/dự án thường xuyên bị gián đoạn.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Tuân thủ khoảng 50%-70% quy trình, cần có sự nhắc nhở từ các bên liên quan về ý thức tuân thủ các quy trình chi tiết.\n- Hợp tác ổn định nhưng chưa chủ động hoặc đôi khi thiếu hiệu quả, gây ảnh hưởng nhẹ đến tiến độ của bên liên quan, cần được can thiệp để làm rõ hoặc giải quyết vấn đề.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Phối hợp đúng và đủ, hoàn toàn tuân thủ quy trình (100% các quy định chính) mà không cần nhắc nhở.\n- Thực hiện các giao tiếp/phối hợp khi được yêu cầu, để đảm bảo đạt được output hiệu quả khi giao tiếp liên phòng ban và mục đích duy trì team vận hành ổn định.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Phối hợp chủ động, hiệu quả cao với các bên liên quan, đảm bảo mục tiêu chung được thực hiện.\n- Chủ động giải quyết mọi xung đột và đảm bảo team cũng tuân thủ quy trình chặt chẽ, duy trì sự tuân thủ tích cực và tự nguyện ngay cả trong điều kiện áp lực, đảm bảo tính ổn định trong chất lượng và tính thống nhất trong vận hành.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Chủ động tuân thủ, đi đầu trong định hình tư duy về hợp tác, và tuân thủ là nhằm nhất quán trong vận hành, đảm bảo lợi ích chung của tổ chức trong khuôn khổ team phòng ban/liên phòng ban.\n- Đề xuất và triển khai các giải pháp tối ưu hóa quy trình để nâng cao chất lượng hợp tác và tăng hiệu quả vận hành cho toàn bộ team/phòng ban/liên phòng ban.",
					},
				],
			},
		],
	},
	{
		name: "Culture Fit",
		weight: 24,
		roleScope: RoleScope.MANAGEMENT,
		criteria: [
			{
				name: "Empowerment",
				description: "Empowers peers and team members",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Hầu như không giao phó trách nhiệm/cho NV tự quyết định.\n- Thường xuyên tự đưa ra tất cả các quyết định (kể cả những quyết định nhỏ), dẫn đến sự thụ động và phụ thuộc cao của đội ngũ vào quản lý.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Chỉ để NV đưa quyết định khi bắt buộc hoặc cho các nhiệm vụ đơn giản, tự quyết các quyết định quan trọng.\n- Có xu hướng can thiệp sâu vào công việc của cấp dưới, làm hạn chế sự phát triển và tính chủ động của team.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Có phân tích năng lực của từng nhân viên và tuân thủ các quy tắc phân cấp hiện có để trao quyền phù hợp.\n- Đảm bảo cấp dưới có đủ thông tin và nguồn lực để thực hiện công việc một cách tự chủ. Cung cấp sự hỗ trợ khi được yêu cầu.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Thường xuyên nâng cao hiệu quả trong việc giao phó trách nhiệm và quyền hạn.\n- Tin tưởng vào năng lực của cấp dưới, cung cấp tài nguyên đầy đủ và giảm được đáng kể khối lượng công việc từ can thiệp chi tiết.\n- Thường xuyên tạo động lực để cấp dưới tự tin giải quyết vấn đề và học hỏi từ kinh nghiệm.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Xây dựng một đội ngũ có khả năng tự vận hành cao, không phát sinh bất kỳ sự cố nào, ngay cả khi cấp QL không có mặt.\n- Thiết lập hệ thống hỗ trợ và hướng dẫn để cấp dưới tự phát triển năng lực (tiêu chuẩn hoá/tài liệu hoá/đào tạo lại quy trình Empower trong tổ chức, chương trình successor training...).",
					},
				],
			},
			{
				name: "Innovation",
				description: "Brings new ideas to the team",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Không đóng góp ý tưởng mới hoặc phản đối các đề xuất thay đổi/cải tiến. Chỉ làm việc theo lối mòn và quy trình đã có, ngại thay đổi.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Có đề xuất ý tưởng mới, nhưng chưa được đánh giá là thực tế.\n- Hoặc chưa chủ động tìm kiếm các cơ hội để cải tiến hoặc đổi mới, hoặc chỉ thực hiện khi được yêu cầu.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Cùng tham gia vào các hoạt động sáng tạo, cải tiến của team.\n- Đưa ra được các ý tưởng mới hợp lý khi được yêu cầu hoặc khi phát hiện vấn đề, giúp giải quyết các khó khăn trong công việc thường nhật.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Thường xuyên đề xuất các ý tưởng cải tiến có hệ thống quy trình hoặc sản phẩm/dịch vụ/văn hoá tổ chức hiện có.\n- Ít nhất 1 đề xuất được triển khai và mang lại hiệu quả rõ rệt (tiết kiệm chi phí/thời gian đáng kể...).",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Trong kỳ, có đưa ra ít nhất 1 giải pháp đột phá hoặc công nghệ mới, được triển khai, tạo ra giá trị chiến lược lớn (tăng doanh thu, lợi thế cạnh tranh) cho toàn tổ chức, liên phòng ban, hoặc khách hàng.",
					},
				],
			},
			{
				name: "Accountability",
				description: "Takes ownership of outcomes",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Tránh né việc chịu trách nhiệm về kết quả tiêu cực.\n- Cấp cao hơn phải thường xuyên can thiệp.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Cần sự thúc đẩy từ quản lý để thừa nhận sai sót.\n- Giải trình còn thiếu dữ liệu hoặc không đầy đủ, dẫn đến việc phải nhắc lại các hành động khắc phục.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Hoàn thành các cam kết đã giao.\n- Cung cấp báo cáo, giải thích và minh chứng cho hành động, quyết định và kết quả đã đạt được rõ ràng khi được yêu cầu.\n- Hạn chế việc đổ lỗi cho yếu tố bên ngoài khi xảy ra vấn đề.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Công khai chấp nhận trách nhiệm về kết quả (thất bại/thành công) trong các cuộc họp/báo cáo.\n- Có kế hoạch hoàn thành các cam kết/khắc phục cho các vấn đề đã xảy ra đúng hạn mà không cần nhắc nhở.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Chủ động tổ chức buổi họp/buổi đối thoại (retro) để phân tích thất bại, rút kinh nghiệm và đề xuất thay đổi quy trình để ngăn chặn tái diễn trong toàn bộ phận.\n- Chuẩn hóa lại quy trình và thông tin.",
					},
				],
			},
			{
				name: "Empathy",
				description: "Understands others' perspectives",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Thường xuyên bỏ qua ý kiến/cảm xúc của đồng nghiệp, chỉ hành động dựa trên logic cá nhân, dẫn đến mâu thuẫn thường xuyên.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Phản ứng hời hợt hoặc không phù hợp với các tín hiệu cảm xúc. Cần được nhắc nhở để tập trung lắng nghe ý kiến của người khác.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Lắng nghe đầy đủ ý kiến của người khác (không bao giờ ngắt lời).\n- Phản hồi bằng ngôn ngữ tích cực và thừa nhận quan điểm khác biệt trước khi đưa ra ý kiến riêng.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							'- Chủ động đặt các câu hỏi thăm dò (Ví dụ: "Bạn cảm thấy thế nào về đề xuất này?", "Bạn cần hỗ trợ gì?").\n- Thực hiện ít nhất 1 hành động hỗ trợ sau khi lắng nghe phản hồi xây dựng hoặc phản ánh tiêu cực (Ví dụ: đề nghị lùi deadline, chia sẻ tài nguyên, nguồn lực…).',
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Sử dụng dữ liệu phản hồi (Feedback) từ nhân viên/khách hàng để đề xuất cải tiến chính sách/quy trình.\n- Luôn điều chỉnh nội dung giao tiếp dựa trên đối tượng để tối đa hóa hiệu quả làm việc.",
					},
				],
			},
			{
				name: "Agility",
				description: "Adapts quickly to changes",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Kháng cự hoặc tích cực phản đối các thay đổi, vẫn duy trì dùng các phương pháp, công cụ cũ ngay cả khi không còn phù hợp.\n- Gây ra cản trở cho tiến độ chung khi dự án cần điều chỉnh.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Chấp nhận thay đổi một cách miễn cưỡng hoặc chậm chạp.\n- Cần nhiều thời gian và sự hỗ trợ từ quản lý/đồng nghiệp để thích nghi với các yêu cầu hoặc công nghệ mới. Hiệu suất bị giảm tạm thời sau khi có thay đổi.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Chấp nhận thay đổi một cách sẵn lòng và điều chỉnh công việc/tiến độ khi có chỉ đạo. Có khả năng tự học hỏi các kỹ năng hoặc công cụ mới ở tốc độ hợp lý để đáp ứng yêu cầu công việc.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Phản ứng ngay lập tức và hiệu quả trước những thay đổi quan trọng (ví dụ: thay đổi yêu cầu dự án, thay đổi cơ cấu tổ chức, công cụ làm việc, lỗi hệ thống…).\n- Điều chỉnh kế hoạch, mức độ ưu tiên một cách liền mạch, duy trì hiệu suất và hỗ trợ đồng nghiệp thích nghi.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Luôn luôn chủ động dự đoán và sẵn sàng thích nghi các thay đổi lớn về công nghệ/chiến lược công ty.\n- Nhanh chóng làm chủ các công cụ/phương pháp mới thích nghi nhanh nhất với thay đổi và dẫn dắt đội nhóm áp dụng.",
					},
				],
			},
			{
				name: "Impact",
				description: "Creates visible positive outcomes",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Hành động/quyết định thường xuyên dẫn đến hậu quả tiêu cực (sai sót lớn, chậm trễ, vượt chi phí) hoặc không đạt được bất kỳ kết quả có ý nghĩa nào, đòi hỏi người khác phải can thiệp khắc phục.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Công việc tạo ra kết quả cơ bản, tuy nhiên chất lượng chưa ổn định nên dẫn đến tác động tích cực bị hạn chế hoặc không nhất quán.\n- Đôi khi các hành động/quyết định tạo ra tác động không tốt lên các team/bộ phận khác.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Công việc/quyết định tạo ra cải tiến có thể định lượng được bằng việc mang lại lợi ích cho team trực tiếp.\n- Tầm ảnh hưởng đáp ứng đủ trong phạm vi chức vụ để đảm bảo đạt các mục tiêu team đã xác định từ đầu và đóng góp tích cực vào việc team luôn duy trì hiệu suất ổn định.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Công việc/quyết định tạo ra cải tiến đáng kể, có thể định lượng và mang lại lợi ích cho nhiều hơn 1 team (cross functional).\n- Mức độ ảnh hưởng có thể giúp chuyển đổi một quy trình, thiết lập một tiêu chuẩn mới, văn hoá làm việc mới hiệu quả hơn trong nội bộ team hoặc nhiều hơn 1 team.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Công việc/quyết định tạo ra lợi ích đột phá, có thể định lượng (ví dụ: tăng trưởng doanh thu đáng kể, tiết kiệm chi phí, nguồn lực, giảm tải...).\n- Mức độ ảnh hưởng có thể giúp chuyển đổi một quy trình hoặc lĩnh vực lớn của tổ chức, thiết lập một tiêu chuẩn mới, văn hoá doanh nghiệp mới.",
					},
				],
			},
		],
	},
	{
		name: "Skill Set",
		weight: 16,
		roleScope: RoleScope.MANAGEMENT,
		criteria: [
			{
				name: "Problem-Solving",
				description: "Problem-solving",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Hiểu sai vấn đề; không phân tích nguyên nhân; chọn sai giải pháp hoặc không đưa ra được giải pháp; gây hậu quả nghiêm trọng cho team/dự án; ra quyết định cảm tính hoặc bị động.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Khó xác định vấn đề thật sự; phân tích cảm tính khi không đủ dữ liệu; giải pháp mang tính ngắn hạn, xử lý triệu chứng hơn là nguyên nhân.\n- Để rủi ro xảy ra; team lúng túng khi triển khai.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Hiểu vấn đề ở mức đúng và đủ trong phạm vi chuyên môn; Phân tích để xác định nguyên nhân gốc rễ và giải pháp, cần cải thiện về chiều sâu và góc nhìn đa chiều\n- Cấp trên vẫn cần follow-up sát để đảm bảo team triển khai đúng.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Xác định vấn đề đúng; phân tích đầy đủ; giải pháp hiệu quả.\n- Có dự báo được các rủi ro; dẫn dắt team xử lý trơn tru; quyết định nhanh, thỉnh thoảng cần hỗ trợ từ cấp cao hơn.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Xác định vấn đề nhanh và chính xác; phân tích nguyên nhân gốc rễ (root cause) bằng dữ liệu; đưa ra giải pháp chiến lược, tối ưu & bền vững.\n- Dự đoán rủi ro trước khi xảy ra; điều phối team xử lý hiệu quả; quyết định rõ ràng và nhất quán.",
					},
				],
			},
			{
				name: "Risk Management",
				description: "Risk management",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Không chủ động nhận diện rủi ro; chỉ phản ứng khi sự cố đã xảy ra.\n- Thiếu khả năng đánh giá tác động, dẫn đến các quyết định xử lý rủi ro gây tổn thất đáng kể về thời gian hoặc chi phí dự án.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Chỉ nhận diện được rủi ro khi đã rõ ràng hoặc sắp xảy ra.\n- Việc phân tích và xử lý rủi ro còn hạn chế, thường yêu cầu sự hỗ trợ hoặc nhắc nhở từ quản lý để đưa ra hành động phòng ngừa.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Nhận diện được các rủi ro chính theo checklist hoặc tiêu chuẩn đã có.\n- Phân tích được tác động cơ bản và thực hiện các hành động phòng ngừa theo quy trình đã được thiết lập. Xử lý kịp thời các sự cố nhỏ mà không cần sự can thiệp của cấp trên.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Nhận diện gần như toàn bộ các rủi ro tiềm ẩn (kỹ thuật, tiến độ, chi phí) từ sớm.\n- Phân tích toàn diện các lựa chọn (risk-taking vs. risk-handling) và đề xuất biện pháp giảm thiểu rất hiệu quả, giúp dự án duy trì tính ổn định vượt trội.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Nhận diện và dự báo rủi ro mang tính chiến lược (ví dụ: rủi ro về công nghệ mới, thị trường).\n- Chủ động chuyển hóa rủi ro thành cơ hội hoặc xây dựng hệ thống phòng ngừa tự động cho đội nhóm. Dẫn dắt việc chuẩn hóa quy trình quản lý rủi ro.",
					},
				],
			},
			{
				name: "Communication Skills",
				description: "Communication",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Giao tiếp kém, không truyền đạt được yêu cầu; gây hiểu nhầm nghiêm trọng; làm mất niềm tin của team hoặc khách hàng.\n- Phản hồi thiếu trách nhiệm; dẫn đến team rối, không align, tinh thần giảm sút hoặc xung đột kéo dài.",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Giao tiếp mơ hồ hoặc thiếu nhất quán; truyền đạt không rõ dẫn đến hiểu sai công việc.\n- Phản hồi chậm hoặc không kịp thời; thiếu kỹ năng kết nối team; xử lý xung đột kém hoặc né tránh.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Giao tiếp đạt yêu cầu; truyền đạt thông tin rõ ràng, đi vào trọng tâm. Phản hồi đều đặn.\n- Có 1-2 tình huống khó cần hỗ trợ từ cấp cao hơn để giải quyết.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Giao tiếp hiệu quả, rõ ràng; truyền đạt mục tiêu và yêu cầu đúng; phối hợp tốt với tất cả các bên liên quan\n- Biết điều chỉnh ngôn ngữ cho phù hợp tình huống; xử lý được các tình huống khó.",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Truyền đạt định hướng, mục tiêu và yêu cầu một cách rõ ràng, logic và dễ hiểu; điều chỉnh cách giao tiếp phù hợp từng đối tượng (CEO/COO, khách hàng, team).\n- Giao tiếp truyền cảm hứng; xử lý xung đột thông minh; phản hồi (feedback) kịp thời, thẳng thắn nhưng tinh tế; tạo được sự “alignment” trong toàn team.",
					},
				],
			},
			{
				name: "Team Development",
				description: "Team development",
				weight: 4,
				rubrics: [
					{
						rating: 1,
						description: "Dưới kỳ vọng",
						details:
							"- Chưa có kế hoạch phát triển cho team hoặc cá nhân.\n- Không nhận diện khoảng cách năng lực của nhân viên.\n- Thường xuyên bỏ qua việc cung cấp phản hồi",
					},
					{
						rating: 2,
						description: "Cần cải thiện",
						details:
							"- Việc phát triển năng lực cá nhân thường chỉ mang tính phản ứng, xảy ra khi có yêu cầu hoặc khi hiệu suất gặp vấn đề.\n- Thiếu đi việc lập IDP, hoặc cung cấp cơ hội học tập cho đội ngũ một cách bản năng, chưa thấy hiệu quả rõ rệt, hay định hướng lâu dài cho nhân viên.\n- Thỉnh thoảng có phản hồi, nhưng không có tác dụng cải thiện hiệu suất hay năng lực của đội ngũ.",
					},
					{
						rating: 3,
						description: "Đạt kỳ vọng",
						details:
							"- Đảm bảo mọi thành viên trong team trực tiếp có Kế hoạch Phát triển Cá nhân (IDP) rõ ràng, và được giám sát, hỗ trợ kịp thời.\n- Chủ động cung cấp các cơ hội học tập, đào tạo và trao quyền phù hợp để nâng cao năng lực hiện tại của nhân viên.\n- Cung cấp phản hồi mang tính xây dựng một cách đều đặn.",
					},
					{
						rating: 4,
						description: "Vượt kỳ vọng",
						details:
							"- Có phân tích chi tiết để nhận diện và bồi dưỡng nhân sự có tiềm năng trong phạm vi chức năng/phòng ban.\n- Thiết lập các lộ trình phát triển năng lực và kế hoạch kế nhiệm có cấu trúc rõ ràng, giúp nhân viên có định hướng rõ ràng.\n- Thường xuyên cung cấp phản hồi chuyên sâu/ thỉnh thoảng coaching cho cấp dưới",
					},
					{
						rating: 5,
						description: "Xuất sắc",
						details:
							"- Tham gia vào kế hoạch định hình chiến lược phát triển nhân tài/ kế hoạch người kế nhiệm cấp phòng ban/công ty.\n- Xây dựng/ thường xuyên thúc đẩy văn hóa học hỏi, mentoring, chia sẻ kiến thức vượt ra ngoài ranh giới phòng ban.\n- Tạo ra những chương trình phát triển nhân sự có tầm ảnh hưởng lớn và đảm bảo sự ổn định, phát triển bền vững nguồn nhân sự kế thừa cho toàn công ty.",
					},
				],
			},
		],
	},
];
