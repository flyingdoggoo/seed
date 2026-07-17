import { PrismaClient } from "@prisma/client";
import { seedActiveCycleFill } from "./seed-active-fill";
import { seedShowcaseCycles } from "./seed-cycles";
import { seedShowcaseRoundtables } from "./seed-roundtables";

/**
 * Showcase cycle seeding: creates the 5-cycle matrix, then fills the ACTIVE cycle
 * to its in-progress (90% self / 50% peer) state. COMPLETED cycles are filled to
 * 100% by the shared seedMockSubmissions step in the top-level index.
 */
export async function seedShowcaseCyclesModule(prisma: PrismaClient) {
	await seedShowcaseCycles(prisma);
	await seedActiveCycleFill(prisma);
}

export { seedShowcaseRoundtables };
