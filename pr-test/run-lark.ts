import * as dotenv from "dotenv";
import * as path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { seedLarkCalendarEvents } from "./modules/users/seed-lark-events";

dotenv.config({ path: path.resolve(__dirname, "../../ehub-nestjs-be/.env") });

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

seedLarkCalendarEvents(prisma)
	.then(() => {
		console.log("Done");
	})
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
