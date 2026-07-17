import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";
import { seedMockActionPlans } from "./modules/action-plans";
import { seedMockOneOnOnes } from "./modules/bilateral-meetings";
import { seedCriteriaConfig } from "./modules/criteria-config";
import { seedMockPeerAssignments } from "./modules/peer-assignments";
import { seedMockPerformanceRecords } from "./modules/performance-records";
import { seedPrCyclesModule } from "./modules/pr-cycles";
import { seedPrFormsModule } from "./modules/pr-forms";
import { seedMockSubmissions } from "./modules/pr-submissions";
import { seedMockRoundtables } from "./modules/roundtable-sessions";
import { seedUsersModule } from "./modules/users";
import { seedUS3US6Module } from "./modules/us3-us6";
import { seedNotificationsModule } from "./modules/notifications";

export async function seedPRTest(prisma: PrismaClient) {
	console.log("==========================================");
	console.log("Starting PR Test Seeding Process...");
	console.log("==========================================\n");
	console.log("NOTE: This seed mirrors the dev seed + adds US3–US6 test cycles.");
	console.log("Location: Ehub-Atsone/seeders/pr-test/ (safe from git pull overwrite)\n");

	// 1. Seed Users (Departments, Projects, Roles, Users, Line Managers)
	console.log("--- 1. Seeding Users Module ---");
	await seedUsersModule(prisma);

	// 1.5. Seed Notifications Config
	console.log("\n--- 1.5. Seeding Notifications Config ---");
	await seedNotificationsModule(prisma);

	// 2. Seed Criteria Config (Categories, Criteria, Rubrics)
	console.log("\n--- 2. Seeding Criteria Config Module ---");
	await seedCriteriaConfig(prisma);

	// 3. Seed PR Forms (Using Criteria Config Data)
	console.log("\n--- 3. Seeding PR Forms Module ---");
	await seedPrFormsModule(prisma);

	// 4. Seed PR Cycles (Using Users and Forms Data)
	console.log("\n--- 4. Seeding PR Cycles Module (Dev data) ---");
	await seedPrCyclesModule(prisma);

	// 5. Seed US3–US6 Test Cycles (must be before mock execution data so active cycles are in the DB)
	console.log("\n--- 5. Seeding US3-US6 Test Cycles ---");
	console.log("    Cycle A: [TEST] Q3 2026 PR Cycle — Active (14-day deadline)");
	console.log("    Cycle B: [TEST] Q1 2026 PR Cycle (Overdue) — Deadline passed 30 days ago");
	await seedUS3US6Module(prisma);

	// 6. Seed Mock Execution Data (Full Cycle Data for completed and active cycles)
	console.log("\n--- 6. Seeding Mock Execution Data ---");
	await seedMockPeerAssignments(prisma);
	await seedMockSubmissions(prisma);
	await seedMockRoundtables(prisma);
	await seedMockOneOnOnes(prisma);
	await seedMockActionPlans(prisma);
	await seedMockPerformanceRecords(prisma);

	// Generate postman_test_guide.md dynamically with the fresh UUIDs
	await generatePostmanGuide(prisma);

	console.log("\n==========================================");
	console.log("PR Test Seeding Completed Successfully!");
	console.log("==========================================");
	console.log("\nTest Scenarios Summary:");
	console.log("  Cycle A (Active - còn hạn 14 ngày):");
	console.log("    - Alice : Not Started            → US3: xem form | US5: block (empty form)");
	console.log("    - Bob   : Self DRAFT + Peer DRAFT → US4: điền dở | US5: block (missing required)");
	console.log("    - Carol : Self SUBMITTED + Peer SUBMITTED → US5: success | US6: read-only");
	console.log("  Cycle B (Overdue - quá hạn 30 ngày):");
	console.log("    - Alice : Self LOCKED + Peer LOCKED → US6: deadline auto-lock");
	console.log("    - Bob   : Self LATE + Peer LOCKED   → US6: draft → LATE khi quá hạn");
	console.log("    - Carol : Self SUBMITTED + Peer SUBMITTED → US6: submitted trước hạn → read-only");
}

