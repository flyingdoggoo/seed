import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";
import { seedMockActionPlans } from "./modules/action-plans";
import { seedMockOneOnOnes } from "./modules/bilateral-meetings";
import { seedCriteriaConfig } from "./modules/criteria-config";
import { seedMockPerformanceRecords } from "./modules/performance-records";
import { seedPrFormsModule } from "./modules/pr-forms";
import { seedMockSubmissions } from "./modules/pr-submissions";
import { seedShowcaseCyclesModule } from "./modules/pr-cycles";
import { seedShowcaseRoundtables } from "./modules/roundtable-sessions";
import { CYCLE } from "./modules/showcase-data";
import { seedUsersModule } from "./modules/users";
import { seedNotificationsModule } from "./modules/notifications";

export async function seedPRTest(prisma: PrismaClient) {
	console.log("==========================================");
	console.log("Starting PR Test Seeding Process...");
	console.log("==========================================\n");
	console.log("NOTE: Showcase seed — 4 hero accounts + 5-cycle matrix.");
	console.log("Location: Ehub-Atsone/seeders/pr-test/ (safe from git pull overwrite)\n");

	// 1. Seed Users (Departments, Roles, real+hero accounts, virtual pool, managers, Projects)
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

	// 4. Seed the 5-cycle matrix (cycles + eligible participants + peer assignments),
	//    then fill the ACTIVE cycle to its in-progress 90%/50% state.
	console.log("\n--- 4. Seeding Showcase Cycles (5-cycle matrix) ---");
	console.log("    COMPLETED: Q1 2025, Q3 2025 (full execution data)");
	console.log("    ACTIVE:    Q3 2026 (Peer Review stage, 90% self / 50% peer)");
	console.log("    DRAFT:     Q4 2026 (ready to publish), Q1 2027 (needs PM confirm)");
	await seedShowcaseCyclesModule(prisma);

	// 5. Seed Mock Execution Data.
	//    seedMockSubmissions fills COMPLETED cycles to 100% self + peer.
	//    Roundtables / 1:1 / action plans / performance records follow.
	console.log("\n--- 5. Seeding Mock Execution Data ---");
	await seedMockSubmissions(prisma);
	await seedShowcaseRoundtables(prisma);
	await seedMockOneOnOnes(prisma);
	await seedMockActionPlans(prisma);
	await seedMockPerformanceRecords(prisma);

	// Generate postman_test_guide.md dynamically with the fresh UUIDs
	await generatePostmanGuide(prisma);

	console.log("\n==========================================");
	console.log("Showcase Seeding Completed Successfully!");
	console.log("==========================================");
	console.log("\nHero logins (password via SSO/Lark):");
	console.log("  manager@ehub.enosta.com  — Long Nguyen  (LINE_MANAGER)");
	console.log("  pm@ehub.enosta.com       — Tung Nguyen  (PROJECT_MANAGER)");
	console.log("  employee@ehub.enosta.com — Chuong Mai   (EMPLOYEE)");
	console.log("  hr@ehub.enosta.com       — HR Admin     (HR_ADMIN)");
}

async function generatePostmanGuide(prisma: PrismaClient) {
	const sessions = await prisma.roundtableSession.findMany({
		where: {
			cycle: {
				name: CYCLE.ACTIVE,
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
			name: CYCLE.ACTIVE,
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
