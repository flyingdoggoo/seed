/**
 * Prisma client for pr-test seed.
 *
 * CHẠY BẰNG LỆNH:
 *   cd Ehub-Atsone/ehub-nestjs-be
 *   npx ts-node --project tsconfig.json ../seeders/pr-test/index.ts
 *
 * Node.js tự resolve node_modules lên cây thư mục khi chạy file trực tiếp.
 * Khi import từ ehub-nestjs-be/ (có node_modules) seed sẽ hoạt động đúng.
 */
import * as fs from "fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";
import { Pool } from "pg";

// Parse the .env file's raw bytes ourselves. Auto-loaders in the backend tooling
// (e.g. dotenvx, pulled in via ts-node) can "claim" the file and inject nothing,
// leaving DATABASE_URL blank — which surfaces as a SASL
// "client password must be a string" error during seeding. Reading the file
// directly sidesteps whatever those loaders did to process.env.
const envPath = path.resolve(
	__dirname,
	"../../official_backend/ehub-nestjs-be/.env",
);
const fileEnv: Record<string, string> = fs.existsSync(envPath)
	? dotenv.parse(fs.readFileSync(envPath))
	: {};

const readVar = (key: string): string | undefined =>
	process.env[key] || fileEnv[key];

// Prefer a URL that actually carries a password; fall back to DIRECT_URL, then to
// building one from the discrete DB_* parts.
function resolveConnectionString(): string {
	for (const url of [readVar("DATABASE_URL"), readVar("DIRECT_URL")]) {
		if (!url) continue;
		try {
			if (new URL(url).password) return url;
		} catch {
			// not a parseable URL; skip
		}
	}

	const host = readVar("DB_HOST") ?? "localhost";
	const port = readVar("DB_PORT") ?? "5432";
	const user = readVar("DB_USERNAME") ?? readVar("DB_USER");
	const password = readVar("DB_PASSWORD");
	const database = readVar("DB_DATABASE") ?? readVar("DB_NAME");
	if (user && password && database) {
		return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
	}

	const fallback = readVar("DATABASE_URL") ?? readVar("DIRECT_URL");
	if (!fallback) {
		throw new Error(
			"No database connection string found. Set DATABASE_URL/DIRECT_URL or DB_* vars in ehub-nestjs-be/.env.",
		);
	}
	return fallback;
}

const pool = new Pool({
	connectionString: resolveConnectionString(),
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
	adapter,
});