async function generatePostmanGuide(prisma: PrismaClient) {
	const sessions = await prisma.roundtableSession.findMany({
		where: {
			cycle: {
				name: { startsWith: "[TEST]" }
			}
		},
		include: {
			reviewees: {
				include: {
					employee: true
				}
			}
		}
	});

	const activeCycle = await prisma.pRCycle.findFirst({
		where: {
			name: "[TEST] Q3 2026 PR Cycle",
		},
	});
	const activeCycleId = activeCycle?.id || "N/A";

	const criteria = await prisma.evaluationCriterion.findMany({
		take: 2,
	});
	const criterion1 = criteria[0]?.id || "cmriy06ok00h6vk7kwrhc00xe";
	const criterion2 = criteria[1]?.id || "cmriy06om00h7vk7kmeubdito";

	const scheduledSession = sessions.find(s => s.status === "SCHEDULED");
	const inProgressSession = sessions.find(s => s.status === "IN_PROGRESS");

	let scheduledBlock = "";
	if (scheduledSession) {
		const rev = scheduledSession.reviewees[0];
		scheduledBlock = `
1. **Scheduled Session (${scheduledSession.title}):**
   - **Get Reviewees URL:**
     \`\`\`
     GET http://localhost:3000/api/v1/roundtable-sessions/${scheduledSession.id}/reviewees
     \`\`\`
   - **View Evidence Matrix URL:**
     - **Reviewee:** ${rev?.employee?.fullName || "N/A"} (ID: ${rev?.employeeId || "N/A"})
     \`\`\`
     GET http://localhost:3000/api/v1/roundtable-sessions/${scheduledSession.id}/reviewees/${rev?.employeeId || "N/A"}/evidence
     \`\`\`
   - **Save Calibrated Scores URL:**
     \`\`\`
     PATCH http://localhost:3000/api/v1/roundtable-sessions/${scheduledSession.id}/reviewees/${rev?.employeeId || "N/A"}/scores
     \`\`\`
     - **Sample Body:**
       \`\`\`json
       {
         "scores": [
           {
             "criterionId": "${criterion1}",
             "score": 4,
             "feedback": "Strong performance, met expectations."
           },
           {
             "criterionId": "${criterion2}",
             "score": 5,
             "feedback": "Exceptional productivity and quality."
           }
         ]
       }
       \`\`\`
   - **Complete Roundtable Session URL:**
     \`\`\`
     POST http://localhost:3000/api/v1/roundtable-sessions/${scheduledSession.id}/complete
     \`\`\`
`;
	}

	let inProgressBlock = "";
	if (inProgressSession) {
		const rev = inProgressSession.reviewees[0];
		inProgressBlock = `
2. **In-Progress Session (${inProgressSession.title}):**
   - **Get Reviewees URL:**
     \`\`\`
     GET http://localhost:3000/api/v1/roundtable-sessions/${inProgressSession.id}/reviewees
     \`\`\`
   - **View Evidence Matrix URL:**
     - **Reviewee:** ${rev?.employee?.fullName || "N/A"} (ID: ${rev?.employeeId || "N/A"})
     \`\`\`
     GET http://localhost:3000/api/v1/roundtable-sessions/${inProgressSession.id}/reviewees/${rev?.employeeId || "N/A"}/evidence
     \`\`\`
   - **Save Calibrated Scores URL:**
     \`\`\`
     PATCH http://localhost:3000/api/v1/roundtable-sessions/${inProgressSession.id}/reviewees/${rev?.employeeId || "N/A"}/scores
     \`\`\`
     - **Sample Body:**
       \`\`\`json
       {
         "scores": [
           {
             "criterionId": "${criterion1}",
             "score": 3,
             "feedback": "Solid effort, needs slight improvement in communication."
           }
         ]
       }
       \`\`\`
   - **Complete Roundtable Session URL:**
     \`\`\`
     POST http://localhost:3000/api/v1/roundtable-sessions/${inProgressSession.id}/complete
     \`\`\`
`;
	}

	const content = `# Postman Test Guide

This guide provides the exact API endpoints and sample UUIDs from the seeded database to test the roundtable room feature using Postman.

> [!NOTE]
> This file is dynamically generated after each seeder run, so these URLs and UUIDs are guaranteed to be valid for your current database state.

## 1. Authentication
To hit the endpoints, you must include a valid Bearer token in the \`Authorization\` header.
- **Header:** \`Authorization: Bearer <YOUR_ACCESS_TOKEN>\`
- **Test Account (Line Manager):** Log in as \`nguyenthanhhieu17022005@ehub.enosta.com\` to obtain the token.
- **Test Account (HR Admin):** Log in as \`hr@ehub.enosta.com\` to obtain the token.

---

## 2. API Endpoints & Sample URLs

### A. View Roundtable Session List as Participant
* **Method:** \`GET\`
* **URL Format:** \`http://localhost:3000/api/v1/roundtable-sessions/me\`
* **Sample URL (Active Test Cycle):**
  \`\`\`
  GET http://localhost:3000/api/v1/roundtable-sessions/me?cycleId=${activeCycleId}
  \`\`\`

### B. Get Reviewees List in Roundtable Session
* **Method:** \`GET\`
* **URL Format:** \`http://localhost:3000/api/v1/roundtable-sessions/:sessionId/reviewees\`

### C. View Evidence Matrix by Criterion
* **Method:** \`GET\`
* **URL Format:** \`http://localhost:3000/api/v1/roundtable-sessions/:sessionId/reviewees/:revieweeId/evidence\`

### D. Save/Update Calibrated Criterion Scores
* **Method:** \`PATCH\`
* **URL Format:** \`http://localhost:3000/api/v1/roundtable-sessions/:sessionId/reviewees/:revieweeId/scores\`

### E. Finalize and Complete Roundtable Session
* **Method:** \`POST\`
* **URL Format:** \`http://localhost:3000/api/v1/roundtable-sessions/:sessionId/complete\`

---

## 3. Sample Postman URLs for Active Cycles
${scheduledBlock}
${inProgressBlock}
`;

	const guidePath = path.join(__dirname, "postman_test_guide.md");
	fs.writeFileSync(guidePath, content, "utf8");
	console.log(`\nUpdated Postman Test Guide at: ${guidePath}`);
}

if (require.main === module) {
	seedPRTest(prisma)
		.catch((e) => {
			console.error(e);
			process.exit(1);
		})
		.finally(async () => {
			await prisma.$disconnect();
		});
}
