export const feedbackPool = [
	"Hoàn thành xuất sắc các task được giao đúng hạn, code quality rất tốt và hiếm khi có bug.",
	"Kỹ năng giải quyết vấn đề xuất sắc, đóng góp nhiều giải pháp tối ưu cho dự án.",
	"Cần cải thiện thêm kỹ năng giao tiếp với khách hàng và report định kỳ.",
	"Tinh thần team work tốt, hỗ trợ đồng đội nhiệt tình trong các sprint căng thẳng.",
	"Chất lượng công việc ổn định, nhưng cần chủ động hơn trong việc propose giải pháp mới.",
	"Hiệu suất làm việc vượt mong đợi, thái độ chuyên nghiệp, luôn sẵn sàng OT khi cần.",
	"Có cố gắng học hỏi công nghệ mới, tuy nhiên cần cải thiện tốc độ hoàn thành task.",
];

export const kudosScenarios = [
	"Outstanding performance in delivering the SOTRAMS MVP ahead of schedule.",
	"Excellent problem solving during the DEMLUOS production incident.",
	"Great mentorship and support for junior members in the team during Q1.",
];

export const warningScenarios = [
	"Late delivery on the final sprint of Q1 without prior notice or escalation.",
	"Multiple complaints regarding communication with clients on the NOMISERP project.",
	"Failed to comply with company security policies regarding data access.",
];

export function getRandomItem<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomRating(): number {
	return Math.floor(Math.random() * 3) + 3; // Returns 3, 4, or 5 (integers)
}
