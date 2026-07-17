import { PrismaClient } from "@prisma/client";
import { categoryDefinitions } from "./criteria-data";

export async function seedRubrics(prisma: PrismaClient) {
	console.log("Seeding Evaluation Rubrics...");
	await prisma.rubric.deleteMany({});

	for (const def of categoryDefinitions) {
		const category = await prisma.evaluationCategory.findFirst({
			where: { name: def.name, roleScope: def.roleScope },
		});
		if (!category) continue;

		for (const crit of def.criteria) {
			const criterion = await prisma.evaluationCriterion.findFirst({
				where: { name: crit.name, categoryId: category.id },
			});
			if (!criterion) continue;

			if ("rubrics" in crit && crit.rubrics) {
				await prisma.rubric.createMany({
					data: crit.rubrics.map((r) => ({
						criterionId: criterion.id,
						rating: r.rating,
						description: r.description,
						details: r.details,
					})),
				});
			} else {
				await prisma.rubric.createMany({
					data: [
						{
							criterionId: criterion.id,
							rating: 1,
							description: "Dưới kỳ vọng",
							details:
								"Thường xuyên không hoàn thành nhiệm vụ đúng hạn, cần giám sát liên tục.",
						},
						{
							criterionId: criterion.id,
							rating: 2,
							description: "Cần cải thiện",
							details:
								"Hoàn thành phần lớn nhiệm vụ nhưng chậm trễ ở một số hạng mục quan trọng.",
						},
						{
							criterionId: criterion.id,
							rating: 3,
							description: "Đạt kỳ vọng",
							details:
								"Hoàn thành nhiệm vụ đúng hạn, đảm bảo khối lượng công việc cơ bản.",
						},
						{
							criterionId: criterion.id,
							rating: 4,
							description: "Vượt kỳ vọng",
							details:
								"Thường xuyên hoàn thành trước hạn, chủ động nhận thêm công việc.",
						},
						{
							criterionId: criterion.id,
							rating: 5,
							description: "Xuất sắc",
							details:
								"Luôn vượt kỳ vọng, là người tăng tốc độ toàn đội, không cần giám sát.",
						},
					],
				});
			}
		}
	}
	console.log("Seeded Evaluation Rubrics.");
}
