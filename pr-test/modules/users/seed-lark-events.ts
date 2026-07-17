import { PrismaClient } from "@prisma/client";
import { DemoConfig } from "../../config";
import { larkEmailByLogin } from "../showcase/real-accounts";
import {
	HERO_LINE_MANAGER,
	HERO_PROJECT_MANAGER,
} from "../showcase/showcase-data";

interface LarkTokenResponse {
	tenant_access_token?: string;
	code?: number;
	msg?: string;
}

interface LarkCalendarEventTime {
	timestamp?: string;
	timezone?: string;
	date?: string;
}

interface LarkCalendarEvent {
	summary: string;
	description: string;
	is_all_day: boolean;
	start_time: LarkCalendarEventTime;
	end_time: LarkCalendarEventTime;
}

interface LarkProfileResponse {
	code: number;
	msg: string;
	data?: {
		user?: {
			avatar?: {
				avatar_640?: string;
				avatar_240?: string;
				avatar_72?: string;
			};
			job_title?: string;
		};
	};
}

interface LarkAttendeeResponse {
	code: number;
	msg: string;
}

interface LarkCreateEventResponse {
	code: number;
	msg: string;
	data?: {
		event?: {
			event_id: string;
		};
	};
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const EVENT_TEMPLATES = [
	{ title: "Daily Standup", duration: 30 },
	{ title: "Weekly Sync", duration: 60 },
	{ title: "1:1 with Manager", duration: 45 },
	{ title: "Project Status Update", duration: 60 },
	{ title: "Team Offsite Planning", duration: 120 },
	{ title: "Client Presentation Prep", duration: 90 },
	{ title: "Quarterly Review Prep", duration: 60 },
	{ title: "Cross-team Sync", duration: 30 },
	{ title: "Training Session", duration: 120 },
	{ title: "Workshop", duration: 150 },
];

const RSVP_STATUSES = ["accept", "tentative", "needs_action", "accept", "accept"];

function generateRandomNonOverlappingSlots(
	day: Date,
	numEvents: number,
	templates: typeof EVENT_TEMPLATES,
): { start: Date; end: Date; title: string }[] {
	const slots: { start: Date; end: Date; title: string }[] = [];
	const morningStart = 8 * 60 + 30; // 8:30 (510 min)
	const morningEnd = 12 * 60;       // 12:00 (720 min)
	const afternoonStart = 13 * 60 + 30; // 13:30 (810 min)
	const afternoonEnd = 18 * 60;     // 18:00 (1080 min)

	// Shuffle templates to pick randomly
	const shuffledTemplates = [...templates].sort(() => Math.random() - 0.5);

	for (let i = 0; i < Math.min(numEvents, shuffledTemplates.length); i++) {
		const template = shuffledTemplates[i];
		const duration = template.duration;

		let foundSlot = false;
		for (let retry = 0; retry < 15; retry++) {
			const isMorning = Math.random() < 0.5;
			let startMin = 0;
			if (isMorning) {
				const maxStart = morningEnd - duration;
				if (maxStart <= morningStart) continue;
				startMin = randomInt(morningStart, maxStart);
			} else {
				const maxStart = afternoonEnd - duration;
				if (maxStart <= afternoonStart) continue;
				startMin = randomInt(afternoonStart, maxStart);
			}

			const start = new Date(day);
			start.setHours(0, startMin, 0, 0);
			const end = new Date(start);
			end.setMinutes(end.getMinutes() + duration);

			// Check overlap with existing slots on this day
			const overlaps = slots.some((s) => {
				return start.getTime() < s.end.getTime() && end.getTime() > s.start.getTime();
			});

			if (!overlaps) {
				slots.push({ start, end, title: template.title });
				foundSlot = true;
				break;
			}
		}
	}

	return slots;
}

export async function seedLarkCalendarEvents(prisma: PrismaClient) {
	console.log("\n--- Seeding Lark Calendar Events (July 22 – July 30, 2026) ---");

	const appId = process.env.LARK_APP_ID || "cli_aab91998c3b8de18";
	const appSecret = process.env.LARK_APP_SECRET || "ww8817EcUDavmdPIv02yoHkQy8MDlZSo";

	try {
		const tokenRes = await fetch(
			"https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
			},
		);
		const tokenData = (await tokenRes.json()) as LarkTokenResponse;
		const token = tokenData.tenant_access_token;

		if (!token) {
			console.warn("Could not retrieve Lark token. Skipping calendar seeding.");
			return;
		}

		const calRes = await fetch(
			"https://open.larksuite.com/open-apis/calendar/v4/calendars/primary?user_id_type=open_id",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);
		const calData = await calRes.json();
		let botCalendarId = "feishu.cn_KRkzHX2iynefv5Vcfatkcd@group.calendar.feishu.cn";
		if (calData.code === 0 && calData.data && calData.data.calendar) {
			botCalendarId = calData.data.calendar.calendar_id;
			console.log(`Resolved Bot Calendar ID: ${botCalendarId}`);
		} else {
			console.warn(`Failed to resolve bot calendar dynamically: ${calData.msg}. Using fallback.`);
		}

		// LarkAccountLink.email stores each person's Lark-resolution address
		// (larkEmail). Long + Tung are the showcase roundtable reviewers, so their
		// larkEmails are always included; the rest come from the real-account map.
		const targetEmails = Array.from(
			new Set([
				larkEmailByLogin[HERO_LINE_MANAGER.email] ?? HERO_LINE_MANAGER.larkEmail,
				larkEmailByLogin[HERO_PROJECT_MANAGER.email] ??
					HERO_PROJECT_MANAGER.larkEmail,
				...Object.values(larkEmailByLogin),
				DemoConfig.LINE_MANAGER.EMAIL,
				DemoConfig.HR_ADMIN.EMAIL,
			]),
		);
		const linkedAccounts = await prisma.larkAccountLink.findMany({
			where: {
				email: { in: targetEmails },
			},
		});

		if (linkedAccounts.length === 0) {
			console.warn("No target linked managers found in DB. Skipping.");
			return;
		}
		console.log(`Found ${linkedAccounts.length} target reviewers`);

		console.log("Cleaning up previous test events from Bot calendar...");
		const eventsRes = await fetch(
			`https://open.larksuite.com/open-apis/calendar/v4/calendars/${encodeURIComponent(
				botCalendarId,
			)}/events?page_size=50`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);
		const eventsData = await eventsRes.json();
		if (eventsData.code === 0 && eventsData.data && eventsData.data.items) {
			const testPrefixes = [
				"Roundtable Test",
				"Daily Standup",
				"Weekly Sync",
				"1:1 with Manager",
				"Project Status Update",
				"Team Offsite Planning",
				"Client Presentation Prep",
				"Quarterly Review Prep",
				"Cross-team Sync",
				"Training Session",
				"Workshop",
				"Seeded Event",
				"Roundtable Slot",
			];
			for (const event of eventsData.data.items) {
				if (testPrefixes.some((pref) => event.summary?.startsWith(pref))) {
					console.log(`Deleting old test event: ${event.summary} (${event.event_id})`);
					await fetch(
						`https://open.larksuite.com/open-apis/calendar/v4/calendars/${encodeURIComponent(
							botCalendarId,
						)}/events/${event.event_id}`,
						{
							method: "DELETE",
							headers: { Authorization: `Bearer ${token}` },
						},
					);
				}
			}
		}

		// July 22, 2026 to July 30, 2026 (7 weekdays)
		const startDate = new Date(2026, 6, 22);
		const endDate = new Date(2026, 6, 30);
		const allDays: Date[] = [];
		const current = new Date(startDate);
		while (current <= endDate) {
			if (current.getDay() !== 0 && current.getDay() !== 6) {
				allDays.push(new Date(current));
			}
			current.setDate(current.getDate() + 1);
		}
		console.log(`Date range: ${startDate.toLocaleDateString()} — ${endDate.toLocaleDateString()} (${allDays.length} weekdays)`);

		for (const link of linkedAccounts) {
			const reviewerName = link.email.split("@")[0];
			let eventCount = 0;

			for (const day of allDays) {
				// Seed 1 to 2 random events per day for each reviewer
				const numEvents = randomInt(1, 2);
				const slots = generateRandomNonOverlappingSlots(day, numEvents, EVENT_TEMPLATES);

				for (const slot of slots) {
					const summary = `${slot.title} (${reviewerName})`;
					const rsvp = RSVP_STATUSES[randomInt(0, RSVP_STATUSES.length - 1)];

					console.log(`Creating event for ${link.email}: ${summary} at ${slot.start.toLocaleString()}`);
					eventCount++;

					const ev: LarkCalendarEvent = {
						summary,
						description: `Auto-seeded ${slot.title} for ${reviewerName}.`,
						is_all_day: false,
						start_time: {
							timestamp: Math.floor(slot.start.getTime() / 1000).toString(),
							timezone: "Asia/Ho_Chi_Minh",
						},
						end_time: {
							timestamp: Math.floor(slot.end.getTime() / 1000).toString(),
							timezone: "Asia/Ho_Chi_Minh",
						},
					};

					const createRes = await fetch(
						`https://open.larksuite.com/open-apis/calendar/v4/calendars/${encodeURIComponent(
							botCalendarId,
						)}/events`,
						{
							method: "POST",
							headers: {
								Authorization: `Bearer ${token}`,
								"Content-Type": "application/json",
							},
							body: JSON.stringify(ev),
						},
					);
					const createData = (await createRes.json()) as LarkCreateEventResponse;
					if (createData.code !== 0 || !createData.data?.event) {
						console.error(`Failed to create event ${summary}: ${createData.msg}`);
						continue;
					}
					const eventId = createData.data.event.event_id;

					const attRes = await fetch(
						`https://open.larksuite.com/open-apis/calendar/v4/calendars/${encodeURIComponent(
							botCalendarId,
						)}/events/${eventId}/attendees?user_id_type=open_id`,
						{
							method: "POST",
							headers: {
								Authorization: `Bearer ${token}`,
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								attendees: [
									{
										type: "user",
										user_id: link.larkUserId,
										rsvp_status: rsvp,
									},
								],
							}),
						},
					);
					const attData = (await attRes.json()) as LarkAttendeeResponse;
					if (attData.code === 0) {
						console.log(`  Invited ${link.email} to ${summary} (rsvp: ${rsvp})`);
					} else {
						console.error(`  Failed to invite: ${attData.msg}`);
					}
				}
			}

			console.log(`Created ${eventCount} events for ${link.email}`);
		}

		console.log("Seeded Lark Calendar Events successfully.");
	} catch (e) {
		const msg = e instanceof Error ? e.message : "Unknown error";
		console.warn("Lark Calendar seeding failed/skipped:", msg);
	}
}
