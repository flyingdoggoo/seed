import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { seedLarkCalendarEvents } from "./modules/users/seed-lark-events";

const findBackendDir = () => {
	if (process.env.EHUB_BE_DIR) {
		return path.resolve(process.env.EHUB_BE_DIR);
	}
	const candidates = [
		path.resolve(__dirname, "../../Ehub-Atsone/ehub-nestjs-be"),
		path.resolve(__dirname, "../../official_backend/ehub-nestjs-be"),
		path.resolve(__dirname, "../../ehub-nestjs-be"),
	];
	for (const candidate of candidates) {
		if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, "package.json"))) {
			return candidate;
		}
	}
	return candidates[1]; // fallback to default
};
const beDir = findBackendDir();
dotenv.config({
	path: path.resolve(beDir, ".env"),
});

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
