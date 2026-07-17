import { FormStatus, PrismaClient, RoleScope, StageType } from "@prisma/client";

export async function seedForms(prisma: PrismaClient) {
	console.log("Seeding PR Forms...");

	// Clean old forms
	await prisma.pRForm.deleteMany({});

	const formsToCreate = [
		{
			name: "Management Self Review Form 2025",
			roleScope: RoleScope.MANAGEMENT,
			stageType: StageType.SELF_REVIEW,
		},
		{
			name: "Management Peer Review Form 2025",
			roleScope: RoleScope.MANAGEMENT,
			stageType: StageType.PEER_REVIEW,
		},
		{
			name: "Management Self Review Form 2026",
			roleScope: RoleScope.MANAGEMENT,
			stageType: StageType.SELF_REVIEW,
		},
		{
			name: "Management Peer Review Form 2026",
			roleScope: RoleScope.MANAGEMENT,
			stageType: StageType.PEER_REVIEW,
		},
		{
			name: "Non-Management Self Review Form 2025",
			roleScope: RoleScope.NON_MANAGEMENT,
			stageType: StageType.SELF_REVIEW,
		},
		{
			name: "Non-Management Peer Review Form 2025",
			roleScope: RoleScope.NON_MANAGEMENT,
			stageType: StageType.PEER_REVIEW,
		},
		{
			name: "Non-Management Self Review Form 2026",
			roleScope: RoleScope.NON_MANAGEMENT,
			stageType: StageType.SELF_REVIEW,
		},
		{
			name: "Non-Management Peer Review Form 2026",
			roleScope: RoleScope.NON_MANAGEMENT,
			stageType: StageType.PEER_REVIEW,
		},
	];

	for (const formData of formsToCreate) {
		const categories = await prisma.evaluationCategory.findMany({
			where: {
				roleScope: {
					in: [formData.roleScope],
				},
			},
			include: {
				criteria: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		const prForm = await prisma.pRForm.create({
			data: {
				name: formData.name,
				description: `This is a generated ${formData.name}`,
				stageType: formData.stageType,
				roleScope: formData.roleScope,
				status: FormStatus.PUBLISHED,
				publishedAt: new Date(),
				sections: {
					create: [
						...categories.map((cat, i) => ({
							categoryId: cat.id,
							title: cat.name,
							order: i + 1,
							questions: {
								create: cat.criteria.map((crit, j) => ({
									criterionId: crit.id,
									type: "RATING",
									text: crit.name,
									description: crit.description,
									required: true,
									order: j + 1,
								})),
							},
						})),
						// General feedback section (non-criteria questions)
						{
							categoryId: null,
							title: "General Feedback & Future Development",
							order: categories.length + 1,
							questions: {
								create: [
									{
										criterionId: null,
										type: "TEXT",
										text: "Key Accomplishments",
										description: "Describe your main achievements and successes during this review period.",
										required: true,
										order: 1,
									},
									{
										criterionId: null,
										type: "TEXT",
										text: "Areas for Improvement",
										description: "What areas or skills do you think you can improve upon in the next cycle?",
										required: false,
										order: 2,
									},
									{
										criterionId: null,
										type: "TEXT",
										text: "Other Comments / Support Needed",
										description: "Any other suggestions, comments, or resources you need from the team.",
										required: false,
										order: 3,
									},
								],
							},
						},
					],
				},
			},
			include: {
				sections: {
					include: {
						questions: true,
					},
				},
			},
		});

		const totalQuestions = prForm.sections.reduce(
			(acc, sec) => acc + sec.questions.length,
			0,
		);
		console.log(
			`Created form "${prForm.name}" with ${prForm.sections.length} sections and ${totalQuestions} questions.`,
		);

		// Note: Since Prisma nested writes for questions inside sections don't automatically set formId on the questions,
		// we need to update them if the schema requires formId on FormQuestion to be set directly.
		for (const section of prForm.sections) {
			if (section.questions.length > 0) {
				await prisma.formQuestion.updateMany({
					where: { sectionId: section.id },
					data: { formId: prForm.id },
				});
			}
		}
	}

	console.log("Seeded PR Forms.");
}
