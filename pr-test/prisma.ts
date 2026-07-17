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
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../../ehub-nestjs-be/.env") });

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
	adapter,
});
