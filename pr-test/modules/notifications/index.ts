import { PrismaClient } from "@prisma/client";

export async function seedNotificationsModule(prisma: PrismaClient) {
	console.log("Seeding Notifications Config...");

	// 1. Clean old configs
	await prisma.notificationChannelSetting.deleteMany({});
	await prisma.notificationReminderSetting.deleteMany({});

	// 2. Seed Default Reminder Setting
	// "Asia/Ho_Chi_Minh" is validated by our check constraint.
	await prisma.notificationReminderSetting.create({
		data: {
			reminderOffsets: [3, 1, 0],
			dailySendHour: new Date("1970-01-01T09:00:00.000Z"),
			zone: "Asia/Ho_Chi_Minh",
		},
	});

	console.log("Seeded default reminder settings successfully.");
}
