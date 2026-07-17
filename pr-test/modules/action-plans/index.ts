import { ActionPlanStatus, PrismaClient } from "@prisma/client";

export async function seedMockActionPlans(prisma: PrismaClient) {
	console.log("Seeding Mock Action Plans...");

	const users = await prisma.user.findMany();

	const completedCycles = await prisma.pRCycle.findMany({
		where: { status: "COMPLETED" },
		include: { participants: true },
	});

	for (const cycle of completedCycles) {
		for (const participant of cycle.participants) {
			const existingPlan = await prisma.actionPlanItem.findFirst({
				where: { cycleId: cycle.id, employeeId: participant.employeeId },
			});

			if (!existingPlan) {
				await prisma.actionPlanItem.create({
					data: {
						cycleId: cycle.id,
						employeeId: participant.employeeId,
						goal: "Cải thiện kỹ năng mềm và nâng cao hiệu suất công việc trong quý tới",
						status: ActionPlanStatus.ACTIVE,
					},
				});
			}
		}
	}
}
